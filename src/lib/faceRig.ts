// Qahramon yuzi teksturaning o'ziga chiziladi (3D sirtga "bo'yalgan" multfilm yuzi).
//
// Bola o'zi ko'z va og'iz chizgan bo'lsa (masalan, bosh doirasi ichidagi ikki nuqta va chiziq),
// ular topiladi va aynan ular harakatlanadi: ko'z qorachig'i barmoq tomonga qaraydi,
// pirpiraydi, xursand/og'riq/jahl holatida bolaning chizgan chizig'i rangi va qalinligida qayta chiziladi.
// Topilmasa — sirtga chiroyli multfilm yuzi chiziladi.

export type EyeState = 'open' | 'closed' | 'happy' | 'squeeze' | 'dizzy' | 'wide' | 'sad' | 'angry' | 'sleepy'
export type MouthState = 'rest' | 'smile' | 'talk' | 'laugh' | 'ouch' | 'o' | 'sad' | 'grr'

export interface FaceState {
  eyes: EyeState
  mouth: MouthState
  /** og'iz ochiqligi 0..1 (gapirganda) */
  open: number
  /** qarash yo'nalishi -1..1 */
  look: { x: number; y: number }
  /** yonoq qizarishi 0..1 */
  blush: number
  /** dizzy spirali aylanishi uchun vaqt */
  t: number
}

interface Feature {
  cx: number
  cy: number
  w: number
  h: number
  x0: number
  y0: number
  sprite: HTMLCanvasElement
}

export interface FaceRig {
  drawn: boolean
  eyes: [{ x: number; y: number; r: number; f?: Feature }, { x: number; y: number; r: number; f?: Feature }]
  mouth: { x: number; y: number; w: number; f?: Feature }
  ink: string
  lw: number
}

/** Bog'langan bo'laklar (siyoh piksellari) */
function inkComponents(ink: Uint8Array, outside: Uint8Array, w: number, h: number) {
  const comp = new Int32Array(w * h).fill(-1)
  const list: { pixels: number[]; x0: number; y0: number; x1: number; y1: number; enclosed: boolean }[] = []
  const stack: number[] = []
  for (let s = 0; s < ink.length; s++) {
    if (!ink[s] || comp[s] !== -1) continue
    const id = list.length
    const c = { pixels: [] as number[], x0: w, y0: h, x1: 0, y1: 0, enclosed: true }
    comp[s] = id
    stack.push(s)
    while (stack.length) {
      const i = stack.pop()!
      c.pixels.push(i)
      const x = i % w
      const y = (i - x) / w
      if (x < c.x0) c.x0 = x
      if (x > c.x1) c.x1 = x
      if (y < c.y0) c.y0 = y
      if (y > c.y1) c.y1 = y
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j < 0) {
          c.enclosed = false
          continue
        }
        if (ink[j]) {
          if (comp[j] === -1) {
            comp[j] = id
            stack.push(j)
          }
        } else if (outside[j]) c.enclosed = false
      }
    }
    list.push(c)
  }
  return list
}

type Cand = { pixels: number[]; x0: number; y0: number; x1: number; y1: number; cx: number; cy: number; cw: number; ch: number }

/** Ikki ko'z: bir xil balandlikda, o'lchami yaqin, oralig'i mos ikki bo'lak */
function pickEyes(cands: Cand[]): [Cand, Cand] | null {
  let eyes: [Cand, Cand] | null = null
  let bestScore = -Infinity
  for (let i = 0; i < cands.length; i++)
    for (let j = i + 1; j < cands.length; j++) {
      const a = cands[i]
      const b = cands[j]
      const size = Math.max(a.cw, a.ch, b.cw, b.ch)
      const dx = Math.abs(a.cx - b.cx)
      const dy = Math.abs(a.cy - b.cy)
      const ratio = Math.max(a.pixels.length, b.pixels.length) / Math.min(a.pixels.length, b.pixels.length)
      if (dy > size * 1.1 || dx < size * 0.9 || dx > size * 9 || ratio > 4) continue
      const score = a.pixels.length + b.pixels.length - dy * 4 - a.cy * 0.05
      if (score > bestScore) {
        bestScore = score
        eyes = a.cx < b.cx ? [a, b] : [b, a]
      }
    }
  return eyes
}

