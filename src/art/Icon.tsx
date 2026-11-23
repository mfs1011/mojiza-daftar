import type { ReactNode } from 'react'
import { artUrl } from '../lib/assets'
import { ArtImg } from './ArtImg'

/**
 * Tugma ikonkasi: tayyor 3D ikonka (public/assets/art/icon/<name>.png) bo'lsa — u,
 * bo'lmasa — ichidagi SVG.
 */
export function Icon({ name, children }: { name: string; children: ReactNode }) {
  const img = artUrl(`icon/${name}`)
  return img ? <ArtImg src={img} /> : <>{children}</>
}
