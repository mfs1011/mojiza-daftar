import { ALL_ANIMALS, ALL_FRUITS } from './names.ts'
import { SHAPE_ORDER } from './shapes.ts'
import { ALL_THINGS, THINGS, type ThingId } from './things.ts'

// Stiker albomi: har o'tilgan darajada bitta stiker. Avval hali yo'q stikerlar beriladi —
// bola albomni to'ldirishga intiladi. Ovoz: stiker nomi (hayvon_*, meva_*, shakl_*, odam_*).

export type StickerKind = 'animal' | 'fruit' | 'person' | 'shape' | 'thing'
/** Albom sahifasi */
export type StickerPage = 'animal' | 'fruit' | 'veg' | 'person' | 'obj' | 'nature' | 'shape'

export interface Sticker {
  id: string
  kind: StickerKind
  ref: string
  voice: string
  page: StickerPage
}

export const PEOPLE = ['bobo', 'buvi', 'aka', 'opa', 'bola'] as const

export const STICKERS: Sticker[] = [
  ...ALL_ANIMALS.map((a) => ({ id: `animal:${a}`, kind: 'animal' as const, ref: a, voice: `hayvon_${a}`, page: 'animal' as const })),
  ...ALL_FRUITS.map((f) => ({ id: `fruit:${f}`, kind: 'fruit' as const, ref: f, voice: `meva_${f}`, page: 'fruit' as const })),
  ...PEOPLE.map((p) => ({ id: `person:${p}`, kind: 'person' as const, ref: p, voice: `odam_${p}`, page: 'person' as const })),
  ...SHAPE_ORDER.map((s) => ({ id: `shape:${s}`, kind: 'shape' as const, ref: s, voice: `shakl_${s}`, page: 'shape' as const })),
  // Yangi narsalar: hayvonlar — "Hayvonlar"ga, kasblar — "Odamlar"ga, qolganlari — o'z sahifasiga
  ...ALL_THINGS.map((t) => ({
    id: `thing:${t}`,
    kind: 'thing' as const,
    ref: t,
    voice: `nom_${t}`,
    page: ({ hayvon: 'animal', sabzavot: 'veg', buyum: 'obj', tabiat: 'nature', kasb: 'person' } as const)[THINGS[t].cat],
  })),
]

export const STICKER_PAGES: { kind: StickerPage; title: string }[] = [
  { kind: 'animal', title: 'Hayvonlar' },
  { kind: 'fruit', title: 'Mevalar' },
  { kind: 'veg', title: 'Sabzavotlar' },
  { kind: 'obj', title: 'Buyumlar' },
  { kind: 'nature', title: 'Tabiat' },
  { kind: 'person', title: 'Odamlar' },
  { kind: 'shape', title: 'Shakllar' },
]

/** Rasmi tayyor stikerlar (yangi narsaning rasmi hali yaratilmagan bo'lsa — albomda ham, sovg'ada ham ko'rinmaydi) */
let readyCheck: (id: ThingId) => boolean = () => true
export function setThingReady(fn: (id: ThingId) => boolean) {
  readyCheck = fn
}
export const visibleStickers = () => STICKERS.filter((s) => s.kind !== 'thing' || readyCheck(s.ref as ThingId))

/** Keyingi stiker: avval yo'qlaridan tasodifiy, hammasi yig'ilgan bo'lsa — istalgani */
export function nextSticker(owned: string[]): Sticker {
  const have = new Set(owned)
  const all = visibleStickers()
  const fresh = all.filter((s) => !have.has(s.id))
  const pool = fresh.length ? fresh : all
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Har nechanchi darajada hovli uchun sovg'a beriladi */
export const YARD_GIFT_EVERY = 5
