import { instrumentOut } from './audio'

// 🎹 Musiqa uyi cholg'ulari — hammasi WebAudio sintezi (fayl kerak emas, internetsiz ishlaydi).
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

/** Do-major gamma, birinchi oktava (Do … Do) */
export const SCALE = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25]
export const NOTE_NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'Lya', 'Si', 'Do']
/** Kamalak ranglari — har nota o'z rangida (bola rangni ham eslab qoladi) */
export const NOTE_COLORS = ['#ef476f', '#f78c6b', '#ffd166', '#06d6a0', '#118ab2', '#3a86ff', '#8e5bd6', '#ef476f']

export const PADS = ['Bum', 'Tak', 'Qarsak', 'Qayroq', 'Jiring', 'Shaq', 'Gumm', 'Chiq']
export const PAD_COLORS = ['#e76f51', '#f4a261', '#e9c46a', '#8d5524', '#ffd166', '#2a9d8f', '#264653', '#e63946']

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

/** Bitta notani chalish (i — 0..7 gamma indeksi, doirada — pad raqami) */
export function playNote(inst: InstrumentId, i: number) {
  const { c, dest } = instrumentOut()
  const t = c.currentTime + 0.005
  const out = c.createGain()
  out.gain.value = 0.9
  out.connect(dest)
  const f = SCALE[i % SCALE.length]
  switch (inst) {
    case 'pianino': {
      // Yuqori notalar tezroq so'nadi
      const decay = 1.8 - i * 0.12
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
