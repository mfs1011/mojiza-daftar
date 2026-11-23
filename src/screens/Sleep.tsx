import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Mascot } from '../art/Mascot'
import { CoinArt } from '../art/Scenery'
import { Hero } from '../components/Hero'
import { say } from '../lib/audio'
import type { Profile, Progress } from '../types'
import { Icon } from '../art/Icon'

interface Props {
  profile: Profile
  progress: Progress
  onHome: () => void
}

const STARS = Array.from({ length: 34 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 60,
  d: Math.random() * 2,
  s: 0.5 + Math.random() * 0.9,
}))

/** Kun oxiri: qahramon va Popishak uxlaydi, o'yin ertagacha yopiladi. */
export function Sleep({ profile, progress, onHome }: Props) {
  useEffect(() => {
    void say('uxlash')
  }, [])

  return (
    <div className="screen sleep">
      {STARS.map((s, i) => (
        <motion.span
          key={i}
          className="star"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}vmin`, height: `${s.s}vmin` }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 2.4, delay: s.d }}
        />
      ))}
      <svg viewBox="0 0 100 100" className="art moon">
        <mask id="crescent">
          <rect width={100} height={100} fill="#fff" />
          <circle cx={68} cy={38} r={34} fill="#000" />
        </mask>
        <circle cx={50} cy={50} r={40} fill="#fff3b0" mask="url(#crescent)" />
      </svg>
      <svg viewBox="0 0 1600 300" className="sleep-hills" preserveAspectRatio="none">
        <path d="M0 120C300 40 600 160 900 90C1200 30 1400 120 1600 70V300H0Z" fill="#1d3557" />
        <path d="M0 200C400 130 800 240 1200 170C1400 140 1500 170 1600 160V300H0Z" fill="#14213d" />
      </svg>

      <div className="sleep-scene">
        <div className="sleep-hero">
          <Hero profile={profile} mode="sleep" />
          <motion.span className="zzz" animate={{ opacity: [0, 1, 0], y: [0, -40], x: [0, 24] }} transition={{ repeat: Infinity, duration: 2.6 }}>
            Z z z
          </motion.span>
        </div>
        <div className="sleep-mascot">
          <Mascot mood="sleep" />
        </div>
      </div>

      <div className="sleep-stats">
        <span className="hud-icon">
          <CoinArt />
        </span>
        {progress.coins}
      </div>

      <button className="home-btn" onClick={onHome} aria-label="Bosh sahifa">
        <Icon name="home"><svg viewBox="0 0 40 40" className="art">
          <path d="M6 20L20 7L34 20M10 17V33H30V17" fill="#ffd166" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
          <rect x={17} y={23} width={6} height={10} fill="#8d5524" />
        </svg></Icon>
      </button>
    </div>
  )
}
