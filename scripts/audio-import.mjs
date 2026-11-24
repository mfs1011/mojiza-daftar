#!/usr/bin/env node
// Tayyor ovoz fayllarini (musiqa, hayvonlar, effektlar, muhit, ko'rsatmalar) o'yinga qo'shish.
//
//   1) Faylni audio-inbox/ papkasiga <tur>__<nom>.<istalgan format> nomi bilan qo'ying:
//        music__map.mp3            → public/assets/music/map.m4a
//        music__jingle-win.wav     → public/assets/music/jingle-win.m4a
//        animal__sigir-2.wav       → public/assets/sfx/animals/sigir-2.m4a
//        sfx__tap.ogg              → public/assets/sfx/tap.m4a
//        ambience__bog.wav         → public/assets/ambience/bog.m4a
//        voice__bozor_intro.wav    → public/assets/voices/bozor_intro.m4a
//   2) npm run audio:import
//
// ffmpeg kerak (brew install ffmpeg). Skript: sukutni kesadi, balandlikni normallashtiradi
// (ikki bosqichli loudnorm), 10 ms fade qo'shadi, AAC .m4a ga o'giradi, joyiga qo'yadi,
// asl faylni audio-inbox/done/ ga ko'chiradi va manifestni yangilaydi.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import { ASSETS_DIR, ROOT, writeManifest } from './lib.mjs'

const INBOX = join(ROOT, 'audio-inbox')
const DONE = join(INBOX, 'done')
const CREDITS = join(ROOT, 'docs/AUDIO_CREDITS.md')
const INPUT = new Set(['.wav', '.mp3', '.ogg', '.oga', '.opus', '.m4a', '.aac', '.flac', '.aif', '.aiff', '.webm'])

/**
 * Har tur uchun qayta ishlash qoidalari (docs/AUDIO.md).
 * loop: boshi-oxiri ulanadi — sukut kesilmaydi, fade qo'shilmaydi.
 */
const TYPES = {
  music: { dir: 'music', lufs: -18, tp: -1.5, ch: 2, kbps: 96, loop: true },
  animal: { dir: 'sfx/animals', lufs: -16, tp: -1.5, ch: 1, kbps: 96, loop: false },
  sfx: { dir: 'sfx', lufs: -13, tp: -1, ch: 1, kbps: 96, loop: false, speech: true },
  ambience: { dir: 'ambience', lufs: -30, tp: -1.5, ch: 2, kbps: 64, loop: true },
  // TTS vokoderi yuqori chastotada "shitirlaydi" (bijillash): 6.5 kHz dan yuqorisi yumshoq kesiladi —
  // nutq tushunarliligiga ta'sir qilmaydi, quloqqa tozaroq eshitiladi
  voice: { dir: 'voices', lufs: -16, tp: -1.5, ch: 1, kbps: 64, loop: false, speech: true, tone: 'lowpass=f=6500:poles=2,highshelf=f=4000:g=-4' },
}

/** Loop bo'lmagan musiqa: jingle'lar va alla (oxirida so'nadi) */
const musicOneShot = (name) => name.startsWith('jingle-') || name === 'uyqu'

function ffmpeg(args) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...args], { encoding: 'utf8', maxBuffer: 64 << 20 })
  if (r.error) throw new Error(r.error.code === 'ENOENT' ? 'ffmpeg topilmadi: brew install ffmpeg' : r.error.message)
  if (r.status !== 0) throw new Error(r.stderr.split('\n').filter(Boolean).slice(-3).join(' | '))
  return r.stderr
}

const TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02'
const trimBoth = `${TRIM},areverse,${TRIM},areverse`
const fades = 'afade=t=in:d=0.01,areverse,afade=t=in:d=0.01,areverse'

/**
 * TTS artefaktlarini kesish: Gemini TTS ba'zan faylning boshida va oxirida qisqa, baland, keng polosali
 * "chirsillash" qoldiradi (spektrogrammada vertikal tasma). U nutqdan sukut bilan ajralgan — shuning uchun:
 *   nutqni sukut bilan ajralgan orolchalarga bo'lamiz va chetlardagi 100 ms dan qisqa orolchalarni tashlaymiz
 *   (so'z bunchalik qisqa bo'lmaydi; "t" portlashi, "s" shivirlashi so'zga yopishgan — saqlanadi).
 * Natija: [start, end] soniyalarda yoki null (nutq topilmasa).
 */
function speechSpan(src) {
  const R = 16000
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', src, '-ac', '1', '-ar', String(R), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 })
  if (r.status !== 0) return null
  const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4)
  const N = R / 100 // 10 ms
  const db = []
  const zcr = []
  for (let i = 0; i + N <= x.length; i += N) {
    let e = 0
    let z = 0
    for (let k = i; k < i + N; k++) {
      e += x[k] * x[k]
      if (k > i && (x[k] >= 0) !== (x[k - 1] >= 0)) z++
    }
    db.push(10 * Math.log10(e / N + 1e-12))
    zcr.push(z / N)
  }
  const peak = Math.max(...db)
  // Sukut (cho'qqidan 42 dB past) bilan ajratilgan "orolchalar"; 20 ms dan qisqa sukut orolchani bo'lmaydi
  const loud = db.map((d) => d > peak - 42)
  const isl = []
  for (let i = 0; i < loud.length; i++) {
    if (!loud[i]) continue
    const last = isl[isl.length - 1]
    if (last && i - last[1] <= 2) last[1] = i
    else isl.push([i, i])
  }
  // Chetdagi artefakt: qisqa (160 ms dan kam) orolcha, yonida RAQAMLI jimlik (-95 dB dan past — tabiiy pauza
  // hech qachon bunchalik toza bo'lmaydi) yoki o'zi 30 ms dan qisqa chirsillash. "Hi-hi-hi" kabi kulgi
  // bo'g'inlari qisqa bo'lsa ham saqlanadi: ular orasida tabiiy (shovqinli) pauza bor.
  const zeroNear = (from, to) => db.slice(Math.max(0, from), Math.max(0, to)).some((d) => d < -95)
  const artefact = ([x, y]) => y - x + 1 < 16 && (y - x + 1 <= 3 || zeroNear(x - 4, x) || zeroNear(y + 1, y + 5))
  while (isl.length > 1 && artefact(isl[0])) isl.shift()
  while (isl.length > 1 && artefact(isl[isl.length - 1])) isl.pop()
  if (!isl.length) return null
  const a = isl[0][0]
  const b = isl[isl.length - 1][1]
  // Kichik zaxira: so'z boshi va oxiri kesilib qolmasin
  return [Math.max(0, (a - 3) / 100), Math.min(db.length / 100, (b + 6) / 100)]
}

