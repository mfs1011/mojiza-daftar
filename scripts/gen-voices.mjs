#!/usr/bin/env node
// Ovozli ko'rsatmalarni Gemini TTS bilan yaratish (ota-ona yozmagan ko'rsatmalar uchun zaxira).
//
//   npm run gen:voices -- --test   # bitta namuna: public/assets/voices/_test.wav — avval tinglab ko'ring!
//   npm run gen:voices             # hamma ko'rsatmalar (borlari o'tkazib yuboriladi)
//   npm run gen:voices -- --force
//   GEN_TTS_VOICE=Leda GEN_TTS_MODEL=gemini-2.5-pro-preview-tts npm run gen:voices
//
// Ota-ona panelida yozilgan ovoz har doim ustun turadi; bu fayllar faqat zaxira.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { voicePrompts } from '../src/lib/voices.ts'
import { ASSETS_DIR, gemini, inlineData, isDailyLimit, keyPool, writeManifest } from './lib.mjs'

// Modellar navbati: bepul limit har model uchun alohida (kuniga ~10 ta × kalit). Biri tugasa — keyingisi.
// Birinchisi uslub ko'rsatmasini tushunadi (o'zbekcha talaffuz); Gemini 3.x faqat toza matn oladi.
//   GEN_TTS_MODELS=gemini-2.5-flash-preview-tts,gemini-3.8-flash-tts npm run gen:voices
const MODELS = (process.env.GEN_TTS_MODELS ?? process.env.GEN_TTS_MODEL ?? 'gemini-2.5-flash-preview-tts,gemini-3.8-flash-tts,gemini-3.1-flash-tts-preview,gemini-3.8-flash-lite-tts').split(',').map((m) => m.trim()).filter(Boolean)
let mi = 0
const MODEL = MODELS[0]
const styled = (m) => !/gemini-3/.test(m)
/** Qaysi ovoz qaysi model bilan yaratilgani (--redo tayyorini qayta yaratmasin) */
const madeFile = new URL('./voice-models.json', import.meta.url)
const made = existsSync(madeFile) ? JSON.parse(readFileSync(madeFile, 'utf8')) : {}
const VOICE = process.env.GEN_TTS_VOICE ?? 'Leda'
const args = process.argv.slice(2)
const test = args.includes('--test')
// --only voice-ouch,salom → faqat shu kalitlar (qayta yaratish uchun --force bilan)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null
const want = (k) => !only || only.includes(k)
const force = args.includes('--force')
let pool = keyPool()
const dir = join(ASSETS_DIR, 'voices')
mkdirSync(dir, { recursive: true })

/** Gemini TTS xom PCM (16-bit, mono) qaytaradi → WAV sarlavhasi qo'shamiz */
function wav(pcm, rate) {
  const h = Buffer.alloc(44)
  h.write('RIFF', 0)
  h.writeUInt32LE(36 + pcm.length, 4)
  h.write('WAVEfmt ', 8)
  h.writeUInt32LE(16, 16)
  h.writeUInt16LE(1, 20)
  h.writeUInt16LE(1, 22)
  h.writeUInt32LE(rate, 24)
  h.writeUInt32LE(rate * 2, 28)
  h.writeUInt16LE(2, 32)
  h.writeUInt16LE(16, 34)
  h.write('data', 36)
  h.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([h, pcm])
}

/** Hamma odam ovozlari uchun: o'zbekcha talaffuz qoidalari */
const UZBEK =
  'Read the following Uzbek (Latin script) phrase aloud as a native Uzbek speaker from Tashkent, ' +
  'with natural Uzbek pronunciation, rhythm and word stress (in Uzbek the stress is usually on the LAST syllable of a word). ' +
  'Do not use a Russian, Turkish or English accent. ' +
  '"oʻ" is ONE rounded vowel [ɵ] between o and u, with no pause after it; "gʻ" is ONE soft guttural consonant [ʁ] like French "r", not "g", with no pause; ' +
  '"q" is a deep uvular [q], different from "k"; "x" is like German "ch" in "Bach"; "h" is a light breath. '

