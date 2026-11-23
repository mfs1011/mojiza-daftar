import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import type { AnimalId } from '../art/Animal'
import { audioUrl, musicTracks } from './assets'
import { getVoice } from './db'

// ============ Audio grafi ============
// master ─┬─ effektlar
//         └─ musicGain ─ fon musiqasi (ovoz gapirganda pasayadi)

let ctx: AudioContext | null = null
let master: GainNode
let musicGain: GainNode
const MUSIC_VOL = 0.32
const MUSIC_DUCKED = 0.08

function ac(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.connect(ctx.destination)
    musicGain = ctx.createGain()
    musicGain.gain.value = 0
    musicGain.connect(master)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', vol = 0.18, dest?: AudioNode) {
  const c = ac()
  const t0 = c.currentTime + at
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(dest ?? master)
  o.start(t0)
  o.stop(t0 + dur + 0.05)
}

let noiseBuf: AudioBuffer | null = null
function noise(at: number, dur: number, freq: number, vol: number, dest?: AudioNode) {
  const c = ac()
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const t0 = c.currentTime + at
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = freq
  const g = c.createGain()
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(f).connect(g).connect(dest ?? master)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
}

// ============ Tebranish ============

const quiet = (p: Promise<unknown>) => void p.catch(() => {})

export const haptic = {
  tap: () => quiet(Haptics.impact({ style: ImpactStyle.Light })),
  thud: () => quiet(Haptics.impact({ style: ImpactStyle.Medium })),
  success: () => quiet(Haptics.notification({ type: NotificationType.Success })),
  oops: () => quiet(Haptics.notification({ type: NotificationType.Warning })),
}

// ============ Tayyor yozilgan tovushlar (public/assets/sfx) ============

const sampleCache = new Map<string, Promise<AudioBuffer | null>>()

function loadSample(url: string): Promise<AudioBuffer | null> {
  let p = sampleCache.get(url)
  if (!p) {
    p = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => ac().decodeAudioData(b))
      .catch(() => null)
    sampleCache.set(url, p)
  }
  return p
}

/** Fayl bo'lsa ijro etadi va true qaytaradi; bo'lmasa false (sintezga o'tiladi) */
function sample(name: string, vol = 0.8): boolean {
  const url = audioUrl(`sfx/${name}`)
  if (!url) return false
  void loadSample(url).then((buf) => {
    if (!buf) return
    const c = ac()
    const src = c.createBufferSource()
    const g = c.createGain()
    g.gain.value = vol
    src.buffer = buf
    src.connect(g).connect(master)
    src.start()
  })
  return true
}

/** Har bir effekt: avval yozilgan fayl (sfx/<prefix><nom>), bo'lmasa sintez. Tebranish doim ishlaydi. */
function withSamples<T extends Record<string, () => void>>(prefix: string, fx: T): T {
  return Object.fromEntries(
    Object.entries(fx).map(([k, fn]) => [
      k,
      () => {
        if (sample(`${prefix}${k}`)) haptic.tap()
        else fn()
      },
    ]),
  ) as T
}

/** Qahramon ovozi: ota-ona yozgan (reak_*) → AI yaratgan fayl → sintez */
function withParentVoice<T extends Record<string, () => void>>(fx: T): T {
  return Object.fromEntries(
    Object.entries(fx).map(([k, fn]) => [
      k,
      () => {
        void parentUrl(`reak_${k}`).then((u) => {
          if (u) {
            haptic.tap()
            const a = new Audio(u)
            a.playbackRate = 1.15
            void a.play().catch(() => fn())
          } else fn()
        })
      },
    ]),
  ) as T
}

// ============ Effekt tovushlari ============

