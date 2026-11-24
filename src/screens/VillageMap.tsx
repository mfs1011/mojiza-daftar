import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { FruitArt } from '../art/Fruit'
import { CoinArt, StationIcon } from '../art/Scenery'
import { artUrl } from '../lib/assets'
import { Hero, useHeroUrl, type HeroMode } from '../components/Hero'
import { sfx } from '../lib/audio'
import { WORLDS, worldStations, type WorldId } from '../lib/stations'
import type { Profile, Progress, StationId } from '../types'
import { Icon } from '../art/Icon'

interface Props {
  /** Qaysi olam xaritasi (Qishloq, Maktab, Ijod) */
  world: WorldId
  profile: Profile
  progress: Progress
  /** Qahramon qaysi bekatdan qaytdi (yurish animatsiyasi shu yerdan boshlanadi) */
  arrivedFrom: StationId | null
  onPlay: (s: StationId) => void
  /** Olamlar ekraniga qaytish */
  onHome: () => void
  onSleep: () => void
}

function MapBackground({ world }: { world: WorldId }) {
  const w = WORLDS.find((x) => x.id === world)!
  const pathPoints = w.stations.map((s) => `${s.x * 16},${s.y * 9}`).join(' ')
  const img = artUrl(`bg/${w.bg}`)
  if (img)
    // Tayyor xarita rasmi + ustida faqat bekatlarni bog'lovchi yo'l
    return (
      <>
        <img src={img} alt="" className="map-bg" draggable={false} style={{ objectFit: 'cover' }} />
        <svg viewBox="0 0 1600 900" className="map-bg" preserveAspectRatio="none">
          <polyline points={pathPoints} fill="none" stroke="#f6e7c1" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />
          <polyline points={pathPoints} fill="none" stroke="#e9c46a" strokeWidth={4} strokeDasharray="14 18" strokeLinecap="round" />
        </svg>
      </>
    )
  return (
    <svg viewBox="0 0 1600 900" className="map-bg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ecae6" />
          <stop offset="1" stopColor="#e0f4ff" />
        </linearGradient>
      </defs>
      <rect width={1600} height={900} fill="url(#sky)" />
      <circle cx={1440} cy={100} r={58} fill="#ffd166" />
      <circle cx={1440} cy={100} r={80} fill="#ffd166" opacity={0.25} />

      {/* Chimyon tog'lari */}
      <path d="M0 300L170 170L300 250L470 110L640 260L790 160L950 270L1120 140L1290 260L1450 180L1600 240V430H0Z" fill="#b8c0ff" opacity={0.75} />
      <path d="M470 110L430 150L470 140L510 160ZM1120 140L1085 175L1120 165L1160 180ZM170 170L140 195L170 188L200 200Z" fill="#fff" />

      {/* Uzoqdagi shahar: gumbaz va minoralar */}
      <g fill="#7aa6c2" opacity={0.75}>
        <rect x={1120} y={300} width={180} height={60} />
        <path d="M1160 300C1160 250 1220 250 1220 300Z" />
        <path d="M1230 300C1230 262 1280 262 1280 300Z" />
        <rect x={1100} y={240} width={16} height={120} />
        <rect x={1300} y={250} width={16} height={110} />
        <rect x={300} y={318} width={90} height={42} />
        <path d="M318 318C318 284 372 284 372 318Z" />
      </g>

      <path d="M0 380C300 300 500 420 800 360C1100 300 1300 400 1600 340V900H0Z" fill="#a7d7a0" />
      {/* Teraklar qatori */}
      {Array.from({ length: 22 }, (_, i) => {
        const x = 30 + i * 74 + (i % 3) * 8
        const y = 360 + Math.sin(i * 0.9) * 26
        return (
          <g key={i}>
            <rect x={x - 3} y={y - 10} width={6} height={22} fill="#8d5524" />
            <ellipse cx={x} cy={y - 48} rx={13} ry={44} fill={i % 2 ? '#52b788' : '#40916c'} />
          </g>
        )
      })}
      <path d="M0 520C300 450 600 560 900 500C1200 440 1400 540 1600 480V900H0Z" fill="#8cc084" />

      {/* Ariq */}
      <path d="M0 840C300 780 520 890 820 835S1300 770 1600 810" fill="none" stroke="#8ecae6" strokeWidth={56} />
      <path d="M0 840C300 780 520 890 820 835S1300 770 1600 810" fill="none" stroke="#bde0fe" strokeWidth={14} strokeDasharray="40 60" />

      {/* Yo'l */}
      <polyline points={pathPoints} fill="none" stroke="#e9d5a1" strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pathPoints} fill="none" stroke="#f6e7c1" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pathPoints} fill="none" stroke="#e9c46a" strokeWidth={4} strokeDasharray="14 18" strokeLinecap="round" />
    </svg>
  )
}

