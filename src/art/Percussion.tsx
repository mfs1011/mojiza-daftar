import { motion } from 'framer-motion'
import { PADS } from '../lib/instruments'

// 🥁 Musiqa uyi zarbli cholg'ulari: haqiqiy ko'rinishdagi o'zbek doirasi (o'rtasi — "Bum",
// chekkasi — "Tak", halqali gardishi — "Jiring") va yonida boshqa zarbli asboblar.
// Pad raqamlari lib/instruments PADS tartibida: 0 Bum, 1 Tak, 2 Qarsak, 3 Qayroq, 4 Jiring, 5 Shaq, 6 Gumm, 7 Chiq.

interface KitProps {
  /** Nechta pad ishlatiladi (3..8) */
  count: number
  lit: number | null
  disabled: boolean
  onHit: (pad: number) => void
}

const RINGS = 14

function Doira({ count, lit, disabled, onHit }: KitProps) {
  const hit = (p: number) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) onHit(p)
  }
  const jingles = count > 4
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={`doira ${lit === 4 ? 'shake' : ''}`}
      animate={lit === 0 || lit === 1 ? { scale: 0.97 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 14 }}
    >
      <defs>
        <radialGradient id="skin" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#fbf1dc" />
          <stop offset="0.6" stopColor="#efd9ae" />
          <stop offset="1" stopColor="#c99c63" />
        </radialGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a8632f" />
          <stop offset="0.5" stopColor="#7a401b" />
          <stop offset="1" stopColor="#4e2810" />
        </linearGradient>
        <filter id="hide" x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.16 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      {/* Soya */}
      <ellipse cx="100" cy="196" rx="82" ry="5" fill="#0003" />
      {/* Yog'och gardish va naqsh */}
      <circle cx="100" cy="100" r="97" fill="url(#wood)" stroke="#3b1f0c" strokeWidth="2" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2
        return <circle key={i} cx={100 + Math.cos(a) * 90} cy={100 + Math.sin(a) * 90} r={i % 2 ? 1.6 : 2.6} fill={i % 2 ? '#f4d58d' : '#e63946'} />
      })}
      {/* Ichki halqachalar (metall) */}
      {Array.from({ length: RINGS }, (_, i) => {
        const a = (i / RINGS) * Math.PI * 2
        return (
          <g key={i} className="ring" style={{ transformOrigin: `${100 + Math.cos(a) * 82}px ${100 + Math.sin(a) * 82}px`, animationDelay: `${(i % 4) * 0.03}s` }}>
            <ellipse cx={100 + Math.cos(a) * 82} cy={100 + Math.sin(a) * 82} rx="5" ry="3.2" transform={`rotate(${(a * 180) / Math.PI + 90} ${100 + Math.cos(a) * 82} ${100 + Math.sin(a) * 82})`} fill="none" stroke="#d9d9d9" strokeWidth="1.8" />
          </g>
        )
      })}
      {/* Teri */}
      <circle cx="100" cy="100" r="76" fill="url(#skin)" stroke="#8a5a2b" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="76" fill="#000" filter="url(#hide)" />
      {/* Chekka ("tak") zonasi — ingichka chiziq bilan ajratilgan */}
      <circle cx="100" cy="100" r="46" fill="none" stroke="#b8894f" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
      {/* Urilganda to'lqin */}
      {(lit === 0 || lit === 1) && (
        <motion.circle
          key={`w${lit}-${Date.now()}`}
          cx="100"
          cy="100"
          fill="none"
          stroke={lit === 0 ? '#e76f51' : '#f4a261'}
          strokeWidth="4"
          initial={{ r: lit === 0 ? 10 : 50, opacity: 0.9 }}
          animate={{ r: 76, opacity: 0 }}
          transition={{ duration: 0.45 }}
        />
      )}
      {/* Bosiladigan zonalar */}
      {jingles && <circle className="zone" data-key={4} cx="100" cy="100" r="98" fill="transparent" onPointerDown={hit(4)} />}
      <circle className="zone" data-key={1} cx="100" cy="100" r="76" fill="transparent" onPointerDown={hit(1)} />
      <circle className="zone" data-key={0} cx="100" cy="100" r="46" fill="transparent" onPointerDown={hit(0)} />
      <text x="100" y="106" textAnchor="middle" className="doira-label">
        {PADS[0]}
      </text>
      <text x="100" y="160" textAnchor="middle" className="doira-label small">
        {PADS[1]}
      </text>
    </motion.svg>
  )
}

