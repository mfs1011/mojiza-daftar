import type { Profile } from '../types.ts'
import { PAINT_NAMES, PAINT_ORDER, SHAPE_NAMES, SHAPE_ORDER } from './shapes.ts'
import { LETTERS } from './letters.ts'
import { ALL_ANIMALS, ALL_FRUITS, ANIMAL_NAMES, ANIMAL_SOUNDS, FRUIT_NAMES } from './names.ts'

export interface VoicePrompt {
  key: string
  /** Ota-ona o'qib beradigan matn */
  text: string
  group: string
  /** Generator uchun: o'z ovozi bilan gapiradigan personaj (Gemini TTS ovoz nomi) */
  voice?: string
}

/** Bozor mijozlari: har biri o'z ovozida gapiradi (Gemini TTS ovozlari) */
export const CUSTOMER_VOICES = {
  bobo: 'Algenib', // xirildoq, keksa erkak
  buvi: 'Gacrux', // yetuk, mehribon ayol
  aka: 'Orus', // yosh yigit
  opa: 'Aoede', // yengil, yosh qiz
  bola: 'Puck', // sho'x bola
} as const
export type CustomerId = keyof typeof CUSTOMER_VOICES

const CUSTOMER_LINES: Record<CustomerId, Record<'salom' | 'kam' | 'kop' | 'rahmat', string>> = {
  bobo: { salom: 'Assalomu alaykum, bolam!', kam: 'Yana bering, bolam.', kop: "Voy, ko'payib ketdi-ku!", rahmat: 'Barakalla, bolam! Mana tanga.' },
  buvi: { salom: 'Assalomu alaykum, jonim!', kam: 'Yana kerak, aylanay.', kop: "Ko'p bo'lib ketdi, jonim.", rahmat: 'Rahmat, aylanay! Mana tanga.' },
  aka: { salom: "Salom, do'stim!", kam: 'Yana kerak!', kop: "Ko'p bo'ldi-ku!", rahmat: "Rahmat, do'stim! Ol, tanga." },
  opa: { salom: 'Salom, jonim!', kam: 'Yana bitta kerak!', kop: "Ko'p bo'lib qoldi!", rahmat: 'Rahmat! Mana senga tanga.' },
  bola: { salom: 'Salom!', kam: 'Yana!', kop: "Ko'p bo'ldi!", rahmat: 'Rahmat! Tanga ol!' },
}

const NUMBERS = ['Bir', 'Ikki', 'Uch', "To'rt", 'Besh', 'Olti', 'Yetti', 'Sakkiz', "To'qqiz", "O'n",
  "O'n bir", "O'n ikki", "O'n uch", "O'n to'rt", "O'n besh", "O'n olti", "O'n yetti", "O'n sakkiz", "O'n to'qqiz", 'Yigirma']

export const COLOR_NAMES = {
  qizil: 'Qizil',
  sariq: 'Sariq',
  yashil: 'Yashil',
  binafsha: 'Binafsha',
} as const

/**
 * Ilovadagi barcha ovozli ko'rsatmalar. Bolalar o'qiy olmaydi, shuning uchun hammasi ovozda.
 * Guruhlar ota-ona panelida bekatlar bo'yicha ko'rinadi.
 */
