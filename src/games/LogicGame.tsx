import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimalArt } from '../art/Animal'
import { FruitArt } from '../art/Fruit'
import { ThingArt as ItemArt, thingReady } from '../art/Thing'
import { ALL_THINGS, THINGS, type ThingCat, type ThingId } from '../lib/things'
import { PAINT_ORDER, SHAPE_ORDER, ShapeArt, type PaintId, type ShapeId } from '../art/Shapes'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { useHowTo } from '../components/useHowTo'
import { Hero } from '../components/Hero'
import { say, sfx } from '../lib/audio'
import { ALL_ANIMALS, ALL_FRUITS, type AnimalId, type FruitKind } from '../lib/names'
import { levelRow } from '../lib/stations'
import { pick, shuffle } from '../lib/util'
import type { GameProps } from '../types'

// 🧩 Mantiq — fikrlash (IQ) o'yinlari.
//   ortiqcha  — to'rttadan qaysi biri boshqalariga o'xshamaydi (toifa → shakl → rang → o'lcham)
//   juft      — xotira kartalari: ikkitadan ochib, juftini topish
//   tiz       — eng kichigidan kattasigacha tartib bilan bosish
//   labirint  — qahramonni yo'l bo'ylab uyiga olib borish

type RType = 'ortiqcha' | 'juft' | 'tiz' | 'labirint'

interface LogicCfg {
  /** Ortiqcha: qiyinlik bosqichi 0..4 */
  odd: number
  pairs: number
  sizes: number
  maze: [number, number]
  rounds: RType[]
}

const C = (odd: number, pairs: number, sizes: number, maze: [number, number], rounds: RType[]): LogicCfg => ({ odd, pairs, sizes, maze, rounds })
const LOGIC_LEVELS: LogicCfg[] = [
  C(0, 2, 3, [3, 3], ['ortiqcha', 'juft', 'tiz']),
  C(0, 3, 3, [3, 3], ['ortiqcha', 'juft', 'labirint']),
  C(1, 3, 3, [4, 3], ['tiz', 'juft', 'labirint']),
  C(1, 3, 4, [4, 3], ['ortiqcha', 'juft', 'labirint']),
  C(2, 4, 4, [5, 3], ['tiz', 'ortiqcha', 'labirint']),
  C(2, 4, 4, [5, 4], ['juft', 'ortiqcha', 'labirint']),
  C(3, 4, 4, [5, 4], ['tiz', 'juft', 'labirint']),
  C(3, 5, 5, [6, 4], ['ortiqcha', 'juft', 'labirint']),
  C(3, 5, 5, [6, 4], ['tiz', 'juft', 'labirint', 'ortiqcha']),
  C(4, 5, 5, [6, 5], ['ortiqcha', 'juft', 'labirint', 'tiz']),
  C(4, 6, 5, [7, 5], ['juft', 'ortiqcha', 'labirint', 'tiz']),
  C(4, 6, 5, [7, 5], ['ortiqcha', 'juft', 'labirint', 'tiz']),
  C(4, 7, 5, [8, 5], ['juft', 'ortiqcha', 'labirint', 'tiz']),
  C(4, 7, 5, [8, 5], ['ortiqcha', 'labirint', 'juft', 'labirint']),
  C(4, 8, 5, [9, 5], ['ortiqcha', 'juft', 'labirint', 'tiz']),
]

// ---------- Narsalar ----------

type Thing =
  | { k: 'fruit'; id: FruitKind; scale?: number }
  | { k: 'animal'; id: AnimalId }
  | { k: 'shape'; shape: ShapeId; color: PaintId }
  | { k: 'item'; id: ThingId }

/** Rasmi tayyor yangi narsalar, turkum bo'yicha (hayvon/sabzavot/buyum/tabiat) */
function newThings(cat?: ThingCat): Thing[] {
  return ALL_THINGS.filter((id) => thingReady(id) && THINGS[id].cat !== 'kasb' && (!cat || THINGS[id].cat === cat)).map((id) => ({ k: 'item', id }) as Thing)
}

