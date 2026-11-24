// Harfni barmoq bilan chizishni baholash.
// Harf offscreen canvasga chiziladi → "niqob" (mask). Bolaning chizig'i bilan solishtiriladi:
//   coverage = harfning necha foizi bo'yalgan
//   outside  = bolaning chizig'ining necha foizi harfdan tashqarida

export const LETTER_FONT = (size: number) => `900 ${size}px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif`

export interface LetterLayout {
  size: number
  x: number
  y: number
  /** Bolaning "bo'r" chizig'i qalinligi */
  lineWidth: number
}

export function layoutLetter(ctx: CanvasRenderingContext2D, letter: string, w: number, h: number): LetterLayout {
  ctx.font = LETTER_FONT(100)
  const m100 = ctx.measureText(letter)
  const size = Math.min(h * 0.72, (w * 0.8 * 100) / Math.max(1, m100.width))
  ctx.font = LETTER_FONT(size)
  const m = ctx.measureText(letter)
  const y = h / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2
  return { size, x: w / 2, y, lineWidth: Math.max(14, size * 0.15) }
}

export function drawLetter(
  ctx: CanvasRenderingContext2D,
  letter: string,
  L: LetterLayout,
  style: { fill?: string; stroke?: string; dash?: number[]; strokeWidth?: number },
) {
  ctx.save()
  ctx.font = LETTER_FONT(L.size)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'
  if (style.fill) {
    ctx.fillStyle = style.fill
    ctx.fillText(letter, L.x, L.y)
  }
  if (style.stroke) {
    ctx.strokeStyle = style.stroke
    ctx.lineWidth = style.strokeWidth ?? 3
    ctx.setLineDash(style.dash ?? [])
    ctx.strokeText(letter, L.x, L.y)
  }
  ctx.restore()
}

export interface TraceMask {
  w: number
  h: number
  letter: Uint8Array
  /** Harf + atrofidagi kichik chegara (bola chizig'i biroz chetga chiqsa ham kechiriladi) */
  near: Uint8Array
  count: number
  layout: LetterLayout
}

function alphaMask(c: HTMLCanvasElement): Uint8Array {
  const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data
  const out = new Uint8Array(c.width * c.height)
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4 + 3] > 40 ? 1 : 0
  return out
}

// ---------- Chiziq shakllari (yozuvga tayyorgarlik: tik, to'lqin, aylana...) ----------

/** Harf/raqam (matn) yoki SVG yo'li: 0..100 kvadrat ichida, bola uning ustidan yurib chizadi */
export type Glyph = string | { path: string; /** Boshlanish nuqtasi (0..100) */ start: [number, number] }

function strokeLayout(w: number, h: number): LetterLayout {
  const size = Math.min(w, h) * 0.8
  return { size, x: (w - size) / 2, y: (h - size) / 2, lineWidth: Math.max(14, size * 0.085) }
}

export function layoutGlyph(ctx: CanvasRenderingContext2D, g: Glyph, w: number, h: number): LetterLayout {
  return typeof g === 'string' ? layoutLetter(ctx, g, w, h) : strokeLayout(w, h)
}

/**
 * Glyph chizish. Matn uchun — harf shrifti; yo'l uchun — `fill` qalin tasma (bola bo'yashi kerak bo'lgan joy),
 * `stroke` — ingichka (punktir) markaziy chiziq.
 */
export function drawGlyph(
  ctx: CanvasRenderingContext2D,
  g: Glyph,
  L: LetterLayout,
  style: { fill?: string; stroke?: string; dash?: number[]; strokeWidth?: number; band?: number },
) {
  if (typeof g === 'string') return drawLetter(ctx, g, L, style)
  const p = new Path2D(g.path)
  ctx.save()
  ctx.translate(L.x, L.y)
  ctx.scale(L.size / 100, L.size / 100)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const k = 100 / L.size
  if (style.fill) {
    ctx.strokeStyle = style.fill
    ctx.lineWidth = L.lineWidth * (style.band ?? 1.15) * k
    ctx.stroke(p)
  }
  if (style.stroke) {
    ctx.strokeStyle = style.stroke
    ctx.lineWidth = (style.strokeWidth ?? 3) * k
    ctx.setLineDash((style.dash ?? []).map((v) => v * k))
    ctx.stroke(p)
  }
  ctx.restore()
}

export function makeMask(glyph: Glyph, w: number, h: number): TraceMask {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const layout = layoutGlyph(ctx, glyph, w, h)
  drawGlyph(ctx, glyph, layout, { fill: '#000' })
  const mask = alphaMask(c)

  ctx.clearRect(0, 0, w, h)
  if (typeof glyph === 'string') drawLetter(ctx, glyph, layout, { fill: '#000', stroke: '#000', strokeWidth: layout.lineWidth * 1.3 })
  else drawGlyph(ctx, glyph, layout, { fill: '#000', band: 2.6 })
  const near = alphaMask(c)

  let count = 0
  for (const v of mask) count += v
  return { w, h, letter: mask, near, count, layout }
}

export function scoreTrace(
  m: TraceMask,
  user: Uint8ClampedArray,
): { coverage: number; outside: number; userCount: number; parts: number } {
  // Harf kichik kataklarga (≈ chiziq qalinligi) bo'linadi: HAR bir qismi chizilgan bo'lishi kerak —
  // umumiy foizgina yetarli emas (aks holda harfning bir bo'lagini tashlab ketsa ham o'tib ketardi)
  const cell = Math.max(10, Math.round((m.layout.lineWidth ?? 24) * 1.2))
  const cols = Math.ceil(m.w / cell)
  const cellLetter = new Map<number, number>()
  const cellCovered = new Map<number, number>()
  let covered = 0
  let letterSeen = 0
  let userCount = 0
  let outside = 0
  const step = 2
  for (let y = 0; y < m.h; y += step) {
    for (let x = 0; x < m.w; x += step) {
      const i = y * m.w + x
      const u = user[i * 4 + 3] > 40
      if (m.letter[i]) {
        letterSeen++
        const c = Math.floor(y / cell) * cols + Math.floor(x / cell)
        cellLetter.set(c, (cellLetter.get(c) ?? 0) + 1)
        if (u) {
          covered++
          cellCovered.set(c, (cellCovered.get(c) ?? 0) + 1)
        }
      }
      if (u) {
        userCount++
        if (!m.near[i]) outside++
      }
    }
  }
  // Katakning ozgina qismi harf bo'lsa (chet) — hisobga olinmaydi; qolganlarining ≥25% bo'yalgan bo'lsa — "chizilgan"
  let partsTotal = 0
  let partsDone = 0
  const minPx = (cell / 2) * (cell / 2) * 0.15
  for (const [c, n] of cellLetter) {
    if (n < minPx) continue
    partsTotal++
    if ((cellCovered.get(c) ?? 0) / n >= 0.25) partsDone++
  }
  return {
    coverage: letterSeen ? covered / letterSeen : 0,
    outside: userCount ? outside / userCount : 0,
    userCount,
    parts: partsTotal ? partsDone / partsTotal : 0,
  }
}

/** Faqat testlar uchun: harf ustidagi nuqtalar (sahifa koordinatalarida) */
export function maskPoints(m: TraceMask, offsetX: number, offsetY: number, step: number): [number, number][] {
  const pts: [number, number][] = []
  for (let y = 0; y < m.h; y += step)
    for (let x = 0; x < m.w; x += step) if (m.letter[y * m.w + x]) pts.push([offsetX + x, offsetY + y])
  return pts
}
