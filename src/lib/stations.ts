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

// Tartib = kunlik sayohat tartibi
export const STATIONS: Station[] = [
  { id: 'rasm', name: 'Rasm uyi', x: 8, y: 36, daily: false },
  { id: 'bog', name: "Bog'", x: 18, y: 70, daily: true },
  { id: 'bozor', name: 'Bozor', x: 33, y: 47, daily: true },
  { id: 'ferma', name: 'Ferma', x: 49, y: 72, daily: true },
  { id: 'ustaxona', name: 'Ustaxona', x: 64, y: 47, daily: true },
  { id: 'qora', name: "Kechki qo'ra", x: 79, y: 72, daily: true },
  { id: 'harflar', name: 'Harflar uyi', x: 91, y: 45, daily: true, minAge: 5 },
]

export const stationsFor = (age: Age) => STATIONS.filter((s) => !s.minAge || age >= s.minAge)

export const dailyFor = (age: Age) => stationsFor(age).filter((s) => s.daily)

export const MAX_LEVEL = 4

/** Yosh faqat boshlang'ich nuqta; keyin daraja bolaning natijasiga qarab o'zgaradi */
export const startLevel = (age: Age) => (age === 3 ? 0 : 2)

/** Xatosiz o'tsa qiyinlashadi, ko'p xato qilsa osonlashadi */
export function nextLevel(level: number, mistakes: number): number {
  if (mistakes === 0) return Math.min(MAX_LEVEL, level + 1)
  if (mistakes >= 5) return Math.max(0, level - 1)
  return level
}
