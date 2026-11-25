#!/usr/bin/env node
// O'yin ovozlari — Gemini 3.8 Flash TTS, Interactions API orqali (dev-docs loyihasidagi usul).
//
//   node scripts/gen-voices-inter.mjs            # hali shu usulda yaratilmaganlarning hammasi
//   node scripts/gen-voices-inter.mjs --only son_1,harf_B
//   node scripts/gen-voices-inter.mjs --plan     # so'rovsiz: qaysi guruhlar, nechta so'rov
//   keyin: node scripts/audio-import.mjs
//
// Nega shunday:
//  • Interactions API'da uslub (kim gapiryapti, qanday ohangda) alohida maydonda beriladi va
//    ovoz chiqarib o'qilmaydi; eski generateContent'da 3.x modellar uslubni o'qib yuborardi.
//  • Bir xil ovoz va uslubdagi 10–12 jumla BITTA so'rovda o'qiladi (orasida uzun pauza), keyin
//    pauzalar bo'yicha kesiladi: so'rovlar soni ~12 marta kamayadi (bepul limit yetadi) va
//    ohang tabiiyroq chiqadi. Kesish ishonchsiz bo'lsa — guruh ikkiga bo'linib qayta so'raladi.
import { spawnSync } from 'node:child_process'
import { homedir, tmpdir } from 'node:os'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isDailyLimit, keyPool, ROOT } from './lib.mjs'
import { CUSTOMER_VOICES, voicePrompts } from '../src/lib/voices.ts'

// Modellar navbati: birining bepul limiti tugasa — keyingisi. 3.1 Interactions API'da uslub maydonini qo'llamaydi
const MODELS = (process.env.GEN_TTS_MODELS ?? 'gemini-3.8-flash-tts,gemini-3.8-flash-lite-tts').split(',')
let mi = 0
const MODEL = MODELS[0]
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const TEACHER_VOICE = process.env.GEN_VOICE ?? 'Sulafat'
// MMS aligner (scripts/align-lines.py): bo'lsa — jumlalar so'zma-so'z aniq ajratiladi, guruh kattaroq bo'ladi
const ALIGN_PY = process.env.ALIGN_PY ?? join(homedir(), '.cache/mojiza-align/venv/bin/python')
const HAS_ALIGN = existsSync(ALIGN_PY)
const BATCH = Number(process.env.GEN_BATCH ?? (HAS_ALIGN ? 20 : 8))
const INBOX = join(ROOT, 'audio-inbox')
const VOICES = join(ROOT, 'public/assets/voices')
const madeFile = new URL('./voice-models.json', import.meta.url)
const made = existsSync(madeFile) ? JSON.parse(readFileSync(madeFile, 'utf8')) : {}
mkdirSync(INBOX, { recursive: true })

const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null
const plan = args.includes('--plan')

const NATIVE = 'native Uzbek speaker from Tashkent, natural Uzbek intonation and word stress, no English, Russian or Turkish accent'
const TEACHER = `${NATIVE}, warm cheerful kindergarten teacher talking to a 4-year-old child, clear unhurried pace`
const LETTERS = `${NATIVE}, kindergarten teacher saying names of letters of the Uzbek alphabet to a small child: every consonant is said as its own sound followed by a short "e" (Be, De, Fe, He, Ke, Le, Me, Ne, Qe, Re, Se, Xe, She, Che), never as "em", "en", "ka" or English letter names; vowels as pure sounds (A, E, I, O, U, Oʻ); clear and slow`
const PERSONA = {
  bobo: `${NATIVE}, a kind elderly grandfather of about 70 buying fruit from a small child at a village bazaar, slow warm deep voice`,
  buvi: `${NATIVE}, a loving elderly grandmother of about 65 buying fruit from a small child at a village bazaar, gentle caring voice`,
  aka: `${NATIVE}, a friendly cheerful young man of about 25 buying fruit from a small child at a village bazaar`,
  opa: `${NATIVE}, a cheerful young woman of about 20 buying fruit from a small child at a village bazaar, light friendly voice`,
  bola: `${NATIVE}, a playful energetic 7-year-old boy buying fruit at a village bazaar, childlike voice`,
  shifokor: `${NATIVE}, a kind caring woman doctor of about 35 buying fruit from a small child at a village bazaar, warm calm voice`,
  oshpaz: `${NATIVE}, a cheerful jolly man cook of about 40 buying fruit from a small child at a village bazaar, warm hearty voice`,
  haydovchi: `${NATIVE}, a friendly calm man driver of about 30 buying fruit from a small child at a village bazaar`,
  dehqon: `${NATIVE}, a kind hardworking farmer of about 50 buying fruit from a small child at a village bazaar, warm earthy voice`,
}
const PAUSE = ' Read every line as a separate short phrase and make a long pause of about two seconds after each line.'

