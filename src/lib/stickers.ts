import { ALL_ANIMALS, ALL_FRUITS } from './names.ts'
import { SHAPE_ORDER } from './shapes.ts'

// Stiker albomi: har o'tilgan darajada bitta stiker. Avval hali yo'q stikerlar beriladi —
// bola albomni to'ldirishga intiladi. Ovoz: stiker nomi (hayvon_*, meva_*, shakl_*, odam_*).

export type StickerKind = 'animal' | 'fruit' | 'person' | 'shape'

export interface Sticker {
  id: string
  kind: StickerKind
  ref: string
  voice: string
}

export const PEOPLE = ['bobo', 'buvi', 'aka', 'opa', 'bola'] as const

export const STICKERS: Sticker[] = [
  ...ALL_ANIMALS.map((a) => ({ id: `animal:${a}`, kind: 'animal' as const, ref: a, voice: `hayvon_${a}` })),
  ...ALL_FRUITS.map((f) => ({ id: `fruit:${f}`, kind: 'fruit' as const, ref: f, voice: `meva_${f}` })),
  ...PEOPLE.map((p) => ({ id: `person:${p}`, kind: 'person' as const, ref: p, voice: `odam_${p}` })),
  ...SHAPE_ORDER.map((s) => ({ id: `shape:${s}`, kind: 'shape' as const, ref: s, voice: `shakl_${s}` })),
]

export const STICKER_PAGES: { kind: StickerKind; title: string }[] = [
  { kind: 'animal', title: 'Hayvonlar' },
  { kind: 'fruit', title: 'Mevalar' },
  { kind: 'person', title: 'Odamlar' },
  { kind: 'shape', title: 'Shakllar' },
]

/** Keyingi stiker: avval yo'qlaridan tasodifiy, hammasi yig'ilgan bo'lsa — istalgani */
export function nextSticker(owned: string[]): Sticker {
  const have = new Set(owned)
  const fresh = STICKERS.filter((s) => !have.has(s.id))
  const pool = fresh.length ? fresh : STICKERS
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Har nechanchi darajada hovli uchun sovg'a beriladi */
export const YARD_GIFT_EVERY = 5