export const sfx = withSamples('', {
  tap: () => {
    tone(520, 0, 0.08, 'triangle', 0.12)
    haptic.tap()
  },
  pop: () => {
    tone(660, 0, 0.12, 'triangle')
    tone(990, 0.05, 0.14, 'triangle')
    haptic.tap()
  },
  // Yumshoq "xato": qo'rqitmaydi, shunchaki "hm?"
  wrong: () => {
    tone(330, 0, 0.18, 'sine', 0.1)
    tone(262, 0.12, 0.22, 'sine', 0.1)
    haptic.oops()
  },
  coin: () => {
    tone(988, 0, 0.08, 'square', 0.05)
    tone(1319, 0.08, 0.3, 'square', 0.05)
    haptic.tap()
  },
  whoosh: () => noise(0, 0.35, 900, 0.25),
  rustle: () => {
    for (let i = 0; i < 6; i++) noise(i * 0.07, 0.12, 2500 + Math.random() * 2000, 0.18)
    haptic.thud()
  },
  thump: () => {
    tone(140, 0, 0.18, 'sine', 0.3)
    haptic.tap()
  },
  success: () => {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.3, 'triangle'))
    haptic.success()
  },
  magic: () => {
    ;[784, 988, 1175, 1568, 1976, 2349].forEach((f, i) => tone(f, i * 0.07, 0.4, 'sine', 0.1))
    haptic.success()
  },
})

// ============ Sahnadagi qahramonning "ovozlari" (sintez, multfilmcha) ============

function sweep(f0: number, f1: number, at: number, dur: number, type: OscillatorType = 'triangle', vol = 0.2, vib = 0) {
  const c = ac()
  const t0 = c.currentTime + at
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(f0, t0)
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur)
  if (vib) {
    const l = c.createOscillator()
    const lg = c.createGain()
    l.frequency.value = vib
    lg.gain.value = f0 * 0.06
    l.connect(lg).connect(o.frequency)
    l.start(t0)
    l.stop(t0 + dur)
  }
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02)
  g.gain.setValueAtTime(vol, t0 + dur * 0.7)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(master)
  o.start(t0)
  o.stop(t0 + dur + 0.05)
}

export const voiceFx = withParentVoice(withSamples('voice-', {
  bonk: () => {
    sweep(320, 110, 0, 0.18, 'square', 0.12)
    sweep(900, 520, 0.16, 0.22, 'triangle', 0.18)
    haptic.thud()
  },
  ouch: () => {
    sweep(950, 520, 0, 0.22, 'triangle', 0.22, 9)
    sweep(760, 380, 0.26, 0.35, 'triangle', 0.2, 9)
    haptic.oops()
  },
  giggle: () => {
    for (let i = 0; i < 4; i++) sweep(i % 2 ? 1150 : 950, i % 2 ? 1000 : 820, i * 0.11, 0.08, 'triangle', 0.18, 18)
    haptic.tap()
  },
  purr: () => {
    for (let i = 0; i < 10; i++) noise(i * 0.08, 0.07, 220, 0.25)
  },
  yay: () => {
    ;[660, 880, 1100].forEach((f, i) => sweep(f, f * 1.2, i * 0.08, 0.14, 'triangle', 0.18))
    sweep(1300, 1700, 0.26, 0.3, 'sine', 0.15, 10)
    haptic.success()
  },
  hmm: () => sweep(420, 560, 0, 0.28, 'triangle', 0.16),
  woo: () => {
    sweep(400, 1000, 0, 0.45, 'triangle', 0.18, 7)
    sweep(1000, 300, 0.45, 0.6, 'triangle', 0.16, 7)
  },
  yawn: () => sweep(650, 230, 0, 1.3, 'triangle', 0.14, 4),
  snore: () => {
    noise(0, 0.9, 180, 0.22)
    sweep(90, 70, 0, 0.9, 'sawtooth', 0.04)
  },
  grr: () => {
    sweep(140, 110, 0, 0.6, 'sawtooth', 0.08, 25)
    haptic.oops()
  },
  boing: () => {
    sweep(180, 720, 0, 0.18, 'sine', 0.25)
    sweep(720, 300, 0.18, 0.25, 'sine', 0.2, 14)
  },
  squeeze: () => sweep(500, 1300, 0, 0.6, 'triangle', 0.12, 6),
}))

// ============ Fon musiqasi: doira + yengil kuy ============

// Re-minor pentatonikaga yaqin, o'zbekona ohang uchun
const SCALE = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 698.46]
const STEP = 0.3 // sekund, sakkizdan bir
let musicOn = false
let schedTimer: number | undefined
let nextTime = 0
let step = 0
let note = 3

