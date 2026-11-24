import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FruitArt } from '../art/Fruit'
import { Icon } from '../art/Icon'
import { Mascot } from '../art/Mascot'
import { CoinArt, StationIcon } from '../art/Scenery'
import { Hero, useHeroUrl } from '../components/Hero'
import { artUrl } from '../lib/assets'
import { mascotCall, say, sfx } from '../lib/audio'
import { WORLDS, worldStations, type WorldId } from '../lib/stations'
import type { Profile, Progress } from '../types'

// 🌍 Bosh ekran: uchta olam — Qishloq, Maktab, Ijod. Har biri o'z xaritasi bilan ochiladi.
// Bekatlar bitta xaritaga tiqilib qolmaydi; bola qayerga borishini rasmidan taniydi.

interface Props {
  profile: Profile
  progress: Progress
  onWorld: (w: WorldId) => void
  onAlbum: () => void
  onYard: () => void
  onHome: () => void
  onSleep: () => void
}

const WORLD_COLOR: Record<WorldId, string> = { qishloq: '#52b788', maktab: '#3a86ff', ijod: '#e76f51' }

export function Worlds({ profile, progress, onWorld, onAlbum, onYard, onHome, onSleep }: Props) {
  const heroUrl = useHeroUrl(profile.id)
  const needsHero = heroUrl === null
  const [locked, setLocked] = useState<WorldId | null>(null)
  const bg = artUrl('bg/profiles')
  const done = new Set(progress.stationsDone)

  useEffect(() => {
    if (progress.dayDone) {
      const t = setTimeout(onSleep, 1800)
      return () => clearTimeout(t)
    }
    void say(needsHero ? 'rasm_intro' : `ism_${profile.id}`, ...(needsHero ? [] : ['salom']))
    // Faqat ochilganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="screen worlds" style={bg ? { backgroundImage: `url("${bg}")` } : undefined}>
      <div className="worlds-row">
        {WORLDS.map((w, i) => {
          const list = worldStations(w.id, profile.age)
          const stars = list.reduce((a, s) => a + (progress.stars?.[s.id]?.reduce((x, y) => x + (y ?? 0), 0) ?? 0), 0)
          const fresh = list.filter((s) => !done.has(s.id)).length
          const isLocked = needsHero && w.id !== 'ijod'
          const glow = needsHero ? w.id === 'ijod' : fresh > 0
          const img = artUrl(`bg/${w.bg}`)
          return (
            <motion.button
              key={w.id}
              className={`world-card ${isLocked ? 'locked' : ''} ${glow ? 'glow' : ''}`}
              data-world={w.id}
              style={{ '--wc': WORLD_COLOR[w.id] } as React.CSSProperties}
              initial={{ y: 80, opacity: 0, rotate: (i - 1) * 4 }}
              animate={
                locked === w.id
                  ? { x: [0, -12, 12, -8, 8, 0], y: 0, opacity: 1, rotate: (i - 1) * 3 }
                  : { y: [0, -8, 0], opacity: 1, rotate: (i - 1) * 3 }
              }
              transition={locked === w.id ? { duration: 0.4 } : { y: { repeat: Infinity, duration: 3 + i * 0.4, ease: 'easeInOut' }, delay: i * 0.12 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                if (isLocked) {
                  sfx.wrong()
                  setLocked(null)
                  requestAnimationFrame(() => setLocked(w.id))
                  void say('rasm_intro')
                  return
                }
                sfx.tap()
                onWorld(w.id)
              }}
            >
              <div className="world-pic" style={img ? { backgroundImage: `url("${img}")` } : undefined}>
                <div className="world-icons">
                  {list.slice(0, 3).map((s) => (
                    <span key={s.id} className="world-icon">
                      <StationIcon id={s.id} />
                    </span>
                  ))}
                </div>
                {isLocked && <span className="world-lock">🔒</span>}
              </div>
              <div className="world-name">{w.name}</div>
              <div className="world-stars">⭐ {stars}</div>
            </motion.button>
          )
        })}
      </div>

      <div className="worlds-hero">
        <Hero profile={profile} mode="idle" />
      </div>
      <button className="worlds-mascot" onClick={mascotCall} aria-label="Popishak">
        <Mascot mood="happy" />
      </button>

      <button className="home-btn" onClick={onHome} aria-label="Profillar">
        <Icon name="home">
          <svg viewBox="0 0 40 40" className="art">
            <path d="M6 20L20 7L34 20M10 17V33H30V17" fill="#ffd166" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
            <rect x={17} y={23} width={6} height={10} fill="#8d5524" />
          </svg>
        </Icon>
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
      <div className="map-collect">
        <motion.button className="collect-btn" whileTap={{ scale: 0.9 }} onClick={() => (sfx.tap(), onAlbum())} aria-label="Albom">
          <span>📒</span>
          <small>{progress.stickers?.length ?? 0}</small>
        </motion.button>
        <motion.button className="collect-btn" whileTap={{ scale: 0.9 }} onClick={() => (sfx.tap(), onYard())} aria-label="Hovli">
          <span>🏡</span>
          {(progress.yardInbox?.length ?? 0) > 0 && (
            <motion.small className="collect-new" animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              🎁 {progress.yardInbox!.length}
            </motion.small>
          )}
        </motion.button>
      </div>
    </div>
  )
}