function ThingArt({ t }: { t: Thing }) {
  if (t.k === 'fruit')
    return (
      <span className="thing" style={{ transform: `scale(${t.scale ?? 1})` }}>
        <FruitArt kind={t.id} />
      </span>
    )
  if (t.k === 'animal') return <AnimalArt id={t.id} />
  if (t.k === 'item') return <ItemArt id={t.id} />
  return <ShapeArt shape={t.shape} color={t.color} />
}

/** Ortiqchasini top: 3 ta bir guruhdan + 1 ta boshqa. Qiyinlik oshgan sari farq nozikroq */
function oddRound(tier: number): { items: Thing[]; odd: number } {
  const t = Math.min(tier, 4) === 4 ? pick([2, 3, 4]) : tier
  let three: Thing[]
  let one: Thing
  if (t === 0) {
    // Bir xil meva ×3 + hayvon (yoki aksincha)
    if (Math.random() < 0.5) {
      const f = pick(ALL_FRUITS)
      three = [0, 1, 2].map(() => ({ k: 'fruit', id: f }) as Thing)
      one = { k: 'animal', id: pick(ALL_ANIMALS) }
    } else {
      const a = pick(ALL_ANIMALS)
      three = [0, 1, 2].map(() => ({ k: 'animal', id: a }) as Thing)
      one = { k: 'fruit', id: pick(ALL_FRUITS) }
    }
  } else if (t === 1) {
    // Toifa: uchtasi bir turkumdan (meva, hayvon, sabzavot, buyum, tabiat), bittasi boshqasidan
    const groups: Thing[][] = [
      ALL_FRUITS.map((id) => ({ k: 'fruit', id }) as Thing),
      [...ALL_ANIMALS.map((id) => ({ k: 'animal', id }) as Thing), ...newThings('hayvon')],
      newThings('sabzavot'),
      newThings('buyum'),
      newThings('tabiat'),
    ].filter((g) => g.length >= 3)
    const [ga, gb] = shuffle(groups)
    if (ga && gb) {
      three = shuffle(ga).slice(0, 3)
      one = pick(gb)
    } else if (Math.random() < 0.5) {
      three = shuffle(ALL_FRUITS).slice(0, 3).map((id) => ({ k: 'fruit', id }) as Thing)
      one = { k: 'animal', id: pick(ALL_ANIMALS) }
    } else {
      three = shuffle(ALL_ANIMALS).slice(0, 3).map((id) => ({ k: 'animal', id }) as Thing)
      one = { k: 'fruit', id: pick(ALL_FRUITS) }
    }
  } else if (t === 2) {
    // Shakl: bir xil shakl, har xil rang + boshqa shakl
    const [s, other] = shuffle(SHAPE_ORDER.slice(0, 5))
    const cols = shuffle(PAINT_ORDER.slice(0, 7))
    three = [0, 1, 2].map((i) => ({ k: 'shape', shape: s, color: cols[i] }) as Thing)
    one = { k: 'shape', shape: other, color: cols[0] }
  } else if (t === 3) {
    // Rang: bir xil rang, har xil shakl + boshqa rang
    const shapes = shuffle(SHAPE_ORDER.slice(0, 6))
    const [c, other] = shuffle(PAINT_ORDER.slice(0, 7))
    three = [0, 1, 2].map((i) => ({ k: 'shape', shape: shapes[i], color: c }) as Thing)
    one = { k: 'shape', shape: shapes[3], color: other }
  } else {
    // O'lcham: uchta katta, bitta kichik (yoki aksincha)
    const f = pick(ALL_FRUITS)
    const big = Math.random() < 0.5
    three = [0, 1, 2].map(() => ({ k: 'fruit', id: f, scale: big ? 1 : 0.55 }) as Thing)
    one = { k: 'fruit', id: f, scale: big ? 0.55 : 1 }
  }
  const odd = Math.floor(Math.random() * 4)
  const items = [...three]
  items.splice(odd, 0, one)
  return { items, odd }
}

