import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Mascot, type Mood } from '../art/Mascot'

/** Popishakning kayfiyati: react('happy') -> bir oz quvonadi, keyin tinchlanadi */
export function useMascot() {
  const [state, setState] = useState<{ mood: Mood; key: number }>({ mood: 'idle', key: 0 })
  const timer = useRef<number | undefined>(undefined)
  const react = useCallback((mood: Mood, ms = 1400) => {
    setState((s) => ({ mood, key: s.key + 1 }))
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState((s) => ({ mood: 'idle', key: s.key })), ms)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return [state, react] as const
}

interface Props {
  className: string
  mascot: { mood: Mood; key: number }
  round: number
  rounds: number
  onExit: () => void
  children: ReactNode
  /** Testlar uchun data-* atributlar */
  data?: Record<`data-${string}`, string | number>
}

/** Har bir o'yin uchun umumiy ramka: orqaga tugmasi, raund nuqtalari, Popishak */
export function GameShell({ className, mascot, round, rounds, onExit, children, data }: Props) {
  return (
    <div className={`screen game ${className}`} {...data}>
      {children}
      <button className="back-btn" onClick={onExit} aria-label="Orqaga">
        <svg viewBox="0 0 40 40" className="art">
          <path d="M24 10L12 20L24 30" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="pips">
        {Array.from({ length: rounds }, (_, i) => (
          <span key={i} className={`pip ${i < round ? 'done' : i === round ? 'now' : ''}`} />
        ))}
      </div>
      <div className="mascot-corner">
        <Mascot key={mascot.key} mood={mascot.mood} />
      </div>
    </div>
  )
}
