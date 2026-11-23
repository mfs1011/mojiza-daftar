// Chizmalar bilan ishlash: bo'sh joyni kesish va qog'ozdagi rasm suratidan fonni olib tashlash.

/** Shaffof bo'lmagan qism atrofida kesadi. Chizma juda kichik bo'lsa null. */
export function trimCanvas(src: HTMLCanvasElement, pad = 10): HTMLCanvasElement | null {
  const w = src.width
  const h = src.height
  const d = src.getContext('2d')!.getImageData(0, 0, w, h).data
  let minX = w
  let minY = h
  let maxX = -1
  let maxY = -1
  let count = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 20) {
        count++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0 || count < w * h * 0.002) return null
  const bw = maxX - minX + 1
  const bh = maxY - minY + 1
  const out = document.createElement('canvas')
  out.width = bw + pad * 2
  out.height = bh + pad * 2
  out.getContext('2d')!.drawImage(src, minX, minY, bw, bh, pad, pad, bw, bh)
  return out
}

/**
 * Qog'ozga chizilgan rasm suratidan "stiker" yasaydi:
 *  1) har bir hududning qog'oz yorqinligini taxmin qiladi (soya va notekis yorug'likka chidamli),
 *  2) qog'ozdan sezilarli qoraroq yoki rangli piksellarni qoldiradi, qolganini shaffof qiladi,
 *  3) rasm chetiga tegib turgan qismlarni (stol, qog'oz qirrasi) olib tashlaydi.
 */
export async function photoToCutout(file: Blob, maxSize = 900): Promise<HTMLCanvasElement | null> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bmp.width, bmp.height))
  const w = Math.max(1, Math.round(bmp.width * scale))
  const h = Math.max(1, Math.round(bmp.height * scale))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.drawImage(bmp, 0, 0, w, h)
  bmp.close()
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  const n = w * h

  const lum = new Float32Array(n)
  const sat = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const r = d[i * 4]
    const g = d[i * 4 + 1]
    const b = d[i * 4 + 2]
    lum[i] = 0.299 * r + 0.587 * g + 0.114 * b
    sat[i] = Math.max(r, g, b) - Math.min(r, g, b)
  }

  // Qog'oz yorqinligi xaritasi: 12x12 katak, har birida 85-persentil
  const G = 12
  const grid = new Float32Array(G * G)
  for (let gy = 0; gy < G; gy++) {
    for (let gx = 0; gx < G; gx++) {
      const vals: number[] = []
      const x0 = Math.floor((gx * w) / G)
      const x1 = Math.floor(((gx + 1) * w) / G)
      const y0 = Math.floor((gy * h) / G)
      const y1 = Math.floor(((gy + 1) * h) / G)
      for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) vals.push(lum[y * w + x])
      vals.sort((a, b) => a - b)
      grid[gy * G + gx] = vals.length ? vals[Math.floor(vals.length * 0.85)] : 255
    }
  }
  const bgAt = (x: number, y: number) => {
    const fx = Math.min(G - 1.001, Math.max(0, (x / w) * G - 0.5))
    const fy = Math.min(G - 1.001, Math.max(0, (y / h) * G - 0.5))
    const ix = Math.floor(fx)
    const iy = Math.floor(fy)
    const tx = fx - ix
    const ty = fy - iy
    const a = grid[iy * G + ix]
    const b = grid[iy * G + Math.min(G - 1, ix + 1)]
    const cc = grid[Math.min(G - 1, iy + 1) * G + ix]
    const dd = grid[Math.min(G - 1, iy + 1) * G + Math.min(G - 1, ix + 1)]
    return (a * (1 - tx) + b * tx) * (1 - ty) + (cc * (1 - tx) + dd * tx) * ty
  }

  const alpha = new Uint8Array(n)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const bg = Math.max(30, bgAt(x, y))
      const dark = (bg - lum[i]) / bg
      let a = Math.min(1, Math.max(0, (dark - 0.12) / 0.14))
      if (sat[i] > 45) a = Math.max(a, Math.min(1, (sat[i] - 40) / 30))
      alpha[i] = Math.round(a * 255)
      // Qalam chiziqlari biroz to'qroq bo'lsin: ekranda yaxshi ko'rinadi
      if (sat[i] < 45) {
        d[i * 4] *= 0.75
        d[i * 4 + 1] *= 0.75
        d[i * 4 + 2] *= 0.75
      }
    }
  }

  // Chetga tegib turgan bog'langan qismlarni o'chirish (stol, qog'oz qirrasi, soya)
  const stack: number[] = []
  const seen = new Uint8Array(n)
  const push = (i: number) => {
    if (!seen[i] && alpha[i] > 60) {
      seen[i] = 1
      stack.push(i)
    }
  }
  for (let x = 0; x < w; x++) {
    push(x)
    push((h - 1) * w + x)
  }
  for (let y = 0; y < h; y++) {
    push(y * w)
    push(y * w + w - 1)
  }
  while (stack.length) {
    const i = stack.pop()!
    alpha[i] = 0
    const x = i % w
    if (x > 0) push(i - 1)
    if (x < w - 1) push(i + 1)
    if (i >= w) push(i - w)
    if (i < n - w) push(i + w)
  }

  for (let i = 0; i < n; i++) d[i * 4 + 3] = alpha[i]
  ctx.putImageData(img, 0, 0)
  return trimCanvas(c, 10)
}

export function canvasToBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'))
}
