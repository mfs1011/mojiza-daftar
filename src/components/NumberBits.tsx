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
export function CountGroup({ n, fruit, gone = 0, small }: { n: number; fruit: FruitKind; gone?: number; small?: boolean }) {
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
              <div key={i} className="tf-cell">
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
