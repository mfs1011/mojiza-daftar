// Tayyor personaj rasmidan (PNG yoki JPEG) fonni kesib olish.
//
//  1) PNG'da shaffof fon bo'lsa — u ishlatiladi (eng aniq natija).
//  2) Aks holda: rasm chetidagi ranglar = fon. Chetdan boshlab "to'ldiramiz": piksel fon rangiga
//     yaqin bo'lsa VA kuchli qirra bo'lmasa — fon. Personaj konturi (qirra) to'ldirishni to'xtatadi.
//  3) Tozalash: eng katta shakl qoladi, ichidagi mayda teshiklar yopiladi, chetlar yumshatiladi.
//  4) Qo'lda tuzatish: bola/ota-ona qolib ketgan fonni bossa — o'sha joy o'chadi (removeAt).

const MAX_SIDE = 1024

export interface CutState {
  /** Asl rasm (fonsiz holatga keltirilmagan) */
  src: ImageData
  /** 0..255 shaffoflik (personaj = 255) */
  alpha: Uint8ClampedArray
  mode: 'alpha' | 'auto'
}

function lab(d: Uint8ClampedArray, i: number): [number, number, number] {
  const lin = (c: number) => {
    c /= 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const r = lin(d[i])
  const g = lin(d[i + 1])
  const b = lin(d[i + 2])
  const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.9505)
  const y = f(r * 0.2126 + g * 0.7152 + b * 0.0722)
  const z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.089)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

export async function loadForCut(file: Blob): Promise<ImageData> {
  const bmp = await createImageBitmap(file)
  const s = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  const w = Math.max(1, Math.round(bmp.width * s))
  const h = Math.max(1, Math.round(bmp.height * s))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.drawImage(bmp, 0, 0, w, h)
  bmp.close()
  return g.getImageData(0, 0, w, h)
}