/**
 * Tayyor rangli personaj (PNG/JPEG): yuz ichidagi to'q, ixcham dog'lar = ko'z qorachiqlari va og'iz.
 * Ular personaj konturiga (shaffof chetga) tegmaydi va yuqori qismda joylashadi.
 */
function colorFeatures(sd: Uint8ClampedArray, w: number, h: number): Cand[] {
  const n = w * h
  const mask = new Uint8Array(n)
  const L = new Float32Array(n)
  const vals: number[] = []
  let y0 = h
  let y1 = 0
  for (let i = 0; i < n; i++) {
    mask[i] = sd[i * 4 + 3] > 128 ? 1 : 0
    L[i] = 0.299 * sd[i * 4] + 0.587 * sd[i * 4 + 1] + 0.114 * sd[i * 4 + 2]
    if (mask[i]) {
      if (i % 7 === 0) vals.push(L[i])
      const y = Math.floor(i / w)
      y0 = Math.min(y0, y)
      y1 = Math.max(y1, y)
    }
  }
  if (!vals.length) return []
  vals.sort((a, b) => a - b)
  const med = vals[Math.floor(vals.length / 2)]
  const thr = Math.min(med - 40, 95)
  const dark = new Uint8Array(n)
  let maskCount = 0
  for (let i = 0; i < n; i++) {
    maskCount += mask[i]
    dark[i] = mask[i] && L[i] < thr ? 1 : 0
  }
  const comp = new Int32Array(n).fill(-1)
  const out: Cand[] = []
  const st: number[] = []
  for (let s0 = 0; s0 < n; s0++) {
    if (!dark[s0] || comp[s0] !== -1) continue
    const c = { pixels: [] as number[], x0: w, y0: h, x1: 0, y1: 0, touches: false }
    comp[s0] = out.length + 1e6
    st.push(s0)
    while (st.length) {
      const i = st.pop()!
      c.pixels.push(i)
      const x = i % w
      const y = (i - x) / w
      c.x0 = Math.min(c.x0, x)
      c.x1 = Math.max(c.x1, x)
      c.y0 = Math.min(c.y0, y)
      c.y1 = Math.max(c.y1, y)
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j < 0 || !mask[j]) {
          c.touches = true
          continue
        }
        if (dark[j] && comp[j] === -1) {
          comp[j] = comp[s0]
          st.push(j)
        }
      }
    }
    const cw = c.x1 - c.x0 + 1
    const ch = c.y1 - c.y0 + 1
    const a = c.pixels.length
    const aspect = Math.max(cw, ch) / Math.min(cw, ch)
    if (c.touches || a < maskCount * 0.0003 || a > maskCount * 0.03 || aspect > 3.2) continue
    if ((c.y0 + c.y1) / 2 > y0 + (y1 - y0) * 0.7) continue
    out.push({ pixels: c.pixels, x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1, cx: (c.x0 + c.x1) / 2, cy: (c.y0 + c.y1) / 2, cw, ch })
  }
  return out
}

/**
 * Ko'z atrofidagi "teri" rangi: yaqin atrofdagi eng ko'p uchraydigan rang
 * (to'q kontur va oppoq ko'z oqi hisobga olinmaydi).
 */
