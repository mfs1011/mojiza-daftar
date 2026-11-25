import type { Profile } from '../types.ts'
import { PAINT_NAMES, PAINT_ORDER, SHAPE_NAMES, SHAPE_ORDER } from './shapes.ts'
import { ALPHABET, LETTER_NAMES, letterVoice, STROKE_LABELS } from './letters.ts'
import { RIDDLES } from './poems.ts'
import { THINGS } from './things.ts'
import { PEOPLE } from './stickers.ts'

const PERSON_NAMES: Record<(typeof PEOPLE)[number], string> = { bobo: 'Bobo', buvi: 'Buvi', aka: 'Aka', opa: 'Opa', bola: 'Bola' }

/** Hovli narsalari nomlari (bosganda aytiladi) */
const DECOR_NAMES = {
  terak: 'Terak',
  olma_daraxt: 'Olma daraxti',
  anor_daraxt: 'Anor daraxti',
  gul: 'Gul',
  kungaboqar: 'Kungaboqar',
  uy: 'Uy',
  sori: "So'ri",
  tandir: 'Tandir',
  quduq: 'Quduq',
  koza: "Ko'za",
}
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
  // Interactions API + Gemini 3.8 Flash TTS bilan tinglab tanlangan (o'zbekchasi tabiiy)
  bobo: 'Charon', // chuqur, vazmin erkak ovozi
  buvi: 'Kore', // mehribon, aniq ayol ovozi
  aka: 'Orus', // yosh yigit
  opa: 'Leda', // yengil, yosh qiz
  bola: 'Puck', // sho'x bola
  // Kasblar (egasi tinglab tanlagan)
  shifokor: 'Callirrhoe', // mehribon ayol shifokor
  oshpaz: 'Fenrir', // quvnoq oshpaz
  haydovchi: 'Schedar', // vazmin haydovchi
  dehqon: 'Rasalgethi', // mehnatkash dehqon
} as const
export type CustomerId = keyof typeof CUSTOMER_VOICES

/** "Menga beshta" — son "-ta" qo'shimchasi bilan (buyurtmaning birinchi yarmi) */
const COUNT_WORDS = ['bitta', 'ikkita', 'uchta', "to'rtta", 'beshta', 'oltita', 'yettita', 'sakkizta', "to'qqizta", "o'nta"]

const CUSTOMER_LINES: Record<CustomerId, Record<'salom' | 'kam' | 'kop' | 'rahmat', string>> = {
  bobo: { salom: 'Assalomu alaykum, bolam!', kam: 'Yana bering, bolam.', kop: "Voy, ko'payib ketdi-ku!", rahmat: 'Barakalla, bolam! Mana tanga.' },
  buvi: { salom: 'Assalomu alaykum, jonim!', kam: 'Yana kerak, aylanay.', kop: "Ko'p bo'lib ketdi, jonim.", rahmat: 'Rahmat, aylanay! Mana tanga.' },
  aka: { salom: "Salom, do'stim!", kam: 'Yana kerak!', kop: "Ko'p bo'ldi-ku!", rahmat: "Rahmat, do'stim! Ol, tanga." },
  opa: { salom: 'Salom, jonim!', kam: 'Yana bitta kerak!', kop: "Ko'p bo'lib qoldi!", rahmat: 'Rahmat! Mana senga tanga.' },
  bola: { salom: 'Salom!', kam: 'Yana!', kop: "Ko'p bo'ldi!", rahmat: 'Rahmat! Tanga ol!' },
  shifokor: { salom: 'Assalomu alaykum, aqlli bola!', kam: 'Yana kerak, azizim.', kop: "Ko'p bo'lib qoldi, azizim.", rahmat: "Rahmat! Mevalar sog'liq uchun foydali. Mana tanga." },
  oshpaz: { salom: 'Salom, kichkina sotuvchi!', kam: 'Yana kerak, oshga yetmaydi!', kop: "Voy, ko'p bo'lib ketdi!", rahmat: 'Rahmat! Mazali taom qilaman. Ol, tanga!' },
  haydovchi: { salom: "Salom, do'stim!", kam: 'Yana kerak!', kop: "Ko'p bo'ldi, do'stim.", rahmat: 'Rahmat! Yo\'lda yeyman. Mana tanga.' },
  dehqon: { salom: 'Assalomu alaykum, bolam!', kam: 'Yana kerak, bolam.', kop: "Ko'p bo'lib qoldi, bolam.", rahmat: 'Barakalla, bolam! Mana tanga.' },
}