/** Ovozga ketadigan matn: rasmiy oʻ/gʻ, tovush taqlidlari va harf yozuvlari tozalanadi */
function sayText(p) {
  const raw = p.key.startsWith('tovush_') ? p.text.split(': ').slice(1).join(': ').replace(/"/g, '') : p.text.replace(/^"(.+)" harfi$/, '$1')
  const text = raw.replace(/([OoGg])['‘’`]/g, '$1ʻ').trim()
  // Harf nomi yolg'iz bo'g'in bo'lsa ("Be", "E") model uni inglizcha o'qishi mumkin: o'zbekcha gap ichida
  // o'qitiladi, keyin aligner faqat «…» ichidagi nomni kesib oladi
  // Talaffuz yozuvi: "Je" TTS'da ruscha "Же" bo'lib o'qiladi — o'zbekcha [dʒe] uchun "Dje"
  if (/^harf_(?!chiz$|top$)/.test(p.key)) return `Bu «${text === 'Je' ? 'Dje' : text}» harfi.`
  return text
}
/** Tekshiruv uchun: kesib olinadigan qism uzunligi */
const spokenLen = (say) => (/«([^»]+)»/.exec(say)?.[1] ?? say).length

/** Kim va qanday ohangda gapiradi */
function roleOf(p) {
  const m = /^mijoz_([a-z]+)_/.exec(p.key)
  if (m && PERSONA[m[1]]) return { voice: CUSTOMER_VOICES[m[1]], style: PERSONA[m[1]], role: m[1] }
  if (/^harf_(?!chiz$|top$)/.test(p.key)) return { voice: TEACHER_VOICE, style: LETTERS, role: 'harf' }
  return { voice: TEACHER_VOICE, style: TEACHER, role: 'tarbiyachi' }
}

const mark = (voice) => `inter:${MODELS[mi]}:${voice}`
// --upgrade: asosiy modeldan boshqasida yaratilganlarini ham qayta yaratish
const upgrade = args.includes('--upgrade')
const done = (k, voice) => {
  const m = made[k] ?? ''
  if (!m.startsWith('inter:') || !m.endsWith(`:${voice}`)) return false
  return !upgrade || m === `inter:${MODEL}:${voice}`
}
const prompts = voicePrompts([])
  .filter((p) => !/^(reak_|tovush_|ism_)/.test(p.key))
  .filter((p) => !only || only.includes(p.key))
  .map((p) => ({ ...p, say: sayText(p), ...roleOf(p) }))
  .filter((p) => only || !done(p.key, p.voice))

// Guruhlash: bir xil ovoz + uslub
const groups = new Map()
for (const p of prompts) {
  const g = `${p.voice}|${p.role}`
  if (!groups.has(g)) groups.set(g, [])
  groups.get(g).push(p)
}
const chunks = []
for (const list of groups.values()) for (let i = 0; i < list.length; i += BATCH) chunks.push(list.slice(i, i + BATCH))
console.log(`Kesish: ${HAS_ALIGN ? 'MMS aligner' : 'pauzalar'}, guruh: ${BATCH}. Modellar: ${MODELS.join(' → ')} (Interactions API). Ovozlar: ${prompts.length} ta, so'rovlar: ~${chunks.length} ta`)
if (plan) {
  for (const [g, list] of groups) console.log(`  ${g}: ${list.length} ta`)
  process.exit(0)
}

// ---------- So'rov (kalitlar navbat bilan) ----------
let pool = keyPool()
let keysLeft = (() => {
  const p = keyPool()
  let n = 1
  while (p.next()) n++
  return n
})()

async function tts(text, style, voice) {
  for (;;) {
    const body = {
      model: MODELS[mi],
      input: [{ type: 'user_input', content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style }] }] }],
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice }] },
    }
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': pool.key }, body: JSON.stringify(body) })
    const t = await r.text()
    if (r.status === 429) {
      const e = new Error(`429 ${t.slice(0, 300)}`)
      if (!isDailyLimit(e) && !/PerDay|per day|quota/i.test(t)) {
        await new Promise((res) => setTimeout(res, 20000))
        continue
      }
      if (--keysLeft > 0 && pool.next()) {
        console.log(`  ↻ kalit ${pool.label} ga o'tildi`)
        continue
      }
      if (++mi >= MODELS.length) throw new Error('LIMIT')
      pool = keyPool()
      keysLeft = 8
      {
        const p = keyPool()
        let n = 1
        while (p.next()) n++
        keysLeft = n
      }
      console.log(`  ⇄ ${MODELS[mi - 1]} tugadi → ${MODELS[mi]}`)
      continue
    }
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${t.slice(0, 200)}`)
    const data = JSON.parse(t)
    const audio = (data.steps ?? [])
      .filter((s) => s.type === 'model_output')
      .flatMap((s) => s.content ?? [])
      .filter((c) => c.type === 'audio')
      .at(-1)
    if (!audio) throw new Error(`audio yo'q: ${t.slice(0, 160)}`)
    return Buffer.from(audio.data, 'base64')
  }
}

