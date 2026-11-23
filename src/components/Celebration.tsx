import { motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { Mascot } from '../art/Mascot'
import { say, sfx } from '../lib/audio'
import { wait } from '../lib/util'

interface Props {
  /** Bayram paytida aytiladigan ovozlar */
  voice: string[]
  onDone: () => void
}

const COLORS = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#ff9f68', '#9b5de5']

// Tasodifiy qiymatlar modul darajasida bir marta hisoblanadi (render toza qoladi)
const PIECES = Array.from({ length: 46 }, (_, i) => ({
  x: Math.random() * 100,
  delay: Math.random() * 0.6,
  rotate: (Math.random() - 0.5) * 900,
  drift: (Math.random() - 0.5) * 30,
  w: 1.2 + Math.random() * 1.6,
  color: COLORS[i % COLORS.length],
  round: i % 4 === 0,
}))

export function Celebration({ voice, onDone }: Props) {
  const pieces = useMemo(() => PIECES, [])

  useEffect(() => {
    let cancelled = false
    sfx.success()
    void Promise.all([say(...voice), wait(2600)]).then(() => {
      if (!cancelled) onDone()
    })
    return () => {
      cancelled = true
    }
    // Faqat bir marta, ochilganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div className="celebration" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="confetti"
          style={{
            left: `${p.x}%`,
            width: `${p.w}vmin`,
            height: `${p.round ? p.w : p.w * 1.8}vmin`,
            background: p.color,
            borderRadius: p.round ? '50%' : '0.3vmin',
          }}
          initial={{ y: '-10vh', x: 0, rotate: 0 }}
          animate={{ y: '112vh', x: `${p.drift}vw`, rotate: p.rotate }}
          transition={{ duration: 2.4, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
      <motion.div
        className="celebration-mascot"
        initial={{ scale: 0, y: 80 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 12 }}
      >
        <Mascot mood="happy" />
      </motion.div>
    </motion.div>
  )
}