/** Yon cholg'ular rasmlari */
function SideArt({ pad }: { pad: number }) {
  switch (pad) {
    case 2: // Qarsak — ikki kaft
      return (
        <svg viewBox="0 0 100 100">
          <g transform="rotate(-18 45 60)">
            <path d="M30 88 C22 70 22 46 28 30 C30 24 37 25 37 31 L38 48 L40 18 C41 11 49 11 49 18 L49 46 L52 14 C53 7 61 8 61 15 L60 47 L64 22 C65 15 73 16 72 23 L69 60 C68 75 60 88 50 92 Z" fill="#f6c89f" stroke="#a86b3c" strokeWidth="3" strokeLinejoin="round" />
          </g>
          <g transform="translate(100 0) scale(-1 1) rotate(-18 45 60)">
            <path d="M30 88 C22 70 22 46 28 30 C30 24 37 25 37 31 L38 48 L40 18 C41 11 49 11 49 18 L49 46 L52 14 C53 7 61 8 61 15 L60 47 L64 22 C65 15 73 16 72 23 L69 60 C68 75 60 88 50 92 Z" fill="#ffd9b3" stroke="#a86b3c" strokeWidth="3" strokeLinejoin="round" />
          </g>
        </svg>
      )
    case 3: // Qayroq — ikki silliq tosh
      return (
        <svg viewBox="0 0 100 100">
          <defs>
            <radialGradient id="stone" cx="35%" cy="30%">
              <stop offset="0" stopColor="#d9d9d9" />
              <stop offset="1" stopColor="#5c5c5c" />
            </radialGradient>
          </defs>
          <ellipse cx="38" cy="58" rx="24" ry="30" transform="rotate(-20 38 58)" fill="url(#stone)" stroke="#333" strokeWidth="2.5" />
          <ellipse cx="64" cy="48" rx="22" ry="29" transform="rotate(18 64 48)" fill="url(#stone)" stroke="#333" strokeWidth="2.5" />
          <path d="M55 22 l6 -8 M66 20 l3 -9 M74 26 l8 -6" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 5: // Shaq — shaqildoq
      return (
        <svg viewBox="0 0 100 100">
          <rect x="44" y="56" width="12" height="38" rx="5" fill="#8d5524" stroke="#4e2810" strokeWidth="2.5" />
          <ellipse cx="50" cy="38" rx="27" ry="31" fill="#e9c46a" stroke="#7a4b12" strokeWidth="3" />
          <path d="M28 32 Q50 44 72 32 M26 46 Q50 58 74 46" stroke="#e76f51" strokeWidth="4" fill="none" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={32 + i * 9} cy={24 + (i % 2) * 4} r="2.4" fill="#2a9d8f" />
          ))}
        </svg>
      )
    case 6: // Gumm — nog'ora (sopol tanali katta baraban)
      return (
        <svg viewBox="0 0 100 100">
          <path d="M12 38 C12 78 30 94 50 94 C70 94 88 78 88 38 Z" fill="#b5651d" stroke="#5a2e0c" strokeWidth="3" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${16 + i * 14} 40 L${24 + i * 10} 88`} stroke="#f4d58d" strokeWidth="2.5" />
          ))}
          <ellipse cx="50" cy="38" rx="38" ry="12" fill="#f3e2c0" stroke="#5a2e0c" strokeWidth="3" />
          <ellipse cx="44" cy="35" rx="16" ry="4" fill="#fff8" />
        </svg>
      )
    case 7: // Chiq — kichik mis zang
      return (
        <svg viewBox="0 0 100 100">
          <defs>
            <radialGradient id="brass" cx="40%" cy="35%">
              <stop offset="0" stopColor="#fff3b0" />
              <stop offset="0.6" stopColor="#e0b13a" />
              <stop offset="1" stopColor="#8a6212" />
            </radialGradient>
          </defs>
          <path d="M50 10 C64 10 70 24 72 44 C74 60 82 66 86 72 L14 72 C18 66 26 60 28 44 C30 24 36 10 50 10 Z" fill="url(#brass)" stroke="#6b4a0b" strokeWidth="3" />
          <rect x="12" y="70" width="76" height="8" rx="4" fill="#c9971f" stroke="#6b4a0b" strokeWidth="2.5" />
          <circle cx="50" cy="86" r="7" fill="#8a6212" />
          <circle cx="50" cy="8" r="5" fill="none" stroke="#6b4a0b" strokeWidth="3" />
        </svg>
      )
    default:
      return null
  }
}

const SIDE = [2, 3, 5, 6, 7]

export function DoiraKit(props: KitProps) {
  const { count, lit, disabled, onHit } = props
  const side = SIDE.filter((p) => p < count)
  return (
    <div className="doira-kit">
      <div className="doira-wrap">
        <Doira {...props} />
      </div>
      {side.length > 0 && (
        <div className={`side-kit n${side.length}`}>
          {side.map((p) => (
            <motion.button
              key={p}
              className={`side-pad ${lit === p ? 'lit' : ''}`}
              data-key={p}
              onPointerDown={(e) => {
                e.preventDefault()
                if (!disabled) onHit(p)
              }}
              animate={lit === p ? { scale: 0.9, rotate: p === 5 ? [0, -14, 12, 0] : 0 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 700, damping: 16 }}
            >
              <SideArt pad={p} />
              <span>{PADS[p]}</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