// ---------- Pauzalar bo'yicha kesish ----------
const SR = 24000
function decode(wavBuf) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', 'pipe:0', '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { input: wavBuf, maxBuffer: 1 << 28 })
  const b = r.stdout
  return new Float32Array(b.buffer, b.byteOffset, b.length / 4)
}
function toWav(f32) {
  const pcm = Buffer.alloc(f32.length * 2)
  for (let i = 0; i < f32.length; i++) pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767))), i * 2)
  const h = Buffer.alloc(44)
  h.write('RIFF')
  h.writeUInt32LE(36 + pcm.length, 4)
  h.write('WAVEfmt ', 8)
  h.writeUInt32LE(16, 16)
  h.writeUInt16LE(1, 20)
  h.writeUInt16LE(1, 22)
  h.writeUInt32LE(SR, 24)
  h.writeUInt32LE(SR * 2, 28)
  h.writeUInt16LE(2, 32)
  h.writeUInt16LE(16, 34)
  h.write('data', 36)
  h.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([h, pcm])
}

/** Aligner bilan: har jumlaning boshlanish/tugash vaqti → qo'shni jumlalar orasidan kesiladi */
function splitAligned(wavBuf, x, items) {
  const dir = join(tmpdir(), 'mojiza-align')
  mkdirSync(dir, { recursive: true })
  const wf = join(dir, 'batch.wav')
  const lf = join(dir, 'lines.json')
  writeFileSync(wf, wavBuf)
  writeFileSync(lf, JSON.stringify(items.map((p) => p.say)))
  const r = spawnSync(ALIGN_PY, [join(ROOT, 'scripts/align-lines.py'), wf, lf], { encoding: 'utf8', maxBuffer: 1 << 24 })
  if (r.status !== 0) {
    console.log(`  ⚠ aligner: ${(r.stderr || '').trim().split('\n').pop()}`)
    return null
  }
  const t = JSON.parse(r.stdout)
  const total = x.length / SR
  const segs = []
  for (let i = 0; i < items.length; i++) {
    const { a0, a1 } = t[i]
    // Nutq davomiyligi matnga mos bo'lishi kerak (model jumlani tashlab ketgan bo'lsa — qayta so'raladi)
    const chars = spokenLen(items[i].say)
    const marked = items[i].say.includes('«')
    // Gap ichidan kesilgan bitta harf juda qisqa bo'lishi mumkin ("A" ≈ 0,1 s)
    const min = marked ? 0.05 : 0.12 + chars * 0.02
    if (a1 - a0 < min || a1 - a0 > 1.5 + chars * 0.2) return null
    // Gap ichidan so'z kesilsa — aniq chegarada (atrofidagi gap kirmasin), aks holda qo'shni jumlalar o'rtasidan
    const from = marked ? Math.max(0, a0 - 0.05) : i === 0 ? Math.max(0, a0 - 0.15) : (t[i - 1].a1 + a0) / 2
    const to = marked ? Math.min(total, a1 + 0.12) : i === items.length - 1 ? Math.min(total, a1 + 0.3) : (a1 + t[i + 1].a0) / 2
    segs.push(x.subarray(Math.round(from * SR), Math.round(to * SR)))
  }
  return segs
}

