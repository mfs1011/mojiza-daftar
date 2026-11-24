import { motion, type PanInfo } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MIXES, PAINT_ORDER, PaintBlob, SHAPE_ORDER, ShapeArt, type PaintId, type ShapeId } from '../art/Shapes'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { say, sfx } from '../lib/audio'
import { levelRow } from '../lib/stations'
import { pick, shuffle } from '../lib/util'
import type { GameProps } from '../types'

// 🔺 Shakllar va ranglar.
//   shakl    — aytilgan shaklni topish
//   rang     — aytilgan rangni topish
//   ikkalasi — "ko'k uchburchak": rang va shakl birga (diqqat)
//   teshik   — har shaklni o'z uyasiga sudrab joylash
//   aralash  — ikki rang aralashsa qaysi rang chiqadi
// Shakllar (3 → 8) va ranglar (3 → 10) to'plami darajaga qarab kengayadi.

type RType = 'shakl' | 'rang' | 'ikkalasi' | 'teshik' | 'aralash'

interface ShapeCfg {
  /** Nechta shakl/rang o'rganilgan (to'plam boshidan) */
  shapes: number
  colors: number
  options: number
  rounds: RType[]
}

const C = (shapes: number, colors: number, options: number, rounds: RType[]): ShapeCfg => ({ shapes, colors, options, rounds })
const SHAPE_LEVELS: ShapeCfg[] = [
  C(2, 2, 2, ['shakl', 'rang', 'shakl']),
  C(3, 3, 3, ['shakl', 'rang', 'teshik']),
  C(3, 3, 3, ['rang', 'shakl', 'teshik']),
  C(4, 4, 3, ['shakl', 'rang', 'teshik']),
  C(4, 4, 3, ['ikkalasi', 'teshik', 'rang']),
  C(5, 5, 4, ['shakl', 'aralash', 'teshik']),
  C(5, 6, 4, ['ikkalasi', 'rang', 'teshik']),
  C(6, 6, 4, ['aralash', 'shakl', 'teshik']),
  C(6, 7, 4, ['ikkalasi', 'aralash', 'teshik']),
  C(7, 8, 4, ['shakl', 'ikkalasi', 'teshik', 'aralash']),
  C(7, 8, 5, ['rang', 'ikkalasi', 'teshik', 'aralash']),
  C(8, 9, 5, ['ikkalasi', 'shakl', 'teshik', 'aralash']),
  C(8, 9, 5, ['ikkalasi', 'aralash', 'teshik', 'ikkalasi']),
  C(8, 10, 5, ['rang', 'ikkalasi', 'teshik', 'aralash']),
  C(8, 10, 6, ['ikkalasi', 'aralash', 'teshik', 'ikkalasi']),
]

interface Item {
  shape: ShapeId
  color: PaintId
}

type Round =
  | { type: 'shakl'; target: ShapeId; options: Item[] }
  | { type: 'rang'; target: PaintId; options: PaintId[] }
  | { type: 'ikkalasi'; target: Item; options: Item[] }
  | { type: 'teshik'; holes: ShapeId[]; colors: PaintId[] }
  | { type: 'aralash'; mix: [PaintId, PaintId, PaintId]; options: PaintId[] }

const same = (a: Item, b: Item) => a.shape === b.shape && a.color === b.color

function makeRound(type: RType, cfg: ShapeCfg): Round {
  const shapes = SHAPE_ORDER.slice(0, cfg.shapes)
  // Oq rang oq fonda ko'rinmasligi mumkin — kontur bilan chiziladi, lekin shakl rangiga ham qo'shamiz
  const colors = PAINT_ORDER.slice(0, Math.max(2, cfg.colors))
  const n = Math.min(cfg.options, shapes.length)
  switch (type) {
    case 'shakl': {
      const opts = shuffle(shapes).slice(0, n)
      return { type, target: pick(opts), options: opts.map((s) => ({ shape: s, color: pick(colors) })) }
    }
    case 'rang': {
      const opts = shuffle(colors).slice(0, Math.min(cfg.options, colors.length))
      return { type, target: pick(opts), options: opts }
    }
    case 'ikkalasi': {
      const target: Item = { shape: pick(shapes), color: pick(colors) }
      // Chalg'ituvchilar: bir xil shakl boshqa rangda va bir xil rang boshqa shaklda — diqqat bilan qarash kerak
      const pool: Item[] = []
      for (const c of colors) if (c !== target.color) pool.push({ shape: target.shape, color: c })
      for (const s of shapes) if (s !== target.shape) pool.push({ shape: s, color: target.color })
      const opts = [target, ...shuffle(pool).slice(0, cfg.options - 1)]
      return { type, target, options: shuffle(opts) }
    }
    case 'teshik': {
      const holes = shuffle(shapes).slice(0, Math.min(Math.max(3, cfg.options), shapes.length))
      return { type, holes, colors: holes.map(() => pick(colors.filter((c) => c !== 'oq'))) }
    }
    case 'aralash': {
      const mix = pick(MIXES)
      const others = shuffle(PAINT_ORDER.filter((c) => !mix.includes(c))).slice(0, Math.min(cfg.options, 4) - 1)
      return { type, mix, options: shuffle([mix[2], ...others]) }
    }
  }
}

