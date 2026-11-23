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
  sfx: { dir: 'sfx', lufs: -13, tp: -1, ch: 1, kbps: 96, loop: false },
  ambience: { dir: 'ambience', lufs: -30, tp: -1.5, ch: 2, kbps: 64, loop: true },
  voice: { dir: 'voices', lufs: -16, tp: -1.5, ch: 1, kbps: 64, loop: false },
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

function convert(src, out, t, loop) {
  const pre = loop ? [] : [trimBoth]
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
  const chain = [...pre, level, ...(loop ? [] : [fades])].join(',')
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
