import type { CSSProperties } from 'react'
import { animOf, artUrl } from '../lib/assets'
import { setThingReady } from '../lib/stickers'
import { THINGS, type ThingId } from '../lib/things'
import { ArtImg, ArtSprite } from './ArtImg'

/** Yangi "narsa" rasmi (hayvon/sabzavot/buyum/tabiat/kasb); rasm hali yo'q bo'lsa — nomining bosh harfi */
export function ThingArt({ id, className, style }: { id: ThingId; className?: string; style?: CSSProperties }) {
  const t = THINGS[id]
  const anim = animOf(t.art)
  if (anim) return <ArtSprite anim={anim} className={className} style={style} />
  const img = artUrl(t.art)
  if (img) return <ArtImg src={img} alt={t.name} className={className} style={style} />
  return (
    <svg viewBox="0 0 100 100" className={`art ${className ?? ''}`} style={style}>
      <circle cx={50} cy={50} r={42} fill="#ffd166" stroke="#3d2c1e" strokeWidth={4} />
      <text x={50} y={64} textAnchor="middle" fontSize={40} fontWeight={900} fill="#3d2c1e">
        {t.name[0]}
      </text>
    </svg>
  )
}

/** Rasmi tayyormi (rasm kelmaguncha topishmoq/variantlarda chiqmaydi) */
export const thingReady = (id: ThingId) => !!(animOf(THINGS[id].art) || artUrl(THINGS[id].art))

// Stiker tizimi rasmi tayyor narsalarnigina ko'rsatadi
setThingReady(thingReady)
