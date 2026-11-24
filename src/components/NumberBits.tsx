import { motion } from 'framer-motion'
import { FruitArt } from '../art/Fruit'
import type { FruitKind } from '../lib/names'
import { shuffle } from '../lib/util'

// Raqamlar uyi va Hisob maktabi uchun umumiy bo'laklar.

/** To'g'ri javob + yaqin sonlardan chalg'ituvchilar (0..max oralig'ida, takrorsiz) */
export function numberOptions(answer: number, n: number, max: number, min = 0): number[] {
  const set = new Set([answer])
  for (let d = 1; set.size < n && d <= max + 2; d++) {
    for (const v of shuffle([answer - d, answer + d])) if (v >= min && v <= Math.max(max, answer + 2) && set.size < n) set.add(v)
  }
  return shuffle([...set])
}

/** Javob tugmalari: katta raqamli kartochkalar */
export function NumberChoices({
  options,
  wrong,
  right,
  onPick,
}: {
  options: (number | string)[]
  wrong: number | string | null
  right: number | string | null
  onPick: (v: number | string) => void
}) {
  return (
    <div className="num-choices">
      {options.map((v) => (
        <motion.button
          key={String(v)}
          className={`num-card ${right === v ? 'right' : ''}`}
          data-value={v}
          onClick={() => onPick(v)}
          initial={{ scale: 0 }}
          animate={wrong === v ? { x: [0, -10, 10, -6, 6, 0], scale: 1 } : { scale: right === v ? 1.15 : 1, x: 0 }}
          transition={{ duration: 0.35 }}
          whileTap={{ scale: 0.9 }}
        >
          {v}
        </motion.button>
      ))}
    </div>
  )
}

/**
 * Sanaladigan narsalar: 10 lik ramkalar (5 tadan ikki qator) — bola "beshlik"ni ko'zi bilan ilg'ashni o'rganadi.
 * `gone` — ketib qolganlari (ayirish): xira va siljigan holda ko'rinadi.
 */
export function CountGroup({ n, fruit, gone = 0, small, lit = 0 }: { n: number; fruit: FruitKind; gone?: number; small?: boolean; /** Sanab ko'rsatish: birinchi `lit` tasi yonadi va raqami chiqadi */ lit?: number }) {
  const frames = Math.max(1, Math.ceil(n / 10))
  return (
    <div className={`count-group ${small ? 'small' : ''}`}>
      {Array.from({ length: frames }, (_, f) => (
        <div key={f} className="ten-frame">
          {Array.from({ length: 10 }, (_, i) => {
            const k = f * 10 + i
            const has = k < n
            const leaving = has && k >= n - gone
            return (
              <div key={i} className={`tf-cell ${has && k < lit ? 'lit' : ''}`}>
                {has && k < lit && <span className="tf-count">{k + 1}</span>}
                {has && (
                  <motion.div
                    className="tf-item"
                    initial={{ scale: 0 }}
                    // Ketadiganlari: avval hamma qatori ko'rinadi, keyin birin-ketin xiralashib siljiydi
                    animate={
                      leaving
                        ? { scale: [0, 1, 1, 0.75], opacity: [1, 1, 1, 0.28], y: [0, 0, 0, -18], rotate: [0, 0, 0, 12] }
                        : { scale: 1, opacity: 1, y: 0 }
                    }
                    transition={
                      leaving
                        ? { delay: k * 0.04, duration: 1.8 + (k - (n - gone)) * 0.25, times: [0, 0.2, 0.65, 1] }
                        : { delay: k * 0.04, type: 'spring' }
                    }
                  >
                    <FruitArt kind={fruit} />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/**
 * Barmoqlar bilan son: ikki qo'l, chap qo'lda 1–5, o'ng qo'lda 6–10.
 * Ko'tarilgan barmoq — uzun, bukilgani — kalta. Bola barmoqlarida sanashni ko'rib o'rganadi.
 */
export function FingerHands({ n, small }: { n: number; small?: boolean }) {
  return (
    <div className={`finger-hands ${small ? 'small' : ''}`} data-n={n}>
      <Hand up={Math.min(5, n)} mirror />
      <Hand up={Math.max(0, n - 5)} />
    </div>
  )
}

// Barmoqlar: bosh barmoq yonda, qolganlari tepada (kaft markazidan)
const FINGERS: { x: number; len: number; w: number; tilt: number }[] = [
  { x: 14, len: 26, w: 13, tilt: -38 }, // bosh barmoq
  { x: 30, len: 40, w: 13, tilt: -6 },
  { x: 46, len: 44, w: 13, tilt: 0 },
  { x: 62, len: 41, w: 13, tilt: 5 },
  { x: 77, len: 33, w: 12, tilt: 12 },
]

function Hand({ up, mirror }: { up: number; mirror?: boolean }) {
  return (
    <svg viewBox="0 0 100 120" className="art finger-hand" style={mirror ? { transform: 'scaleX(-1)' } : undefined}>
      <g stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round">
        {FINGERS.map((f, i) => {
          // Sanash tartibi: bosh barmoqdan boshlab
          const raised = i < up
          const len = raised ? f.len : 12
          const baseY = i === 0 ? 74 : 58
          return (
            <motion.rect
              key={i}
              x={f.x - f.w / 2}
              width={f.w}
              rx={f.w / 2}
              fill={raised ? '#f1c27d' : '#e0ac69'}
              initial={false}
              animate={{ attrY: baseY - len, height: len + 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              transform={`rotate(${f.tilt} ${f.x} ${baseY})`}
            />
          )
        })}
        <path d="M18 62C18 54 26 50 34 52H74C84 52 90 58 88 70L84 100C82 110 74 116 62 116H40C28 116 20 108 20 96Z" fill="#f1c27d" />
      </g>
    </svg>
  )
}