/** n ta bo'lakka: eng uzun n−1 ta jimlik o'rtasidan kesiladi. Ishonchsiz bo'lsa — null */
function split(x, items) {
  const n = items.length
  const hop = Math.round(SR * 0.02)
  const frames = Math.floor(x.length / hop)
  const rms = new Float32Array(frames)
  let peak = 1e-6
  for (let f = 0; f < frames; f++) {
    let s = 0
    for (let i = f * hop; i < (f + 1) * hop; i++) s += x[i] * x[i]
    rms[f] = Math.sqrt(s / hop)
    peak = Math.max(peak, rms[f])
  }
  const thr = peak * 0.02 // −34 dB
  const runs = []
  let start = -1
  for (let f = 0; f <= frames; f++) {
    const quiet = f < frames && rms[f] < thr
    if (quiet && start < 0) start = f
    if (!quiet && start >= 0) {
      if (start > 0 && f < frames) runs.push({ a: start, b: f, len: f - start })
      start = -1
    }
  }
  if (runs.length < n - 1) return null
  const cuts = runs
    .sort((p, q) => q.len - p.len)
    .slice(0, n - 1)
    .sort((p, q) => p.a - q.a)
  // Kesish pauzalari boshqa pauzalardan aniq uzunroq bo'lishi kerak (jumla ichidagi pauza bilan adashmaslik)
  const minCut = Math.min(...cuts.map((c) => c.len))
  const nextBest = runs.sort((p, q) => q.len - p.len)[n - 1]?.len ?? 0
  if (n > 1 && minCut * 0.02 < 0.45) return null
  if (n > 1 && nextBest && minCut < nextBest * 1.3) return null
  const bounds = [0, ...cuts.map((c) => Math.round(((c.a + c.b) / 2) * hop)), x.length]
  const segs = []
  for (let i = 0; i < n; i++) {
    const seg = x.subarray(bounds[i], bounds[i + 1])
    // Nutq davomiyligi (jimliksiz) matn uzunligiga mos bo'lishi kerak
    let voiced = 0
    for (let f = Math.floor(bounds[i] / hop); f < Math.floor(bounds[i + 1] / hop); f++) if (rms[f] >= thr) voiced++
    const sec = voiced * 0.02
    const chars = items[i].say.length
    if (sec < 0.15 + chars * 0.025 || sec > 1.2 + chars * 0.16) return null
    segs.push(seg)
  }
  return segs
}

// ---------- Asosiy jarayon ----------
let ok = 0
async function run(items) {
  const text = items.map((p) => p.say).join('\n\n')
  const style = items[0].style + (items.length > 1 ? PAUSE : '')
  const wav = await tts(text, style, items[0].voice)
  const x = decode(wav)
  const needAlign = items.length > 1 || items[0].say.includes('«')
  const segs = !needAlign ? [x] : HAS_ALIGN ? splitAligned(wav, x, items) : split(x, items)
  if (!segs) {
    if (items.length === 1) throw new Error('nutq uzunligi matnga mos emas')
    console.log(`  ✂ ${items.length} ta jumla aniq kesilmadi — ikkiga bo'lib qayta so'rayman`)
    const h = Math.ceil(items.length / 2)
    await run(items.slice(0, h))
    await run(items.slice(h))
    return
  }
  items.forEach((p, i) => {
    writeFileSync(join(INBOX, `voice__${p.key}.wav`), toWav(segs[i]))
    made[p.key] = mark(p.voice)
    ok++
    console.log(`✓ ${p.key} (${p.voice}, ${MODELS[mi].replace('gemini-', '')}): ${p.say}`)
  })
  writeFileSync(madeFile, JSON.stringify(made, null, 1))
}

for (const c of chunks) {
  try {
    await run(c)
  } catch (e) {
    if (e.message === 'LIMIT') {
      console.error('Hamma kalitlarning limiti tugadi — keyinroq davom ettiring (tayyorlari saqlandi).')
      break
    }
    console.error(`✗ ${c.map((p) => p.key).join(',')}: ${e.message.slice(0, 160)}`)
  }
  await new Promise((res) => setTimeout(res, Number(process.env.GEN_DELAY_MS ?? 3000)))
}
console.log(`\nTayyor: ${ok}/${prompts.length}. Endi: node scripts/audio-import.mjs`)
void VOICES
