import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  onDone: () => void
  /** Necha ms bosib turish kerak. Bola tasodifan bosib qo'ymasligi uchun. */
  ms?: number
  className?: string
  children: ReactNode
}

/** Ota-ona uchun himoyalangan tugma: faqat uzoq bosib tursa ishlaydi. */
export function HoldButton({ onDone, ms = 2000, className, children }: Props) {
  const [holding, setHolding] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const start = () => {
    setHolding(true)
    timer.current = window.setTimeout(() => {
      setHolding(false)
      onDone()
    }, ms)
  }
  const cancel = () => {
    setHolding(false)
    window.clearTimeout(timer.current)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <button
      className={`hold-btn ${className ?? ''}`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.span
        className="hold-fill"
        initial={false}
        animate={{ scaleY: holding ? 1 : 0 }}
        transition={{ duration: holding ? ms / 1000 : 0.15, ease: 'linear' }}
      />
      <span className="hold-label">{children}</span>
    </button>
  )
}
