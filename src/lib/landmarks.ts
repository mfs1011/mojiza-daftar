import { findFace, type Pt } from './faceRig'

// Personaj belgilari: ko'zlar, og'iz, qo'llar, oyoqlar.
// Koordinatalar rasmga nisbatan 0..1 (rasm o'lchamidan qat'i nazar).
// Avval avtomatik taxmin qilinadi, keyin bola/ota-ona belgilash ekranida surib to'g'rilaydi.
// Qo'l yoki oyoq yo'q bo'lsa (masalan, to'p yoki uy) — null.

export interface Landmarks {
  eyeL: Pt
  eyeR: Pt
  mouth: Pt
  handL: Pt | null
  handR: Pt | null
  footL: Pt | null
  footR: Pt | null
}

export const ANALYSIS_SIDE = 768

/** Rasmning mazmunidan kalit: bir xil rasm uchun belgilar qayta so'ralmaydi */
export async function blobKey(blob: Blob): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  return [...new Uint8Array(hash).slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function analysisCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(blob)
  const s = ANALYSIS_SIDE / Math.max(bmp.width, bmp.height)
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(bmp.width * s))
  c.height = Math.max(1, Math.round(bmp.height * s))
  c.getContext('2d', { willReadFrequently: true })!.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close()
  return c
}

export function autoLandmarks(c: HTMLCanvasElement): Landmarks {
  const w = c.width
  const h = c.height
  const d = c.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, w, h).data
  const inside = (x: number, y: number) => d[(y * w + x) * 4 + 3] > 40
  let top = h
  let bot = -1
  let left = w
  let right = -1
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (inside(x, y)) {
        top = Math.min(top, y)
        bot = Math.max(bot, y)
        left = Math.min(left, x)
        right = Math.max(right, x)
      }
  if (bot < 0) {
    top = 0
    bot = h - 1
    left = 0
    right = w - 1
  }
  const H = bot - top + 1
  const cx = (left + right) / 2
  const n = (p: Pt): Pt => ({ x: p.x / w, y: p.y / h })

  // Yuz: avval rasmning o'zidan, topilmasa — boshning (yuqori qism) markazidan taxmin
  const face = findFace(c)
  let eyeL: Pt
  let eyeR: Pt
  let mouth: Pt
  if (face) {
    eyeL = face.eyeL
    eyeR = face.eyeR
    mouth = face.mouth
  } else {
    let sx = 0
    let sc = 0
    let minX = w
    let maxX = 0
    const y0 = top
    const y1 = top + Math.round(H * 0.3)
    for (let y = y0; y <= y1; y++)
      for (let x = 0; x < w; x++)
        if (inside(x, y)) {
          sx += x
          sc++
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
        }
    const hx = sc ? sx / sc : cx
    const hy = top + H * 0.17
    const half = Math.max(8, (maxX - minX) * 0.17)
    eyeL = { x: hx - half, y: hy }
    eyeR = { x: hx + half, y: hy }
    mouth = { x: hx, y: hy + half * 1.5 }
  }

  // Qo'llar: tananing o'rta qismidagi eng chap/o'ng nuqtalar (tanadan sezilarli chiqib turgan bo'lsa)
  const band0 = top + Math.round(H * 0.3)
  const band1 = top + Math.round(H * 0.75)
  const widths: number[] = []
  let hl: Pt | null = null
  let hr: Pt | null = null
  for (let y = band0; y <= band1; y++) {
    let a = -1
    let b = -1
    for (let x = 0; x < w; x++)
      if (inside(x, y)) {
        if (a < 0) a = x
        b = x
      }
    if (a < 0) continue
    widths.push(b - a)
    if (!hl || a < hl.x) hl = { x: a, y }
    if (!hr || b > hr.x) hr = { x: b, y }
  }
  widths.sort((p, q) => p - q)
  const typical = widths[Math.floor(widths.length * 0.3)] ?? 0
  const sticks = (p: Pt | null, side: -1 | 1) => !!p && Math.abs(p.x - cx) > typical / 2 + H * 0.06 && side * (p.x - cx) > 0
  const handL = sticks(hl, -1) ? hl : null
  const handR = sticks(hr, 1) ? hr : null

  // Oyoqlar: pastki qismda chap va o'ng yarmidagi eng past nuqtalar
  const foot = (side: -1 | 1): Pt | null => {
    for (let y = bot; y > bot - H * 0.2; y--) {
      let sx = 0
      let sc = 0
      for (let x = 0; x < w; x++) {
        if (inside(x, y) && side * (x - cx) > H * 0.02) {
          sx += x
          sc++
        }
      }
      if (sc) return { x: sx / sc, y }
    }
    return null
  }
  const fl = foot(-1)
  const fr = foot(1)
  // Ikkala oyoq ham topilsa va ular orasida bo'shliq bo'lsa — haqiqiy oyoqlar
  const gap = fl && fr ? !inside(Math.round(cx), Math.round(Math.min(fl.y, fr.y) - 2)) : false

  return {
    eyeL: n(eyeL),
    eyeR: n(eyeR),
    mouth: n(mouth),
    handL: handL && n(handL),
    handR: handR && n(handR),
    footL: gap && fl ? n(fl) : null,
    footR: gap && fr ? n(fr) : null,
  }
}
