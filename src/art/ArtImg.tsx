import type { CSSProperties } from 'react'
import type { Anim } from '../lib/assets'

/** Tayyor (AI/rassom) rasm: SVG o'rnida xuddi shu o'lchamda ko'rinadi */
export function ArtImg({ src, className, alt = '', style }: { src: string; className?: string; alt?: string; style?: CSSProperties }) {
  return <img src={src} alt={alt} draggable={false} className={`art art-img ${className ?? ''}`} style={style} />
}

/** Animatsiya (sprite sheet): kadrlar bir qatorda, CSS steps() bilan aylanadi */
export function ArtSprite({ anim, className, style }: { anim: Anim; className?: string; style?: CSSProperties }) {
  return (
    <div className={`art sprite-box ${className ?? ''}`} style={style}>
      <div
        className="sprite"
        style={{
          aspectRatio: anim.aspect,
          backgroundImage: `url("${anim.url}")`,
          backgroundSize: `${anim.frames * 100}% 100%`,
          animation: `sprite-play ${anim.frames / anim.fps}s steps(${anim.frames}, jump-none) infinite`,
        }}
      />
    </div>
  )
}
