import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import type { AnimalId } from '../art/Animal'
import { audioUrl } from './assets'
import { getVoice } from './db'

// ============ Audio grafi ============
// master ─┬─ fxBus ──────────────────── effektlar, qahramon reaksiyalari
//         ├─ musicBus ─ musicDuck ───── fon musiqasi (ko'rsatma gapirganda pasayadi)
//         ├─ jingleBus ──────────────── qisqa jingle'lar (musiqa slayderi bilan)
//         └─ ambBus ─── ambDuck ─────── muhit ovozlari (ham pasayadi)
// Ko'rsatmalar va hayvon ovozlari HTMLAudio orqali chalinadi, balandligi `voiceVol`.
//
// Darajalar docs/AUDIO.md (P6) bo'yicha: fayllar import paytida normallashtiriladi
// (musiqa −18, ovoz −16, effekt −13, muhit −30 LUFS), bu yerda faqat nisbiy farq qoladi.

let ctx: AudioContext | null = null
let master: GainNode
let fxBus: GainNode
let musicBus: GainNode
let musicDuck: GainNode
let jingleBus: GainNode
let ambBus: GainNode
let ambDuck: GainNode

const LEVEL = {
  fx: 0.6, // ≈ −4 dB
  music: 0.4, // −18 LUFS fayl → ko'rsatmadan ≈ 10 dB past
  musicDucked: 0.08, // ≈ −24 dB
  amb: 0.8, // fayl allaqachon −30 LUFS
  ambDucked: 0.32,
}
const FADE = 1.2 // ekranlar orasida crossfade, s

/** Ota-ona slayderlari (0..1) va tungi rejim */
const mix = { music: 1, fx: 1, voice: 1, night: false }

function ac(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    const g = (dest: AudioNode, v = 1) => {
      const n = ctx!.createGain()
      n.gain.value = v
      n.connect(dest)
      return n
    }
    master = g(ctx.destination, mix.night ? 0.5 : 1)
    fxBus = g(master, LEVEL.fx * mix.fx)
    musicBus = g(master, mix.music)
    musicDuck = g(musicBus, LEVEL.music)
    jingleBus = g(master, LEVEL.music * 1.6 * mix.music)
    ambBus = g(master, mix.fx)
    ambDuck = g(ambBus, LEVEL.amb)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Ota-ona panelidagi balandliklarni qo'llash */
export function applyMix(m: { musicVol: number; fxVol: number; voiceVol: number; night: boolean }) {
  mix.music = m.musicVol
  mix.fx = m.fxVol
  mix.voice = m.voiceVol
  mix.night = m.night
  if (current) current.volume = voiceVolume()
  if (!ctx) return
  const t = ctx.currentTime
  master.gain.setTargetAtTime(mix.night ? 0.5 : 1, t, 0.05)
  fxBus.gain.setTargetAtTime(LEVEL.fx * mix.fx, t, 0.05)
  musicBus.gain.setTargetAtTime(mix.music, t, 0.05)
  jingleBus.gain.setTargetAtTime(LEVEL.music * 1.6 * mix.music, t, 0.05)
  ambBus.gain.setTargetAtTime(mix.fx, t, 0.05)
}

const voiceVolume = () => Math.min(1, mix.voice * (mix.night ? 0.5 : 1))

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
  o.connect(g).connect(dest ?? fxBus)
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
  src.connect(f).connect(g).connect(dest ?? fxBus)
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
    src.connect(g).connect(fxBus)
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
            a.volume = Math.min(1, mix.fx * (mix.night ? 0.5 : 1))
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
  o.connect(g).connect(fxBus)
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

/** 3D robot: qahramon reaksiyalarining robotcha nusxasi (sfx/robot-*), bo'lmasa oddiy ovoz */
export const robotFx = Object.fromEntries(
  Object.entries(voiceFx).map(([k, fn]) => [
    k,
    () => {
      if (sample(`robot-${k}`)) haptic.tap()
      else fn()
    },
  ]),
) as typeof voiceFx

/** Popishak (hudhud): haqiqiy hudhud sayrashi, variantlardan tasodifiy */
export function mascotCall() {
  const v = ['popishak', 'popishak-2', 'popishak-3'].filter((n) => audioUrl(`sfx/${n}`))
  if (v.length) sample(v[Math.floor(Math.random() * v.length)])
}

/** Tayyor ovoz fayli bormi (ota-ona yozuvisiz): personaj ovozi yo'q bo'lsa umumiy ko'rsatmaga qaytish uchun */
export const hasVoice = (key: string) => !!audioUrl(`voices/${key}`)

// ============ Fon musiqasi va muhit ovozlari ============
// Har ekran o'z trekini so'raydi (playMusic/playAmbience). Treklar AudioBufferSourceNode bilan
// uzluksiz aylanadi, almashganda crossfade qilinadi. Fayl bo'lmasa — jimlik (sintez kuy yo'q).

export type MusicId = 'map' | 'bog' | 'bozor' | 'ferma' | 'ustaxona' | 'qora' | 'harflar' | 'rasm' | 'uyqu'
export type AmbienceId = 'bog' | 'bozor' | 'ferma' | 'ustaxona' | 'qora' | 'harflar'

/** Siqilgan fayl baytlari (kichik) keshlanadi; dekodlangan bufer katta, shuning uchun faqat oxirgi ikkitasi */
const bytesCache = new Map<string, Promise<ArrayBuffer | null>>()
const decoded = new Map<string, AudioBuffer>()

function fetchBytes(url: string): Promise<ArrayBuffer | null> {
  let p = bytesCache.get(url)
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null)
    bytesCache.set(url, p)
  }
  return p
}

