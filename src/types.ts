import type { DecorKind } from './art/Scenery'

export type Age = 3 | 5

export interface Profile {
  id: string
  name: string
  age: Age
  /** Qahramon chizilmaguncha ishlatiladigan emoji */
  avatar: string
  color: string
}

export type StationId = 'rasm' | 'bog' | 'bozor' | 'ferma' | 'ustaxona' | 'qora' | 'harflar'

/** Bola o'zi tanlab, o'zi joylashtirgan bezak */
export interface PlacedDecor {
  kind: DecorKind
  /** Xaritadagi joyi, % da */
  x: number
  y: number
}

export interface Progress {
  profileId: string
  coins: number
  fruits: number
  village: PlacedDecor[]
  /** stationsDone qaysi kunga tegishli (YYYY-MM-DD) */
  day: string
  stationsDone: StationId[]
  /** Bugungi kun tugadimi (qahramon uxladimi) */
  dayDone: boolean
  /** Har bir o'yin uchun moslashuvchan qiyinlik darajasi: 0..14 qo'lda yozilgan, 15+ cheksiz */
  levels: Partial<Record<StationId, number>>
  /** Darajalar shkalasi: yo'q bo'lsa eski 0..4 (5 daraja), 15 — yangi */
  levelScale?: number
}

export interface GameResult {
  /** Jami xatolar: daraja shu bo'yicha moslashadi */
  mistakes: number
  coins?: number
  fruits?: number
}

export interface GameProps {
  profile: Profile
  level: number
  onComplete: (result: GameResult) => void
  onExit: () => void
}

export type Screen =
  | { name: 'profiles' }
  | { name: 'map' }
  | { name: 'game'; station: Exclude<StationId, 'rasm'> }
  | { name: 'studio' }
  | { name: 'sleep' }
  | { name: 'parent' }
