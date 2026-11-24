import { instrumentOut } from './audio'

// 🎹 Musiqa uyi cholg'ulari — haqiqiy yozuvlar (CC0 sampler); yuklanmaguncha WebAudio sintezi.
//   pianino  — bir nechta garmonikali, tez so'nadigan tovush
//   ksilofon — yog'och plastinka: asosiy ton + baland "chertish" garmonikasi
//   dutor    — Karplus–Strong: chertilgan tor (o'zbek dutoriga yaqin, iliq)
//   nay      — havo va titroq (vibrato) bilan
//   doira    — urma cholg'ular: doira, tak, qarsak, qayroq, qo'ng'iroqcha...

export type InstrumentId = 'pianino' | 'ksilofon' | 'dutor' | 'nay' | 'doira'

export const INSTRUMENTS: { id: InstrumentId; name: string; icon: string }[] = [
  { id: 'pianino', name: 'Pianino', icon: '🎹' },
  { id: 'ksilofon', name: 'Ksilofon', icon: '🌈' },
  { id: 'dutor', name: 'Dutor', icon: '🪕' },
  { id: 'nay', name: 'Nay', icon: '🎶' },
  { id: 'doira', name: 'Doira', icon: '🥁' },
]

/** Nota nomlari (do-re-mi), yarim tonlar bo'yicha */
const PC_NAMES = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'Lya', 'Lya♯', 'Si']
/** Kamalak ranglari — har nota (oq klavish) o'z rangida: bola rangni ham eslab qoladi */
const DEGREE_COLORS = ['#ef476f', '#f78c6b', '#ffd166', '#06d6a0', '#118ab2', '#3a86ff', '#8e5bd6']
const WHITE_DEGREE: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 }

export const isBlack = (midi: number) => !(((midi % 12) + 12) % 12 in WHITE_DEGREE)
export const noteName = (midi: number) => PC_NAMES[((midi % 12) + 12) % 12]
export function noteColor(midi: number): string {
  const pc = ((midi % 12) + 12) % 12
  return pc in WHITE_DEGREE ? DEGREE_COLORS[WHITE_DEGREE[pc]] : '#2b2d42'
}
/** Do-major gammasidagi notalar (oq klavishlar) — from..to oralig'ida */
export function whiteNotes(from: number, to: number): number[] {
  const out: number[] = []
  for (let m = from; m <= to; m++) if (!isBlack(m)) out.push(m)
  return out
}
const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

export const PADS = ['Bum', 'Tak', 'Qarsak', 'Qayroq', 'Jiring', 'Shaq', 'Gumm', 'Chiq']
const PAD_FILES = ['bum', 'tak', 'qarsak', 'qayroq', 'jiring', 'shaq', 'gumm', 'chiq']
export const PAD_COLORS = ['#e76f51', '#f4a261', '#e9c46a', '#8d5524', '#ffd166', '#2a9d8f', '#264653', '#e63946']

// ============ Haqiqiy yozuvlar (sampler) ============
// public/assets/instruments/<cholg'u>/<midi>.m4a — CC0 namunalar (scripts/instruments-fetch.mjs).
// Kerakli notaga eng yaqin namuna olinadi va tezligi o'zgartirilib suriladi (±2 yarim ton — sezilmaydi).
// Yuklanmaguncha yoki fayl bo'lmasa — sintez.

/** Cholg'u haqiqatda qaysi oktavada yangraydi: ksilofon yozilganidan bir oktava baland, dutor — past */
const TRANSPOSE: Partial<Record<InstrumentId, number>> = { ksilofon: 12, dutor: -12 }
const BASE = `${import.meta.env.BASE_URL}assets/instruments/`
const banks = new Map<string, Promise<Map<number, AudioBuffer>>>()

async function fetchBuf(url: string): Promise<AudioBuffer | null> {
  try {
    const r = await fetch(url)
    if (!r.ok) return null
    return await instrumentOut().c.decodeAudioData(await r.arrayBuffer())
  } catch {
    return null
  }
}

