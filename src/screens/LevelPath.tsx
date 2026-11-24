import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../art/Icon'
import { StationIcon, type DecorKind } from '../art/Scenery'
import { RewardReveal } from '../components/RewardReveal'
import type { Sticker } from '../lib/stickers'
import { Hero } from '../components/Hero'
import { sfx } from '../lib/audio'
import { AUTHORED_LEVELS, STATIONS } from '../lib/stations'
import type { GameStation, Profile } from '../types'

// Bekatning yo'l xaritasi: 1, 2, 3 … ∞ tugunlar. Har tugun — bitta daraja.
// O'tilgan tugunda 1–3 yulduz, keyingisi ochiq (qahramon shu yerda turadi), qolganlari qulfda.
// Bola o'tilgan darajalarni qayta o'ynashi mumkin (yulduzni yaxshilash uchun).

interface Props {
  profile: Profile
  station: GameStation
  /** Ochiq eng yuqori daraja (shu daraja hali o'tilmagan) */
  unlocked: number
  stars: number[]
  /** Hozirgina o'tilgan daraja: yulduzlar va keyingi tugun animatsiya bilan ochiladi */
  justDone?: number
  onPlay: (level: number) => void
  onBack: () => void
  /** Hozirgina olingan mukofot (stiker, hovli sovg'asi) */
  reward?: { sticker: Sticker; gifts: DecorKind[] | null } | null
  onRewardDone?: (gift?: DecorKind) => void
}

/** Tugunlar orasidagi masofa va to'lqin (vmin) */
const STEP = 17
const PAD = 14

const nodePos = (i: number) => ({ x: PAD + i * STEP, y: 50 + Math.sin(i * 0.85) * 22 })

/** Har bekatning yo'li o'z rangida */
const THEME: Record<GameStation, [string, string]> = {
  bog: ['#d8f3dc', '#95d5b2'],
  bozor: ['#ffe8cc', '#f6bd60'],
  ferma: ['#e9f5db', '#b5c99a'],
  ustaxona: ['#f8edeb', '#e3a587'],
  qora: ['#3d405b', '#1d3557'],
  harflar: ['#fefae0', '#dda15e'],
  raqam: ['#e0fbfc', '#98c1d9'],
  hisob: ['#fff1e6', '#f4a261'],
  shakl: ['#fde2e4', '#cdb4db'],
  mantiq: ['#e2ece9', '#84a59d'],
  yozuv: ['#edf6f9', '#83c5be'],
  sher: ['#fff8e7', '#e9c46a'],
}