export function ShapesGame({ level, onComplete, onExit }: GameProps) {
  const rounds = useMemo(() => {
    const endless = level >= SHAPE_LEVELS.length
    const cfg = levelRow(SHAPE_LEVELS, level)
    return (endless ? shuffle(cfg.rounds) : cfg.rounds).map((t) => makeRound(t, endless ? levelRow(SHAPE_LEVELS, level) : cfg))
  }, [level])
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<number | null>(null)
  const [solved, setSolved] = useState<number | null>(null)
  const [placed, setPlaced] = useState<Set<number>>(new Set())
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const boardRef = useRef<HTMLDivElement>(null)
  const holeRefs = useRef<(HTMLDivElement | null)[]>([])
  const r = rounds[idx]

  function instruct() {
    if (r.type === 'shakl') void say(`shakl_${r.target}`, 'shakl_qani')
    else if (r.type === 'rang') void say(`rang_${r.target}`, 'shakl_qani')
    else if (r.type === 'ikkalasi') void say(`rang_${r.target.color}`, `shakl_${r.target.shape}`, 'shakl_qani')
    else if (r.type === 'teshik') void say('shakl_teshik')
    else void say(`rang_${r.mix[0]}`, `rang_${r.mix[1]}`, 'rang_aralash')
  }
  useEffect(instruct, [r]) // eslint-disable-line react-hooks/exhaustive-deps

  function next() {
    setTimeout(() => {
      if (idx + 1 >= rounds.length) setFinished(true)
      else {
        sfx.whoosh()
        setSolved(null)
        setPlaced(new Set())
        setIdx((i) => i + 1)
      }
    }, 1900)
  }

  function good(i: number, spoken: string[]) {
    sfx.success()
    react('happy', 1800)
    burstAt(boardRef.current)
    setSolved(i)
    void say(...spoken, 'barakalla')
    next()
  }

  function bad(i: number) {
    mistakes.current++
    sfx.wrong()
    react('oops')
    setWrong(i)
    setTimeout(() => setWrong(null), 450)
    void say('yana')
  }

  function choose(i: number) {
    if (solved !== null) return
    if (r.type === 'shakl') r.options[i].shape === r.target ? good(i, [`shakl_${r.target}`]) : bad(i)
    else if (r.type === 'rang') r.options[i] === r.target ? good(i, [`rang_${r.target}`]) : bad(i)
    else if (r.type === 'ikkalasi') same(r.options[i], r.target) ? good(i, []) : bad(i)
    else if (r.type === 'aralash') r.options[i] === r.mix[2] ? good(i, [`rang_${r.mix[2]}`]) : bad(i)
  }

  function drop(i: number, info: PanInfo) {
    if (r.type !== 'teshik') return
    const { x, y } = info.point
    let best: { k: number; d: number } | null = null
    r.holes.forEach((_, k) => {
      if (placed.has(k)) return
      const b = holeRefs.current[k]?.getBoundingClientRect()
      if (!b) return
      const d = Math.hypot(x - (b.left + b.width / 2), y - (b.top + b.height / 2))
      if (d < b.width * 0.8 && (!best || d < best.d)) best = { k, d }
    })
    const hit = best as { k: number; d: number } | null
    if (!hit) return
    if (r.holes[hit.k] === r.holes[i]) {
      sfx.pop()
      burstAt(holeRefs.current[hit.k])
      void say(`shakl_${r.holes[i]}`)
      const nextSet = new Set(placed).add(hit.k)
      setPlaced(nextSet)
      if (nextSet.size === r.holes.length) good(-1, [])
    } else bad(i)
  }

  const optionClass = (i: number) => `shape-opt ${solved === i ? 'right' : ''}`
  const shake = (i: number) => (wrong === i ? { x: [0, -10, 10, -6, 6, 0], scale: 1 } : { scale: solved === i ? 1.15 : 1, x: 0 })

  return (
    <GameShell className="shapes" mascot={mascot} round={idx} rounds={rounds.length} onExit={onExit} data={{
        'data-type': r.type,
        'data-answer':
          r.type === 'shakl'
            ? r.options.findIndex((o) => o.shape === r.target)
            : r.type === 'rang'
              ? r.options.indexOf(r.target)
              : r.type === 'ikkalasi'
                ? r.options.findIndex((o) => same(o, r.target))
                : r.type === 'aralash'
                  ? r.options.indexOf(r.mix[2])
                  : -1,
      }}
    >
      <div className="shape-board" ref={boardRef} key={`s-${idx}`}>
        {r.type === 'aralash' && (
          <div className="mix-row">
            <span className="mix-pot">
              <PaintBlob color={r.mix[0]} />
            </span>
            <span className="math-op">+</span>
            <span className="mix-pot">
              <PaintBlob color={r.mix[1]} />
            </span>
            <span className="math-op">=</span>
            <span className="mix-pot result">{solved !== null ? <PaintBlob color={r.mix[2]} /> : <b>?</b>}</span>
          </div>
        )}

        {r.type === 'teshik' && (
          <div className="sorter">
            {r.holes.map((s, k) => (
              <div key={k} className="sorter-hole" data-shape={s} ref={(el) => void (holeRefs.current[k] = el)}>
                {placed.has(k) ? <ShapeArt shape={s} color={r.colors[k]} /> : <ShapeArt shape={s} outline />}
              </div>
            ))}
          </div>
        )}

        {(r.type === 'shakl' || r.type === 'rang' || r.type === 'ikkalasi') && (
          // Javobni ko'rsatmaymiz: bola nomini eshitib topadi (karnay — yana eshitish)
          <motion.button className="num-ear" onClick={instruct} whileTap={{ scale: 0.9 }} aria-label="Yana eshitish">
            <svg viewBox="0 0 100 100" className="art">
              <path d="M20 40H36L56 22V78L36 60H20Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
              <path d="M68 34C76 42 76 58 68 66M78 24C92 38 92 62 78 76" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" />
            </svg>
          </motion.button>
        )}
      </div>

      {r.type === 'teshik' ? (
        <div className="shape-tray">
          {r.holes.map((s, i) =>
            placed.has(i) ? null : (
              <motion.div
                key={`${idx}-${i}`}
                className="shape-piece"
                data-shape={s}
                drag
                dragSnapToOrigin
                dragMomentum={false}
                dragElastic={1}
                initial={{ y: 60, opacity: 0 }}
                animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0], y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                whileDrag={{ scale: 1.15, zIndex: 50 }}
                onDragStart={() => sfx.tap()}
                onDragEnd={(_, info) => drop(i, info)}
              >
                <ShapeArt shape={s} color={r.colors[i]} />
              </motion.div>
            ),
          )}
        </div>
      ) : (
        <div className="shape-choices">
          {r.type === 'rang' || r.type === 'aralash'
            ? r.options.map((c, i) => (
                <motion.button key={`${idx}-${c}`} className={optionClass(i)} data-value={c} onClick={() => choose(i)} initial={{ scale: 0 }} animate={shake(i)} whileTap={{ scale: 0.9 }}>
                  <PaintBlob color={c} />
                </motion.button>
              ))
            : r.options.map((it, i) => (
                <motion.button
                  key={`${idx}-${it.shape}-${it.color}`}
                  className={optionClass(i)}
                  data-value={`${it.shape}-${it.color}`}
                  onClick={() => choose(i)}
                  initial={{ scale: 0 }}
                  animate={shake(i)}
                  whileTap={{ scale: 0.9 }}
                >
                  <ShapeArt shape={it.shape} color={it.color} />
                </motion.button>
              ))}
        </div>
      )}

      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current, tasks: rounds.reduce((a, r) => a + (r.type === 'teshik' ? r.holes.length : 1), 0) })} />}
    </GameShell>
  )
}