function bank(inst: InstrumentId): Promise<Map<number, AudioBuffer>> {
  let p = banks.get(inst)
  if (!p) {
    p = (async () => {
      const m = new Map<number, AudioBuffer>()
      if (inst === 'doira') {
        const bufs = await Promise.all(PAD_FILES.map((f) => fetchBuf(`${BASE}doira/${f}.m4a`)))
        bufs.forEach((b, i) => b && m.set(i, b))
        return m
      }
      try {
        const notes: number[] = await (await fetch(`${BASE}${inst}/notes.json`)).json()
        const bufs = await Promise.all(notes.map((n) => fetchBuf(`${BASE}${inst}/${n}.m4a`)))
        bufs.forEach((b, i) => b && m.set(notes[i], b))
      } catch {
        // fayl yo'q — sintez
      }
      return m
    })()
    banks.set(inst, p)
  }
  return p
}
const ready = new Map<string, Map<number, AudioBuffer>>()
/** Cholg'u namunalarini oldindan yuklash (Musiqa uyiga kirganda) */
export function loadInstrument(inst: InstrumentId): Promise<void> {
  return bank(inst).then((m) => void ready.set(inst, m))
}

function sample(inst: InstrumentId, key: number, dur?: number): boolean {
  const m = ready.get(inst)
  if (!m || !m.size) {
    void loadInstrument(inst)
    return false
  }
  const { c, dest } = instrumentOut()
  const t = c.currentTime + 0.005
  let buf: AudioBuffer | undefined
  let rate = 1
  if (inst === 'doira') buf = m.get(key % 8)
  else {
    const target = key + (TRANSPOSE[inst] ?? 0)
    let best = -1
    for (const n of m.keys()) if (best < 0 || Math.abs(n - target) < Math.abs(best - target)) best = n
    buf = m.get(best)
    rate = 2 ** ((target - best) / 12)
  }
  if (!buf) return false
  const s = c.createBufferSource()
  s.buffer = buf
  s.playbackRate.value = rate
  const g = c.createGain()
  g.gain.value = inst === 'doira' ? 1 : 0.95
  s.connect(g).connect(dest)
  s.start(t)
  // Nay — puflash to'xtaganda tovush ham so'nadi
  if (dur) {
    g.gain.setValueAtTime(g.gain.value, t + dur)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.18)
    s.stop(t + dur + 0.25)
  }
  return true
}

function env(c: AudioContext, t: number, peak: number, attack: number, decay: number) {
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  return g
}

function osc(c: AudioContext, dest: AudioNode, type: OscillatorType, f: number, t: number, peak: number, attack: number, decay: number) {
  const o = c.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  const g = env(c, t, peak, attack, decay)
  o.connect(g).connect(dest)
  o.start(t)
  o.stop(t + attack + decay + 0.05)
  return o
}

let noiseBuf: AudioBuffer | null = null
function noise(c: AudioContext, dest: AudioNode, t: number, dur: number, peak: number, type: BiquadFilterType, f: number, q = 1) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = c.createBufferSource()
  s.buffer = noiseBuf
  const fl = c.createBiquadFilter()
  fl.type = type
  fl.frequency.value = f
  fl.Q.value = q
  const g = env(c, t, peak, 0.003, dur)
  s.connect(fl).connect(g).connect(dest)
  s.start(t)
  s.stop(t + dur + 0.05)
}

/** Karplus–Strong: shovqin portlashi kechikish halqasida "tor"ga aylanadi. Har nota uchun bir marta hisoblanadi */
const stringCache = new Map<number, AudioBuffer>()
function pluckBuffer(c: AudioContext, f: number): AudioBuffer {
  const hit = stringCache.get(f)
  if (hit) return hit
  const sr = c.sampleRate
  const n = Math.round(sr * 2.2)
  const period = Math.round(sr / f)
  const buf = c.createBuffer(1, n, sr)
  const d = buf.getChannelData(0)
  const ring = new Float32Array(period)
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1
  let idx = 0
  for (let i = 0; i < n; i++) {
    const next = (idx + 1) % period
    const v = 0.4985 * (ring[idx] + ring[next])
    d[i] = ring[idx]
    ring[idx] = v
    idx = next
  }
  stringCache.set(f, buf)
  return buf
}

/**
 * Bitta notani chalish: melodik cholg'ularda key — MIDI nota (60 = Do birinchi oktava),
 * doirada — pad raqami (0..7). Avval haqiqiy yozuv, bo'lmasa sintez.
 */
