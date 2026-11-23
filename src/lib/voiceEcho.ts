// "Gapimni takrorla": mikrofon doim tinglaydi, bola gapirsa yozib oladi,
// gapi tugagach (0.7 s jimlik) ingichka, kulgili ovozda qaytarib aytadi.
// Qaytarayotganda mikrofon "quloqni yopadi", aks holda o'z ovozini qayta-qayta takrorlab ketadi.

export type EchoState = 'listening' | 'hearing' | 'speaking'

export interface EchoHandle {
  stop: () => void
  /** 0..1 — qahramon og'zini shunga qarab ochadi */
  level: () => number
  state: () => EchoState
  /** Qahramon o'zi tovush chiqarayotganda mikrofon "quloqni yopadi" (o'zini takrorlamasin) */
  holdOff: (seconds: number) => void
}

const PITCH = 1.45
const SILENCE_END = 0.7
const MAX_SECONDS = 6
const PREROLL_SECONDS = 0.35

export async function startEcho(onState: (s: EchoState) => void): Promise<EchoHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  })
  const ctx = new AudioContext()
  if (ctx.state === 'suspended') await ctx.resume()
  const src = ctx.createMediaStreamSource(stream)
  // ScriptProcessor eskirgan, lekin barcha Android WebView'larda ishlaydi va oddiy
  const proc = ctx.createScriptProcessor(2048, 1, 1)
  const mute = ctx.createGain()
  mute.gain.value = 0
  src.connect(proc)
  proc.connect(mute).connect(ctx.destination)

  const out = ctx.createAnalyser()
  out.fftSize = 512
  out.connect(ctx.destination)
  const outBuf = new Float32Array(out.fftSize)

  const chunkSec = 2048 / ctx.sampleRate
  let state: EchoState = 'listening'
  let floor = 0.01
  let micLevel = 0
  let preroll: Float32Array[] = []
  let chunks: Float32Array[] = []
  let silence = 0
  let resumeAt = 0

  const set = (s: EchoState) => {
    state = s
    onState(s)
  }

  function play() {
    const total = chunks.reduce((a, c) => a + c.length, 0)
    const speech = total / ctx.sampleRate - PREROLL_SECONDS
    if (speech < 0.25) {
      set('listening')
      return
    }
    const buf = ctx.createBuffer(1, total, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let o = 0
    for (const c of chunks) {
      data.set(c, o)
      o += c.length
    }
    // Ovozni biroz kuchaytirish (bolalar ovozi ko'pincha past)
    let peak = 0
    for (const v of data) peak = Math.max(peak, Math.abs(v))
    const gain = peak > 0 ? Math.min(4, 0.9 / peak) : 1
    for (let i = 0; i < data.length; i++) data[i] *= gain

    const node = ctx.createBufferSource()
    node.buffer = buf
    node.playbackRate.value = PITCH
    node.connect(out)
    set('speaking')
    node.onended = () => {
      resumeAt = ctx.currentTime + 0.35
      set('listening')
    }
    node.start()
  }

  proc.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0)
    let sum = 0
    for (const v of input) sum += v * v
    const rms = Math.sqrt(sum / input.length)
    micLevel = rms
    if (state === 'speaking' || ctx.currentTime < resumeAt) return

    const threshold = Math.max(0.025, floor * 3.2)
    const copy = new Float32Array(input)
    if (state === 'listening') {
      floor = floor * 0.97 + Math.min(rms, 0.05) * 0.03
      preroll.push(copy)
      if (preroll.length * chunkSec > PREROLL_SECONDS) preroll.shift()
      if (rms > threshold) {
        chunks = [...preroll, copy]
        preroll = []
        silence = 0
        set('hearing')
      }
      return
    }
    // hearing
    chunks.push(copy)
    silence = rms < threshold * 0.6 ? silence + chunkSec : 0
    const length = chunks.length * chunkSec
    if (silence > SILENCE_END || length > MAX_SECONDS) play()
  }

  return {
    state: () => state,
    holdOff: (seconds) => {
      if (state === 'hearing') {
        chunks = []
        set('listening')
      }
      resumeAt = Math.max(resumeAt, ctx.currentTime + seconds)
    },
    level: () => {
      if (state === 'speaking') {
        out.getFloatTimeDomainData(outBuf)
        let s = 0
        for (const v of outBuf) s += v * v
        return Math.min(1, Math.sqrt(s / outBuf.length) * 5)
      }
      return state === 'hearing' ? Math.min(1, micLevel * 4) : 0
    },
    stop: () => {
      proc.onaudioprocess = null
      src.disconnect()
      proc.disconnect()
      stream.getTracks().forEach((t) => t.stop())
      void ctx.close()
    },
  }
}