function scheduleStep(s: number, t: number) {
  const at = t - ac().currentTime
  // Doira: "bum" (past) va "tak" (baland)
  if (s % 8 === 0 || s % 8 === 5) {
    const c = ac()
    const o = c.createOscillator()
    const g = c.createGain()
    o.frequency.setValueAtTime(120, t)
    o.frequency.exponentialRampToValueAtTime(55, t + 0.2)
    g.gain.setValueAtTime(0.5, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    o.connect(g).connect(musicGain)
    o.start(t)
    o.stop(t + 0.35)
  }
  if (s % 8 === 2 || s % 8 === 3 || s % 8 === 6) noise(at, 0.07, 3200, 0.22, musicGain)
  // Kuy: tasodifiy, lekin silliq (qo'shni notaga yuradi)
  if (s % 16 < 14 && Math.random() < 0.55) {
    note = Math.max(0, Math.min(SCALE.length - 1, note + [-1, -1, 0, 1, 1, 2, -2][Math.floor(Math.random() * 7)]))
    tone(SCALE[note], at, STEP * 1.8, 'triangle', 0.09, musicGain)
  }
}

function scheduler() {
  const c = ac()
  while (nextTime < c.currentTime + 0.5) {
    scheduleStep(step, nextTime)
    nextTime += STEP
    step = (step + 1) % 16
  }
}

// Haqiqiy musiqa fayllari (public/assets/music/*): navbat bilan, aylanma
let track: HTMLAudioElement | null = null
let trackIdx = 0
function playTrack() {
  const list = musicTracks()
  if (!list.length) return false
  track?.pause()
  track = new Audio(list[trackIdx % list.length])
  track.volume = MUSIC_FILE_VOL
  track.onended = () => {
    trackIdx++
    if (musicOn) playTrack()
  }
  void track.play().catch(() => {})
  return true
}
const MUSIC_FILE_VOL = 0.4

export function setMusic(on: boolean) {
  if (on === musicOn) return
  musicOn = on
  if (musicTracks().length) {
    if (on) playTrack()
    else track?.pause()
    return
  }
  const c = ac()
  if (on) {
    nextTime = c.currentTime + 0.1
    schedTimer = window.setInterval(scheduler, 120)
    musicGain.gain.setTargetAtTime(MUSIC_VOL, c.currentTime, 0.5)
  } else {
    window.clearInterval(schedTimer)
    musicGain.gain.setTargetAtTime(0, c.currentTime, 0.1)
  }
}

function duck(down: boolean) {
  if (track && musicOn) track.volume = down ? MUSIC_FILE_VOL * 0.3 : MUSIC_FILE_VOL
  if (!ctx || !musicOn) return
  musicGain.gain.setTargetAtTime(down ? MUSIC_DUCKED : MUSIC_VOL, ctx.currentTime, 0.15)
}

// Ilova orqa fonga o'tsa, hammasi jim bo'ladi
document.addEventListener('visibilitychange', () => {
  if (!ctx) return
  if (document.hidden) {
    stopVoice()
    void ctx.suspend()
  } else void ctx.resume()
})

// ============ Ota-onaning yozib olingan ovozi ============

const urlCache = new Map<string, string>()
let current: HTMLAudioElement | null = null
let token = 0

/** Ovoz qayta yozilganda eski keshni tozalash */
export function forgetVoice(key: string) {
  const u = urlCache.get(key)
  if (u) URL.revokeObjectURL(u)
  urlCache.delete(key)
}

/** Faqat ota-ona yozgan ovoz */
async function parentUrl(key: string): Promise<string | null> {
  const cached = urlCache.get(key)
  if (cached) return cached
  const blob = await getVoice(key)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(key, url)
  return url
}

/** Ota-ona yozuvi ustun; bo'lmasa oldindan yaratilgan zaxira ovoz (public/assets/voices) */
async function urlFor(key: string): Promise<string | null> {
  return (await parentUrl(key)) ?? audioUrl(`voices/${key}`)
}

export function stopVoice() {
  token++
  if (current) {
    current.pause()
    current = null
  }
  duck(false)
}

function playUrl(url: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const a = new Audio(url)
    current = a
    const done = () => resolve()
    a.onended = done
    a.onerror = done
    a.onpause = done
    a.play().catch(done)
  })
}

/**
 * Kalitlarni ketma-ket aytadi. Yangi `say` chaqirilsa, eskisi to'xtaydi.
 * Yozilmagan kalitlar jimgina o'tkazib yuboriladi.
 */
export async function say(...keys: string[]): Promise<void> {
  stopVoice()
  const my = token
  duck(true)
  for (const key of keys) {
    if (my !== token) return
    const url = await urlFor(key)
    if (!url || my !== token) continue
    await playUrl(url)
  }
  if (my === token) duck(false)
}

