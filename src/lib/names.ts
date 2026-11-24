// Sof ma'lumot (JSX'siz): ilova ham, Node skriptlari (ovoz yaratish) ham shu fayldan o'qiydi.

export type FruitKind = 'olma' | 'anor' | 'gilos' | 'qovun' | 'behi' | 'tarvuz' | 'nok' | 'uzum' | 'anjir' | 'orik'
export type ColorId = 'qizil' | 'sariq' | 'yashil' | 'binafsha'

export const FRUIT_COLOR: Record<FruitKind, ColorId | null> = {
  olma: 'qizil',
  anor: 'qizil',
  gilos: 'qizil',
  qovun: 'sariq',
  behi: 'sariq',
  tarvuz: 'yashil',
  nok: 'yashil',
  uzum: 'binafsha',
  anjir: 'binafsha',
  orik: null, // faqat bozorda
}

export const COLOR_HEX: Record<ColorId, string> = {
  qizil: '#e63946',
  sariq: '#f6c945',
  yashil: '#52b788',
  binafsha: '#8e5bd6',
}

export const FRUIT_NAMES: Record<FruitKind, string> = {
  olma: 'Olma',
  anor: 'Anor',
  gilos: 'Gilos',
  qovun: 'Qovun',
  behi: 'Behi',
  tarvuz: 'Tarvuz',
  nok: 'Nok',
  uzum: 'Uzum',
  anjir: 'Anjir',
  orik: "O'rik",
}

export const ALL_FRUITS = Object.keys(FRUIT_NAMES) as FruitKind[]

/** Bozorda sotiladigan mevalar (mijozlar shularni so'raydi) */
export const MARKET_FRUITS: FruitKind[] = ['olma', 'anor', 'orik', 'nok', 'behi', 'uzum']

export type AnimalId = 'sigir' | 'qoy' | 'echki' | 'xoroz' | 'it' | 'mushuk' | 'ordak' | 'eshak'

export const ANIMAL_NAMES: Record<AnimalId, string> = {
  sigir: 'Sigir',
  qoy: "Qo'y",
  echki: 'Echki',
  xoroz: "Xo'roz",
  it: 'Kuchukcha',
  mushuk: 'Mushuk',
  ordak: "O'rdak",
  eshak: 'Eshak',
}

/** Ota-ona yozib oladigan tovushlar uchun matn */
export const ANIMAL_SOUNDS: Record<AnimalId, string> = {
  sigir: "Mo'-o'-o'",
  qoy: 'Ma-a-a',
  echki: 'Me-e-e',
  xoroz: 'Qu-qu-qu-quuu!',
  it: 'Vov-vov!',
  mushuk: 'Miyov!',
  ordak: 'Vak-vak!',
  eshak: 'I-a! I-a!',
}

export const ALL_ANIMALS = Object.keys(ANIMAL_NAMES) as AnimalId[]
