import { motion } from 'framer-motion'
import { artUrl } from '../lib/assets'

// Popishak (hudhud qushi): o'yinning yo'lboshchisi.
// Bolalar o'yinning o'ziga emas, qahramonga bog'lanadi, shuning uchun
// u har bir harakatga javob qaytaradi: xursand bo'ladi, hayron bo'ladi, uxlaydi.

export type Mood = 'idle' | 'happy' | 'oops' | 'sleep' | 'talk'

const INK = '#3d2c1e'
const BODY = '#e9a46a'
const BELLY = '#f6d1a8'

const CREST = [-52, -28, -6, 16, 38]

export function Mascot({ mood = 'idle', className }: { mood?: Mood; className?: string }) {
  const happy = mood === 'happy'
  const oops = mood === 'oops'
  const sleep = mood === 'sleep'
  const animate = happy
    ? { y: [0, -18, 0, -10, 0], rotate: [0, -4, 4, 0] }
    : oops
      ? { rotate: [0, -8, 6, -4, 0] }
      : sleep
        ? { y: [0, 2, 0] }
        : { y: [0, -3, 0] }
  const transition = happy || oops ? { duration: 0.8 } : { repeat: Infinity, duration: sleep ? 3 : 1.6 }

  // Tayyor rasm bo'lsa — kayfiyatga mos rasm, xuddi shu harakatlar bilan
  const img = artUrl(`mascot/${mood === 'talk' ? 'idle' : mood}`) ?? artUrl('mascot/idle')
  if (img)
    return (
      <motion.div className={`art mascot ${className ?? ''}`} animate={animate} transition={transition}>
        <img src={img} alt="" draggable={false} className="art art-img" />
      </motion.div>
    )

  return (
    <motion.svg viewBox="0 0 130 130" className={`art mascot ${className ?? ''}`} animate={animate} transition={transition}>
      <g stroke={INK} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
        {/* oyoqlar */}
        <path d="M56 104L54 118M70 104L72 118M48 118H60M66 118H78" fill="none" />

        {/* dum */}
        <path d="M30 86L8 96L12 86L6 78Z" fill="#212529" />

        {/* tana */}
        <ellipse cx={60} cy={84} rx={30} ry={24} fill={BODY} />
        <ellipse cx={68} cy={92} rx={17} ry={13} fill={BELLY} stroke="none" />

        {/* qanot: oq-qora yo'llar */}
        <motion.g
          style={{ originX: 0.9, originY: 0.2 }}
          animate={happy ? { rotate: [0, -25, 0, -25, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 }}
        >
          <path d="M30 76C38 66 58 68 62 78C58 92 40 100 26 94Z" fill="#212529" />
          <path d="M34 80L56 78M30 87L54 86M30 93L46 94" fill="none" stroke="#fff" strokeWidth={3.4} />
        </motion.g>

        {/* toj (popik) */}
        <motion.g
          style={{ originX: 0.5, originY: 1 }}
          animate={
            happy
              ? { scale: [1, 1.25, 1.1], rotate: 0 }
              : oops
                ? { scale: 0.75, rotate: -20 }
                : sleep
                  ? { scale: 0.7, rotate: -35 }
                  : { scale: 1, rotate: 0 }
          }
          transition={{ type: 'spring', stiffness: 220, damping: 10 }}
        >
          {CREST.map((a, i) => (
            <g key={i} transform={`rotate(${a} 74 44)`}>
              <ellipse cx={74} cy={22} rx={5.5} ry={18} fill="#f4a261" />
              <ellipse cx={74} cy={10} rx={4.2} ry={6} fill="#212529" stroke="none" />
              <rect x={70} y={15} width={8} height={3} fill="#fff" stroke="none" />
            </g>
          ))}
        </motion.g>

        {/* bosh */}
        <circle cx={76} cy={52} r={19} fill={BODY} />

        {/* tumshuq: uzun, egilgan */}
        <path d="M92 54C104 56 116 62 124 72C114 68 102 64 92 61Z" fill={INK} />

        {/* ko'z */}
        {sleep ? (
          <path d="M78 48Q83 53 88 48" fill="none" strokeWidth={2.8} />
        ) : happy ? (
          <path d="M77 50Q83 43 89 50" fill="none" strokeWidth={3} />
        ) : (
          <>
            <circle cx={83} cy={48} r={7} fill="#fff" />
            <circle cx={84.5} cy={49} r={3.8} fill="#212529" stroke="none" />
            <circle cx={86} cy={47.2} r={1.4} fill="#fff" stroke="none" />
          </>
        )}
        <circle cx={74} cy={59} r={4.5} fill="#ff8fab" opacity={0.6} stroke="none" />

        {oops && <path d="M96 30Q100 22 104 30M100 34V36" fill="none" strokeWidth={3} />}
      </g>
    </motion.svg>
  )
}
