import { openDB, type DBSchema } from 'idb'
import type { PlacedDecor, PlayRecord, Profile, Progress } from '../types'
import type { Landmarks } from './landmarks'
import { today } from './util'

// Hamma ma'lumot (profillar, ovozlar, chizmalar) faqat qurilmaning o'zida saqlanadi.
interface QishloqDB extends DBSchema {
  profiles: { key: string; value: Profile }
  progress: { key: string; value: Progress }
  voices: { key: string; value: Blob }
  /** Bolaning chizgan qahramoni (PNG), kalit = profil id */
  heroes: { key: string; value: Blob }
  /** Bo'yash daftaridan tayyor rasmlar (albom) */
  artworks: { key: number; value: Artwork }
  /** Sahna qahramonlarining belgilari (ko'z, og'iz, qo'l, oyoq); kalit = rasm mazmuni xeshi */
  rigs: { key: string; value: Landmarks }
  /** O'yinlar tarixi (ota-ona statistikasi) */
  plays: { key: number; value: PlayRecord; indexes: { profile: string } }
}

export interface Artwork {
  id?: number
  profileId: string
  created: number
  png: Blob
  /** Sahna uchun: fonsiz qismi (chetga tegmagan bo'laklar) */
  cutout?: Blob
}

// Ichki baza nomi eski nomda qoladi: o'zgartirilsa, qurilmadagi ma'lumotlar yo'qoladi
const dbp = openDB<QishloqDB>('bizning-qishloq', 5, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore('profiles', { keyPath: 'id' })
      db.createObjectStore('progress', { keyPath: 'profileId' })
      db.createObjectStore('voices')
    }
    if (oldVersion < 2) db.createObjectStore('heroes')
    if (oldVersion < 3) db.createObjectStore('artworks', { keyPath: 'id', autoIncrement: true })
    if (oldVersion < 4) db.createObjectStore('rigs')
    if (oldVersion < 5) db.createObjectStore('plays', { keyPath: 'id', autoIncrement: true }).createIndex('profile', 'profileId')
  },
})

const DEFAULT_PROFILES: Profile[] = [
  { id: 'katta', name: 'Katta qiz', age: 5, avatar: '👧', color: '#ff8fab' },
  { id: 'kichik', name: 'Kichik qiz', age: 3, avatar: '👶', color: '#7fb3ff' },
]

export async function getProfiles(): Promise<Profile[]> {
  const db = await dbp
  let list = await db.getAll('profiles')
  if (list.length === 0) {
    for (const p of DEFAULT_PROFILES) await db.put('profiles', p)
    list = DEFAULT_PROFILES
  }
  return [...list].sort((a, b) => b.age - a.age)
}

export async function saveProfile(p: Profile) {
  await (await dbp).put('profiles', p)
}

export function emptyProgress(profileId: string): Progress {
  return {
    profileId,
    coins: 0,
    fruits: 0,
    village: [],
    day: today(),
    stationsDone: [],
    dayDone: false,
    levels: {},
    levelScale: 15,
  }
}

/** Yangi kun boshlansa, bekatlar avtomatik qayta ochiladi. Eski formatdagi yozuvlar ham to'g'rilanadi. */
export async function getProgress(profileId: string): Promise<Progress> {
  const saved = await (await dbp).get('progress', profileId)
  const p: Progress = { ...emptyProgress(profileId), ...saved }
  p.village = (p.village as unknown[]).filter((v): v is PlacedDecor => typeof v === 'object' && v !== null)
  p.levels ??= {}
  // Eski 5 darajali shkala (0..4) → yangi 15 darajali: 0,3,6,9,12
  if (saved && !saved.levelScale) {
    p.levels = Object.fromEntries(Object.entries(p.levels).map(([k, v]) => [k, (v ?? 0) * 3]))
    p.levelScale = 15
  }
  p.stars ??= {}
  if (p.day !== today()) return { ...p, day: today(), stationsDone: [], dayDone: false, playedMs: 0 }
  return p
}

export async function saveProgress(p: Progress) {
  await (await dbp).put('progress', p)
}

export async function getVoice(key: string) {
  return (await dbp).get('voices', key)
}

export async function saveVoice(key: string, blob: Blob) {
  await (await dbp).put('voices', blob, key)
}

export async function deleteVoice(key: string) {
  await (await dbp).delete('voices', key)
}

export async function voiceKeys(): Promise<string[]> {
  return (await dbp).getAllKeys('voices')
}

export async function getHero(profileId: string) {
  return (await dbp).get('heroes', profileId)
}

export async function saveHero(profileId: string, png: Blob) {
  await (await dbp).put('heroes', png, profileId)
}

export async function deleteHero(profileId: string) {
  await (await dbp).delete('heroes', profileId)
}

export async function saveArtwork(profileId: string, png: Blob, cutout?: Blob) {
  await (await dbp).add('artworks', { profileId, created: Date.now(), png, cutout })
}

export async function listArtworks(profileId: string): Promise<Artwork[]> {
  const all = await (await dbp).getAll('artworks')
  return all.filter((a) => a.profileId === profileId).sort((a, b) => b.created - a.created)
}

export async function getRig(key: string) {
  return (await dbp).get('rigs', key)
}

export async function saveRig(key: string, marks: Landmarks) {
  await (await dbp).put('rigs', marks, key)
}

// ---------- Statistika ----------

export async function addPlay(r: PlayRecord) {
  await (await dbp).add('plays', r)
}

/** Bolaning barcha o'yinlari, eng yangisi birinchi */
export async function getPlays(profileId: string): Promise<PlayRecord[]> {
  const all = await (await dbp).getAllFromIndex('plays', 'profile', profileId)
  return all.sort((a, b) => b.ts - a.ts)
}
