import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
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
export function CountGroup({
  n,
  fruit,
  gone = 0,
  small,
  lit = 0,
}: {
  n: number
  fruit: FruitKind
  gone?: number
  small?: boolean
  /** Sanab ko'rsatish: birinchi `lit` tasi yonadi va raqami chiqadi */ lit?: number
}) {
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
                        ? {
                            scale: [0, 1, 1, 0.75],
                            opacity: [1, 1, 1, 0.28],
                            y: [0, 0, 0, -18],
                            rotate: [0, 0, 0, 12],
                          }
                        : { scale: 1, opacity: 1, y: 0 }
                    }
                    transition={
                      leaving
                        ? {
                            delay: k * 0.04,
                            duration: 1.8 + (k - (n - gone)) * 0.25,
                            times: [0, 0.2, 0.65, 1],
                          }
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
  // Haqiqiy 3D qo'llar; WebGL bo'lmasa — 2D chizma
  if (webgl()) return <Hands3DLazy n={n} small={small} />
  return (
    <div className={`finger-hands ${small ? 'small' : ''}`} data-n={n}>
      <Hand up={Math.min(5, n)} mirror />
      <Hand up={Math.max(0, n - 5)} />
    </div>
  )
}

// Haqiqiyroq qo'l (orqa tomoni): tirnoqlar, bo'g'im burmalari, teri soyasi, bilakda yeng.
// Ko'tarilgan barmoq — to'liq uzunlikda; bukilgani — kaft ustida bo'g'im bo'rtig'i bo'lib qoladi;
// bosh barmoq bukilganda kaft ustiga qayriladi. Barmoqlar silliq ko'tarilib-bukiladi.
const FINGERS: { x: number; len: number; w: number; tilt: number }[] = [
  { x: 41, len: 47, w: 14.5, tilt: -8 },
  { x: 57, len: 52, w: 15, tilt: -1.5 },
  { x: 72.5, len: 48, w: 14, tilt: 5 },
  { x: 87, len: 38, w: 12, tilt: 13 },
]
const BASE_Y = 70

/** Barmoq shakli (tagi 0 da, uchi -L da). Buyruqlar tuzilishi doim bir xil — animatsiya silliq bo'lsin */
const fingerPath = (L: number, w: number) => `M${-w / 2} 4 L${-w / 2} ${-(L - w / 2)} A${w / 2} ${w / 2} 0 0 1 ${w / 2} ${-(L - w / 2)} L${w / 2} 4 Z`
const spring = { type: 'spring' as const, stiffness: 260, damping: 20 }