export function LevelPath({ profile, station, unlocked, stars, justDone, onPlay, onBack, reward, onRewardDone }: Props) {
  // Mukofot oynasi qahramon keyingi tugunga yurib bo'lgach chiqadi
  const [showReward, setShowReward] = useState(false)
  useEffect(() => {
    if (!reward) return
    const t = setTimeout(() => setShowReward(true), 2600)
    return () => clearTimeout(t)
  }, [reward])
  const scrollRef = useRef<HTMLDivElement>(null)
  const info = STATIONS.find((s) => s.id === station)!
  // Ochiq tugundan keyin yana 6 tasi (qulfda) ko'rinib turadi: oldinda nima borligini ko'rsin
  const count = Math.max(unlocked + 7, 12)
  const total = stars.reduce((a, b) => a + (b ?? 0), 0)
  const [c1, c2] = THEME[station]
  const dark = station === 'qora'
  const width = PAD * 2 + (count - 1) * STEP

  // Ochiq tugunni ekran o'rtasiga olib kelish
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const vmin = Math.min(window.innerWidth, window.innerHeight) / 100
    el.scrollTo({ left: nodePos(unlocked).x * vmin - el.clientWidth / 2, behavior: justDone !== undefined ? 'smooth' : 'auto' })
  }, [unlocked, justDone])

  const pts = Array.from({ length: count }, (_, i) => nodePos(i))
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')
  const doneD = pts
    .slice(0, unlocked + 1)
    .map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`)
    .join(' ')

  return (
    <div className={`screen level-path ${dark ? 'dark' : ''}`} style={{ background: `linear-gradient(${c1}, ${c2})` }}>
      <div className="lp-head">
        <button className="lp-back" onClick={onBack} aria-label="Orqaga">
          <Icon name="back">
            <svg viewBox="0 0 40 40" className="art">
              <path d="M24 8L10 20L24 32" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Icon>
        </button>
        <div className="lp-title">
          <span className="lp-icon">
            <StationIcon id={station} />
          </span>
          {info.name}
        </div>
        <div className="lp-total">
          <Star on /> {total}
        </div>
      </div>

      <div className="lp-scroll" ref={scrollRef}>
        <div className="lp-track" style={{ width: `${width}vmin` }}>
          <svg className="lp-road" viewBox={`0 0 ${width} 100`} preserveAspectRatio="none" style={{ width: `${width}vmin` }}>
            <path d={d} fill="none" stroke="#ffffff88" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            <path d={d} fill="none" stroke="#ffffffcc" strokeWidth={1} strokeDasharray="2.5 3" strokeLinecap="round" />
            <path d={doneD} fill="none" stroke="#ffd166" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {pts.map((p, i) => {
            const st = stars[i] ?? 0
            const locked = i > unlocked
            const current = i === unlocked
            const endless = i >= AUTHORED_LEVELS
            const fresh = justDone === i
            return (
              <motion.button
                key={i}
                className={`lp-node ${locked ? 'locked' : ''} ${current ? 'current' : ''} ${st ? 'done' : ''} ${endless ? 'endless' : ''}`}
                style={{ left: `${p.x}vmin`, top: `${p.y}%` }}
                initial={fresh ? { scale: 1.4 } : false}
                animate={current ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={current ? { repeat: Infinity, duration: 1.2 } : { type: 'spring' }}
                whileTap={locked ? undefined : { scale: 0.9 }}
                onClick={() => {
                  if (locked) return void sfx.wrong()
                  sfx.tap()
                  onPlay(i)
                }}
                aria-label={`${i + 1}-daraja`}
              >
                {locked ? <Lock /> : <span className="lp-num">{i + 1}</span>}
                {endless && !locked && <span className="lp-inf">∞</span>}
                {st > 0 && (
                  <span className="lp-stars">
                    {[1, 2, 3].map((k) => (
                      <motion.span
                        key={k}
                        initial={fresh ? { scale: 0, y: -20 } : false}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: fresh ? 0.3 + k * 0.25 : 0, type: 'spring' }}
                      >
                        <Star on={k <= st} />
                      </motion.span>
                    ))}
                  </span>
                )}
              </motion.button>
            )
          })}

          {/* Qahramon ochiq tugun ustida turadi */}
          <motion.div
            className="lp-hero"
            initial={justDone !== undefined ? { left: `${nodePos(justDone).x}vmin`, top: `${nodePos(justDone).y}%` } : false}
            animate={{ left: `${nodePos(unlocked).x}vmin`, top: `${nodePos(unlocked).y}%` }}
            transition={{ duration: 1.2, delay: 1.2, ease: 'easeInOut' }}
          >
            <Hero profile={profile} mode="idle" />
          </motion.div>
        </div>
      </div>
      {reward && showReward && (
        <RewardReveal
          sticker={reward.sticker}
          gifts={reward.gifts}
          onDone={(g) => {
            setShowReward(false)
            onRewardDone?.(g)
          }}
        />
      )}
    </div>
  )
}

function Star({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="art lp-star">
      <path
        d="M20 3L25 14.5L37.5 15.5L28 24L31 36.5L20 30L9 36.5L12 24L2.5 15.5L15 14.5Z"
        fill={on ? '#ffd166' : '#ffffff66'}
        stroke="#3d2c1e"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Lock() {
  return (
    <svg viewBox="0 0 40 40" className="art lp-lock">
      <path d="M13 18V13A7 7 0 0 1 27 13V18" fill="none" stroke="#3d2c1e" strokeWidth={4} />
      <rect x={9} y={18} width={22} height={16} rx={4} fill="#adb5bd" stroke="#3d2c1e" strokeWidth={3} />
    </svg>
  )
}