// ---------- Labirint ----------

interface Maze {
  w: number
  h: number
  /** wallR[y][x] — o'ng tomonda devor; wallB[y][x] — pastda devor */
  wallR: boolean[][]
  wallB: boolean[][]
}

/** Chuqurlik bo'yicha qidiruv bilan tasodifiy labirint: har doim bitta yo'l bor */
function makeMaze(w: number, h: number): Maze {
  const wallR = Array.from({ length: h }, () => Array(w).fill(true))
  const wallB = Array.from({ length: h }, () => Array(w).fill(true))
  const seen = Array.from({ length: h }, () => Array(w).fill(false))
  const stack: [number, number][] = [[0, 0]]
  seen[0][0] = true
  while (stack.length) {
    const [x, y] = stack[stack.length - 1]
    const nb = shuffle(
      (
        [
          [x + 1, y],
          [x - 1, y],
          [x, y + 1],
          [x, y - 1],
        ] as [number, number][]
      ).filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[ny][nx]),
    )
    if (!nb.length) {
      stack.pop()
      continue
    }
    const [nx, ny] = nb[0]
    if (nx > x) wallR[y][x] = false
    if (nx < x) wallR[y][nx] = false
    if (ny > y) wallB[y][x] = false
    if (ny < y) wallB[ny][x] = false
    seen[ny][nx] = true
    stack.push([nx, ny])
  }
  return { w, h, wallR, wallB }
}

/** Labirint yechimi (BFS): boshidan (0,0) uyigacha kataklar */
function solveMaze(m: Maze): [number, number][] {
  const goal = `${m.w - 1},${m.h - 1}`
  const prev = new Map<string, string | null>([['0,0', null]])
  const q: [number, number][] = [[0, 0]]
  while (q.length) {
    const [x, y] = q.shift()!
    if (`${x},${y}` === goal) break
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ] as [number, number][]) {
      const k = `${nx},${ny}`
      if (!prev.has(k) && canMove(m, x, y, nx, ny)) {
        prev.set(k, `${x},${y}`)
        q.push([nx, ny])
      }
    }
  }
  const path: [number, number][] = []
  for (let k: string | null | undefined = goal; k; k = prev.get(k)) path.unshift(k.split(',').map(Number) as [number, number])
  return path
}

function canMove(m: Maze, x: number, y: number, nx: number, ny: number) {
  if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) return false
  if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) return false
  if (nx > x) return !m.wallR[y][x]
  if (nx < x) return !m.wallR[y][nx]
  if (ny > y) return !m.wallB[y][x]
  return !m.wallB[ny][x]
}

// ---------- Raundlar ----------

type Round =
  | { type: 'ortiqcha'; items: Thing[]; odd: number }
  | { type: 'juft'; cards: Thing[]; preview: number }
  | { type: 'tiz'; fruit: FruitKind; scales: number[] }
  | { type: 'labirint'; maze: Maze }

function makeRound(type: RType, cfg: LogicCfg): Round {
  switch (type) {
    case 'ortiqcha':
      return { type, ...oddRound(cfg.odd) }
    case 'juft': {
      const fruits = ALL_FRUITS.map((id) => ({ k: 'fruit', id }) as Thing)
      const animals = [...ALL_ANIMALS.map((id) => ({ k: 'animal', id }) as Thing), ...newThings('hayvon')]
      // Yuqori darajada juftlar bir toifadan (faqat mevalar / hayvonlar / sabzavotlar / buyumlar) — farqlash qiyinroq
      const same = cfg.pairs >= 5
      const cats = [fruits, animals, newThings('sabzavot'), newThings('buyum')].filter((g) => g.length >= cfg.pairs)
      const base = same && cats.length ? pick(cats) : [...fruits, ...animals, ...newThings()]
      const pool = shuffle(base).slice(0, cfg.pairs)
      // Boshida hamma kartalar ochiq turadi (eslab qolish uchun): oson darajada uzoqroq
      const preview = Math.max(1000, 3200 - cfg.pairs * 280)
      return { type, cards: shuffle([...pool, ...pool]), preview }
    }
    case 'tiz': {
      const scales = Array.from({ length: cfg.sizes }, (_, i) => 0.42 + (0.58 * i) / (cfg.sizes - 1))
      return { type, fruit: pick(ALL_FRUITS), scales: shuffle(scales) }
    }
    case 'labirint':
      return { type, maze: makeMaze(cfg.maze[0], cfg.maze[1]) }
  }
}