function skinAround(sd: Uint8ClampedArray, w: number, h: number, c: Cand): [number, number, number] {
  const R = Math.max(c.cw, c.ch) * 3
  const bins = new Map<number, [number, number, number, number]>()
  for (let y = Math.max(0, Math.round(c.cy - R)); y <= Math.min(h - 1, c.cy + R); y++)
    for (let x = Math.max(0, Math.round(c.cx - R)); x <= Math.min(w - 1, c.cx + R); x++) {
      const i = y * w + x
      if (sd[i * 4 + 3] < 200) continue
      const r = sd[i * 4]
      const g = sd[i * 4 + 1]
      const b = sd[i * 4 + 2]
      const L = 0.299 * r + 0.587 * g + 0.114 * b
      if (L < 80 || L > 238) continue
      const k = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
      const e = bins.get(k) ?? [0, 0, 0, 0]
      e[0] += r
      e[1] += g
      e[2] += b
      e[3]++
      bins.set(k, e)
    }
  let best: [number, number, number, number] = [255, 255, 255, 1]
  for (const e of bins.values()) if (e[3] > best[3]) best = e
  return [Math.round(best[0] / best[3]), Math.round(best[1] / best[3]), Math.round(best[2] / best[3])]
}

/**
 * Rangli personajda ko'z = qorachiq + oqi + konturi. Qorachiqdan boshlab terining rangidan
 * farq qiladigan bog'langan piksellarni yig'amiz — butun ko'z bitta "bo'lak" bo'ladi,
 * shunda ko'z yumilganda asl ko'zning oqi ostida qolib ketmaydi.
 */
function expandToSkin(sd: Uint8ClampedArray, w: number, h: number, c: Cand, skin: [number, number, number]): Cand {
  const R = Math.max(c.cw, c.ch) * 1.4
  const seen = new Set<number>(c.pixels)
  const st = [...c.pixels]
  const px = [...c.pixels]
  let { x0, y0, x1, y1 } = c
  while (st.length) {
    const i = st.pop()!
    const x = i % w
    const y = (i - x) / w
    for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
      if (j < 0 || seen.has(j) || sd[j * 4 + 3] < 128) continue
      const jx = j % w
      const jy = (j - jx) / w
      if (Math.hypot(jx - c.cx, jy - c.cy) > R) continue
      const d = Math.hypot(sd[j * 4] - skin[0], sd[j * 4 + 1] - skin[1], sd[j * 4 + 2] - skin[2])
      if (d < 45) continue
      seen.add(j)
      st.push(j)
      px.push(j)
      x0 = Math.min(x0, jx)
      x1 = Math.max(x1, jx)
      y0 = Math.min(y0, jy)
      y1 = Math.max(y1, jy)
    }
  }
  // Haddan tashqari katta bo'lib ketsa (teri rangi noto'g'ri topilgan) — faqat asl bo'lak
  if (px.length > c.pixels.length * 14) return c
  return { pixels: px, x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, cw: x1 - x0 + 1, ch: y1 - y0 + 1 }
}

/**
 * base: yuzsiz tekstura (bolaning ko'z/og'zi topilsa, ular shu yerdan o'chiriladi).
 * src: asl chizma (shaffof fonli) tekstura o'lchamida.
 * anchor: model hisoblagan yuz markazi (tekstura pikselida).
 */
