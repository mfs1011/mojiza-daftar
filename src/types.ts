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

export type StationId = 'rasm' | 'bog' | 'bozor' | 'ferma' | 'ustaxona' | 'qora' | 'harflar' | 'raqam' | 'hisob' | 'shakl' | 'mantiq'
/** O'yin bekatlari (Rasm uyidan tashqari hammasi) */
export type GameStation = Exclude<StationId, 'rasm'>

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
  /** Har bekat yo'lidagi har daraja uchun eng yaxshi natija: 1..3 yulduz */
  stars?: Partial<Record<StationId, number[]>>
  /** Bugun o'ynalgan vaqt (ms): kunlik chegarani ota-ona sozlaydi */
  playedMs?: number
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
  | { name: 'path'; station: GameStation; justDone?: number }
  | { name: 'game'; station: GameStation; level: number }
  | { name: 'studio' }
  | { name: 'sleep' }
  | { name: 'parent' }
