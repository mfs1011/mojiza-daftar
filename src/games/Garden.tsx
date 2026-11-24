import { motion, type PanInfo } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { COLOR_HEX, FRUIT_COLOR, FruitArt, type ColorId, type FruitKind } from '../art/Fruit'
import { BasketArt } from '../art/Scenery'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { say, sfx } from '../lib/audio'
import { pick, shuffle } from '../lib/util'
import { levelRow } from '../lib/stations'
import type { GameProps } from '../types'

// 🍎 Bog' — saralash (#2).
// Har raund: daraxtni silkitish (bosish yoki telefonni silkitish) → mevalar yerga tushadi →
// ularni savatlarga saralash. Raund turlari: rang, kattalik, meva turi.

type RoundType = 'rang' | 'kattalik' | 'tur'

interface RoundCfg {
  type: RoundType
  groups: number
  perGroup: number
}

interface Group {
  id: string
  color?: ColorId
  size?: number
  kind?: FruitKind
}

interface Item {
  id: number
  kind: FruitKind
  group: string
  scale: number
  tree: { x: number; y: number }
  ground: { x: number; y: number }
}

const GARDEN_FRUITS = (Object.keys(FRUIT_COLOR) as FruitKind[]).filter((k) => FRUIT_COLOR[k])
const BY_COLOR = (c: ColorId) => GARDEN_FRUITS.filter((k) => FRUIT_COLOR[k] === c)
const KIND_SETS: FruitKind[][] = [
  ['olma', 'anor'],
  ['uzum', 'anjir'],
  ['tarvuz', 'nok'],
  ['qovun', 'behi'],
]
const KIND_SETS_3: FruitKind[][] = [
  ['olma', 'anor', 'gilos'],
  ['qovun', 'behi', 'nok'],
  ['uzum', 'anjir', 'olma'],
]
const SIZES: Record<number, number[]> = { 2: [1.3, 0.72], 3: [1.35, 1, 0.68] }

// Har daraja — 3 raund. Daraxtga 12 tagacha meva sig'adi (rang ≤4 guruh, kattalik va tur ≤3).
const R = (type: RoundType, groups: number, perGroup: number): RoundCfg => ({ type, groups, perGroup })
const GARDEN_LEVELS: RoundCfg[][] = [
  [R('rang', 2, 2), R('kattalik', 2, 2), R('rang', 2, 3)],
  [R('rang', 2, 3), R('kattalik', 2, 2), R('rang', 2, 3)],
  [R('rang', 2, 3), R('kattalik', 2, 3), R('rang', 3, 2)],
  [R('rang', 3, 2), R('kattalik', 2, 3), R('tur', 2, 2)],
  [R('rang', 3, 3), R('kattalik', 2, 3), R('tur', 2, 3)],
  [R('rang', 3, 3), R('kattalik', 3, 2), R('tur', 2, 3)],
  [R('rang', 3, 3), R('kattalik', 3, 2), R('tur', 3, 2)],
  [R('rang', 4, 2), R('kattalik', 3, 2), R('tur', 3, 3)],
  [R('rang', 4, 2), R('kattalik', 3, 3), R('tur', 3, 3)],
  [R('rang', 4, 3), R('kattalik', 3, 3), R('tur', 3, 3)],
  [R('tur', 3, 3), R('rang', 4, 3), R('kattalik', 3, 3)],
  [R('rang', 3, 4), R('kattalik', 3, 3), R('tur', 3, 4)],
  [R('rang', 4, 3), R('kattalik', 3, 4), R('tur', 3, 4)],
  [R('tur', 3, 4), R('rang', 4, 3), R('kattalik', 3, 4)],
  [R('rang', 4, 3), R('tur', 3, 4), R('kattalik', 3, 4)],
]

/** Endless'da har raund yuqori darajalardan alohida tanlanadi */
function gardenRounds(level: number): RoundCfg[] {
  if (level < GARDEN_LEVELS.length) return GARDEN_LEVELS[level]
  return shuffle([0, 1, 2].map((i) => levelRow(GARDEN_LEVELS, level)[i]))
}

