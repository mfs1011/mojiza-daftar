import { motion, type PanInfo } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimalArt, type AnimalId } from '../art/Animal'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { pathBetween, useHowTo } from '../components/useHowTo'
import { say, sayAnimal, sfx } from '../lib/audio'
import { shuffle, wait } from '../lib/util'
import { levelRow } from '../lib/stations'
import type { GameProps } from '../types'

// 🌙 Kechki qo'ra — soya topish (#3).
// Qorong'i tushdi: qo'rada hayvonlarning soyalari bor. Bola har bir hayvonni
// o'z soyasiga olib borib yotqizadi. Yuqori darajada o'xshash hayvonlar (qo'y/echki)
// va teskari qaragan soyalar paydo bo'ladi — fazoviy tasavvur uchun.

interface ShadowCfg {
  count: number
  similar: boolean
  /** Soyaning teskari qarash ehtimoli (0..1) */
  flips: number
}

// Hayvonlar soni (7 tagacha sig'adi), o'xshash juftlik (qo'y/echki) va teskari soyalar
// navbat bilan qo'shiladi: bola bir vaqtda faqat bitta yangi qiyinchilikka duch keladi.
const SHADOW_LEVELS: ShadowCfg[] = [
  { count: 3, similar: false, flips: 0 },
  { count: 4, similar: false, flips: 0 },
  { count: 4, similar: true, flips: 0 },
  { count: 5, similar: false, flips: 0 },
  { count: 5, similar: true, flips: 0 },
  { count: 4, similar: false, flips: 0.3 },
  { count: 5, similar: true, flips: 0.3 },
  { count: 6, similar: false, flips: 0.3 },
  { count: 6, similar: true, flips: 0.3 },
  { count: 6, similar: true, flips: 0.5 },
  { count: 7, similar: false, flips: 0.5 },
  { count: 7, similar: true, flips: 0.5 },
  { count: 7, similar: true, flips: 0.6 },
  { count: 7, similar: true, flips: 0.7 },
  { count: 7, similar: true, flips: 0.8 },
]

const shadowCfg = (level: number) => levelRow(SHADOW_LEVELS, level)

const ROUNDS = 2
const DISTINCT: AnimalId[] = ['sigir', 'xoroz', 'ordak', 'eshak', 'mushuk', 'it']
const SIMILAR: AnimalId[] = ['qoy', 'echki']

interface Spot {
  id: AnimalId
  x: number
  y: number
  flip: boolean
}

function makeRound(cfg: ShadowCfg): { spots: Spot[]; tray: AnimalId[] } {
  const pool = cfg.similar ? [...SIMILAR, ...shuffle(DISTINCT)] : shuffle(DISTINCT)
  const ids = shuffle(pool.slice(0, cfg.count))
  const cols = Math.ceil(ids.length / 2)
  const spots = ids.map((id, i) => {
    const row = ids.length <= 3 ? 0 : i % 2
    const col = ids.length <= 3 ? i : Math.floor(i / 2)
    const n = ids.length <= 3 ? ids.length : cols
    return {
      id,
      x: 22 + (col + 0.5) * (58 / n) + (row ? 3 : -3),
      y: ids.length <= 3 ? 38 : 26 + row * 24,
      flip: Math.random() < cfg.flips,
    }
  })
  return { spots, tray: shuffle(ids) }
}

