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

export function makeMask(letter: string, w: number, h: number): TraceMask {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const layout = layoutLetter(ctx, letter, w, h)
  drawLetter(ctx, letter, layout, { fill: '#000' })
  const mask = alphaMask(c)

  ctx.clearRect(0, 0, w, h)
  drawLetter(ctx, letter, layout, { fill: '#000', stroke: '#000', strokeWidth: layout.lineWidth * 1.3 })
  const near = alphaMask(c)

  let count = 0
  for (const v of mask) count += v
  return { w, h, letter: mask, near, count, layout }
}

export function scoreTrace(m: TraceMask, user: Uint8ClampedArray): { coverage: number; outside: number; userCount: number } {
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
        if (u) covered++
      }
      if (u) {
        userCount++
        if (!m.near[i]) outside++
      }
    }
  }
  return {
    coverage: letterSeen ? covered / letterSeen : 0,
    outside: userCount ? outside / userCount : 0,
    userCount,
  }
}

/** Faqat testlar uchun: harf ustidagi nuqtalar (sahifa koordinatalarida) */
export function maskPoints(m: TraceMask, offsetX: number, offsetY: number, step: number): [number, number][] {
  const pts: [number, number][] = []
  for (let y = 0; y < m.h; y += step)
    for (let x = 0; x < m.w; x += step) if (m.letter[y * m.w + x]) pts.push([offsetX + x, offsetY + y])
  return pts
}