async function loadLoop(url: string): Promise<AudioBuffer | null> {
  const hit = decoded.get(url)
  if (hit) {
    decoded.delete(url)
    decoded.set(url, hit) // LRU: oxiriga
    return hit
  }
  const bytes = await fetchBytes(url)
  if (!bytes) return null
  try {
    // decodeAudioData buferni "olib qo'yadi", shuning uchun nusxasini beramiz
    const buf = await ac().decodeAudioData(bytes.slice(0))
    decoded.set(url, buf)
    while (decoded.size > 2) decoded.delete(decoded.keys().next().value!)
    return buf
  } catch {
    return null
  }
}

/** Ekranga kirishdan oldin trek faylini yuklab qo'yish (dekodlanmaydi) */
export function preloadMusic(...ids: MusicId[]) {
  for (const id of ids) {
    const u = audioUrl(`music/${id}`)
    if (u) void fetchBytes(u)
  }
}

/** Bitta uzluksiz qatlam (musiqa yoki muhit): bir vaqtda bitta trek, almashganda crossfade */
class LoopLayer {
  private wanted: string | null = null
  private enabled = true
  private playing: { id: string; src: AudioBufferSourceNode; gain: GainNode } | null = null
  /** Loop bo'lmagan trek (alla) tugagan bo'lsa, qayta boshlanmaydi */
  private finished: string | null = null
  private seq = 0

  private dir: string
  private bus: () => GainNode
  private once: (id: string) => boolean

  constructor(dir: string, bus: () => GainNode, once: (id: string) => boolean = () => false) {
    this.dir = dir
    this.bus = bus
    this.once = once
  }

  want(id: string | null) {
    if (id !== this.wanted) this.finished = null
    this.wanted = id
    void this.refresh()
  }

  enable(on: boolean) {
    this.enabled = on
    void this.refresh()
  }

  private async refresh() {
    const target = this.enabled ? this.wanted : null
    if (this.playing?.id === target || (target && target === this.finished)) return
    const my = ++this.seq
    this.fadeOut()
    if (!target) return
    const url = audioUrl(`${this.dir}/${target}`)
    if (!url) return
    const buf = await loadLoop(url)
    if (!buf || my !== this.seq) return
    const c = ac()
    const src = c.createBufferSource()
    const gain = c.createGain()
    src.buffer = buf
    src.loop = !this.once(target)
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(1, c.currentTime + FADE)
    src.connect(gain).connect(this.bus())
    src.start()
    const p = { id: target, src, gain }
    this.playing = p
    src.onended = () => {
      if (this.playing !== p) return
      this.playing = null
      this.finished = target
    }
  }

  private fadeOut() {
    const p = this.playing
    if (!p || !ctx) return
    this.playing = null
    const t = ctx.currentTime
    p.gain.gain.cancelScheduledValues(t)
    p.gain.gain.setValueAtTime(p.gain.gain.value, t)
    p.gain.gain.linearRampToValueAtTime(0, t + FADE)
    p.src.onended = null
    p.src.stop(t + FADE + 0.05)
  }
}