export function LogicGame({ profile, level, onComplete, onExit }: GameProps) {
  const rounds = useMemo(() => {
    const endless = level >= LOGIC_LEVELS.length
    const cfg = levelRow(LOGIC_LEVELS, level)
    return (endless ? shuffle(cfg.rounds) : cfg.rounds).map((t) => makeRound(t, endless ? levelRow(LOGIC_LEVELS, level) : cfg))
  }, [level])
  const [idx, setIdx] = useState(0)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const boardRef = useRef<HTMLDivElement>(null)
  const r = rounds[idx]

  // "Qanday bajariladi?"
  const howto = useHowTo(profile.id, 'mantiq', () => {
    if (r.type === 'ortiqcha') return howto.tap(`.odd-card[data-i="${r.odd}"]`)
    if (r.type === 'tiz') {
      const items = [...document.querySelectorAll<HTMLElement>('.size-item')]
      const min = items.sort((a, b) => Number(a.dataset.scale) - Number(b.dataset.scale))[0]
      if (min) howto.tap(`.size-item[data-scale="${min.dataset.scale}"]`)
      return
    }
    if (r.type === 'juft') {
      // Bir xil ikki kartani bog'lab ko'rsatadi
      const cards = [...document.querySelectorAll<HTMLElement>('.mem-card:not(.matched)')]
      const a = cards[0]
      const b = cards.find((c) => c !== a && c.dataset.key === a?.dataset.key)
      if (!a || !b) return
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      const p0 = { x: ra.left + ra.width / 2, y: ra.top + ra.height / 2 }
      const p1 = { x: rb.left + rb.width / 2, y: rb.top + rb.height / 2 }
      return howto.drag(Array.from({ length: 14 }, (_, i) => ({ x: p0.x + ((p1.x - p0.x) * i) / 13, y: p0.y + ((p1.y - p0.y) * i) / 13 })))
    }
    // Labirint: boshidan uyigacha yo'lni chizib ko'rsatadi
    const el = document.querySelector('.maze')
    if (!el || r.type !== 'labirint') return
    const b = el.getBoundingClientRect()
    const m = r.maze
    howto.drag(solveMaze(m).map(([x, y]) => ({ x: b.left + ((x + 0.5) / m.w) * b.width, y: b.top + ((y + 0.5) / m.h) * b.height })))
  })

  useEffect(() => {
    howto.start(r.type, [`mantiq_${r.type}`])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r])

  function solved() {
    howto.done()
    sfx.success()
    react('happy', 1800)
    burstAt(boardRef.current)
    void say('barakalla')
    setTimeout(() => {
      if (idx + 1 >= rounds.length) setFinished(true)
      else {
        sfx.whoosh()
        setIdx((i) => i + 1)
      }
    }, 1900)
  }

  function oops() {
    mistakes.current++
    howto.miss()
    sfx.wrong()
    react('oops')
  }

  return (
    <GameShell className="logic" mascot={mascot} round={idx} rounds={rounds.length} onExit={onExit} data={{ 'data-type': r.type }}>
      <div className="logic-board" ref={boardRef} key={`l-${idx}`}>
        {r.type === 'ortiqcha' && <OddOne round={r} onWin={solved} onMiss={oops} />}
        {r.type === 'juft' && <Memory cards={r.cards} preview={r.preview} onWin={solved} onMiss={() => ((mistakes.current += 0.5), howto.miss())} />}
        {r.type === 'tiz' && <SizeOrder fruit={r.fruit} scales={r.scales} onWin={solved} onMiss={oops} />}
        {r.type === 'labirint' && <MazeView maze={r.maze} profile={profile} onWin={solved} />}
      </div>
      {!finished && howto.overlay}
      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: Math.floor(mistakes.current), tasks: rounds.length })} />}
    </GameShell>
  )
}

