#!/usr/bin/env node
// Ovozli ko'rsatmalarni Gemini TTS bilan yaratish (ota-ona yozmagan ko'rsatmalar uchun zaxira).
//
//   npm run gen:voices -- --test   # bitta namuna: public/assets/voices/_test.wav — avval tinglab ko'ring!
//   npm run gen:voices             # hamma ko'rsatmalar (borlari o'tkazib yuboriladi)
//   npm run gen:voices -- --force
//   GEN_TTS_VOICE=Leda GEN_TTS_MODEL=gemini-2.5-pro-preview-tts npm run gen:voices
//
// Ota-ona panelida yozilgan ovoz har doim ustun turadi; bu fayllar faqat zaxira.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { voicePrompts } from '../src/lib/voices.ts'
import { ASSETS_DIR, gemini, inlineData, isDailyLimit, keyPool, writeManifest } from './lib.mjs'

const MODEL = process.env.GEN_TTS_MODEL ?? 'gemini-2.5-flash-preview-tts'
const VOICE = process.env.GEN_TTS_VOICE ?? 'Leda'
const args = process.argv.slice(2)
const test = args.includes('--test')
// --only voice-ouch,salom → faqat shu kalitlar (qayta yaratish uchun --force bilan)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null
const want = (k) => !only || only.includes(k)
const force = args.includes('--force')
const pool = keyPool()
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

const TEACHER =
  'You are a native Uzbek speaker from Tashkent. Read the following Uzbek (Latin script) phrase aloud ' +
  'with natural Uzbek pronunciation, rhythm and word stress (in Uzbek the stress is usually on the LAST syllable of a word). ' +
  "Do not use a Russian, Turkish or English accent. \"o'\" and \"g'\" are distinct Uzbek sounds. " +
  'Speak like a warm, cheerful kindergarten teacher talking to a 4-year-old: unhurried, clear, smiling.'

async function speak(text, file, style = TEACHER, voice = VOICE) {
  // Gemini 3.x TTS uslub ko'rsatmasini ham ovoz chiqarib o'qib yuboradi (systemInstruction ham yo'q):
  // ularga faqat toza matn beriladi
  const plain = /gemini-3/.test(MODEL)
  const body = {
    contents: [{ parts: [{ text: plain ? text : `${style} Say only this: "${text}"` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  }
  let json
  for (;;) {
    try {
      json = await gemini(MODEL, body, pool.key)
      break
    } catch (e) {
      // Bu kalitning kunlik limiti tugadi → keyingi kalit
      if (!isDailyLimit(e) || !pool.next()) throw e
      console.log(`  ↻ kunlik limit tugadi, kalit ${pool.label} ga o'tildi`)
    }
  }
  const data = inlineData(json)
  const rate = Number(/rate=(\d+)/.exec(data.mimeType ?? '')?.[1] ?? 24000)
  const pcm = Buffer.from(data.data, 'base64')
  // Sog'lomlik tekshiruvi: model ko'rsatmani o'qib yuborsa, ovoz matndan ancha uzun chiqadi
  const secs = pcm.length / 2 / rate
  const limit = 3 + text.length * 0.15
  if (secs > limit) throw new Error(`ovoz juda uzun (${secs.toFixed(1)} s > ${limit.toFixed(1)} s): model ko'rsatmani o'qigan bo'lishi mumkin`)
  writeFileSync(file, wav(pcm, rate))
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
  'You are a cute, playful cartoon character (like a small animated toy) with a bright, expressive, child-like voice. ' +
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
const prompts = voicePrompts([]).filter((p) => !p.key.startsWith('reak_') && !p.key.startsWith('tovush_') && want(p.key) && (force || !exists(p.key)))
console.log(`Model: ${MODEL}, ovoz: ${VOICE}. Yaratiladi: ${prompts.length} ta`)
let ok = 0
for (const p of prompts) {
  // "Sigir: "Mo'-o'"" kabi matnlarda faqat tovushning o'zi aytiladi
  const text = p.key.startsWith('tovush_') ? p.text.split(': ').slice(1).join(': ').replace(/"/g, '') : p.text.replace(/^"(.+)" harfi$/, '$1')
  // Bepul tarifda daqiqalik so'rov limiti bor: GEN_DELAY_MS bilan sekinlashtirish mumkin
  if (process.env.GEN_DELAY_MS) await new Promise((r) => setTimeout(r, Number(process.env.GEN_DELAY_MS)))
  try {
    await speak(text, join(dir, `${p.key}.wav`), TEACHER, p.voice ?? VOICE)
    ok++
    console.log(`✓ ${p.key}: ${text}`)
  } catch (e) {
    console.error(`✗ ${p.key}: ${e.message.slice(0, 120)}`)
    if (/429/.test(e.message)) {
      console.error('Hamma kalitlarning kunlik limiti tugadi — ertaga davom ettiring (borlari o\'tkazib yuboriladi).')
      break
    }
  }
}
console.log(`\nTayyor: ${ok}/${prompts.length}. Manifest: ${writeManifest()} ta fayl`)
