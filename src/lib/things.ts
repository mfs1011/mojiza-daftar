// 🧺 "Narsalar" — topishmoqlar, albom va xotira o'yini uchun qo'shimcha obyektlar:
// yangi hayvonlar (ferma/soyalar o'yinlariga ulanmagan — ularda haqiqiy hayvon ovozi kerak),
// sabzavotlar, uy buyumlari, tabiat va kasblar. Rasm: public/assets/art/<art>.png (docs/ART_PROMPTS_YANGI.md).

export type ThingCat = 'hayvon' | 'sabzavot' | 'buyum' | 'tabiat' | 'kasb'

export interface Thing {
  cat: ThingCat
  /** Bolaga aytiladigan nom */
  name: string
  /** Rasm yo'li (art/…) */
  art: string
}

const T = (cat: ThingCat, art: string, name: string): Thing => ({ cat, art, name })

export const THINGS = {
  // Hayvonlar
  ot: T('hayvon', 'animal/ot', 'Ot'),
  tuya: T('hayvon', 'animal/tuya', 'Tuya'),
  quyon: T('hayvon', 'animal/quyon', 'Quyon'),
  tovuq: T('hayvon', 'animal/tovuq', 'Tovuq'),
  joja: T('hayvon', 'animal/joja', "Jo'ja"),
  goz: T('hayvon', 'animal/goz', "G'oz"),
  baliq: T('hayvon', 'animal/baliq', 'Baliq'),
  kapalak: T('hayvon', 'animal/kapalak', 'Kapalak'),
  ari: T('hayvon', 'animal/ari', 'Ari'),
  toshbaqa: T('hayvon', 'animal/toshbaqa', 'Toshbaqa'),
  ayiq: T('hayvon', 'animal/ayiq', 'Ayiq'),
  fil: T('hayvon', 'animal/fil', 'Fil'),
  // Sabzavotlar
  sabzi: T('sabzavot', 'veg/sabzi', 'Sabzi'),
  piyoz: T('sabzavot', 'veg/piyoz', 'Piyoz'),
  kartoshka: T('sabzavot', 'veg/kartoshka', 'Kartoshka'),
  pomidor: T('sabzavot', 'veg/pomidor', 'Pomidor'),
  bodring: T('sabzavot', 'veg/bodring', 'Bodring'),
  karam: T('sabzavot', 'veg/karam', 'Karam'),
  qalampir: T('sabzavot', 'veg/qalampir', 'Qalampir'),
  oshqovoq: T('sabzavot', 'veg/oshqovoq', 'Oshqovoq'),
  // Buyumlar
  choynak: T('buyum', 'obj/choynak', 'Choynak'),
  piyola: T('buyum', 'obj/piyola', 'Piyola'),
  non: T('buyum', 'obj/non', 'Non'),
  doppi: T('buyum', 'obj/doppi', "Do'ppi"),
  qoshiq: T('buyum', 'obj/qoshiq', 'Qoshiq'),
  soat: T('buyum', 'obj/soat', 'Soat'),
  kitob: T('buyum', 'obj/kitob', 'Kitob'),
  qalam: T('buyum', 'obj/qalam', 'Qalam'),
  koptok: T('buyum', 'obj/koptok', "Koptok"),
  mashina: T('buyum', 'obj/mashina', 'Mashina'),
  velosiped: T('buyum', 'obj/velosiped', 'Velosiped'),
  soyabon: T('buyum', 'obj/soyabon', 'Soyabon'),
  // Tabiat
  quyosh: T('tabiat', 'nature/quyosh', 'Quyosh'),
  oy: T('tabiat', 'nature/oy', 'Oy'),
  yulduz: T('tabiat', 'nature/yulduz', 'Yulduz'),
  bulut: T('tabiat', 'nature/bulut', 'Bulut'),
  yomgir: T('tabiat', 'nature/yomgir', "Yomg'ir"),
  gul: T('tabiat', 'nature/gul', 'Lola'),
  // Alifbo uchun (har harfga kamida 2 ta narsa)
  fonar: T('buyum', 'obj/fonar', 'Fonar'),
  gilam: T('buyum', 'obj/gilam', 'Gilam'),
  hakka: T('hayvon', 'animal/hakka', 'Hakka'),
  ilon: T('hayvon', 'animal/ilon', 'Ilon'),
  ip: T('buyum', 'obj/ip', 'Ip'),
  jirafa: T('hayvon', 'animal/jirafa', 'Jirafa'),
  joxori: T('sabzavot', 'veg/joxori', "Jo'xori"),
  limon: T('sabzavot', 'veg/limon', 'Limon'),
  laylak: T('hayvon', 'animal/laylak', 'Laylak'),
  raketa: T('buyum', 'obj/raketa', 'Raketa'),
  ruchka: T('buyum', 'obj/ruchka', 'Ruchka'),
  uy: T('buyum', 'obj/uy', 'Uy'),
  uzuk: T('buyum', 'obj/uzuk', 'Uzuk'),
  vertolyot: T('buyum', 'obj/vertolyot', 'Vertolyot'),
  xurmo: T('sabzavot', 'veg/xurmo', 'Xurmo'),
  xalta: T('buyum', 'obj/xalta', 'Xalta'),
  zebra: T('hayvon', 'animal/zebra', 'Zebra'),
  zina: T('buyum', 'obj/zina', 'Zina'),
  gildirak: T('buyum', 'obj/gildirak', "G'ildirak"),
  chumoli: T('hayvon', 'animal/chumoli', 'Chumoli'),
  shar: T('buyum', 'obj/shar', 'Shar'),
  sher: T('hayvon', 'animal/sher', 'Sher'),
  // Kasblar (odamlar — ular uchun "kim")
  shifokor: T('kasb', 'person/shifokor', 'Shifokor'),
  oshpaz: T('kasb', 'person/oshpaz', 'Oshpaz'),
  haydovchi: T('kasb', 'person/haydovchi', 'Haydovchi'),
  dehqon: T('kasb', 'person/dehqon', 'Dehqon'),
} satisfies Record<string, Thing>

export type ThingId = keyof typeof THINGS
export const ALL_THINGS = Object.keys(THINGS) as ThingId[]
