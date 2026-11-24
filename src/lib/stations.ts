import type { Age, StationId } from '../types'

export interface Station {
  id: StationId
  name: string
  /** Xaritadagi joylashuv, 16:9 sahnaning % ida */
  x: number
  y: number
  /** Kunlik sayohatga kiradimi (Rasm uyi har doim ochiq, lekin majburiy emas) */
  daily: boolean
  minAge?: Age
}

// Tartib = kunlik sayohat tartibi.
// Bekatlar sahnaning pastki yarmida (o'tloqda): yuqorida fon rasmidagi qishloq ko'rinib tursin
export const STATIONS: Station[] = [
  { id: 'rasm', name: 'Rasm uyi', x: 5, y: 56, daily: false },
  { id: 'bog', name: "Bog'", x: 12.5, y: 82, daily: true },
  { id: 'bozor', name: 'Bozor', x: 20, y: 58, daily: true },
  { id: 'ferma', name: 'Ferma', x: 27.5, y: 82, daily: true },
  { id: 'raqam', name: 'Raqamlar uyi', x: 35, y: 58, daily: true },
  { id: 'ustaxona', name: 'Ustaxona', x: 42.5, y: 82, daily: true },
  { id: 'qora', name: "Kechki qo'ra", x: 50, y: 58, daily: true },
  { id: 'hisob', name: 'Hisob maktabi', x: 57.5, y: 82, daily: true },
  { id: 'harflar', name: 'Harflar uyi', x: 65, y: 58, daily: true, minAge: 5 },
  { id: 'shakl', name: 'Shakllar va ranglar', x: 72.5, y: 82, daily: true },
  { id: 'mantiq', name: 'Mantiq', x: 80, y: 58, daily: true },
  { id: 'yozuv', name: 'Yozuv maktabi', x: 87.5, y: 82, daily: true },
  { id: 'sher', name: "She'rlar", x: 95, y: 58, daily: true },
  { id: 'musiqa', name: 'Musiqa uyi', x: 96, y: 84, daily: true },
]

export const stationsFor = (age: Age) => STATIONS.filter((s) => !s.minAge || age >= s.minAge)

// ---------- Olamlar: bosh ekranda 3 ta katta karta, har biri o'z xaritasi bilan ----------

export type WorldId = 'qishloq' | 'maktab' | 'ijod'

export interface World {
  id: WorldId
  name: string
  /** Fon rasmi (art/bg/<bg>) */
  bg: string
  /** Bekatlar va ularning shu olam xaritasidagi joyi (16:9 sahnaning %) */
  stations: { id: StationId; x: number; y: number }[]
}

export const WORLDS: World[] = [
  {
    id: 'qishloq',
    name: 'Qishloq',
    bg: 'map',
    stations: [
      { id: 'bog', x: 15, y: 76 },
      { id: 'bozor', x: 32, y: 58 },
      { id: 'ferma', x: 50, y: 80 },
      { id: 'ustaxona', x: 68, y: 58 },
      { id: 'qora', x: 85, y: 76 },
    ],
  },
  {
    id: 'maktab',
    name: 'Maktab',
    bg: 'letters',
    stations: [
      { id: 'raqam', x: 12, y: 72 },
      { id: 'hisob', x: 27, y: 86 },
      { id: 'shakl', x: 42, y: 70 },
      { id: 'mantiq', x: 57, y: 86 },
      { id: 'yozuv', x: 72, y: 70 },
      { id: 'harflar', x: 87, y: 84 },
    ],
  },
  {
    id: 'ijod',
    name: 'Ijod',
    bg: 'studio',
    stations: [
      { id: 'rasm', x: 22, y: 74 },
      { id: 'musiqa', x: 50, y: 84 },
      { id: 'sher', x: 78, y: 74 },
    ],
  },
]

export const worldOf = (s: StationId): WorldId => WORLDS.find((w) => w.stations.some((x) => x.id === s))?.id ?? 'qishloq'

/** Olamdagi bekatlar (yoshga qarab) va ularning shu olamdagi joyi */
export function worldStations(w: WorldId, age: Age) {
  const world = WORLDS.find((x) => x.id === w)!
  const allowed = new Set(stationsFor(age).map((s) => s.id))
  return world.stations
    .filter((p) => allowed.has(p.id))
    .map((p) => ({ ...STATIONS.find((s) => s.id === p.id)!, x: p.x, y: p.y }))
}

export const dailyFor = (age: Age) => stationsFor(age).filter((s) => s.daily)

/** Har bekatda qo'lda yozilgan darajalar: 0..14. Undan keyin — cheksiz (endless) */
export const AUTHORED_LEVELS = 15

/** Yosh faqat boshlang'ich nuqta; keyin daraja bolaning natijasiga qarab o'zgaradi */
export const startLevel = (age: Age) => (age === 3 ? 0 : 5)

/** Natija yulduzlari: xatosiz — 3, 1–2 xato — 2, ko'proq — 1 (o'tdi, keyingi daraja ochiladi) */
export const starsFor = (mistakes: number) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1)

/** Daraja bolaga ko'rinadigan raqami: 15 dan keyin "∞" belgisi bilan */
export const levelLabel = (level: number) => `${level + 1}${level >= AUTHORED_LEVELS ? ' ∞' : ''}`

/**
 * O'yin jadvalidan daraja sozlamasini olish.
 * 0..14 — aniq jadval qatori. 15+ (endless) — eng qiyin 5 qatordan tasodifiy tanlov:
 * daraja oshgan sari eng qiyinlari ko'proq tushadi, lekin har safar yangi kombinatsiya chiqadi.
 * Har raund uchun alohida chaqirilsa, bitta o'yin ichida ham raundlar har xil bo'ladi.
 */
export function levelRow<T>(table: readonly T[], level: number): T {
  if (level < table.length) return table[Math.max(0, level)]
  const band = table.slice(-5)
  const extra = Math.min(level - table.length + 1, 20)
  // Og'irlik: i-qator (qiyinroq) uchun 1 + i * extra/4
  const weights = band.map((_, i) => 1 + (i * extra) / 4)
  let r = Math.random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < band.length; i++) {
    r -= weights[i]
    if (r <= 0) return band[i]
  }
  return band[band.length - 1]
}
