#!/usr/bin/env node
// Musiqa uyi uchun haqiqiy cholg'u namunalari (CC0) — Freesound'dan.
//
//   node scripts/instruments-fetch.mjs            # hammasi
//   node scripts/instruments-fetch.mjs --only pianino,doira
//
// Melodik cholg'ular: har namunaning balandligi o'lchanadi (autokorrelyatsiya) va
// public/assets/instruments/<cholg'u>/<midi>.m4a nomi bilan saqlanadi. O'yin eng yaqin namunani
// kerakli notaga ±2–3 yarim ton surib chaladi (sampler).
// Zarbli (doira): public/assets/instruments/doira/<pad>.m4a
// Manbalar docs/AUDIO_CREDITS.md ga yoziladi.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ASSETS_DIR, ROOT } from './lib.mjs'

const KEY = (process.env.FREESOUND_API_KEY ??
  readFileSync(join(ROOT, '.env.local'), 'utf8').match(/^\s*FREESOUND_API_KEY\s*=\s*"?([^"\s]+)"?/m)?.[1])
if (!KEY) throw new Error('FREESOUND_API_KEY topilmadi (.env.local)')
const OUT = join(ASSETS_DIR, 'instruments')
const TMP = join(ROOT, 'audio-inbox/.instruments')
const CREDITS = join(ROOT, 'docs/AUDIO_CREDITS.md')
mkdirSync(TMP, { recursive: true })

const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null

/**
 * Melodik: pack (Freesound pack nomi yoki user) + nom filtri; max — namunaning eng uzun davomiyligi;
 * range — kerakli MIDI oralig'i (undan tashqaridagilar olinmaydi); lufs — bir xil balandlik
 */
const MELODIC = [
  { id: 'pianino', filter: 'pack:"VSCO 2 CE  - Keys - Upright Piano"', must: /Player_dyn2_rr1/, range: [45, 96], max: 3.2, lufs: -20,
    // Fayl tartibi: _000 = A0, har namuna 4 yarim tonda (bas notalarida o'lchash adashadi)
    midiOf: (n) => 21 + 2 * Number(/_(\d{3})\.wav/.exec(n)[1]) },
  { id: 'ksilofon', filter: 'pack:"VSCO 2 CE  - Percussion - Xylophone"', must: /Xylo_Medium/, range: [55, 100], max: 1.6, lufs: -20 },
  { id: 'nay', filter: 'pack:"VSCO 2 CE  - Woodwinds - Flute - vibrato sustain"', must: /_v1_1/, range: [55, 100], max: 2.2, lufs: -21, sustain: true },
  { id: 'dutor', filter: 'username:fcerim', q: 'baglama', must: /Baglama_/, range: [40, 90], max: 2.0, lufs: -20 },
]

/** Doira va zarbli cholg'ular: pad → aniq nom (user/pack bo'yicha) */
const PERC = [
  { pad: 'bum', filter: 'username:hollandm', name: /^Dum1\.wav$/ },
  { pad: 'tak', filter: 'username:hollandm', name: /^Tek1\.wav$/ },
  { pad: 'qarsak', filter: 'license:"Creative Commons 0"', q: 'single hand clap', name: /clap/i, not: /loop|applause|crowd|claps\b|multiple/i },
  { pad: 'qayroq', filter: 'username:hollandm', name: /^Sticks-singleclick\.wav$/ },
  { pad: 'jiring', filter: 'username:hollandm', name: /^Tamb-hit\.wav$/ },
  { pad: 'shaq', filter: 'username:hollandm', name: /^Maracas-shake\.wav$/ },
  { pad: 'gumm', filter: 'username:hollandm', name: /^Dum2\.wav$/ },
  { pad: 'chiq', filter: 'username:hollandm', name: /^Tek3\.wav$/ },
]

async function api(path, params) {
  const u = new URL(`https://freesound.org/apiv2/${path}`)
  u.search = new URLSearchParams({ ...params, token: KEY })
  for (let i = 0; i < 4; i++) {
    const r = await fetch(u)
    if (r.ok) return r.json()
    if (r.status !== 429) throw new Error(`Freesound ${r.status}: ${(await r.text()).slice(0, 200)}`)
    await new Promise((res) => setTimeout(res, 3000))
  }
  throw new Error('Freesound: juda ko\'p so\'rov')
}

async function search(filter, q = '') {
  const all = []
  let page = 1
  for (;;) {
    const j = await api('search/text/', { query: q, filter, fields: 'id,name,username,license,previews,duration', page_size: '150', page: String(page) })
    all.push(...j.results)
    if (!j.next) return all
    page++
  }
}

async function download(s) {
  const f = join(TMP, `${s.id}.ogg`)
  if (!existsSync(f)) {
    const r = await fetch(s.previews['preview-hq-ogg'])
    if (!r.ok) throw new Error(`yuklab bo'lmadi: ${s.name}`)
    writeFileSync(f, Buffer.from(await r.arrayBuffer()))
  }
  return f
}

/** Mono float32 PCM (44.1 kHz), boshidagi jimlik kesilgan */
function pcm(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB', '-ac', '1', '-ar', '44100', '-f', 'f32le', '-'], {
    maxBuffer: 1 << 28,
  })
  const b = r.stdout
  return new Float32Array(b.buffer, b.byteOffset, b.length / 4)
}