const cap = (w: string) => w[0].toUpperCase() + w.slice(1)
/** Farq iboralari — har mijoz o'z xarakterida */
const DIFF_LINES: Record<CustomerId, { kam: (w: string) => string; kop: (w: string) => string }> = {
  bobo: { kam: (w) => `Yana ${w} kerak, bolam.`, kop: (w) => `Voy, ${w} ko'p bo'lib ketdi, bolam.` },
  buvi: { kam: (w) => `Yana ${w} kerak, aylanay.`, kop: (w) => `${cap(w)} ko'p bo'lib qoldi, jonim.` },
  aka: { kam: (w) => `Yana ${w} kerak!`, kop: (w) => `${cap(w)} ko'p bo'ldi-ku!` },
  opa: { kam: (w) => `Yana ${w} kerak!`, kop: (w) => `${cap(w)} ko'p bo'lib qoldi!` },
  bola: { kam: (w) => `Yana ${w}!`, kop: (w) => `${cap(w)} ko'p!` },
  shifokor: { kam: (w) => `Yana ${w} kerak, azizim.`, kop: (w) => `${cap(w)} ko'p bo'lib qoldi, azizim.` },
  oshpaz: { kam: (w) => `Yana ${w} kerak!`, kop: (w) => `Voy, ${w} ko'p bo'lib ketdi!` },
  haydovchi: { kam: (w) => `Yana ${w} kerak.`, kop: (w) => `${cap(w)} ko'p bo'ldi.` },
  dehqon: { kam: (w) => `Yana ${w} kerak, bolam.`, kop: (w) => `${cap(w)} ko'p bo'lib qoldi, bolam.` },
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
    // Kam yoki ko'p berilganda mijoz farqni aytadi: "Yana toʻrtta kerak!", "Ikkita koʻp boʻlib qoldi!"
    ...(Object.keys(CUSTOMER_LINES) as CustomerId[]).flatMap((c) =>
      COUNT_WORDS.slice(0, 9).flatMap((w, i) => [
        { key: `mijoz_${c}_kam_${i + 1}`, text: DIFF_LINES[c].kam(w), group: 'Bozor mijozlari', voice: CUSTOMER_VOICES[c] },
        { key: `mijoz_${c}_kop_${i + 1}`, text: DIFF_LINES[c].kop(w), group: 'Bozor mijozlari', voice: CUSTOMER_VOICES[c] },
      ]),
    ),
    // Buyurtmani mijozning o'zi aytadi: "Menga beshta" + "olma bering!"
    ...(Object.keys(CUSTOMER_LINES) as CustomerId[]).flatMap((c) => [
      ...COUNT_WORDS.map((w, i) => ({ key: `mijoz_${c}_son_${i + 1}`, text: `Menga ${w}`, group: 'Bozor mijozlari', voice: CUSTOMER_VOICES[c] })),
      ...ALL_FRUITS.map((f) => ({
        key: `mijoz_${c}_meva_${f}`,
        text: `${FRUIT_NAMES[f].toLowerCase()} bering!`,
        group: 'Bozor mijozlari',
        voice: CUSTOMER_VOICES[c],
      })),
    ]),
    // 🍎 Ombor → 🛒 Bozor → 🪙 Do'kon (economy.ts)
    { key: 'bozor_meva_yoq', text: 'Omboringda meva kam. Bogʻga borib meva terib kel!', group: 'Ombor va doʻkon' },
    { key: 'ombor_intro', text: 'Bu — sening omboring. Bogʻda tergan mevalaring shu yerda.', group: 'Ombor va doʻkon' },
    { key: 'hovli_yedir', text: 'Mevani hayvonga olib bor!', group: 'Ombor va doʻkon' },
    { key: 'dokon_intro', text: 'Doʻkonga xush kelibsan! Nima olamiz? Tanla!', group: 'Ombor va doʻkon' },
    { key: 'dokon_hayvon', text: 'Hayvonlar', group: 'Ombor va doʻkon' },
    { key: 'dokon_hovli', text: 'Hovli buyumlari', group: 'Ombor va doʻkon' },
    { key: 'dokon_oyinchoq', text: 'Oʻyinchoqlar', group: 'Ombor va doʻkon' },
    { key: 'dokon_kiyim', text: 'Kiyimlar', group: 'Ombor va doʻkon' },
    ...COUNT_WORDS.map((w, i) => ({ key: `dokon_kerak_${i + 1}`, text: `${cap(w.replace(/'/g, 'ʻ'))} tanga kerak.`, group: 'Ombor va doʻkon' })),
    { key: 'dokon_qoy', text: 'Tangalarni bittalab sanab qoʻy!', group: 'Ombor va doʻkon' },
    { key: 'dokon_yetmaydi', text: 'Tangang yetmaydi. Bozorda meva sotib, tanga topib kel!', group: 'Ombor va doʻkon' },
    { key: 'dokon_rahmat', text: 'Xarid muborak!', group: 'Ombor va doʻkon' },
    { key: 'dokon_qoldi', text: 'Nechta tanga qoldi?', group: 'Ombor va doʻkon' },
    { key: 'dokon_hovliga', text: 'Uni hovlingga olib bordik!', group: 'Ombor va doʻkon' },
    { key: 'dokon_sandiq', text: 'Oʻyinchoqlar sandigʻingga qoʻydik!', group: 'Ombor va doʻkon' },
    { key: 'son_0', text: 'Nol', group: 'Sonlar' },
    ...NUMBERS.map((n, i) => ({ key: `son_${i + 1}`, text: n, group: 'Sonlar' })),

    { key: 'raqam_sana', text: 'Nechta? Sanab, raqamini top!', group: 'Raqamlar uyi' },
    { key: 'raqam_top', text: 'raqamini top!', group: 'Raqamlar uyi' },
    { key: 'raqam_chiz', text: "Raqamni barmog'ing bilan chiz!", group: 'Raqamlar uyi' },
    { key: 'raqam_qator', text: 'Qaysi son tushib qoldi?', group: 'Raqamlar uyi' },
    { key: 'raqam_kop', text: "Qaysi likopchada ko'p?", group: 'Raqamlar uyi' },
    { key: 'raqam_kam', text: 'Qaysi likopchada kam?', group: 'Raqamlar uyi' },
    { key: 'raqam_barmoq', text: "Nechta barmoq ko'rsatyapti? Sanab, raqamini top!", group: 'Raqamlar uyi' },
    { key: 'raqam_barmoq_t', text: "Ko'tarilgan barmoqlarni bittalab sana: bir, ikki, uch... Bitta qo'lda beshta barmoq bor. Nechta bo'lsa, pastdan o'sha raqamni bos. O'z barmoqlaring bilan ham ko'rsatib ko'r!", group: 'Raqamlar uyi' },
    // Har topshiriq birinchi marta chiqqanda (yoki "?" bosilganda) — batafsil tushuntirish
    { key: 'raqam_sana_t', text: "Mevalarni barmog'ing bilan bittalab sana: bir, ikki, uch... Oxirgi aytgan soning — mevalar soni. Keyin pastdan o'sha raqamni bos.", group: 'Raqamlar uyi' },
    { key: 'raqam_top_t', text: 'Men bitta raqamni aytaman. Pastdagi kartochkalardan o\'sha raqamni topib bos. Yana eshitmoqchi bo\'lsang, karnayni bos.', group: 'Raqamlar uyi' },
    { key: 'raqam_chiz_t', text: "Raqam ustidan barmog'ing bilan yurib chiz, xuddi bo'r bilan yozgandek. Chiziqdan chiqmaslikka harakat qil. Xato bo'lsa, gubkani bosib, qaytadan chiz.", group: 'Raqamlar uyi' },
    { key: 'raqam_qator_t', text: "Sonlar navbat bilan turibdi: bir, ikki, uch, to'rt... Bitta joy bo'sh qolgan. O'ylab ko'r: u yerga qaysi son keladi? Pastdan o'sha sonni bos.", group: 'Raqamlar uyi' },
    { key: 'raqam_solishtir_t', text: "Ikkala likopchadagi mevalarni sana. Men «ko'p» desam — ko'p mevali likopchani, «kam» desam — kam mevali likopchani bos.", group: 'Raqamlar uyi' },

    { key: 'hisob_qosh', text: "Ikkalasini qo'shsak, hammasi nechta bo'ladi?", group: 'Hisob maktabi' },
    { key: 'hisob_ayir', text: 'Bir nechtasi ketib qoldi. Nechta qoldi?', group: 'Hisob maktabi' },
    { key: 'hisob_misol', text: 'Misolni yech!', group: 'Hisob maktabi' },
    { key: 'hisob_tushgan', text: 'Qaysi son yetishmayapti?', group: 'Hisob maktabi' },
    ...SHAPE_ORDER.map((s) => ({ key: `shakl_${s}`, text: SHAPE_NAMES[s], group: 'Shakllar' })),
    ...PAINT_ORDER.filter((c) => !(c in COLOR_NAMES)).map((c) => ({ key: `rang_${c}`, text: PAINT_NAMES[c], group: 'Ranglar' })),
    ...PEOPLE.map((p) => ({ key: `odam_${p}`, text: PERSON_NAMES[p], group: 'Odamlar' })),
    ...Object.entries(DECOR_NAMES).map(([k, text]) => ({ key: `narsa_${k}`, text, group: 'Hovli' })),
    { key: 'musiqa_tingla', text: 'Diqqat bilan tingla!', group: 'Musiqa uyi' },
    { key: 'musiqa_sen', text: 'Endi sen chal! Xuddi shunday.', group: 'Musiqa uyi' },
    { key: 'musiqa_erkin', text: 'Xohlagan kuyingni chal! Yozib olib, keyin eshitsang ham bo\'ladi.', group: 'Musiqa uyi' },
    { key: 'asbob_pianino', text: 'Pianino', group: 'Musiqa uyi' },
    { key: 'asbob_ksilofon', text: 'Ksilofon', group: 'Musiqa uyi' },
    { key: 'asbob_dutor', text: 'Dutor', group: 'Musiqa uyi' },
    { key: 'asbob_nay', text: 'Nay', group: 'Musiqa uyi' },
    { key: 'asbob_doira', text: 'Doira', group: 'Musiqa uyi' },
    { key: 'albom_yangi', text: 'Yangi stiker! Albomingga qo\'shildi.', group: 'Umumiy' },
    { key: 'hovli_sovga', text: 'Hovlingga sovg\'a tanla!', group: 'Umumiy' },
    { key: 'hovli_joyla', text: 'Sovg\'angni hovlingga joyla! Qayerga qo\'yamiz?', group: 'Umumiy' },
    { key: 'shakl_qani', text: 'qani? Topib ber!', group: 'Shakllar' },
    { key: 'shakl_teshik', text: "Har bir shaklni o'z uyasiga joyla!", group: 'Shakllar' },
    { key: 'rang_aralash', text: 'Ikkalasini aralashtirsak, qaysi rang chiqadi?', group: 'Ranglar' },

    { key: 'mantiq_ortiqcha', text: "Qaysi biri ortiqcha? Boshqalariga o'xshamaydiganini top!", group: 'Mantiq' },
    { key: 'mantiq_juft', text: 'Kartalarni och va juftini top!', group: 'Mantiq' },
    { key: 'mantiq_tiz', text: 'Eng kichigidan boshlab, kattasigacha bos!', group: 'Mantiq' },
    { key: 'mantiq_labirint', text: "Qahramonni yo'ldan olib borib, uyiga yetkaz!", group: 'Mantiq' },
    // "Qanday bajariladi?" — har topshiriq birinchi marta chiqqanda yoki "?" bosilganda
    { key: 'ustaxona_naqsh_t', text: "Plitkalarga qara: ular bir tartibda takrorlanyapti. Keyingisi qaysi bo'ladi? Pastdan topib bos.", group: 'Ustaxona' },
    { key: 'qora_soya_t', text: "Har bir hayvonni barmog'ing bilan ushlab, o'zining soyasi ustiga olib bor va qo'yib yubor.", group: "Kechki qo'ra" },
    { key: 'ferma_kim_t', text: "Diqqat bilan tingla: qaysi hayvon ovoz chiqaryapti? Keyin o'sha hayvonni bos.", group: 'Ferma' },
    { key: 'ferma_takrorla_t', text: "Hayvonlar navbat bilan ovoz chiqaradi. Eslab qol va xuddi shu tartibda bos.", group: 'Ferma' },
    { key: 'bozor_oddiy_t', text: "Mijoz nechta meva so'rasa, shuncha mevani bos. Har birini sanab tur.", group: 'Bozor' },
    { key: 'bozor_sana_t', text: "Mijoz nechta meva so'rasa, shuncha mevani savatga sol. Ko'p bo'lib ketsa, savatdagisini bosib qaytar. Keyin «Berish» tugmasini bos.", group: 'Bozor' },
    { key: 'hisob_qosh_t', text: "Ikkala guruhdagi mevalarni birga sana. Hammasi nechta bo'lsa, pastdan o'sha raqamni bos.", group: 'Hisob maktabi' },
    { key: 'hisob_ayir_t', text: "Avval nechta meva borligini ko'r. Bir nechtasi ketib qoladi. Qolganlarini sana va pastdan o'sha raqamni bos.", group: 'Hisob maktabi' },
    { key: 'hisob_misol_t', text: "Qo'shuv belgisi — qo'shamiz, ayiruv belgisi — ayiramiz. Barmoqlaring bilan sanab ko'r, javobni pastdan bos.", group: 'Hisob maktabi' },
    { key: 'hisob_tushgan_t', text: "Bir son yashirinib qoldi. Qaysi sonni qo'shsak, natija to'g'ri chiqadi? O'ylab ko'r va pastdan bos.", group: 'Hisob maktabi' },
    { key: 'hisob_belgi_t', text: "Ikki sonni solishtir. Qaysi biri katta bo'lsa, belgining og'zi o'shanga qaraydi. Teng bo'lsa — teng belgisini bos.", group: 'Hisob maktabi' },
    { key: 'shakl_shakl_t', text: "Men shaklning nomini aytaman. Pastdan o'sha shaklni topib bos. Yana eshitmoqchi bo'lsang, karnayni bos.", group: 'Shakllar' },
    { key: 'shakl_rang_t', text: "Men rangning nomini aytaman. Pastdan o'sha rangdagi bo'yoqni bos.", group: 'Shakllar' },
    { key: 'shakl_ikkalasi_t', text: "Diqqat bilan eshit: ham rangi, ham shakli to'g'ri bo'lishi kerak. Pastdan aynan shuni top.", group: 'Shakllar' },
    { key: 'shakl_teshik_t', text: "Har bir shaklni barmog'ing bilan ushlab, o'ziga mos uyaga olib bor va qo'yib yubor.", group: 'Shakllar' },
    { key: 'shakl_aralash_t', text: "Ikki bo'yoqni aralashtirsak, yangi rang chiqadi. Qaysi rang chiqishini o'ylab, pastdan bos.", group: 'Shakllar' },
    { key: 'mantiq_ortiqcha_t', text: "To'rtta rasmga qara. Uchtasi bir-biriga o'xshaydi, bittasi boshqacha. O'sha boshqachasini bos.", group: 'Mantiq' },
    { key: 'mantiq_juft_t', text: "Avval kartalarni eslab qol. Keyin ular yopiladi. Ikkitadan ochib, bir xil rasmlarni top.", group: 'Mantiq' },
    { key: 'mantiq_tiz_t', text: "Eng kichigini top va bos. Keyin undan kattarog'ini. Shunday qilib, kichikdan kattaga tiz.", group: 'Mantiq' },
    { key: 'mantiq_labirint_t', text: "Barmog'ing bilan qahramonni yo'l bo'ylab yurgiz. Devordan o'tib bo'lmaydi. Uyni top!", group: 'Mantiq' },
    { key: 'yozuv_chiziq_t', text: "Sariq nuqtadan boshla. Barmog'ingni ko'tarmasdan, yashil yo'l ustidan yurib chiz.", group: 'Yozuv maktabi' },
    { key: 'yozuv_belgi_t', text: "Harf yoki raqam ustidan barmog'ing bilan yurib yoz. Chiziqdan chiqmaslikka harakat qil.", group: 'Yozuv maktabi' },
    { key: 'sher_topishmoq_t', text: "Men senga she'r-topishmoq aytaman. Diqqat bilan tingla: bu nima haqida? Keyin pastdan o'sha rasmni bos.", group: "She'rlar" },
    { key: 'musiqa_kuy_nonlar', text: "Bugun «Issiq nonlar» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_qozichoq', text: "Bugun «Qo'zichoq» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_yulduzcha', text: "Bugun «Yulduzcha» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_jak', text: "Bugun «Uyg'on, uyg'on!» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_ferma', text: "Bugun «Bobomning fermasi» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_qayiq', text: "Bugun «Qayiqcha» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_koprik', text: "Bugun «Ko'prik» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_shodlik', text: "Bugun «Shodlik qo'shig'i» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_qongiroq', text: "Bugun «Qo'ng'iroqcha» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_alla', text: "Bugun «Alla» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_kuy_tugilgan', text: "Bugun «Tug'ilgan kun» kuyini o'rganamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_qism', text: "Kuyning keyingi qismi. Diqqat bilan tingla!", group: 'Musiqa uyi' },
    { key: 'musiqa_butun', text: "Endi qismlarni birlashtiramiz. Butun kuyni chalamiz!", group: 'Musiqa uyi' },
    { key: 'musiqa_takrorla_t', text: "Men kuy chalaman, klavishlar yonadi. Diqqat bilan tingla va qara. Keyin xuddi shu tartibda o'zing chal.", group: 'Musiqa uyi' },
    { key: 'hisob_belgi', text: "Qaysi belgi to'g'ri keladi: katta, kichik yoki teng?", group: 'Hisob maktabi' },

    { key: 'ferma_kim', text: 'Bu qaysi hayvon? Topchi!', group: 'Ferma' },
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
    // Harf o'zbekcha nomi bilan: "Be", "Ka", "Qe" (inglizcha "bi", "key" emas)
    ...ALPHABET.map((l) => ({ key: letterVoice(l), text: LETTER_NAMES[l], group: 'Harflar' })),

    ...RIDDLES.map((r) => ({ key: `sher_${r.id}`, text: r.text.replace(/\n/g, ' '), group: "She'rlar" })),
    // Yangi narsalar nomi (albom, xotira o'yini)
    ...Object.entries(THINGS).map(([k, t]) => ({ key: `nom_${k}`, text: t.name, group: 'Narsalar' })),
    { key: 'sher_top', text: 'Bu nima? Rasmini top!', group: "She'rlar" },

    { key: 'yozuv_chiz', text: "Sariq nuqtadan boshlab, chiziq ustidan yurib chiz!", group: 'Yozuv maktabi' },
    { key: 'yozuv_harf', text: "Barmog'ing bilan yoz!", group: 'Yozuv maktabi' },
    ...Object.entries(STROKE_LABELS).map(([id, text]) => ({ key: `yozuv_${id}`, text, group: 'Yozuv maktabi' })),
  ]
}