export function buildFaceRig(base: HTMLCanvasElement, src: HTMLCanvasElement, anchor: { x: number; y: number; spacing: number }): FaceRig {
  const w = src.width
  const h = src.height
  const sd = src.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, w, h).data
  const ink = new Uint8Array(w * h)
  let totalInk = 0
  for (let i = 0; i < ink.length; i++) {
    ink[i] = sd[i * 4 + 3] > 80 ? 1 : 0
    totalInk += ink[i]
  }
  // Tashqi bo'shliq (chetdan to'ldirish)
  const outside = new Uint8Array(w * h)
  const q: number[] = []
  for (let x = 0; x < w; x++) q.push(x, (h - 1) * w + x)
  for (let y = 0; y < h; y++) q.push(y * w, y * w + w - 1)
  while (q.length) {
    const i = q.pop()!
    if (outside[i] || ink[i]) continue
    outside[i] = 1
    const x = i % w
    if (x > 0) q.push(i - 1)
    if (x < w - 1) q.push(i + 1)
    if (i >= w) q.push(i - w)
    if (i < w * (h - 1)) q.push(i + w)
  }

  const comps = inkComponents(ink, outside, w, h)
  const cands = comps
    .filter((c) => c.enclosed && c.pixels.length >= 15 && c.pixels.length < totalInk * 0.2)
    .map((c) => ({ ...c, cx: (c.x0 + c.x1) / 2, cy: (c.y0 + c.y1) / 2, cw: c.x1 - c.x0 + 1, ch: c.y1 - c.y0 + 1 }))

  // Ko'zlar: avval bolaning chizmasidan (bo'shliq ichidagi nuqtalar),
  // topilmasa — tayyor rangli personajdan (yuz ichidagi to'q dog'lar)
  let eyes = pickEyes(cands)
  let pool: Cand[] = cands
  let colorMode = false
  let skinColor = '#fff'
  if (!eyes) {
    const cc = colorFeatures(sd, w, h)
    eyes = pickEyes(cc)
    if (eyes) {
      pool = cc
      colorMode = true
    }
  }

  const toFeature = (c: Cand): Feature => {
    const sprite = document.createElement('canvas')
    sprite.width = c.cw
    sprite.height = c.ch
    const g = sprite.getContext('2d')!
    const img = g.createImageData(c.cw, c.ch)
    for (const i of c.pixels) {
      const x = (i % w) - c.x0
      const y = Math.floor(i / w) - c.y0
      const o = (y * c.cw + x) * 4
      img.data.set(sd.subarray(i * 4, i * 4 + 4), o)
    }
    g.putImageData(img, 0, 0)
    return { cx: c.cx, cy: c.cy, w: c.cw, h: c.ch, x0: c.x0, y0: c.y0, sprite }
  }

  const bg = base.getContext('2d')!
  const erase = (c: Cand) => {
    // Bolaning chizmasida bo'shliq oq bilan to'ldirilgan → oq; rangli personajda → atrofdagi teri rangi
    bg.fillStyle = colorMode ? skinColor : '#fff'
    for (const i of c.pixels) bg.fillRect((i % w) - 2, Math.floor(i / w) - 2, 5, 5)
  }

  if (eyes && colorMode) {
    // Butun ko'zni (oqi va konturi bilan) olamiz; o'chirishda teri rangi ishlatiladi
    const skin = skinAround(sd, w, h, eyes[0])
    skinColor = `rgb(${skin[0]},${skin[1]},${skin[2]})`
    eyes = [expandToSkin(sd, w, h, eyes[0], skin), expandToSkin(sd, w, h, eyes[1], skin)]
  }

  if (eyes) {
    const [l, r] = eyes
    const ecx = (l.cx + r.cx) / 2
    const ecy = (l.cy + r.cy) / 2
    const dist = r.cx - l.cx
    const eyeSize = Math.max(l.cw, l.ch, r.cw, r.ch)
    const mouthC = pool
      .filter((c) => c !== l && c !== r && c.cy > ecy + eyeSize * 0.4 && c.cy < ecy + dist * 1.8 && Math.abs(c.cx - ecx) < dist * 0.9)
      .sort((a, b) => a.cy - b.cy)[0]

    // Siyoh rangi va qalinligi: ko'z piksellarining o'rtacha rangi
    let rr = 0
    let gg = 0
    let bb = 0
    for (const i of l.pixels) {
      rr += sd[i * 4]
      gg += sd[i * 4 + 1]
      bb += sd[i * 4 + 2]
    }
    const n = l.pixels.length
    const ink = `rgb(${Math.round(rr / n)},${Math.round(gg / n)},${Math.round(bb / n)})`
    const lw = Math.max(4, Math.min(16, Math.min(l.cw, l.ch) * 0.55))

    const mouthFull = mouthC && colorMode ? expandToSkin(sd, w, h, mouthC, skinAround(sd, w, h, l)) : mouthC
    const feats = mouthFull ? [l, r, mouthFull] : [l, r]
    for (const f of feats) erase(f)
    const er = Math.max(eyeSize / 2, dist * 0.18)
    return {
      drawn: true,
      eyes: [
        { x: l.cx, y: l.cy, r: er, f: toFeature(l) },
        { x: r.cx, y: r.cy, r: er, f: toFeature(r) },
      ],
      mouth: mouthFull
        ? { x: mouthFull.cx, y: mouthFull.cy, w: Math.max(mouthFull.cw, dist * 0.5), f: toFeature(mouthFull) }
        : { x: ecx, y: ecy + dist * 0.75, w: dist * 0.6 },
      ink,
      lw,
    }
  }

  const sp = anchor.spacing
  const r = sp * 0.6
  return {
    drawn: false,
    eyes: [
      { x: anchor.x - sp, y: anchor.y - sp * 0.25, r },
      { x: anchor.x + sp, y: anchor.y - sp * 0.25, r },
    ],
    mouth: { x: anchor.x, y: anchor.y + sp * 0.95, w: sp * 1.3 },
    ink: '#2b1d14',
    lw: Math.max(4, r * 0.24),
  }
}