export function VillageMap({ world, profile, progress, arrivedFrom, onPlay, onHome, onSleep }: Props) {
  const heroUrl = useHeroUrl(profile.id)
  const stations = worldStations(world, profile.age)
  const done = new Set(progress.stationsDone)
  const needsHero = heroUrl === null
  // Tavsiya: shu olamda bugun hali o'ynalmagan birinchi bekat
  const next: StationId | null = needsHero
    ? stations.some((s) => s.id === 'rasm')
      ? 'rasm'
      : null
    : (stations.find((s) => !done.has(s.id))?.id ?? null)

  const [heroAt, setHeroAt] = useState<StationId>(
    arrivedFrom && stations.some((s) => s.id === arrivedFrom) ? arrivedFrom : (next ?? stations[0].id),
  )
  const [heroMode, setHeroMode] = useState<HeroMode>('idle')
  const stageRef = useRef<HTMLDivElement>(null)
  // Sovg'alar endi albom va hovliga tushadi — xarita doim toza va bosiladigan
  const busy = false

  // Qahramon keyingi bekatga yurib boradi (sovg'a joylab bo'lingach)
  useEffect(() => {
    if (busy || heroUrl === undefined) return
    const target = next ?? heroAt
    if (target === heroAt) {
      if (progress.dayDone) {
        const t = setTimeout(onSleep, 2500)
        return () => clearTimeout(t)
      }
      return
    }
    const t1 = setTimeout(() => {
      setHeroMode('walk')
      setHeroAt(target)
    }, 400)
    const t2 = setTimeout(() => setHeroMode('idle'), 2200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [busy, next, heroAt, heroUrl, progress.dayDone, onSleep])

  const hs = stations.find((s) => s.id === heroAt) ?? stations[0]

  return (
    <div className={`screen map world-${world}`}>
      <div className="stage" ref={stageRef}>
        <MapBackground world={world} />

        <motion.div className="cloud" animate={{ x: ['0%', '120%', '0%'] }} transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}>
          <svg viewBox="0 0 120 50" className="art">
            <path d="M20 44C6 44 6 26 20 26C20 10 44 8 50 20C58 6 84 8 86 24C102 22 110 44 94 44Z" fill="#fff" />
          </svg>
        </motion.div>

        {stations.map((s) => {
          const isNext = s.id === next
          const isDone = done.has(s.id)
          // Hamma bekatlar ochiq; "next" — faqat tavsiya (bugun hali o'ynalmagan birinchisi)
          const tappable = !busy && (s.id === 'rasm' || !needsHero)
          return (
            <motion.button
              key={s.id}
              className={`station ${isDone ? 'done' : ''} ${isNext ? 'next' : ''} ${!tappable ? 'later' : ''}`}
              data-id={s.id}
              style={{ left: `${s.x}%`, top: `${s.y}%`, x: '-50%', y: '-50%' }}
              animate={isNext && !busy ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={isNext ? { repeat: Infinity, duration: 1.3 } : undefined}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                if (busy) return
                if (tappable) {
                  sfx.tap()
                  onPlay(s.id)
                } else sfx.wrong()
              }}
            >
              <StationIcon id={s.id} />
              {isDone && (
                <span className="st-badge">
                  <svg viewBox="0 0 40 40" className="art">
                    <circle cx={20} cy={20} r={17} fill="#06d6a0" stroke="#fff" strokeWidth={4} />
                    <path d="M12 21L18 27L29 14" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              {isNext && !busy && (
                <motion.span className="next-arrow" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                  <svg viewBox="0 0 40 40" className="art">
                    <path d="M20 36L6 18H14V4H26V18H34Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
                  </svg>
                </motion.span>
              )}
            </motion.button>
          )
        })}

        <motion.div
          className="map-hero"
          initial={false}
          animate={{ left: `${hs.x + (hs.x < 15 ? 7.5 : -7.5)}%`, top: `${hs.y - 6}%` }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          style={{ zIndex: 120, x: '-50%', y: '-50%' }}
        >
          <Hero profile={profile} mode={heroMode} />
        </motion.div>
      </div>

      <button className="home-btn" onClick={onHome} aria-label="Olamlar">
        <Icon name="home"><svg viewBox="0 0 40 40" className="art">
          <path d="M6 20L20 7L34 20M10 17V33H30V17" fill="#ffd166" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
          <rect x={17} y={23} width={6} height={10} fill="#8d5524" />
        </svg></Icon>
      </button>
      <div className="hud">
        <span>
          <span className="hud-icon">
            <FruitArt kind="olma" />
          </span>
          {progress.fruits}
        </span>
        <span>
          <span className="hud-icon">
            <CoinArt />
          </span>
          {progress.coins}
        </span>
      </div>

    </div>
  )
}