export function Shadows({ profile, level, onComplete, onExit }: GameProps) {
  const [roundIdx, setRoundIdx] = useState(0)
  const rounds = useMemo(() => Array.from({ length: ROUNDS }, () => makeRound(shadowCfg(level))), [level])
  const round = rounds[roundIdx]
  const [placed, setPlaced] = useState<Set<AnimalId>>(new Set())
  const [wrongSpot, setWrongSpot] = useState<AnimalId | null>(null)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const spotRefs = useRef<Partial<Record<AnimalId, HTMLDivElement | null>>>({})
  /** Har joylashtirishda +1: eski ovoz ketma-ketligi yangisini bosib ketmasin */
  const speech = useRef(0)

  // "Qanday bajariladi?": qo'l hayvonni o'z soyasiga sudrab ko'rsatadi
  const howto = useHowTo(profile.id, 'qora', () => {
    const id = round.tray.find((a) => !placed.has(a))
    if (id) howto.drag(pathBetween(`.tray-animal[data-id="${id}"]`, `.silhouette[data-id="${id}"]`))
  })
  useEffect(() => {
    const first = howto.arm('soya')
    if (roundIdx === 0 || first.length) void say(...first, ...(roundIdx === 0 ? ['qora_intro'] : []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx])

  function handleDrop(id: AnimalId, info: PanInfo) {
    const { x, y } = info.point
    let best: { id: AnimalId; d: number } | null = null
    for (const s of round.spots) {
      if (placed.has(s.id)) continue
      const r = spotRefs.current[s.id]?.getBoundingClientRect()
      if (!r) continue
      const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2))
      if (d < Math.max(r.width, r.height) * 0.75 && (!best || d < best.d)) best = { id: s.id, d }
    }
    if (!best) return

    if (best.id === id) {
      sfx.pop()
      react('happy')
      burstAt(spotRefs.current[id], ['#ffd166', '#fff6b0', '#a2d2ff'])
      const next = new Set(placed).add(id)
      setPlaced(next)
      const last = next.size === round.spots.length
      if (last) howto.done()
      const my = ++speech.current
      // Hayvon o'z ovozida "javob beradi", keyin ismi aytiladi; oxirgisidan keyin "Xayrli tun"
      void (async () => {
        await sayAnimal(id)
        if (my !== speech.current) return
        await say(`hayvon_${id}`)
        if (!last || my !== speech.current) return
        await say('qora_tun')
        await wait(600)
        if (roundIdx + 1 >= ROUNDS) setFinished(true)
        else {
          sfx.whoosh()
          setPlaced(new Set())
          setRoundIdx((i) => i + 1)
        }
      })()
    } else {
      mistakes.current++
      howto.miss()
      sfx.wrong()
      react('oops')
      setWrongSpot(best.id)
      setTimeout(() => setWrongSpot(null), 450)
      void say('yana')
    }
  }

  const allPlaced = placed.size === round.spots.length

  return (
    <GameShell className="shadows" mascot={mascot} round={roundIdx} rounds={ROUNDS} onExit={onExit}>
      <motion.div className="night-moon" animate={allPlaced ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1 }}>
        <svg viewBox="0 0 100 100" className="art">
          <circle cx={50} cy={50} r={40} fill="#fff3b0" />
          <circle cx={38} cy={42} r={6} fill="#f2e394" />
          <circle cx={62} cy={60} r={9} fill="#f2e394" />
          <path d={allPlaced ? 'M36 62Q50 74 64 62' : 'M38 64Q50 68 62 64'} fill="none" stroke="#c9a227" strokeWidth={3} strokeLinecap="round" />
        </svg>
      </motion.div>
      <div className="pen" />

      {round.spots.map((s) => (
        <motion.div
          key={`${roundIdx}-${s.id}`}
          ref={(el) => {
            spotRefs.current[s.id] = el
          }}
          className="silhouette"
          data-id={s.id}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          animate={wrongSpot === s.id ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {placed.has(s.id) ? (
            <motion.div initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="sleeping">
              <AnimalArt id={s.id} flip={s.flip} />
              <motion.span className="zz" animate={{ opacity: [0, 1, 0], y: [0, -16] }} transition={{ repeat: Infinity, duration: 2 }}>
                z
              </motion.span>
            </motion.div>
          ) : (
            <AnimalArt id={s.id} shadow flip={s.flip} />
          )}
        </motion.div>
      ))}

      <div className="tray">
        {round.tray
          .filter((id) => !placed.has(id))
          .map((id) => (
            <motion.div
              key={`${roundIdx}-${id}`}
              className="tray-animal"
              data-id={id}
              drag
              dragSnapToOrigin
              dragMomentum={false}
              dragElastic={1}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileDrag={{ scale: 1.2, zIndex: 50 }}
              onDragStart={() => sfx.tap()}
              onDragEnd={(_, info) => handleDrop(id, info)}
            >
              <AnimalArt id={id} />
            </motion.div>
          ))}
      </div>

      {!finished && howto.overlay}
      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current, tasks: rounds.reduce((a, r) => a + r.spots.length, 0) })} />}
    </GameShell>
  )
}