// ---------------- Chizish ----------------

function line(g: CanvasRenderingContext2D, pts: number[], close = false) {
  g.beginPath()
  g.moveTo(pts[0], pts[1])
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1])
  if (close) g.closePath()
}

function drawEye(g: CanvasRenderingContext2D, rig: FaceRig, e: FaceRig['eyes'][number], side: -1 | 1, s: FaceState) {
  const { x, y, r } = e
  g.strokeStyle = rig.ink
  g.fillStyle = rig.ink
  g.lineWidth = rig.lw
  const look = { x: s.look.x * r * 0.35, y: -s.look.y * r * 0.3 }

  switch (s.eyes) {
    case 'closed':
    case 'sleepy':
      line(g, [x - r, y, x, y + r * (s.eyes === 'sleepy' ? 0.15 : 0.3), x + r, y])
      g.stroke()
      return
    case 'happy':
      g.beginPath()
      g.arc(x, y + r * 0.35, r * 0.9, Math.PI * 1.1, Math.PI * 1.9)
      g.stroke()
      return
    case 'squeeze':
      line(g, [x - side * r, y - r * 0.7, x + side * r * 0.6, y, x - side * r, y + r * 0.7])
      g.stroke()
      return
    case 'dizzy': {
      g.beginPath()
      for (let a = 0; a < Math.PI * 5; a += 0.2) {
        const rr = (a / (Math.PI * 5)) * r
        const px = x + Math.cos(a + s.t * 6 * side) * rr
        const py = y + Math.sin(a + s.t * 6 * side) * rr
        if (a === 0) g.moveTo(px, py)
        else g.lineTo(px, py)
      }
      g.stroke()
      return
    }
  }

  const scale = s.eyes === 'wide' ? 1.3 : 1
  if (e.f) {
    // Bolaning o'zi chizgan ko'zi: qarash tomonga suriladi
    const f = e.f
    const dw = f.w * scale
    const dh = f.h * scale
    g.drawImage(f.sprite, f.cx - dw / 2 + look.x, f.cy - dh / 2 + look.y, dw, dh)
  } else {
    g.fillStyle = '#fff'
    g.beginPath()
    g.ellipse(x, y, r * scale, r * 1.15 * scale, 0, 0, Math.PI * 2)
    g.fill()
    g.stroke()
    g.fillStyle = rig.ink
    g.beginPath()
    g.arc(x + look.x, y + look.y + r * 0.1, r * (s.eyes === 'wide' ? 0.38 : 0.5), 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#fff'
    g.beginPath()
    g.arc(x + look.x + r * 0.18, y + look.y - r * 0.12, r * 0.16, 0, Math.PI * 2)
    g.fill()
  }
  // Qosh: xafa — ichki uchi tepada, jahl — ichki uchi pastda
  if (s.eyes === 'sad' || s.eyes === 'angry') {
    // Xafa: ichki uchi yuqorida (/ \ ko'rinishi teskari), jahl: ichki uchi pastda (\ /)
    const inner = s.eyes === 'sad' ? 1 : -1
    g.strokeStyle = rig.ink
    line(g, [x - side * r * 1.1, y - r * 1.5 - inner * r * 0.25, x + side * r * 0.9, y - r * 1.5 + inner * r * 0.35])
    g.stroke()
  }
}

function drawMouth(g: CanvasRenderingContext2D, rig: FaceRig, s: FaceState) {
  const { x, y, w } = rig.mouth
  const m = rig.mouth
  g.strokeStyle = rig.ink
  g.lineWidth = rig.lw
  const dark = '#5a1020'
  const tongue = '#ff6b81'

  const openShape = (rx: number, ry: number, d = false) => {
    g.save()
    g.beginPath()
    if (d) {
      g.moveTo(x - rx, y - ry * 0.3)
      g.lineTo(x + rx, y - ry * 0.3)
      g.ellipse(x, y - ry * 0.3, rx, ry * 1.3, 0, 0, Math.PI)
    } else g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    g.closePath()
    g.fillStyle = dark
    g.fill()
    g.clip()
    g.fillStyle = tongue
    g.beginPath()
    g.ellipse(x, y + ry * 0.9, rx * 0.6, ry * 0.6, 0, 0, Math.PI * 2)
    g.fill()
    g.restore()
    g.beginPath()
    if (d) {
      g.moveTo(x - rx, y - ry * 0.3)
      g.lineTo(x + rx, y - ry * 0.3)
      g.ellipse(x, y - ry * 0.3, rx, ry * 1.3, 0, 0, Math.PI)
      g.closePath()
    } else g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    g.stroke()
  }

  switch (s.mouth) {
    case 'rest':
      if (m.f) {
        g.drawImage(m.f.sprite, m.f.x0, m.f.y0)
        return
      }
      g.beginPath()
      g.arc(x, y - w * 0.35, w * 0.45, Math.PI * 0.25, Math.PI * 0.75)
      g.stroke()
      return
    case 'smile':
      g.beginPath()
      g.arc(x, y - w * 0.45, w * 0.6, Math.PI * 0.2, Math.PI * 0.8)
      g.stroke()
      return
    case 'sad':
      g.beginPath()
      g.arc(x, y + w * 0.5, w * 0.5, Math.PI * 1.25, Math.PI * 1.75)
      g.stroke()
      return
    case 'ouch': {
      const pts: number[] = []
      for (let i = 0; i <= 8; i++) pts.push(x - w * 0.45 + (i * w * 0.9) / 8, y + (i % 2 ? -1 : 1) * w * 0.08)
      line(g, pts)
      g.stroke()
      return
    }
    case 'grr':
      g.fillStyle = '#fff'
      g.beginPath()
      g.rect(x - w * 0.4, y - w * 0.12, w * 0.8, w * 0.24)
      g.fill()
      g.stroke()
      line(g, [x - w * 0.4, y, x + w * 0.4, y])
      g.stroke()
      return
    case 'o':
      openShape(w * 0.18, w * 0.22)
      return
    case 'laugh':
      openShape(w * 0.5, w * 0.36, true)
      return
    case 'talk':
      openShape(w * 0.38, w * (0.06 + s.open * 0.38))
      return
  }
}

export function renderFace(tex: HTMLCanvasElement, base: HTMLCanvasElement, rig: FaceRig, s: FaceState) {
  const g = tex.getContext('2d')!
  g.drawImage(base, 0, 0)
  g.lineCap = 'round'
  g.lineJoin = 'round'
  if (s.blush > 0.01) {
    g.fillStyle = `rgba(255,120,150,${0.45 * s.blush})`
    for (const e of rig.eyes) {
      g.beginPath()
      g.ellipse(e.x + (e === rig.eyes[0] ? -e.r * 0.6 : e.r * 0.6), e.y + e.r * 1.6, e.r * 0.8, e.r * 0.45, 0, 0, Math.PI * 2)
      g.fill()
    }
  }
  drawEye(g, rig, rig.eyes[0], -1, s)
  drawEye(g, rig, rig.eyes[1], 1, s)
  drawMouth(g, rig, s)
}