function convert(src, out, t, loop) {
  // Ovozlar: artefaktlar sukut bilan ajratilgan joydan kesiladi (sukutni kesish ularni olib tashlay olmaydi)
  const span = t.speech ? speechSpan(src) : null
  const cut = span ? [`atrim=start=${span[0].toFixed(3)}:end=${span[1].toFixed(3)}`, 'asetpts=PTS-STARTPTS'] : []
  const pre = [...cut, ...(loop ? [] : [trimBoth]), ...(t.tone ? [t.tone] : [])]
  const norm = `loudnorm=I=${t.lufs}:TP=${t.tp}:LRA=11`
  // 1-bosqich: o'lchash
  const log = ffmpeg(['-i', src, '-af', [...pre, `${norm}:print_format=json`].join(','), '-f', 'null', '-'])
  const json = log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1)
  const m = JSON.parse(json)
  let level
  if (Number.isFinite(Number(m.input_i))) {
    // 2-bosqich: o'lchov bilan chiziqli normallashtirish (loop chokida balandlik "suzmaydi")
    level =
      `${norm}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
      `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`
  } else {
    // 0.4 s dan qisqa tovush: loudnorm o'lchay olmaydi → o'rtacha balandlik bo'yicha oddiy kuchaytirish,
    // cho'qqi true peak chegarasidan oshmasin
    const vd = ffmpeg(['-i', src, '-af', [...pre, 'volumedetect'].join(','), '-f', 'null', '-'])
    const mean = Number(/mean_volume: (-?[\d.]+) dB/.exec(vd)?.[1] ?? t.lufs)
    const peak = Number(/max_volume: (-?[\d.]+) dB/.exec(vd)?.[1] ?? 0)
    const gain = Math.min(t.lufs - mean, t.tp - peak)
    level = `volume=${gain.toFixed(2)}dB`
    m.input_i = `${mean} (qisqa)`
  }
  // Cheklagich: AAC'ga o'tgach ham cho'qqi 0 dB dan oshmasin (kesilish — xirillash)
  const limit = `alimiter=limit=${Math.pow(10, (t.tp - 1.5) / 20).toFixed(3)}:level=false`
  const chain = [...pre, level, limit, ...(loop ? [] : [fades])].join(',')
  mkdirSync(dirname(out), { recursive: true })
  ffmpeg(['-y', '-i', src, '-af', chain, '-ar', '44100', '-ac', String(t.ch), '-c:a', 'aac', '-b:a', `${t.kbps}k`, '-movflags', '+faststart', out])
  return { lufs: Number(m.input_i) }
}

if (!existsSync(INBOX)) {
  mkdirSync(INBOX, { recursive: true })
  console.log(`audio-inbox/ papkasi yaratildi. Fayllarni <tur>__<nom>.<format> nomi bilan qo'yib, qayta ishga tushiring.`)
  console.log(`Turlar: ${Object.keys(TYPES).join(', ')}`)
  process.exit(0)
}
mkdirSync(DONE, { recursive: true })

const credits = existsSync(CREDITS) ? readFileSync(CREDITS, 'utf8') : ''
const noCredit = []
const bad = []
let ok = 0

for (const f of readdirSync(INBOX).sort()) {
  const ext = extname(f).toLowerCase()
  if (!INPUT.has(ext)) continue
  const m = /^([a-z]+)__([A-Za-z0-9_-]+)$/.exec(f.slice(0, -ext.length))
  const t = m && TYPES[m[1]]
  if (!t) {
    bad.push(f)
    continue
  }
  const name = m[2]
  const loop = t.loop && !(m[1] === 'music' && musicOneShot(name))
  const out = join(ASSETS_DIR, t.dir, `${name}.m4a`)
  try {
    const r = convert(join(INBOX, f), out, t, loop)
    renameSync(join(INBOX, f), join(DONE, f))
    ok++
    const rel = relative(ASSETS_DIR, out)
    console.log(`✓ ${f} → ${rel}  (${r.lufs} → ${t.lufs} LUFS${loop ? ', loop' : ''})`)
    // O'zimiz yozgan ovozlar (voice) manbasiz bo'lishi mumkin; qolganlari jurnalda bo'lishi shart
    if (m[1] !== 'voice' && !credits.includes(rel)) noCredit.push(rel)
  } catch (e) {
    console.error(`✗ ${f}: ${e.message}`)
  }
}

if (bad.length) console.log(`\nNomi tanilmadi (<tur>__<nom>, tur: ${Object.keys(TYPES).join('|')}): ${bad.join(', ')}`)
if (noCredit.length) console.log(`\n⚠ docs/AUDIO_CREDITS.md da yozuvi yo'q: ${noCredit.join(', ')}`)
console.log(`\nQo'shildi: ${ok}. Manifest: ${writeManifest()} ta fayl`)