function Finger({ f, raised, id }: { f: (typeof FINGERS)[number]; raised: boolean; id: string }) {
  // Ko'tarilgan barmoq (kaft ortidan chiqadi); bukilganda pastga qisqaradi va yo'qoladi
  const L = raised ? f.len : 6
  return (
    <motion.g initial={false} animate={{ opacity: raised ? 1 : 0 }} transition={{ duration: 0.18 }} transform={`translate(${f.x} ${BASE_Y}) rotate(${f.tilt})`}>
      <motion.path initial={false} animate={{ d: fingerPath(L, f.w) }} transition={spring} fill={`url(#skin-${id})`} stroke="#a0643a" strokeWidth={2} />
      {[0.36, 0.64].map((k) => (
        <motion.path
          key={k}
          initial={false}
          animate={{
            d: `M${-f.w * 0.26} ${-L * k} Q0 ${-L * k + 2.2} ${f.w * 0.26} ${-L * k}`,
          }}
          transition={spring}
          stroke="#b97a4b"
          strokeWidth={1.3}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}
      <motion.ellipse
        initial={false}
        animate={{ cy: -(L - f.w * 0.78) }}
        transition={spring}
        cx={0}
        rx={f.w * 0.3}
        ry={f.w * 0.4}
        fill="#fde8db"
        stroke="#d59a7a"
        strokeWidth={1}
      />
    </motion.g>
  )
}

/** Bukilgan barmoq — mushtda kaft ustida yotgan bo'g'im (orqa tomondan ko'rinishi) */
function Knuckle({ f, folded, id }: { f: (typeof FINGERS)[number]; folded: boolean; id: string }) {
  const h = f.w * 1.35
  return (
    <g transform={`translate(${f.x} ${BASE_Y - 9}) rotate(${f.tilt * 0.4})`}>
      <motion.g initial={false} animate={{ opacity: folded ? 1 : 0, y: folded ? 0 : -8 }} transition={{ duration: 0.22 }}>
        <rect x={-f.w / 2} y={0} width={f.w} height={h} rx={f.w / 2} fill={`url(#skin-${id})`} stroke="#a0643a" strokeWidth={2} />
        <ellipse cx={0} cy={f.w * 0.42} rx={f.w * 0.26} ry={f.w * 0.15} fill="#ffe7cf" opacity={0.9} />
        <path d={`M${-f.w * 0.25} ${h * 0.72} Q0 ${h * 0.72 + 2} ${f.w * 0.25} ${h * 0.72}`} stroke="#b97a4b" strokeWidth={1.2} fill="none" opacity={0.7} />
      </motion.g>
    </g>
  )
}

function Hand({ up, mirror }: { up: number; mirror?: boolean }) {
  const id = mirror ? 'l' : 'r'
  const thumbUp = up > 0
  return (
    <svg viewBox="0 0 120 152" className="art finger-hand" style={mirror ? { transform: 'scaleX(-1)' } : undefined}>
      <defs>
        <linearGradient id={`skin-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9b487" />
          <stop offset="0.45" stopColor="#f8d3ad" />
          <stop offset="1" stopColor="#e2a676" />
        </linearGradient>
        <radialGradient id={`palm-${id}`} cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="#fbdcbc" />
          <stop offset="0.7" stopColor="#f1c296" />
          <stop offset="1" stopColor="#dc9f6e" />
        </radialGradient>
      </defs>
      {/* Ko'tarilgan bosh barmoq — kaftning yonidan qiya chiqadi */}
      {thumbUp && (
        <g transform="translate(36 100) rotate(-52)">
          <path d={fingerPath(38, 16)} fill={`url(#skin-${id})`} stroke="#a0643a" strokeWidth={2} />
          <path d="M-4 -19 Q0 -17 4 -19" stroke="#b97a4b" strokeWidth={1.3} fill="none" opacity={0.7} />
          <ellipse cx={0} cy={-38 + 12.5} rx={5} ry={6.4} fill="#fde8db" stroke="#d59a7a" strokeWidth={1} />
        </g>
      )}
      {FINGERS.map((f, i) => (
        // Sanash tartibi: bosh barmoq, ko'rsatkich, o'rta, nomsiz, jimjiloq
        <Finger key={i} f={f} raised={i + 1 < up} id={id} />
      ))}
      {/* Kaft (orqa tomoni) */}
      <path
        d="M33 73C32 64 40 60 48 60L92 60C101 61 104 69 102 79L96 109C93 120 85 125 74 126L55 126C44 125 37 118 35 107Z"
        fill={`url(#palm-${id})`}
        stroke="#a0643a"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Pay chiziqlari */}
      {FINGERS.map((f, i) => (
        <path
          key={i}
          d={`M${f.x + (66 - f.x) * 0.12} ${BASE_Y + 8} L${66 + (f.x - 66) * 0.4} 110`}
          stroke="#e7b088"
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.6}
        />
      ))}
      {FINGERS.map((f, i) => (
        <Knuckle key={i} f={f} folded={!(i + 1 < up)} id={id} />
      ))}
      {/* Bukilgan bosh barmoq — kaft ustiga qayrilgan */}
      {!thumbUp && (
        <g transform="translate(34 104) rotate(72)">
          <path d={fingerPath(34, 15)} fill={`url(#skin-${id})`} stroke="#a0643a" strokeWidth={2} />
          <ellipse cx={0} cy={-34 + 11} rx={4.6} ry={5.8} fill="#fde8db" stroke="#d59a7a" strokeWidth={1} />
        </g>
      )}
      {/* Yeng */}
      <path d="M48 123H84L88 152H44Z" fill="#3a86ff" stroke="#1d4e9e" strokeWidth={2} strokeLinejoin="round" />
      <path d="M47 123H85V131H46Z" fill="#ffd166" stroke="#1d4e9e" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  )
}

const Hands3DInner = lazy(() => import('./Hands3D').then((m) => ({ default: m.Hands3D })))
function Hands3DLazy(p: { n: number; small?: boolean }) {
  return (
    <Suspense fallback={<div className={`hands3d ${p.small ? 'small' : ''}`} />}>
      <Hands3DInner {...p} />
    </Suspense>
  )
}
let gl: boolean | null = null
function webgl(): boolean {
  if (gl === null) {
    try {
      gl = !!document.createElement('canvas').getContext('webgl2')
    } catch {
      gl = false
    }
  }
  return gl
}