const TEACHER = UZBEK + 'Speak like a warm, cheerful kindergarten teacher talking to a 4-year-old: unhurried, clear, smiling.'

/** Bozor mijozlari: har biri o'z xarakterida, lekin baribir sof o'zbekcha */
const PERSONA = {
  bobo: 'an elderly Uzbek grandfather (about 70) from a village: deep, slow, slightly raspy, very kind',
  buvi: 'an elderly Uzbek grandmother (about 65): warm, soft, loving, a little slow',
  aka: 'a friendly Uzbek young man (about 20): cheerful and lively',
  opa: 'a friendly Uzbek young woman (about 18): bright and gentle',
  bola: 'a playful Uzbek boy (about 8): high-pitched, excited',
}
/** Harf nomi: o'zbek maktabidagidek ("Be", "Qe", "She"), inglizcha "bi", "kyu" emas */
const LETTER =
  UZBEK +
  'This is the NAME of a letter of the Uzbek Latin alphabet, said by a kindergarten teacher. Pronounce it the Uzbek way, ' +
  'NOT as an English letter name: "Be" = [be], "Ka" = [ka], "Qe" = [qe] with a deep uvular q, "Xe" = [χe], "She" = [ʃe], "Che" = [tʃe], ' +
  'single vowels short and pure ("A" = [a], "O" = [o], "U" = [u], "I" = [i]). Clear and slow.'

const styleFor = (key) => {
  if (/^harf_(?!chiz$|top$)/.test(key)) return LETTER
  const m = /^mijoz_([a-z]+)_/.exec(key)
  if (!m || !PERSONA[m[1]]) return TEACHER
  return `You are ${PERSONA[m[1]]}, buying fruit from a small child at a village bazaar. ` + UZBEK + 'Speak naturally in that character.'
}

class Skip extends Error {}
class AllDone extends Error {}

async function speak(text, file, style = TEACHER, voice = VOICE, needStyle = false) {
  let json
  let model
  for (;;) {
    model = MODELS[mi]
    // Harf nomlari va personajlar faqat uslubni tushunadigan modelda (aks holda inglizcha o'qiladi)
    if (needStyle && !styled(model)) throw new Skip('uslubli model limiti tugagan')
    try {
      json = await gemini(model, bodyFor(model, text, style, voice), pool.key)
      break
    } catch (e) {
      if (!isDailyLimit(e)) throw e
      if (pool.next()) {
        console.log(`  ↻ ${model}: kunlik limit tugadi, kalit ${pool.label} ga o'tildi`)
        continue
      }
      if (++mi >= MODELS.length) throw new AllDone('Hamma model va kalitlarning kunlik limiti tugadi')
      pool = keyPool()
      console.log(`  ⇄ ${model} tugadi → ${MODELS[mi]} modeliga o'tildi`)
    }
  }
  return finish(json, text, file, model)
}