const music = new LoopLayer('music', () => (ac(), musicDuck), (id) => id === 'uyqu')
const ambience = new LoopLayer('ambience', () => (ac(), ambDuck))

/** Ekran musiqasi. Bir xil trek so'ralsa, qayta boshlanmaydi. `null` — jimlik */
export function playMusic(id: MusicId | null) {
  music.want(id)
}

/** Bekat muhit ovozi (qushlar, bozor shovqini...). `null` — jimlik */
export function playAmbience(id: AmbienceId | null) {
  ambience.want(id)
}

/** Musiqani umuman yoqish/o'chirish (sozlama yoki sahna). Tanlangan trek eslab qolinadi */
export function setMusic(on: boolean) {
  music.enable(on)
}

export function setAmbience(on: boolean) {
  ambience.enable(on)
}

/** Qisqa jingle: musiqa bir zum pasayadi */
export function jingle(id: 'win' | 'start' | 'sticker') {
  const url = audioUrl(`music/jingle-${id}`)
  if (!url) return
  void loadSample(url).then((buf) => {
    if (!buf) return
    const c = ac()
    const src = c.createBufferSource()
    src.buffer = buf
    src.connect(jingleBus)
    duck(true)
    src.onended = () => {
      if (!current) duck(false)
    }
    src.start()
  })
}

function duck(down: boolean) {
  if (!ctx) return
  const t = ctx.currentTime
  for (const [node, full, low] of [
    [musicDuck, LEVEL.music, LEVEL.musicDucked],
    [ambDuck, LEVEL.amb, LEVEL.ambDucked],
  ] as const) {
    node.gain.cancelScheduledValues(t)
    node.gain.setValueAtTime(node.gain.value, t)
    // Pasayish tez (0.15 s), qaytish silliq (0.4 s)
    node.gain.linearRampToValueAtTime(down ? low : full, t + (down ? 0.15 : 0.4))
  }
}

// Mobil brauzer AudioContext'ni faqat foydalanuvchi tegingandan keyin ochadi
document.addEventListener('pointerdown', () => {
  if (ctx?.state === 'suspended' && !document.hidden) void ctx.resume()
})

// Ilova orqa fonga o'tsa, hammasi jim bo'ladi; qaytganda silliq ko'tariladi
document.addEventListener('visibilitychange', () => {
  if (!ctx) return
  if (document.hidden) {
    stopVoice()
    void ctx.suspend()
  } else {
    const t = ctx.currentTime
    master.gain.setValueAtTime(0, t)
    void ctx.resume().then(() => {
      const now = ctx!.currentTime
      master.gain.linearRampToValueAtTime(mix.night ? 0.5 : 1, now + 0.8)
    })
  }
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
    a.volume = voiceVolume()
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
    o.connect(f).connect(g).connect(fxBus)
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

/** Haqiqiy hayvon yozuvi: <id>, <id>-2, <id>-3 (bo'lganlari) */
function animalVariants(id: AnimalId): string[] {
  return [id, `${id}-2`, `${id}-3`].map((n) => audioUrl(`sfx/animals/${n}`)).filter((u): u is string => !!u)
}

/**
 * Hayvon ovozi: haqiqiy yozuv → ota-ona taqlidi → sintez.
 * Ferma o'yini bolaga haqiqiy hayvonni tanitadi, shuning uchun yozuv ota-ona taqlididan ustun.
 * `steady` — doim asosiy variant ("Eshit va takrorla": xotira o'yini barqaror tovush talab qiladi).
 */
export async function sayAnimal(id: AnimalId, opts: { steady?: boolean } = {}): Promise<void> {
  stopVoice()
  const my = token
  const real = animalVariants(id)
  const recorded = real.length ? (opts.steady ? real[0] : real[Math.floor(Math.random() * real.length)]) : null
  // TTS (odam ovozidagi taqlid) ishlatilmaydi: bola haqiqiy hayvonni tanishi kerak
  const url = recorded ?? (await parentUrl(`tovush_${id}`))
  if (my !== token) return
  duck(true)
  if (url) await playUrl(url)
  else {
    const secs = synthAnimal(id)
    await new Promise((r) => setTimeout(r, secs * 1000))
  }
  if (my === token) duck(false)
}
