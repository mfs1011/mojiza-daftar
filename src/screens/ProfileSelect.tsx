import { motion } from 'framer-motion'
import { Mascot } from '../art/Mascot'
import { DomeArt, PoplarArt } from '../art/Scenery'
import { Hero } from '../components/Hero'
import { HoldButton } from '../components/HoldButton'
import { sfx } from '../lib/audio'
import type { Profile } from '../types'

interface Props {
  profiles: Profile[]
  onChoose: (p: Profile) => void
  onParent: () => void
}

export function ProfileSelect({ profiles, onChoose, onParent }: Props) {
  return (
    <div className="screen profiles">
      <div className="profiles-deco">
        <div className="deco-dome">
          <DomeArt />
        </div>
        <div className="deco-poplar p1">
          <PoplarArt />
        </div>
        <div className="deco-poplar p2">
          <PoplarArt />
        </div>
        <div className="deco-poplar p3">
          <PoplarArt />
        </div>
      </div>

      <motion.div className="title-row" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="title-mascot">
          <Mascot mood="idle" />
        </div>
        <h1 className="title">Mo'jiza Daftar</h1>
      </motion.div>

      <div className="profile-row">
        {profiles.map((p, i) => (
          <motion.button
            key={p.id}
            className="profile-card"
            style={{ background: p.color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.15 * i }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sfx.tap()
              onChoose(p)
            }}
          >
            <div className="card-hero">
              <Hero profile={p} mode="idle" />
            </div>
            <span className="pname">{p.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="parent-corner">
        <HoldButton onDone={onParent}>
          <svg viewBox="0 0 40 40" className="art">
            <circle cx={20} cy={20} r={7} fill="none" stroke="#3d2c1e" strokeWidth={3} />
            <path
              d="M20 4V10M20 30V36M4 20H10M30 20H36M8.7 8.7L13 13M27 27L31.3 31.3M8.7 31.3L13 27M27 13L31.3 8.7"
              stroke="#3d2c1e"
              strokeWidth={4}
              strokeLinecap="round"
            />
          </svg>
        </HoldButton>
        <small>Ota-ona: 2 soniya bosib turing</small>
      </div>
    </div>
  )
}