export function voicePrompts(profiles: Profile[]): VoicePrompt[] {
  return [
    ...profiles.map((p) => ({ key: `ism_${p.id}`, text: `Salom, ${p.name}!`, group: 'Ismlar' })),

    { key: 'salom', text: 'Bugun qishloqqa sayohat qilamiz!', group: 'Umumiy' },
    { key: 'barakalla', text: 'Barakalla!', group: 'Umumiy' },
    { key: 'zor', text: "Zo'r! Juda yaxshi!", group: 'Umumiy' },
    { key: 'yana', text: "Yana bir urinib ko'r", group: 'Umumiy' },
    { key: 'sovga_tanla', text: "Qishlog'ingga sovg'a tanla!", group: 'Umumiy' },
    { key: 'sovga_qoy', text: "Qayerga qo'yamiz? Bosgin!", group: 'Umumiy' },
    { key: 'uxlash', text: "Bugun ko'p ishladik. Qahramonimiz uxlaydi. Ertaga yana o'ynaymiz!", group: 'Umumiy' },

    { key: 'rasm_intro', text: "O'z qahramoningni chiz! Keyin u tiriladi!", group: 'Rasm uyi' },
    { key: 'rasm_tirildi', text: 'Voy! U tirildi!', group: 'Rasm uyi' },
    { key: 'boyash_tanla', text: 'Qaysi rasmni chizamiz? Tanla!', group: 'Rasm uyi' },
    { key: 'boyash_chiz', text: "Barmog'ing bilan chiziqlar ustidan yurib chiz!", group: 'Rasm uyi' },
    { key: 'boyash_rang', text: "Endi ranglar bilan bo'ya!", group: 'Rasm uyi' },
    { key: 'rig_belgila', text: "Ko'zlari, og'zi, qo'l-oyoqlari qayerda? To'g'ri joyga qo'y!", group: 'Rasm uyi' },
    { key: 'boyash_tayyor', text: 'Qanday chiroyli rasm! Albomga qo\'ydik.', group: 'Rasm uyi' },

    // Sahnadagi qahramon: ota-onaning o'z ovozi — eng tabiiy (AI ovozidan ustun turadi)
    ...([
      ['bonk', 'Voy! (boshiga urilganda)'],
      ['ouch', "Oy-oy-oy! (oyog'i og'riganda)"],
      ['giggle', 'Hi-hi-hi-hi! (qitiqlanganda)'],
      ['purr', 'Mmmm... (boshi silanganda, huzur)'],
      ['yay', 'Uraaa! (quvonganda)'],
      ['hmm', 'Hmm? (hayron bo\'lganda)'],
      ['woo', 'Vuuuuy! (boshi aylanganda)'],
      ['yawn', 'Aaaa-uuuf... (esnaganda)'],
      ['snore', 'Xrrr... pshhh... (xurrak)'],
      ['grr', 'Grrr! Hmph! (jahli chiqqanda)'],
      ['boing', 'Hop! (sakraganda)'],
      ['squeeze', 'Iiiiii! (qisilganda)'],
    ] as const).map(([k, text]) => ({ key: `reak_${k}`, text, group: "Sahna qahramoni (o'z ovozingiz — eng tabiiy)" })),

    { key: 'bog_silkit', text: 'Daraxtni silkit!', group: "Bog'" },
    { key: 'bog_rang', text: 'Mevalarni rangiga qarab savatlarga sol!', group: "Bog'" },
    { key: 'bog_kattalik', text: 'Kattalarini katta savatga, kichiklarini kichik savatga sol!', group: "Bog'" },
    { key: 'bog_tur', text: "Har bir mevani o'z savatiga sol!", group: "Bog'" },
    ...Object.entries(COLOR_NAMES).map(([id, name]) => ({ key: `rang_${id}`, text: name, group: 'Ranglar' })),
    ...ALL_FRUITS.map((f) => ({ key: `meva_${f}`, text: FRUIT_NAMES[f], group: 'Mevalar' })),

    { key: 'bozor_intro', text: "Bozorga mijozlar keldi. Ular so'ragancha meva ber!", group: 'Bozor' },
    { key: 'bozor_kop', text: "Ko'p bo'lib qoldi. Bittasini qaytarib ol.", group: 'Bozor' },
    { key: 'bozor_kam', text: 'Yana kerak!', group: 'Bozor' },
    { key: 'bozor_rahmat', text: 'Rahmat! Mana senga tanga.', group: 'Bozor' },
    ...(Object.keys(CUSTOMER_LINES) as CustomerId[]).flatMap((c) =>
      Object.entries(CUSTOMER_LINES[c]).map(([line, text]) => ({
        key: `mijoz_${c}_${line}`,
        text,
        group: 'Bozor mijozlari',
        voice: CUSTOMER_VOICES[c],
      })),
    ),
    { key: 'son_0', text: 'Nol', group: 'Sonlar' },
    ...NUMBERS.map((n, i) => ({ key: `son_${i + 1}`, text: n, group: 'Sonlar' })),

    { key: 'raqam_sana', text: 'Nechta? Sanab, raqamini top!', group: 'Raqamlar uyi' },
    { key: 'raqam_top', text: 'raqamini top!', group: 'Raqamlar uyi' },
    { key: 'raqam_chiz', text: "Raqamni barmog'ing bilan chiz!", group: 'Raqamlar uyi' },
    { key: 'raqam_qator', text: 'Qaysi son tushib qoldi?', group: 'Raqamlar uyi' },
    { key: 'raqam_kop', text: "Qaysi likopchada ko'p?", group: 'Raqamlar uyi' },
    { key: 'raqam_kam', text: 'Qaysi likopchada kam?', group: 'Raqamlar uyi' },

    { key: 'hisob_qosh', text: "Ikkalasini qo'shsak, hammasi nechta bo'ladi?", group: 'Hisob maktabi' },
    { key: 'hisob_ayir', text: 'Bir nechtasi ketib qoldi. Nechta qoldi?', group: 'Hisob maktabi' },
    { key: 'hisob_misol', text: 'Misolni yech!', group: 'Hisob maktabi' },
    { key: 'hisob_tushgan', text: 'Qaysi son yetishmayapti?', group: 'Hisob maktabi' },
    ...SHAPE_ORDER.map((s) => ({ key: `shakl_${s}`, text: SHAPE_NAMES[s], group: 'Shakllar' })),
    ...PAINT_ORDER.filter((c) => !(c in COLOR_NAMES)).map((c) => ({ key: `rang_${c}`, text: PAINT_NAMES[c], group: 'Ranglar' })),
    { key: 'shakl_qani', text: 'qani? Topib ber!', group: 'Shakllar' },
    { key: 'shakl_teshik', text: "Har bir shaklni o'z uyasiga joyla!", group: 'Shakllar' },
    { key: 'rang_aralash', text: 'Ikkalasini aralashtirsak, qaysi rang chiqadi?', group: 'Ranglar' },

    { key: 'mantiq_ortiqcha', text: "Qaysi biri ortiqcha? Boshqalariga o'xshamaydiganini top!", group: 'Mantiq' },
    { key: 'mantiq_juft', text: 'Kartalarni och va juftini top!', group: 'Mantiq' },
    { key: 'mantiq_tiz', text: 'Eng kichigidan boshlab, kattasigacha bos!', group: 'Mantiq' },
    { key: 'mantiq_labirint', text: "Qahramonni yo'ldan olib borib, uyiga yetkaz!", group: 'Mantiq' },
    { key: 'hisob_belgi', text: "Qaysi belgi to'g'ri keladi: katta, kichik yoki teng?", group: 'Hisob maktabi' },

    { key: 'ferma_kim', text: 'Kim gapiryapti? Topchi!', group: 'Ferma' },
    { key: 'ferma_takrorla', text: 'Diqqat bilan eshit, keyin xuddi shu tartibda bos!', group: 'Ferma' },
    ...ALL_ANIMALS.map((a) => ({ key: `hayvon_${a}`, text: ANIMAL_NAMES[a], group: 'Hayvonlar' })),
    ...ALL_ANIMALS.map((a) => ({
      key: `tovush_${a}`,
      text: `${ANIMAL_NAMES[a]}: "${ANIMAL_SOUNDS[a]}"`,
      group: "Hayvon taqlidingiz (ixtiyoriy: haqiqiy yozuv bo'lmasa chalinadi)",
    })),

    { key: 'ustaxona_intro', text: 'Naqshni davom ettir! Keyingisi qaysi?', group: 'Ustaxona' },

    { key: 'qora_intro', text: "Kech kirdi. Hayvonlarni o'z joyiga yotqiz!", group: "Kechki qo'ra" },
    { key: 'qora_tun', text: 'Xayrli tun, hayvonlar!', group: "Kechki qo'ra" },

    { key: 'harf_chiz', text: "Barmog'ing bilan harfni chiz!", group: 'Harflar uyi' },
    { key: 'harf_top', text: 'Bu qaysi harfdan boshlanadi?', group: 'Harflar uyi' },
    ...LETTERS.map((l) => ({ key: `harf_${l}`, text: `"${l}" harfi`, group: 'Harflar' })),
  ]
}
