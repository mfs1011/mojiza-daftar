import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// Ko'rsatuvchi qo'l: ekrandagi nuqtalar bo'ylab yuradi va "bosadi" yoki "chizadi".
// Bola o'qiy olmaydi — nima qilish kerakligini ko'zi bilan ko'radi.

export type HandPath = { x: number; y: number }[]

export function HandHint({ path, mode, onDone }: { path: HandPath; mode: 'tap' | 'trace'; onDone?: () => void }) {
  const [step, setStep] = useState(0)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    if (!path.length) return
    // Bosish: bitta nuqtaga borib, ikki marta bosadi. Chizish: nuqtalar bo'ylab silliq yuradi.
    const ms = mode === 'tap' ? 1800 : 2600
    const t = setTimeout(() => done.current?.(), ms + 300)
    return () => clearTimeout(t)
  }, [path, mode])

  useEffect(() => {
    if (mode !== 'trace' || path.length < 2) return
    const id = setInterval(() => setStep((s) => Math.min(s + 1, path.length - 1)), 2400 / path.length)
    return () => clearInterval(id)
  }, [mode, path])

  if (!path.length) return null
  const p = mode === 'tap' ? path[0] : path[step]
  return (
    <motion.div
      className="hand-hint"
      initial={{ opacity: 0, left: p.x + 60, top: p.y + 80 }}
      animate={
        mode === 'tap'
          ? { opacity: 1, left: p.x, top: p.y, scale: [1, 1, 0.82, 1, 0.82, 1] }
          : { opacity: 1, left: p.x, top: p.y, scale: 0.9 }
      }
      transition={mode === 'tap' ? { duration: 1.6, times: [0, 0.45, 0.55, 0.7, 0.8, 1] } : { duration: step === 0 ? 0.5 : 2.4 / path.length, ease: 'linear' }}
    >
      <svg viewBox="0 0 60 70" className="art">
        <path
          d="M22 6C26 6 28 9 28 13V32L30 31C33 30 36 32 37 34C40 33 43 35 44 37C47 36 51 38 51 42V54C51 62 45 68 36 68H30C24 68 20 65 17 60L7 44C5 41 6 38 9 37C12 36 14 37 16 40L16 13C16 9 18 6 22 6Z"
          fill="#fff"
          stroke="#3d2c1e"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M28 32V44M37 34V45M44 37V46" stroke="#3d2c1e" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
      {mode === 'tap' && <motion.span className="hand-ripple" animate={{ scale: [0, 1.6], opacity: [0.8, 0] }} transition={{ delay: 0.75, duration: 0.6, repeat: 1, repeatDelay: 0.1 }} />}
    </motion.div>
  )
}

/** Element markazi (ekran koordinatalarida) */
export function centerOf(el: Element | null): { x: number; y: number } | null {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}