function makeRound(cfg: RoundCfg): { groups: Group[]; items: Item[] } {
  let groups: Group[]
  let raw: { kind: FruitKind; group: string; scale: number }[]

  if (cfg.type === 'rang') {
    const colors = shuffle<ColorId>(['qizil', 'sariq', 'yashil', 'binafsha']).slice(0, cfg.groups)
    groups = colors.map((c) => ({ id: c, color: c }))
    raw = colors.flatMap((c) => Array.from({ length: cfg.perGroup }, () => ({ kind: pick(BY_COLOR(c)), group: c, scale: 1 })))
  } else if (cfg.type === 'kattalik') {
    const kind = pick(GARDEN_FRUITS)
    const sizes = SIZES[cfg.groups]
    groups = sizes.map((s, i) => ({ id: `s${i}`, size: s, kind }))
    raw = sizes.flatMap((s, i) => Array.from({ length: cfg.perGroup }, () => ({ kind, group: `s${i}`, scale: s })))
  } else {
    const kinds = pick(cfg.groups === 2 ? KIND_SETS : KIND_SETS_3)
    groups = kinds.map((k) => ({ id: k, kind: k }))
    raw = kinds.flatMap((k) => Array.from({ length: cfg.perGroup }, () => ({ kind: k, group: k, scale: 1 })))
  }

  // Daraxt konteyneri: ekranning chap 2%..54% va yuqori 4%..68% qismi.
  // Mevalar shox-shabbada bo'ylab tekis tarqaladi, keyin yerga tushadi.
  const n = raw.length
  const treeRows = n > 6 ? 3 : 2
  const treeCols = Math.ceil(n / treeRows)
  const groundCols = Math.ceil(n / 2)
  const items = shuffle(raw).map((r, i) => {
    const tr = Math.floor(i / treeCols)
    const tc = i % treeCols
    // Shox-shabba ichida (fon rasmidagi daraxt ham, chizilgani ham shu oraliqda)
    const fx = 0.14 + (tc + 0.5) * (0.56 / treeCols) + (Math.random() - 0.5) * 0.03
    const fy = 0.08 + (tr + 0.5) * (0.52 / treeRows) + (Math.random() - 0.5) * 0.04
    const row = i % 2
    const col = Math.floor(i / 2)
    return {
      id: i,
      ...r,
      tree: { x: 2 + 52 * fx, y: 4 + 64 * fy },
      ground: { x: 6 + (col + 0.5) * (48 / groundCols) + (row ? 2 : -2), y: 72 + row * 14 },
    }
  })
  return { groups, items }
}

// Shox-shabbada: [cx, cy, r] (viewBox 200x140)
const CANOPY: [number, number, number][] = [
  [100, 44, 42], [58, 58, 34], [142, 58, 34], [76, 28, 28], [126, 28, 28],
  [100, 72, 36], [34, 78, 22], [166, 78, 22], [72, 80, 26], [130, 80, 26],
]

const INTRO: Record<RoundType, string> = { rang: 'bog_rang', kattalik: 'bog_kattalik', tur: 'bog_tur' }

