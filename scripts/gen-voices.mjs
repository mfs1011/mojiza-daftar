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
import { apiKey, ASSETS_DIR, gemini, inlineData, writeManifest } from './lib.mjs'

const MODEL = process.env.GEN_TTS_MODEL ?? 'gemini-2.5-flash-preview-tts'
const VOICE = process.env.GEN_TTS_VOICE ?? 'Leda'
const args = process.argv.slice(2)
const test = args.includes('--test')
const force = args.includes('--force')
const key = apiKey()
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

async function speak(text, file) {
  const body = {
    contents: [
      {
        parts: [
          {
            text:
              'Read the following Uzbek (Latin script) phrase aloud in natural, fluent Uzbek, ' +
              'like a warm, cheerful kindergarten teacher talking to a 4-year-old: slow, clear, smiling. ' +
              `Say only the phrase: "${text}"`,
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
    },
  }
  const data = inlineData(await gemini(MODEL, body, key))
  const rate = Number(/rate=(\d+)/.exec(data.mimeType ?? '')?.[1] ?? 24000)
  writeFileSync(file, wav(Buffer.from(data.data, 'base64'), rate))
}

if (test) {
  const f = join(dir, '_test.wav')
  await speak("Salom! Bugun qishloqqa sayohat qilamiz. Mevalarni rangiga qarab savatlarga sol!", f)
  console.log(`Namuna: ${f}\nTinglang (macOS: afplay "${f}"). O'zbekcha talaffuz yaxshi bo'lsa: npm run gen:voices`)
  process.exit(0)
}

// Ism bilan salomlashish (ism_*) ota-ona tomonidan yoziladi: ismlarni oldindan bilmaymiz
// .wav (yangi) yoki .m4a (siqilgan) bo'lsa — bor deb hisoblanadi
const exists = (k) => existsSync(join(dir, `${k}.wav`)) || existsSync(join(dir, `${k}.m4a`))
const prompts = voicePrompts([]).filter((p) => force || !exists(p.key))
console.log(`Model: ${MODEL}, ovoz: ${VOICE}. Yaratiladi: ${prompts.length} ta`)
let ok = 0
for (const p of prompts) {
  // "Sigir: "Mo'-o'"" kabi matnlarda faqat tovushning o'zi aytiladi
  const text = p.key.startsWith('tovush_') ? p.text.split(': ').slice(1).join(': ').replace(/"/g, '') : p.text.replace(/^"(.+)" harfi$/, '$1')
  // Bepul tarifda daqiqalik so'rov limiti bor: GEN_DELAY_MS bilan sekinlashtirish mumkin
  if (process.env.GEN_DELAY_MS) await new Promise((r) => setTimeout(r, Number(process.env.GEN_DELAY_MS)))
  try {
    await speak(text, join(dir, `${p.key}.wav`))
    ok++
    console.log(`✓ ${p.key}: ${text}`)
  } catch (e) {
    console.error(`✗ ${p.key}: ${e.message}`)
  }
}
console.log(`\nTayyor: ${ok}/${prompts.length}. Manifest: ${writeManifest()} ta fayl`)