/** Asosiy chastota (YIN soddalashtirilgan): hujumdan keyingi barqaror qismdan */
function pitch(x, sr = 44100) {
  const start = Math.floor(sr * 0.08)
  const N = Math.min(4096, x.length - start - 1200)
  if (N < 1024) return null
  const seg = x.subarray(start, start + N + 1200)
  const minLag = Math.floor(sr / 2200)
  const maxLag = Math.floor(sr / 60)
  const d = new Float32Array(maxLag + 1)
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0
    for (let i = 0; i < N; i++) {
      const v = seg[i] - seg[i + lag]
      s += v * v
    }
    d[lag] = s
  }
  // Kumulyativ normallashtirish
  let run = 0
  const cm = new Float32Array(maxLag + 1).fill(1)
  for (let lag = minLag; lag <= maxLag; lag++) {
    run += d[lag]
    cm[lag] = (d[lag] * (lag - minLag + 1)) / (run || 1)
  }
  let best = -1
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (cm[lag] < 0.15 && cm[lag] <= cm[lag - 1] && cm[lag] <= cm[lag + 1]) {
      best = lag
      break
    }
  }
  if (best < 0) {
    let m = Infinity
    for (let lag = minLag; lag <= maxLag; lag++) if (cm[lag] < m) ((m = cm[lag]), (best = lag))
  }
  // Parabolik aniqlashtirish
  const a = cm[best - 1] ?? cm[best]
  const b = cm[best]
  const c = cm[best + 1] ?? cm[best]
  const shift = (a - c) / (2 * (a - 2 * b + c) || 1)
  const f = sr / (best + shift)
  return 69 + 12 * Math.log2(f / 440)
}

/** Kesish, so'ndirish, bir xil balandlik → m4a */
function render(src, dst, max, lufs) {
  const af = [
    'silenceremove=start_periods=1:start_threshold=-45dB',
    `atrim=0:${max}`,
    `afade=t=out:st=${Math.max(0.05, max - Math.min(0.6, max * 0.35))}:d=${Math.min(0.6, max * 0.35)}`,
    `loudnorm=I=${lufs}:TP=-2:LRA=11`,
    'aresample=44100',
  ].join(',')
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-af', af, '-ac', '1', '-c:a', 'aac', '-b:a', '128k', dst])
  if (r.status !== 0) throw new Error(r.stderr.toString().slice(0, 300))
}

const credits = []

for (const inst of MELODIC) {
  if (only && !only.includes(inst.id)) continue
  const dir = join(OUT, inst.id)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const list = (await search(inst.filter, inst.q ?? '')).filter((s) => inst.must.test(s.name) && /publicdomain\/zero/.test(s.license))
  const got = new Map()
  for (const s of list) {
    const f = await download(s)
    const m = inst.midiOf ? inst.midiOf(s.name) : pitch(pcm(f))
    if (m == null) continue
    const midi = Math.round(m)
    const cents = Math.round((m - midi) * 100)
    if (midi < inst.range[0] || midi > inst.range[1] || Math.abs(cents) > 35) {
      console.log(`  · ${inst.id}: ${s.name} → ${m.toFixed(2)} (o'tkazildi)`)
      continue
    }
    if (got.has(midi)) continue
    got.set(midi, s)
    render(f, join(dir, `${midi}.m4a`), inst.max, inst.lufs)
    credits.push(`| instruments/${inst.id}/${midi}.m4a | [${s.name}](https://freesound.org/s/${s.id}/) — ${s.username} | CC0 |`)
  }
  const notes = [...got.keys()].sort((a, b) => a - b)
  writeFileSync(join(dir, 'notes.json'), JSON.stringify(notes))
  console.log(`✓ ${inst.id}: ${notes.length} ta nota (${notes.join(' ')})`)
}

if (!only || only.includes('doira')) {
  const dir = join(OUT, 'doira')
  mkdirSync(dir, { recursive: true })
  for (const p of PERC) {
    const list = (await search(p.filter, p.q ?? '')).filter(
      (s) => p.name.test(s.name) && !(p.not && p.not.test(s.name)) && /publicdomain\/zero/.test(s.license) && s.duration < 4,
    )
    const s = list[0]
    if (!s) {
      console.log(`✗ doira/${p.pad}: topilmadi`)
      continue
    }
    render(await download(s), join(dir, `${p.pad}.m4a`), 1.4, -19)
    credits.push(`| instruments/doira/${p.pad}.m4a | [${s.name}](https://freesound.org/s/${s.id}/) — ${s.username} | CC0 |`)
    console.log(`✓ doira/${p.pad}: ${s.name} (${s.username})`)
  }
}

// Mualliflik: avvalgi "Cholg'ular" bo'limini almashtiramiz
if (credits.length) {
  let md = readFileSync(CREDITS, 'utf8')
  const head = "\n## Musiqa uyi cholg'ulari (Freesound, CC0)\n\n| Fayl | Manba | Litsenziya |\n|---|---|---|\n"
  const i = md.indexOf("\n## Musiqa uyi cholg'ulari")
  if (i >= 0) {
    const j = md.indexOf('\n## ', i + 5)
    md = md.slice(0, i) + (j >= 0 ? md.slice(j) : '')
  }
  writeFileSync(CREDITS, md.trimEnd() + '\n' + head + credits.join('\n') + '\n')
}
