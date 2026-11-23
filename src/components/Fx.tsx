import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

// "Jonlilik" effektlari: to'g'ri javobda yulduzchalar sachraydi.
// Istalgan joydan burst(x, y) yoki burstAt(element) chaqiriladi.

interface Burst {
  id: number
  x: number
  y: number
  colors: string[]
  count: number
}

const EVENT = 'qishloq-fx'
const DEFAULT_COLORS = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#ff9f68']
let seq = 0

export function burst(x: number, y: number, colors = DEFAULT_COLORS, count = 14) {
  window.dispatchEvent(new CustomEvent<Burst>(EVENT, { detail: { id: ++seq, x, y, colors, count } }))
}

export function burstAt(el: Element | null | undefined, colors?: string[], count?: number) {
  if (!el) return
  const r = el.getBoundingClientRect()
  burst(r.left + r.width / 2, r.top + r.height / 2, colors, count)
}

export function FxLayer() {
  const [bursts, setBursts] = useState<Burst[]>([])

  useEffect(() => {
    const on = (e: Event) => {
      const b = (e as CustomEvent<Burst>).detail
      setBursts((list) => [...list, b])
      setTimeout(() => setBursts((list) => list.filter((x) => x.id !== b.id)), 1000)
    }
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [])

  return (
    <div className="fx-layer">
      {bursts.map((b) =>
        Array.from({ length: b.count }, (_, i) => {
          const angle = (i / b.count) * Math.PI * 2 + (b.id % 7)
          const dist = 60 + ((i * 37 + b.id * 13) % 70)
          return (
            <motion.span
              key={`${b.id}-${i}`}
              className={`fx-bit ${i % 3 === 0 ? 'star' : ''}`}
              style={{ left: b.x, top: b.y, background: b.colors[i % b.colors.length] }}
              initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
              animate={{
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist + 20,
                scale: [0.4, 1.2, 0.6],
                opacity: [1, 1, 0],
                rotate: 180,
              }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
            />
          )
        }),
      )}
    </div>
  )
}
