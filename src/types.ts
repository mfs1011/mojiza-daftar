import type { DecorKind } from './art/Scenery'
import type { FruitKind } from './lib/names'
import type { WorldId } from './lib/stations'

export type Age = 3 | 5

export interface Profile {
  id: string
  name: string
  age: Age
  /** Qahramon chizilmaguncha ishlatiladigan emoji */
  avatar: string
  color: string
}

export type StationId = 'rasm' | 'bog' | 'bozor' | 'ferma' | 'ustaxona' | 'qora' | 'harflar' | 'raqam' | 'hisob' | 'shakl' | 'mantiq' | 'yozuv' | 'sher' | 'musiqa' | 'gaplash'
/** O'yin bekatlari (Rasm uyidan tashqari hammasi) */
export type GameStation = Exclude<StationId, 'rasm' | 'gaplash'>

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
  /** Albomdagi stikerlar (Sticker.id) */
  stickers?: string[]
  /** Hovli uchun tanlangan, hali joylanmagan sovg'alar */
  yardInbox?: DecorKind[]
  /** Ombor: bog'da terilgan mevalar (turi → soni). Bozorda shulardan sotiladi, hovlida hayvonlarga yediriladi */
  store?: FruitStore
  /** Do'kondan olingan o'yinchoq va kiyimlar (ThingId) */
  owned?: string[]
}

/** Mevalar ombori: turi → soni */
export type FruitStore = Partial<Record<FruitKind, number>>

export interface GameResult {
  /** Jami xatolar: daraja shu bo'yicha moslashadi */
  mistakes: number
  coins?: number
  fruits?: number
  /** Bog': terilgan mevalar (omborga qo'shiladi) */
  harvest?: FruitStore
  /** Bozor: sotilgan mevalar (ombordan ayriladi) */
  sold?: FruitStore
  /** Nechta topshiriq (javob) bo'ldi: aniqlik = tasks / (tasks + mistakes) */
  tasks?: number
  /** Yozuv mashqlari: har bir yozilgan harf/raqam/chiziq */
  traces?: TraceStat[]
}

/** Bitta yozuv mashqi: nima yozildi, necha urinishda, qancha vaqtda */
export interface TraceStat {
  glyph: string
  tries: number
  ms: number
}

/** Ota-ona statistikasi uchun: bitta o'yin (daraja) yozuvi */
export interface PlayRecord {
  id?: number
  profileId: string
  /** Boshlangan vaqt (ms) */
  ts: number
  station: StationId
  level: number
  /** Tugatdimi yoki o'rtada chiqib ketdimi */
  completed: boolean
  mistakes: number
  stars: number
  ms: number
  /** Nechta topshiriq bo'ldi (aniqlik uchun) */
  tasks?: number
  traces?: TraceStat[]
}

export interface GameProps {
  profile: Profile
  level: number
  onComplete: (result: GameResult) => void
  onExit: () => void
  /** Ombor (bozor shundan sotadi); berilmasa — cheksiz quti (eski xatti-harakat) */
  store?: FruitStore
  /** Boshqa bekatga o'tish (bozor → bog': "meva terib kel") */
  onGoto?: (station: GameStation) => void
}

export type Screen =
  | { name: 'profiles' }
  /** Bosh ekran: olamlar (Qishloq, Maktab, Ijod) */
  | { name: 'worlds' }
  | { name: 'map'; world: WorldId }
  | { name: 'path'; station: GameStation; justDone?: number }
  | { name: 'game'; station: GameStation; level: number }
  | { name: 'studio' }
  | { name: 'sleep' }
  | { name: 'parent' }
  | { name: 'album' }
  /** Gapiradigan do'st (3D qahramon: gapni takrorlaydi, tegsa reaksiya qiladi) */
  | { name: 'pet' }
  | { name: 'yard' }
  /** Do'kon: tangaga hovli buyumlari, hayvonlar, o'yinchoqlar, kiyimlar */
  | { name: 'shop' }
