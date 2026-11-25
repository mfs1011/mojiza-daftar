import type { DecorKind } from '../art/Scenery'
import type { FruitStore } from '../types'
import { ALL_FRUITS, type FruitKind } from './names'
import type { ThingId } from './things'

// 🍎 → 🛒 → 🪙 → 🎁 Yopiq zanjir: bog'da terilgan meva omborga tushadi, bozorda shundan sotiladi,
// topilgan tangaga do'kondan narsa olinadi, mevani hovlidagi hayvonlarga yedirsa ham bo'ladi.

/**
 * Yangi (yoki eski, ombori yo'q) bolaga boshlang'ich meva: bozor birinchi kuniyoq "bog'ga bor" deb
 * yopilib qolmasin. Keyin meva faqat bog'dan keladi.
 */
export const STARTER_STORE: FruitStore = { olma: 4, anor: 3, nok: 3 }

/** Ombordagi mevalar soni (jami) */
export const storeTotal = (s: FruitStore = {}) => ALL_FRUITS.reduce((a, k) => a + (s[k] ?? 0), 0)

/** Bor mevalar (soni > 0), ALL_FRUITS tartibida */
export const storeKinds = (s: FruitStore = {}): FruitKind[] => ALL_FRUITS.filter((k) => (s[k] ?? 0) > 0)

/** a + b (sign = -1 bo'lsa a − b, manfiy bo'lmaydi) */
export function mergeStore(a: FruitStore = {}, b: FruitStore = {}, sign: 1 | -1 = 1): FruitStore {
  const out: FruitStore = {}
  for (const k of ALL_FRUITS) {
    const n = Math.max(0, (a[k] ?? 0) + sign * (b[k] ?? 0))
    if (n > 0) out[k] = n
  }
  return out
}

/** Bitta mevani qo'shish (sanash uchun qulay) */
export const addFruit = (s: FruitStore, k: FruitKind, n = 1): FruitStore => ({ ...s, [k]: (s[k] ?? 0) + n })

// ---------------- 🏪 Do'kon ----------------

export type ShopCat = 'hayvon' | 'hovli' | 'oyinchoq' | 'kiyim'

export interface ShopItem {
  id: string
  cat: ShopCat
  /** 1..10 tanga: bola o'nlik ramkada sanab to'laydi */
  price: number
  /** Hovliga boradigan narsa (yardInbox) */
  decor?: DecorKind
  /** O'yinchoq/kiyim (Progress.owned) */
  thing?: ThingId
}

const D = (cat: ShopCat, decor: DecorKind, price: number): ShopItem => ({ id: decor, cat, price, decor })
const T = (cat: ShopCat, thing: ThingId, price: number): ShopItem => ({ id: thing, cat, price, thing })

/** Do'kon peshtaxtasi. Rasmi yo'q narsalar ekranda ko'rinmaydi (Shop.tsx filtrlaydi) */
export const SHOP_ITEMS: ShopItem[] = [
  D('hayvon', 'hayvon_xoroz', 3),
  D('hayvon', 'hayvon_ordak', 3),
  D('hayvon', 'hayvon_mushuk', 4),
  D('hayvon', 'hayvon_it', 5),
  D('hayvon', 'hayvon_qoy', 6),
  D('hayvon', 'hayvon_echki', 6),
  D('hayvon', 'hayvon_eshak', 7),
  D('hayvon', 'hayvon_sigir', 8),
  D('hovli', 'gul', 1),
  D('hovli', 'kungaboqar', 1),
  D('hovli', 'koza', 2),
  D('hovli', 'terak', 2),
  D('hovli', 'olma_daraxt', 4),
  D('hovli', 'anor_daraxt', 4),
  D('hovli', 'tandir', 5),
  D('hovli', 'quduq', 5),
  D('hovli', 'sori', 6),
  D('hovli', 'uy', 10),
  T('oyinchoq', 'shar', 1),
  T('oyinchoq', 'koptok', 2),
  T('oyinchoq', 'mashina', 5),
  T('oyinchoq', 'raketa', 7),
  T('oyinchoq', 'vertolyot', 8),
  T('oyinchoq', 'velosiped', 9),
  T('kiyim', 'xalta', 2),
  T('kiyim', 'doppi', 3),
  T('kiyim', 'soyabon', 3),
  T('kiyim', 'uzuk', 4),
]

export const SHOP_CATS: ShopCat[] = ['hayvon', 'hovli', 'oyinchoq', 'kiyim']

/** Narsa nomini aytadigan ovoz kaliti */
export function shopItemVoice(it: ShopItem): string {
  if (it.thing) return `nom_${it.thing}`
  return it.decor!.startsWith('hayvon_') ? it.decor! : `narsa_${it.decor}`
}