export function autoCut(src: ImageData): CutState {
  const { width: w, height: h, data: d } = src
  const n = w * h

  // 1) Tayyor shaffof PNG
  let transparent = 0
  for (let i = 0; i < n; i++) if (d[i * 4 + 3] < 20) transparent++
  if (transparent > n * 0.03) {
    const alpha = new Uint8ClampedArray(n)
    for (let i = 0; i < n; i++) alpha[i] = d[i * 4 + 3]
    return { src, alpha: cleanup(alpha, w, h), mode: 'alpha' }
  }

  // 2) Lab ranglar va qirralar kuchi
  const L = new Float32Array(n)
  const A = new Float32Array(n)
  const B = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const [l, a, b] = lab(d, i * 4)
    L[i] = l
    A[i] = a
    B[i] = b
  }
  const edge = new Float32Array(n)
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      let m = 0
      for (const ch of [L, A, B]) {
        const gx = ch[i + 1] - ch[i - 1] + 0.5 * (ch[i - w + 1] - ch[i - w - 1] + ch[i + w + 1] - ch[i + w - 1])
        const gy = ch[i + w] - ch[i - w] + 0.5 * (ch[i + w - 1] - ch[i - w - 1] + ch[i + w + 1] - ch[i - w + 1])
        m = Math.max(m, Math.hypot(gx, gy))
      }
      edge[i] = m
    }

  // 3) Fon ranglari: chet piksellarini 3 guruhga ajratish (k-means)
  const border: number[] = []
  const step = Math.max(1, Math.floor((w + h) / 400))
  for (let x = 0; x < w; x += step) border.push(x, (h - 1) * w + x)
  for (let y = 0; y < h; y += step) border.push(y * w, y * w + w - 1)
  let centers = [border[0], border[Math.floor(border.length / 3)], border[Math.floor((border.length * 2) / 3)]].map((i) => [L[i], A[i], B[i]])
  const dist = (i: number, c: number[]) => Math.hypot(L[i] - c[0], A[i] - c[1], B[i] - c[2])
  for (let it = 0; it < 8; it++) {
    const acc = centers.map(() => [0, 0, 0, 0])
    for (const i of border) {
      let bi = 0
      for (let c = 1; c < centers.length; c++) if (dist(i, centers[c]) < dist(i, centers[bi])) bi = c
      acc[bi][0] += L[i]
      acc[bi][1] += A[i]
      acc[bi][2] += B[i]
      acc[bi][3]++
    }
    centers = centers.map((c, k) => (acc[k][3] ? [acc[k][0] / acc[k][3], acc[k][1] / acc[k][3], acc[k][2] / acc[k][3]] : c))
    // Juda kam uchraydigan guruh (chetga tegib turgan personaj bo'lagi) fon hisoblanmaydi
    if (it === 7) centers = centers.filter((_, k) => acc[k][3] > border.length * 0.08)
  }
  // Har piksel uchun eng yaqin fon rangigacha masofa — bir marta hisoblanadi
  const bgD = new Float32Array(n)
  // Soya: rangi (a, b) fonniki bilan bir xil, faqat biroz to'qroq — ham fon hisoblanadi
  const shadow = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    let m = Infinity
    let bi = 0
    for (let k = 0; k < centers.length; k++) {
      const d0 = dist(i, centers[k])
      if (d0 < m) {
        m = d0
        bi = k
      }
    }
    bgD[i] = m
    const c = centers[bi]
    const chroma = Math.hypot(A[i] - c[1], B[i] - c[2])
    const darker = c[0] - L[i]
    shadow[i] = chroma < 6 && darker > 0 && darker < 38 ? 1 : 0
  }
  const bgDist = (i: number) => bgD[i]

  // Fon qanchalik "shovqinli" — shunga qarab bardoshlilik
  const bd = border.map(bgDist).sort((a, b) => a - b)
  const T = Math.max(9, Math.min(24, bd[Math.floor(bd.length * 0.9)] * 2.2 + 6))
  const E = 28

  // 4) Chetdan to'ldirish
  const bg = new Uint8Array(n)
  const stack: number[] = []
  for (const i of border) if (bgDist(i) < T * 1.3) stack.push(i)
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x)
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1)
  while (stack.length) {
    const i = stack.pop()!
    if (bg[i]) continue
    if ((bgDist(i) > T && !shadow[i]) || edge[i] > E * 1.6) continue
    bg[i] = 1
    const x = i % w
    for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
      if (j < 0 || j >= n || bg[j]) continue
      // Qirradan o'tmaslik: qo'shni piksel bilan keskin farq bo'lsa to'xtaymiz
      if (edge[j] > E && bgDist(j) > T * 0.5 && !shadow[j]) continue
      stack.push(j)
    }
  }

  // 5) Yumshoq chet: fon rangidan uzoqlashgan sari shaffoflik kamayadi
  const alpha = new Uint8ClampedArray(n)
  for (let i = 0; i < n; i++) alpha[i] = bg[i] ? 0 : 255
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      if (alpha[i] !== 255) continue
      if (bg[i - 1] || bg[i + 1] || bg[i - w] || bg[i + w]) {
        const t = Math.min(1, Math.max(0, (bgDist(i) - T * 0.4) / (T * 0.9)))
        alpha[i] = Math.round(80 + t * 175)
      }
    }
  return { src, alpha: cleanup(alpha, w, h), mode: 'auto' }
}

