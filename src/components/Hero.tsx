import { motion, type TargetAndTransition, type Transition } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getHero } from '../lib/db'
import type { Profile } from '../types'

// Bolaning o'zi chizgan qahramoni. Rasm "tirik" ko'rinishi uchun:
//  1) chiziqlar biroz "qaynaydi" (SVG turbulence filtri, qo'lda chizilgan multfilm effekti),
//  2) tana siqilib-cho'ziladi, sakraydi, chayqaladi.

const urls = new Map<string, string | null>()
const listeners = new Set<() => void>()

async function load(profileId: string): Promise<string | null> {
  if (urls.has(profileId)) return urls.get(profileId) ?? null
  const blob = await getHero(profileId)
  const url = blob ? URL.createObjectURL(blob) : null
  urls.set(profileId, url)
  return url
}

/** Yangi chizma saqlanganda chaqiriladi: hamma joydagi qahramon yangilanadi */
export function invalidateHero(profileId: string) {
  const old = urls.get(profileId)
  if (old) URL.revokeObjectURL(old)
  urls.delete(profileId)
  listeners.forEach((f) => f())
}

/** undefined = yuklanmoqda, null = hali chizilmagan */
export function useHeroUrl(profileId: string): string | null | undefined {
  const [state, setState] = useState<{ id: string; url: string | null } | null>(null)
  useEffect(() => {
    let alive = true
    const refresh = () => void load(profileId).then((url) => alive && setState({ id: profileId, url }))
    refresh()
    listeners.add(refresh)
    return () => {
      alive = false
      listeners.delete(refresh)
    }
  }, [profileId])
  return state?.id === profileId ? state.url : undefined
}

/** Ilovada bir marta qo'yiladi: "qaynayotgan chiziq" filtri */
export function BoilFilter() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
      <filter id="boil">
        <feTurbulence type="fractalNoise" baseFrequency={0.03} numOctaves={2} seed={1}>
          <animate attributeName="seed" values="1;2;3;4" dur="0.5s" repeatCount="indefinite" calcMode="discrete" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale={4} />
      </filter>
    </svg>
  )
}

export type HeroMode = 'idle' | 'walk' | 'dance' | 'cheer' | 'sleep'

const MOVES: Record<HeroMode, { animate: TargetAndTransition; transition: Transition }> = {
  idle: {
    animate: { scaleY: [1, 1.05, 1], scaleX: [1, 0.97, 1], rotate: [-2, 2, -2] },
    transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
  },
  walk: {
    animate: { y: [0, -14, 0], rotate: [-7, 7, -7], scaleY: [0.92, 1.06, 0.92] },
    transition: { repeat: Infinity, duration: 0.5 },
  },
  dance: {
    animate: { rotate: [-14, 14, -14], y: [0, -22, 0], scaleX: [1, 1.12, 1] },
    transition: { repeat: Infinity, duration: 0.6 },
  },
  cheer: {
    animate: { y: [0, -36, 0], scale: [1, 1.15, 1] },
    transition: { repeat: 2, duration: 0.55 },
  },
  sleep: {
    animate: { scaleY: [1, 0.96, 1], rotate: -8 },
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
}

export function Hero({ profile, mode = 'idle', className }: { profile: Profile; mode?: HeroMode; className?: string }) {
  const url = useHeroUrl(profile.id)
  const move = MOVES[mode]
  return (
    <div className={`hero-art ${className ?? ''}`}>
      <div className="hero-shadow" />
      <motion.div key={mode} className="hero-body" style={{ originY: 1 }} animate={move.animate} transition={move.transition}>
        {url ? (
          <img src={url} alt="" draggable={false} className="hero-img" />
        ) : url === null ? (
          <span className="hero-emoji">{profile.avatar}</span>
        ) : null}
      </motion.div>
    </div>
  )
}
