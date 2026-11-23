import type { CSSProperties } from 'react'

/** Tayyor (AI/rassom) rasm: SVG o'rnida xuddi shu o'lchamda ko'rinadi */
export function ArtImg({ src, className, alt = '', style }: { src: string; className?: string; alt?: string; style?: CSSProperties }) {
  return <img src={src} alt={alt} draggable={false} className={`art art-img ${className ?? ''}`} style={style} />
}
