import type { AnimalId, FruitKind } from './names.ts'

// She'r-topishmoqlar: bola she'rni tinglaydi va kim (nima) haqida ekanini rasmlardan topadi.
// Matnlar ilova uchun yozilgan (original). Ovoz: voices/sher_<id> (Gemini TTS yoki ota-ona yozuvi).
// Matnni o'zgartirsangiz, ovozni qayta yarating: npm run gen:voices -- --only sher_<id> --force

export type RiddleAnswer = { k: 'animal'; id: AnimalId } | { k: 'fruit'; id: FruitKind }

export interface Riddle {
  id: string
  answer: RiddleAnswer
  text: string
}

const A = (id: AnimalId): RiddleAnswer => ({ k: 'animal', id })
const F = (id: FruitKind): RiddleAnswer => ({ k: 'fruit', id })

export const RIDDLES: Riddle[] = [
  {
    id: 'sigir',
    answer: A('sigir'),
    text: "Shoxi bor, dumi bor,\nBolalarga suti bor.\nErtalab «mo'» deydi,\nYashil o'tni yeydi.",
  },
  {
    id: 'mushuk',
    answer: A('mushuk'),
    text: "Mo'ylovi bor, ko'zi chaqnar,\nSichqonni poylab yotar.\nSut ichadi xursand bo'lib,\n«Miyov» deydi erkalanib.",
  },
  {
    id: 'it',
    answer: A('it'),
    text: "Hovlimizni qo'riqlaydi,\nBegona kelsa — vovullaydi.\nEgasini ko'rsa agar,\nDumin quvnoq likillatar.",
  },
  {
    id: 'xoroz',
    answer: A('xoroz'),
    text: "Tongda hammadan oldin turar,\n«Qu-qu-qu!» deb bizni uyg'otar.\nBoshida qizil toji bor,\nChiroyli rangdor dumi bor.",
  },
  {
    id: 'qoy',
    answer: A('qoy'),
    text: "Junlari oppoq-oppoq,\nXuddi bulutday yumshoq.\n«Ma-a-a» deb chaqiradi,\nYaylovda o'tlaydi.",
  },
  {
    id: 'ordak',
    answer: A('ordak'),
    text: "Ko'lda suzar chayqalib,\nQanotini qoqib-qoqib.\n«Vak-vak» deydi baland,\nBolalari ergashgan.",
  },
  {
    id: 'eshak',
    answer: A('eshak'),
    text: "Quloqlari uzun-uzun,\nYuk tashiydi kun bo'yi.\n«I-a, i-a!» deb baqirar,\nIshchan, sabrli o'zi.",
  },
  {
    id: 'echki',
    answer: A('echki'),
    text: "Soqoli bor, shoxi bor,\nQoyalarga chiqar u.\n«Me-e-e» deb ma'raydi,\nSutini ham beradi.",
  },
  {
    id: 'tarvuz',
    answer: F('tarvuz'),
    text: "Usti yashil, ichi qizil,\nUrug'lari qop-qora.\nYozda yesang shirin-shirin,\nTopchi, nima u, bola?",
  },
  {
    id: 'olma',
    answer: F('olma'),
    text: "Shoxda osilib turar,\nQip-qizil yuzi kular.\nBir tishlasang — «qars» etar,\nShirin sharbati oqar.",
  },
  {
    id: 'uzum',
    answer: F('uzum'),
    text: "Shingil-shingil osilgan,\nTok bargiga yashiringan.\nDonalari mayda-mayda,\nShirin-shakar har biri.",
  },
  {
    id: 'anor',
    answer: F('anor'),
    text: "Ichida yuzta qizil dur,\nUstida kichik toji bor.\nDonalari yoqutdek,\nTopib ber-chi, bu nima?",
  },
  {
    id: 'qovun',
    answer: F('qovun'),
    text: "Sap-sariq, xushbo'y, katta,\nPoliz ichida yotar.\nKuzda uni so'yamiz,\nAsaldek shirin bo'lar.",
  },
]