// ============ Hayvon tovushlari ============
// Avval ota-onaning yozgan tovushi ("Mo'-o'"), bo'lmasa sintez qilingan taxminiy tovush.

function voiceSynth(
  segments: { f0: number; f1: number; dur: number; vib?: number; depth?: number }[],
  type: OscillatorType,
  formant: number,
  vol = 0.25,
): number {
  const c = ac()
  let t = c.currentTime + 0.02
  for (const s of segments) {
    const o = c.createOscillator()
    const f = c.createBiquadFilter()
    const g = c.createGain()
    o.type = type
    o.frequency.setValueAtTime(s.f0, t)
    o.frequency.linearRampToValueAtTime(s.f1, t + s.dur)
    if (s.vib) {
      const lfo = c.createOscillator()
      const lg = c.createGain()
      lfo.frequency.value = s.vib
      lg.gain.value = s.depth ?? 10
      lfo.connect(lg).connect(o.frequency)
      lfo.start(t)
      lfo.stop(t + s.dur)
    }
    f.type = 'bandpass'
    f.frequency.value = formant
    f.Q.value = 1.2
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(vol, t + 0.04)
    g.gain.setValueAtTime(vol, t + s.dur * 0.7)
    g.gain.exponentialRampToValueAtTime(0.0001, t + s.dur)
    o.connect(f).connect(g).connect(master)
    o.start(t)
    o.stop(t + s.dur + 0.02)
    t += s.dur + 0.06
  }
  return t - c.currentTime
}

function synthAnimal(id: AnimalId): number {
  switch (id) {
    case 'sigir':
      return voiceSynth([{ f0: 150, f1: 105, dur: 1.3, vib: 4, depth: 4 }], 'sawtooth', 500, 0.5)
    case 'qoy':
      return voiceSynth([{ f0: 360, f1: 330, dur: 0.9, vib: 7, depth: 25 }], 'sawtooth', 1100, 0.35)
    case 'echki':
      return voiceSynth([{ f0: 520, f1: 480, dur: 0.8, vib: 12, depth: 45 }], 'sawtooth', 1500, 0.3)
    case 'xoroz':
      return voiceSynth(
        [
          { f0: 600, f1: 700, dur: 0.18 },
          { f0: 750, f1: 850, dur: 0.18 },
          { f0: 850, f1: 800, dur: 0.18 },
          { f0: 900, f1: 600, dur: 0.6, vib: 8, depth: 30 },
        ],
        'square',
        1600,
        0.18,
      )
    case 'it':
      return voiceSynth(
        [
          { f0: 420, f1: 260, dur: 0.14 },
          { f0: 420, f1: 260, dur: 0.14 },
        ],
        'sawtooth',
        900,
        0.45,
      )
    case 'mushuk':
      return voiceSynth([{ f0: 500, f1: 820, dur: 0.35 }, { f0: 820, f1: 450, dur: 0.4 }], 'triangle', 1400, 0.4)
    case 'ordak':
      return voiceSynth(
        [
          { f0: 480, f1: 440, dur: 0.16 },
          { f0: 480, f1: 440, dur: 0.16 },
          { f0: 480, f1: 420, dur: 0.22 },
        ],
        'square',
        1000,
        0.2,
      )
    case 'eshak':
      return voiceSynth(
        [
          { f0: 700, f1: 760, dur: 0.3 },
          { f0: 260, f1: 220, dur: 0.4 },
          { f0: 700, f1: 760, dur: 0.3 },
          { f0: 260, f1: 220, dur: 0.4 },
        ],
        'sawtooth',
        1100,
        0.3,
      )
  }
}

export async function sayAnimal(id: AnimalId): Promise<void> {
  stopVoice()
  const my = token
  // Ota-ona taqlidi → haqiqiy hayvon yozuvi → yaratilgan ovoz → sintez
  const url = (await parentUrl(`tovush_${id}`)) ?? audioUrl(`sfx/animals/${id}`) ?? audioUrl(`voices/tovush_${id}`)
  if (my !== token) return
  duck(true)
  if (url) await playUrl(url)
  else {
    const secs = synthAnimal(id)
    await new Promise((r) => setTimeout(r, secs * 1000))
  }
  if (my === token) duck(false)
}