function bodyFor(model, text, style, voice) {
  // Gemini 3.x TTS uslub ko'rsatmasini ham ovoz chiqarib o'qib yuboradi (systemInstruction ham yo'q):
  // ularga faqat toza matn beriladi
  const plain = !styled(model)
  return {
    contents: [{ parts: [{ text: plain ? text : `${style} Say only this: "${text}"` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  }
}

function finish(json, text, file, model) {
  const data = inlineData(json)
  const rate = Number(/rate=(\d+)/.exec(data.mimeType ?? '')?.[1] ?? 24000)
  const pcm = Buffer.from(data.data, 'base64')
  // Sog'lomlik tekshiruvi: model ko'rsatmani o'qib yuborsa, ovoz matndan ancha uzun chiqadi
  const secs = pcm.length / 2 / rate
  const limit = 3 + text.length * 0.15
  if (secs > limit) throw new Error(`ovoz juda uzun (${secs.toFixed(1)} s > ${limit.toFixed(1)} s): model ko'rsatmani o'qigan bo'lishi mumkin`)
  writeFileSync(file, wav(pcm, rate))
  return model
}

if (test) {
  const f = join(dir, '_test.wav')
  await speak("Salom! Bugun qishloqqa sayohat qilamiz. Mevalarni rangiga qarab savatlarga sol!", f)
  console.log(`Namuna: ${f}\nTinglang (macOS: afplay "${f}"). O'zbekcha talaffuz yaxshi bo'lsa: npm run gen:voices`)
  process.exit(0)
}

// ---------- Sahnadagi qahramonning jonli ovozlari (sintez "pip-pip" o'rniga) ----------
// Ilova ularni sfx/voice-<nom> dan oladi (audio.ts → voiceFx).
const CHARACTER =
  'You are a cute, playful cartoon character (like a small animated toy) with a bright, expressive, child-like voice, ' +
  'and you are Uzbek: say Uzbek words with native Uzbek pronunciation, no Russian or English accent. ' +
  'Perform this short vocal reaction with big emotion, very expressive, like in an animated movie. No extra words.'
const REACTIONS = {
  bonk: 'Voy!',
  ouch: 'Oy-oy-oy!',
  giggle: 'Hi-hi-hi-hi-hi!',
  purr: 'Mmmmmm...',
  yay: 'Uraaa!',
  hmm: 'Hmm?',
  woo: 'Vuuuuuy!',
  yawn: 'Aaaaa-uuuf...',
  snore: 'Xrrrr... pshhhh...',
  grr: 'Grrr! Hmph!',
  boing: 'Hop!',
  squeeze: 'Iiiiiii!',
}
const CHAR_VOICE = process.env.GEN_CHAR_VOICE ?? 'Puck'
const sfxDir = join(ASSETS_DIR, 'sfx')
mkdirSync(sfxDir, { recursive: true })
const charTodo = Object.entries(REACTIONS).filter(
  ([k]) => want(`voice-${k}`) && (force || !(existsSync(join(sfxDir, `voice-${k}.wav`)) || existsSync(join(sfxDir, `voice-${k}.m4a`)))),
)
console.log(`Qahramon ovozlari (${CHAR_VOICE}): ${charTodo.length} ta`)
for (const [k, text] of charTodo) {
  if (process.env.GEN_DELAY_MS) await new Promise((r) => setTimeout(r, Number(process.env.GEN_DELAY_MS)))
  try {
    await speak(text, join(sfxDir, `voice-${k}.wav`), CHARACTER, CHAR_VOICE)
    console.log(`✓ voice-${k}: ${text}`)
  } catch (e) {
    console.error(`✗ voice-${k}: ${e.message.slice(0, 120)}`)
    if (/429/.test(e.message)) {
      console.error('Hamma kalitlarning kunlik limiti tugadi — ertaga davom ettiring (borlari o\'tkazib yuboriladi).')
      writeManifest()
      process.exit(2)
    }
  }
}

// Ism bilan salomlashish (ism_*) ota-ona tomonidan yoziladi: ismlarni oldindan bilmaymiz
// .wav (yangi) yoki .m4a (siqilgan) bo'lsa — bor deb hisoblanadi
const exists = (k) => existsSync(join(dir, `${k}.wav`)) || existsSync(join(dir, `${k}.m4a`))
// reak_* — ota-ona o'zi yozadigan qahramon ovozlari, ular uchun TTS kerak emas
// tovush_* — hayvon taqlidi: TTS (odam ovozi) bilan yaratilmaydi, haqiqiy yozuvlar sfx/animals/ da
/**
 * --redo: o'zbekcha talaffuz ko'rsatmasisiz yaratilgan (Gemini 3 TTS, toza matn) yoki inglizcha o'qilgan ovozlar —
 * fayli bo'lsa ham qayta yaratiladi
 */
const REDO = new Set([
  'hayvon_eshak', 'ustaxona_intro', 'qora_intro', 'qora_tun', 'harf_chiz', 'harf_top', 'son_1',
])
const redo = args.includes('--redo')
const needStyle = (k) => REDO.has(k) || /^harf_(?!chiz$|top$)/.test(k) || /^mijoz_/.test(k)
// Uslubli model bilan allaqachon qayta yaratilganlari o'tkazib yuboriladi
// --redo: uslubsiz (Gemini 3.x) modelda yaratilgan har qanday ovoz ham qayta yaratiladi — ular ba'zan so'zni buzadi
const needs = (k) => force || !exists(k) || (redo && ((needStyle(k) && !(made[k] && styled(made[k]))) || (made[k] && !styled(made[k]))))

/** Ustuvorlik: avval o'yin ko'rsatmalari (ularsiz bola nima qilishni bilmaydi), keyin nomlar, harflar, mijozlar */
const PRIORITY = [
  'Raqamlar uyi', 'Hisob maktabi', 'Shakllar', 'Ranglar', 'Mantiq', 'Yozuv maktabi', 'Musiqa uyi', "She'rlar",
  'Sonlar', 'Umumiy', 'Kechki qo\'ra', 'Ustaxona', 'Harflar uyi', 'Harflar', 'Bozor mijozlari', 'Hayvonlar', 'Odamlar', 'Hovli',
]
const rank = (g) => {
  const i = PRIORITY.indexOf(g)
  return i < 0 ? PRIORITY.length : i
}
/** Bozor mijozlari ichida: avval salomlashish gaplari, keyin "Menga N-ta", keyin meva nomi */
const sub = (k) => (/^mijoz_[a-z]+_son_/.test(k) ? 1 : /^mijoz_[a-z]+_meva_/.test(k) ? 2 : 0)
const prompts = voicePrompts([])
  .filter((p) => !p.key.startsWith('reak_') && !p.key.startsWith('tovush_') && want(p.key) && needs(p.key))
  .sort((a, b) => rank(a.group) - rank(b.group) || sub(a.key) - sub(b.key))
console.log(`Modellar: ${MODELS.join(' → ')}, ovoz: ${VOICE}. Yaratiladi: ${prompts.length} ta`)
let ok = 0
let skipped = 0
for (const p of prompts) {
  // "Sigir: "Mo'-o'"" kabi matnlarda faqat tovushning o'zi aytiladi
  const raw = p.key.startsWith('tovush_') ? p.text.split(': ').slice(1).join(': ').replace(/"/g, '') : p.text.replace(/^"(.+)" harfi$/, '$1')
  // Rasmiy imlo: oʻ / gʻ (U+02BB). Oddiy apostrofni model pauza yoki qisqartma deb o'qiydi
  const text = raw.replace(/([OoGg])['‘’`]/g, '$1ʻ')
  // Bepul tarifda daqiqalik so'rov limiti bor: GEN_DELAY_MS bilan sekinlashtirish mumkin
  if (process.env.GEN_DELAY_MS) await new Promise((r) => setTimeout(r, Number(process.env.GEN_DELAY_MS)))
  try {
    // GEN_ALLOW_PLAIN=mijoz_ — bu kalitlar vaqtincha uslubsiz modelda ham yaratiladi (keyin --redo sifatlisiga almashtiradi)
    const plainOk = (process.env.GEN_ALLOW_PLAIN ?? '').split(',').filter(Boolean).some((pre) => p.key.startsWith(pre))
    made[p.key] = await speak(text, join(dir, `${p.key}.wav`), styleFor(p.key), p.voice ?? VOICE, needStyle(p.key) && !plainOk)
    writeFileSync(madeFile, JSON.stringify(made, null, 1))
    ok++
    console.log(`✓ ${p.key}: ${text}`)
  } catch (e) {
    if (e instanceof Skip) {
      skipped++
      continue
    }
    console.error(`✗ ${p.key}: ${e.message.slice(0, 120)}`)
    if (e instanceof AllDone || /429/.test(e.message)) {
      console.error('Hamma kalitlarning kunlik limiti tugadi — ertaga davom ettiring (borlari o\'tkazib yuboriladi).')
      break
    }
  }
}
console.log(`\nTayyor: ${ok}/${prompts.length} (uslubli model kutayotgani: ${skipped}). Manifest: ${writeManifest()} ta fayl`)