const shakeIf = (on: boolean) => (on ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 })

function OddOne({ round, onWin, onMiss }: { round: { items: Thing[]; odd: number }; onWin: () => void; onMiss: () => void }) {
  const [wrong, setWrong] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  return (
    <div className="odd-row" data-answer={round.odd}>
      {round.items.map((t, i) => (
        <motion.button
          key={i}
          className={`odd-card ${done && i === round.odd ? 'right' : ''}`}
          data-i={i}
          initial={{ scale: 0 }}
          animate={{ scale: done && i === round.odd ? 1.12 : 1, ...shakeIf(wrong === i) }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            if (done) return
            if (i === round.odd) {
              setDone(true)
              onWin()
            } else {
              setWrong(i)
              setTimeout(() => setWrong(null), 450)
              onMiss()
            }
          }}
        >
          <ThingArt t={t} />
        </motion.button>
      ))}
    </div>
  )
}

function Memory({ cards, preview, onWin, onMiss }: { cards: Thing[]; preview: number; onWin: () => void; onMiss: () => void }) {
  const [open, setOpen] = useState<number[]>([])
  // Boshida hamma kartalar ochiq — bola joylarini eslab qoladi, keyin yopiladi
  const [peek, setPeek] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => {
      setPeek(false)
      sfx.whoosh()
    }, preview)
    return () => clearTimeout(t)
  }, [preview])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const busy = useRef(false)
  const key = (t: Thing) => (t.k === 'shape' ? `${t.shape}${t.color}` : `${t.k}${t.id}`)
  const cols = cards.length <= 4 ? cards.length : cards.length <= 8 ? 4 : cards.length <= 12 ? 6 : 8

  function flip(i: number) {
    if (peek || busy.current || open.includes(i) || matched.has(i)) return
    sfx.tap()
    const now = [...open, i]
    setOpen(now)
    if (now.length < 2) return
    busy.current = true
    const [a, b] = now
    if (key(cards[a]) === key(cards[b])) {
      setTimeout(() => {
        sfx.pop()
        const m = new Set(matched).add(a).add(b)
        setMatched(m)
        setOpen([])
        busy.current = false
        if (m.size === cards.length) onWin()
      }, 450)
    } else {
      onMiss()
      setTimeout(() => {
        setOpen([])
        busy.current = false
      }, 900)
    }
  }

  return (
    <div className={`memory ${cols >= 8 ? 'dense' : ''}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {cards.map((t, i) => {
        const shown = peek || open.includes(i) || matched.has(i)
        return (
          <motion.button
            key={i}
            className={`mem-card ${shown ? 'open' : ''} ${matched.has(i) ? 'matched' : ''}`}
            data-key={key(t)}
            onClick={() => flip(i)}
            animate={{ rotateY: shown ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {shown ? <ThingArt t={t} /> : <span className="mem-back">?</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

function SizeOrder({ fruit, scales, onWin, onMiss }: { fruit: FruitKind; scales: number[]; onWin: () => void; onMiss: () => void }) {
  const sorted = [...scales].sort((a, b) => a - b)
  const [done, setDone] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  return (
    <div className="size-order">
      <div className="size-pile">
        {scales.map((s, i) =>
          done.includes(i) ? (
            <span key={i} className="size-slot" />
          ) : (
            <motion.button
              key={i}
              className="size-item"
              data-scale={s}
              animate={shakeIf(wrong === i)}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (s === sorted[done.length]) {
                  sfx.pop()
                  const d = [...done, i]
                  setDone(d)
                  if (d.length === scales.length) onWin()
                } else {
                  setWrong(i)
                  setTimeout(() => setWrong(null), 450)
                  onMiss()
                }
              }}
            >
              <span style={{ transform: `scale(${s})` }} className="thing">
                <FruitArt kind={fruit} />
              </span>
            </motion.button>
          ),
        )}
      </div>
      <div className="size-line">
        {done.map((i) => (
          <motion.span key={i} className="size-placed" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <span style={{ transform: `scale(${scales[i]})` }} className="thing">
              <FruitArt kind={fruit} />
            </span>
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function MazeView({ maze, profile, onWin }: { maze: Maze; profile: GameProps['profile']; onWin: () => void }) {
  const [pos, setPos] = useState<[number, number]>([0, 0])
  const [trail, setTrail] = useState<string[]>(['0,0'])
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const won = useRef(false)
  const goal: [number, number] = [maze.w - 1, maze.h - 1]
  const S = 10 // SVG katak o'lchami

  function cellAt(e: React.PointerEvent): [number, number] {
    const b = wrapRef.current!.getBoundingClientRect()
    return [Math.floor(((e.clientX - b.left) / b.width) * maze.w), Math.floor(((e.clientY - b.top) / b.height) * maze.h)]
  }

  function tryMove([nx, ny]: [number, number]) {
    if (won.current) return
    const [x, y] = pos
    if (nx === x && ny === y) return
    if (!canMove(maze, x, y, nx, ny)) return
    setPos([nx, ny])
    setTrail((t) => [...t, `${nx},${ny}`])
    if (nx === goal[0] && ny === goal[1]) {
      won.current = true
      onWin()
    }
  }

  const walls: string[] = []
  for (let y = 0; y < maze.h; y++)
    for (let x = 0; x < maze.w; x++) {
      if (maze.wallR[y][x] && x < maze.w - 1) walls.push(`M${(x + 1) * S} ${y * S}V${(y + 1) * S}`)
      if (maze.wallB[y][x] && y < maze.h - 1) walls.push(`M${x * S} ${(y + 1) * S}H${(x + 1) * S}`)
    }

  return (
    <div
      className="maze"
      ref={wrapRef}
      style={{ aspectRatio: `${maze.w} / ${maze.h}` }}
      data-w={maze.w}
      data-h={maze.h}
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        tryMove(cellAt(e))
      }}
      onPointerMove={(e) => dragging.current && tryMove(cellAt(e))}
      onPointerUp={() => (dragging.current = false)}
    >
      <svg viewBox={`0 0 ${maze.w * S} ${maze.h * S}`} className="maze-svg">
        {trail.map((c) => {
          const [x, y] = c.split(',').map(Number)
          return <rect key={c} x={x * S + 1.5} y={y * S + 1.5} width={S - 3} height={S - 3} rx={2} fill="#ffd16688" />
        })}
        <rect x={0} y={0} width={maze.w * S} height={maze.h * S} fill="none" stroke="#3d2c1e" strokeWidth={1.6} rx={1} />
        <path d={walls.join('')} stroke="#3d2c1e" strokeWidth={0.9} strokeLinecap="round" fill="none" />
      </svg>
      <div className="maze-goal" style={{ left: `${(goal[0] / maze.w) * 100}%`, top: `${(goal[1] / maze.h) * 100}%`, width: `${100 / maze.w}%`, height: `${100 / maze.h}%` }}>
        <svg viewBox="0 0 40 40" className="art">
          <path d="M6 20L20 7L34 20M10 17V33H30V17" fill="#ffd166" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
          <rect x={17} y={23} width={6} height={10} fill="#8d5524" />
        </svg>
      </div>
      <motion.div
        className="maze-hero"
        animate={{ left: `${(pos[0] / maze.w) * 100}%`, top: `${(pos[1] / maze.h) * 100}%` }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ width: `${100 / maze.w}%`, height: `${100 / maze.h}%` }}
      >
        <Hero profile={profile} mode="idle" />
      </motion.div>
    </div>
  )
}