/** Mayda dog'larni olib tashlash, kichik teshiklarni yopish */
function cleanup(alpha: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const n = w * h
  const fg = new Uint8Array(n)
  for (let i = 0; i < n; i++) fg[i] = alpha[i] > 40 ? 1 : 0
  const label = (mask: Uint8Array, val: number) => {
    const comp = new Int32Array(n).fill(-1)
    const sizes: number[] = []
    const st: number[] = []
    for (let s = 0; s < n; s++) {
      if (mask[s] !== val || comp[s] !== -1) continue
      const id = sizes.length
      comp[s] = id
      st.push(s)
      let size = 0
      while (st.length) {
        const i = st.pop()!
        size++
        const x = i % w
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
          if (j < 0 || j >= n || mask[j] !== val || comp[j] !== -1) continue
          comp[j] = id
          st.push(j)
        }
      }
      sizes.push(size)
    }
    return { comp, sizes }
  }
  // Personaj bo'laklari: eng kattasining 8% idan kichiklari — dog'
  const f = label(fg, 1)
  const big = Math.max(0, ...f.sizes)
  const out = new Uint8ClampedArray(alpha)
  for (let i = 0; i < n; i++) if (fg[i] && f.sizes[f.comp[i]] < big * 0.08) out[i] = 0
  // Personaj ichidagi mayda shaffof teshiklar (siqish artefakti) yopiladi
  const holes = label(fg, 0)
  const touches = new Set<number>()
  for (let x = 0; x < w; x++) touches.add(holes.comp[x]).add(holes.comp[(h - 1) * w + x])
  for (let y = 0; y < h; y++) touches.add(holes.comp[y * w]).add(holes.comp[y * w + w - 1])
  for (let i = 0; i < n; i++) {
    const c = holes.comp[i]
    if (c >= 0 && !touches.has(c) && holes.sizes[c] < n * 0.0008) out[i] = 255
  }
  return out
}

/**
 * Qo'lda tuzatish: bosilgan joydagi rangga o'xshash, hali ko'rinib turgan bog'langan qismni o'chiradi
 * (masalan, qo'l va tana orasida qolib ketgan fon).
 */
export function removeAt(state: CutState, px: number, py: number): Uint8ClampedArray {
  const { width: w, height: h, data: d } = state.src
  const n = w * h
  const x0 = Math.round(px)
  const y0 = Math.round(py)
  const seed = y0 * w + x0
  const out = new Uint8ClampedArray(state.alpha)
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h || out[seed] === 0) return out
  const ref = lab(d, seed * 4)
  const T = 14
  const seen = new Uint8Array(n)
  const st = [seed]
  while (st.length) {
    const i = st.pop()!
    if (seen[i] || out[i] === 0) continue
    seen[i] = 1
    const c = lab(d, i * 4)
    const dd = Math.hypot(c[0] - ref[0], c[1] - ref[1], c[2] - ref[2])
    if (dd > T) continue
    out[i] = 0
    const x = i % w
    if (x > 0) st.push(i - 1)
    if (x < w - 1) st.push(i + 1)
    if (i >= w) st.push(i - w)
    if (i < n - w) st.push(i + w)
  }
  return out
}

/** Natijani PNG uchun canvasga: fonsiz, bo'sh joylari kesilgan */
export function renderCut(state: CutState, alpha: Uint8ClampedArray, pad = 8): HTMLCanvasElement | null {
  const { width: w, height: h, data: d } = state.src
  let x0 = w
  let y0 = h
  let x1 = -1
  let y1 = -1
  let count = 0
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (alpha[y * w + x] > 40) {
        count++
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
        y0 = Math.min(y0, y)
        y1 = Math.max(y1, y)
      }
  if (x1 < 0 || count < w * h * 0.01) return null
  const cw = x1 - x0 + 1
  const ch = y1 - y0 + 1
  const c = document.createElement('canvas')
  c.width = cw + pad * 2
  c.height = ch + pad * 2
  const g = c.getContext('2d')!
  const img = g.createImageData(cw, ch)
  for (let y = 0; y < ch; y++)
    for (let x = 0; x < cw; x++) {
      const si = (y + y0) * w + x + x0
      const di = (y * cw + x) * 4
      img.data[di] = d[si * 4]
      img.data[di + 1] = d[si * 4 + 1]
      img.data[di + 2] = d[si * 4 + 2]
      img.data[di + 3] = alpha[si]
    }
  g.putImageData(img, pad, pad)
  return c
}