export function Garden({ level, onComplete, onExit }: GameProps) {
  const rounds = useMemo(() => gardenRounds(level), [level])
  const [roundIdx, setRoundIdx] = useState(0)
  const cfg = rounds[roundIdx]
  const round = useMemo(() => makeRound(cfg), [cfg])
  const [phase, setPhase] = useState<'tree' | 'ground' | 'next' | 'finished'>('tree')
  const [sorted, setSorted] = useState<Set<number>>(new Set())
  const [shakeTree, setShakeTree] = useState(0)
  const [shakeBasket, setShakeBasket] = useState<string | null>(null)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const totalFruits = useRef(0)
  const basketRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Raund boshlanishi
  useEffect(() => {
    void say('bog_silkit')
  }, [roundIdx])

  function shake() {
    if (phase !== 'tree') return
    setShakeTree((n) => n + 1)
    setPhase('ground')
    sfx.rustle()
    react('happy', 900)
    setTimeout(() => sfx.thump(), 450)
    setTimeout(() => sfx.thump(), 650)
    setTimeout(() => void say(INTRO[cfg.type]), 900)
  }

  // Telefonni silkitish ham ishlaydi
  const shakeRef = useRef(shake)
  useEffect(() => {
    shakeRef.current = shake
  })
  useEffect(() => {
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (a && Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0) > 22) shakeRef.current()
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [])

  function handleDrop(item: Item, info: PanInfo) {
    const { x, y } = info.point
    const hit = round.groups.find((g) => {
      const r = basketRefs.current[g.id]?.getBoundingClientRect()
      return r && x >= r.left - 24 && x <= r.right + 24 && y >= r.top - 50 && y <= r.bottom + 24
    })
    if (!hit) return

    if (hit.id === item.group) {
      sfx.pop()
      burstAt(basketRefs.current[hit.id], hit.color ? [COLOR_HEX[hit.color], '#ffd166', '#fff'] : undefined)
      react('happy')
      const next = new Set(sorted).add(item.id)
      setSorted(next)
      if (cfg.type === 'rang' && hit.color) void say(`rang_${hit.color}`)
      else if (cfg.type === 'tur') void say(`meva_${item.kind}`)
      if (next.size === round.items.length) finishRound()
    } else {
      mistakes.current++
      sfx.wrong()
      react('oops')
      setShakeBasket(hit.id)
      setTimeout(() => setShakeBasket(null), 450)
      void say('yana')
    }
  }

  function finishRound() {
    totalFruits.current += round.items.length
    if (roundIdx + 1 >= rounds.length) {
      setTimeout(() => setPhase('finished'), 700)
      return
    }
    setPhase('next')
    setTimeout(() => {
      sfx.whoosh()
      setSorted(new Set())
      setRoundIdx((i) => i + 1)
      setPhase('tree')
    }, 1600)
  }

  const showHint = level <= 1 || cfg.type !== 'rang'

  return (
    <GameShell
      className="garden"
      mascot={mascot}
      round={roundIdx}
      rounds={rounds.length}
      onExit={onExit}
      data={{ 'data-phase': phase, 'data-round': cfg.type }}
    >
      <div className="garden-hills" />
      <div className="garden-fence" />

      <motion.button
        className="tree-hit"
        onClick={shake}
        animate={shakeTree ? { rotate: [0, -4, 4, -3, 3, 0] } : {}}
        transition={{ duration: 0.6 }}
        key={`tree-${shakeTree}`}
        aria-label="Daraxt"
      >
        <svg viewBox="0 0 200 140" className="art" preserveAspectRatio="none">
          <path d="M84 140C88 120 90 104 86 90L70 74M116 140C112 120 110 104 114 90L132 72" fill="#8d5524" stroke="#3d2c1e" strokeWidth={2} />
          <path d="M84 140C90 116 90 100 88 84H112C110 100 110 116 116 140Z" fill="#8d5524" stroke="#3d2c1e" strokeWidth={2} strokeLinejoin="round" />
          {/* kontur: biroz kattaroq to'q yashil doiralar orqada */}
          {CANOPY.map(([x, y, r], i) => (
            <circle key={`o${i}`} cx={x} cy={y} r={r + 2.5} fill="#2d6a4f" />
          ))}
          {CANOPY.map(([x, y, r], i) => (
            <circle key={`f${i}`} cx={x} cy={y} r={r} fill="#52b788" />
          ))}
          {CANOPY.map(([x, y, r], i) => (
            <circle key={`h${i}`} cx={x - r * 0.25} cy={y - r * 0.3} r={r * 0.55} fill="#74c69d" opacity={0.7} />
          ))}
        </svg>
        {phase === 'tree' && (
          <motion.span
            className="tap-hint"
            animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0.5, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
          />
        )}
      </motion.button>

      {round.items
        .filter((it) => !sorted.has(it.id))
        .map((item) => {
          const onGround = phase !== 'tree'
          const pos = onGround ? item.ground : item.tree
          return (
            <motion.div
              key={`${roundIdx}-${item.id}`}
              className="fruit"
              data-group={item.group}
              style={{ width: `${13 * item.scale}vmin`, height: `${13 * item.scale}vmin`, marginLeft: `${-6.5 * item.scale}vmin`, marginTop: `${-6.5 * item.scale}vmin` }}
              initial={{ left: `${item.tree.x}%`, top: `${item.tree.y}%`, scale: 0 }}
              animate={{ left: `${pos.x}%`, top: `${pos.y}%`, scale: 1 }}
              transition={
                onGround
                  ? { type: 'spring', stiffness: 120, damping: 9, delay: 0.05 * item.id }
                  : { type: 'spring', delay: 0.05 * item.id }
              }
              drag={onGround}
              dragSnapToOrigin
              dragMomentum={false}
              dragElastic={1}
              whileDrag={{ scale: 1.25, zIndex: 50 }}
              onDragStart={() => sfx.tap()}
              onDragEnd={(_, info) => handleDrop(item, info)}
              // Bola daraxtdagi mevani bossa ham daraxt silkinadi
              onClick={() => phase === 'tree' && shake()}
            >
              <FruitArt kind={item.kind} />
            </motion.div>
          )
        })}

      <div className="baskets">
        {round.groups.map((g) => {
          // 4 ta savat telefon ekraniga sig'ishi uchun biroz kichikroq
          const scale = (g.size ?? 1) * (round.groups.length >= 4 ? 0.8 : 1)
          return (
            <motion.div
              key={`${roundIdx}-${g.id}`}
              ref={(el) => {
                basketRefs.current[g.id] = el
              }}
              className="basket"
              data-group={g.id}
              style={{ width: `${24 * scale}vmin`, height: `${22 * scale}vmin` }}
              initial={{ y: 80, opacity: 0 }}
              animate={shakeBasket === g.id ? { x: [0, -12, 12, -8, 8, 0], y: 0, opacity: 1 } : { x: 0, y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {g.color && <div className="basket-glow" style={{ background: COLOR_HEX[g.color] }} />}
              {showHint && (
                <div className="basket-hint" style={{ width: `${9 * scale}vmin`, height: `${9 * scale}vmin` }}>
                  <FruitArt kind={g.kind ?? BY_COLOR(g.color!)[0]} />
                </div>
              )}
              <div className="basket-fill">
                {round.items
                  .filter((it) => it.group === g.id && sorted.has(it.id))
                  .map((it) => (
                    <motion.span key={it.id} initial={{ scale: 0, y: -40 }} animate={{ scale: 1, y: 0 }}>
                      <FruitArt kind={it.kind} />
                    </motion.span>
                  ))}
              </div>
              <BasketArt ribbon={g.color ? COLOR_HEX[g.color] : undefined} />
            </motion.div>
          )
        })}
      </div>

      {phase === 'finished' && (
        <Celebration
          voice={['barakalla']}
          onDone={() => onComplete({ mistakes: mistakes.current, fruits: totalFruits.current, tasks: totalFruits.current })}
        />
      )}
    </GameShell>
  )
}
