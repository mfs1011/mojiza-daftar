import { ANIMAL_NAMES, FRUIT_NAMES, type AnimalId, type FruitKind } from './names.ts'

// Harflar uyi uchun so'zlar: faqat bitta harf bilan boshlanadiganlari
// (O', G', Sh, Ch alohida harflar, ularni hozircha chetlab o'tamiz).

export type WordPic = { type: 'fruit'; id: FruitKind } | { type: 'animal'; id: AnimalId }

export interface Word {
  pic: WordPic
  name: string
  letter: string
  voice: string
}

const FRUIT_WORDS: FruitKind[] = ['olma', 'anor', 'uzum', 'qovun', 'tarvuz', 'nok', 'behi', 'gilos', 'anjir']
const ANIMAL_WORDS: AnimalId[] = ['sigir', 'echki', 'mushuk', 'it', 'xoroz', 'eshak']

export const WORDS: Word[] = [
  ...FRUIT_WORDS.map((id) => ({
    pic: { type: 'fruit' as const, id },
    name: FRUIT_NAMES[id],
    letter: FRUIT_NAMES[id][0],
    voice: `meva_${id}`,
  })),
  ...ANIMAL_WORDS.map((id) => ({
    pic: { type: 'animal' as const, id },
    name: ANIMAL_NAMES[id],
    letter: ANIMAL_NAMES[id][0],
    voice: `hayvon_${id}`,
  })),
]

export const LETTERS = [...new Set(WORDS.map((w) => w.letter))].sort()

/** Chizish oson harflar (to'g'ri chiziq va doira) — boshlang'ich darajalar uchun */
export const EASY_LETTERS = ['O', 'U', 'T', 'N', 'A', 'M']

/** Ismning bosh harfi, o'zbek qo'sh harflarini hisobga olib (Sh, Ch, O', G') */
export function initialOf(name: string): string {
  const n = name.trim()
  if (!n) return 'A'
  const two = n.slice(0, 2)
  if (/^(Sh|Ch|SH|CH|sh|ch)$/.test(two)) return two[0].toUpperCase() + 'h'
  if (/^[OoGg]['ʻ‘’`]/.test(n)) return n[0].toUpperCase() + "'"
  return n[0].toUpperCase()
}

/** O'zbek lotin alifbosi (bosh harflar) */
export const ALPHABET = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', "O'", "G'", 'Sh', 'Ch']

/** Harf ovoz kaliti: O' va G' — alohida (aks holda O va G bilan to'qnashadi) */
export const letterVoice = (l: string) => `harf_${l === "O'" ? 'O2' : l === "G'" ? 'G2' : l}`

/** Yozuvga tayyorgarlik chiziqlari: nomlari (ovoz va statistika uchun) */
export const STROKE_LABELS: Record<'tik' | 'yotiq' | 'qiya' | 'zinapoya' | 'tolqin' | 'yarim' | 'aylana' | 'uycha', string> = {
  tik: 'Tik chiziq',
  yotiq: 'Yotiq chiziq',
  qiya: 'Qiya chiziq',
  zinapoya: 'Zinapoya',
  tolqin: "To'lqin",
  yarim: 'Yarim aylana',
  aylana: 'Aylana',
  uycha: 'Uycha',
}

/** O'zbek alifbosidagi harf nomlari (inglizcha "bi, si" emas): ovoz shu bilan yaratiladi */
export const LETTER_NAMES: Record<string, string> = {
  // Bolalar uchun yagona qolip: undosh + "e" (Me, Ne, Ke…), rasmiy "em, en, ka" emas — bola harf tovushini eshitsin
  A: 'A', B: 'Be', D: 'De', E: 'E', F: 'Fe', G: 'Ge', H: 'He', I: 'I', J: 'Je', K: 'Ke', L: 'Le', M: 'Me', N: 'Ne', O: 'O',
  P: 'Pe', Q: 'Qe', R: 'Re', S: 'Se', T: 'Te', U: 'U', V: 'Ve', X: 'Xe', Y: 'Ye', Z: 'Ze', "O'": "O'", "G'": "G'e", Sh: 'She', Ch: 'Che',
}