export function playNote(inst: InstrumentId, key: number) {
  if (sample(inst, key, inst === 'nay' ? 0.85 : undefined)) return
  const i = key
  const { c, dest } = instrumentOut()
  const t = c.currentTime + 0.005
  const out = c.createGain()
  out.gain.value = 0.9
  out.connect(dest)
  const f = freq(key)
  switch (inst) {
    case 'pianino': {
      // Yuqori notalar tezroq so'nadi
      const decay = Math.max(0.5, 1.8 - (key - 60) * 0.06)
      ;[1, 2, 3, 4, 5].forEach((h, k) => osc(c, out, k ? 'sine' : 'triangle', f * h * (1 + k * 0.0007), t, [0.32, 0.14, 0.07, 0.04, 0.02][k], 0.004, decay / (1 + k * 0.6)))
      noise(c, out, t, 0.03, 0.05, 'highpass', 3000)
      break
    }
    case 'ksilofon':
      osc(c, out, 'sine', f * 2, t, 0.42, 0.002, 0.75)
      osc(c, out, 'sine', f * 2 * 3.93, t, 0.12, 0.001, 0.12)
      osc(c, out, 'sine', f * 2 * 9.2, t, 0.04, 0.001, 0.05)
      break
    case 'dutor': {
      const s = c.createBufferSource()
      s.buffer = pluckBuffer(c, f / 2)
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 3200
      const g = c.createGain()
      g.gain.value = 0.55
      s.connect(lp).connect(g).connect(out)
      s.start(t)
      break
    }
    case 'nay': {
      const o = c.createOscillator()
      o.type = 'triangle'
      o.frequency.value = f * 2
      const vib = c.createOscillator()
      const vg = c.createGain()
      vib.frequency.value = 5.2
      vg.gain.value = 5
      vib.connect(vg).connect(o.frequency)
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 2400
      const g = c.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.linearRampToValueAtTime(0.3, t + 0.08)
      g.gain.setValueAtTime(0.3, t + 0.45)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
      o.connect(lp).connect(g).connect(out)
      ;[o, vib].forEach((x) => (x.start(t), x.stop(t + 1)))
      // Nafas
      noise(c, out, t, 0.5, 0.04, 'bandpass', f * 4, 2)
      break
    }
    case 'doira':
      playPad(c, out, t, i)
      break
  }
}

function playPad(c: AudioContext, out: AudioNode, t: number, i: number) {
  switch (i % 8) {
    case 0: {
      // Bum — doiraning o'rtasi: past, tez pasayadigan ton
      const o = c.createOscillator()
      o.frequency.setValueAtTime(140, t)
      o.frequency.exponentialRampToValueAtTime(55, t + 0.25)
      const g = env(c, t, 0.8, 0.003, 0.35)
      o.connect(g).connect(out)
      o.start(t)
      o.stop(t + 0.4)
      break
    }
    case 1: // Tak — chekkasi: baland "tak"
      noise(c, out, t, 0.09, 0.5, 'bandpass', 3200, 2)
      osc(c, out, 'triangle', 620, t, 0.2, 0.002, 0.06)
      break
    case 2: // Qarsak
      ;[0, 0.012, 0.026].forEach((d) => noise(c, out, t + d, 0.06, 0.45, 'bandpass', 1400, 1.2))
      break
    case 3: // Qayroq — yog'och tosh chiqillashi
      osc(c, out, 'sine', 1900, t, 0.35, 0.001, 0.04)
      osc(c, out, 'sine', 1900, t + 0.08, 0.25, 0.001, 0.04)
      break
    case 4: // Jiring — qo'ng'iroqcha
      osc(c, out, 'sine', 1320, t, 0.22, 0.002, 1.1)
      osc(c, out, 'sine', 1320 * 2.76, t, 0.08, 0.002, 0.5)
      break
    case 5: // Shaq — shaqildoq
      noise(c, out, t, 0.16, 0.3, 'highpass', 6000)
      break
    case 6: // Gumm — katta baraban
      osc(c, out, 'sine', 70, t, 0.9, 0.003, 0.5)
      noise(c, out, t, 0.05, 0.2, 'lowpass', 400)
      break
    case 7: // Chiq — kichik likopcha
      noise(c, out, t, 0.3, 0.22, 'highpass', 8000)
      osc(c, out, 'square', 5200, t, 0.03, 0.001, 0.2)
      break
  }
}
