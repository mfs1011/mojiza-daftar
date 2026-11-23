// Istalgan suratdan "bo'yash daftari" sahifasi yasash (bolalar albomidagidek).
//
//   1) Lab rang fazosi: ranglar farqi inson ko'zi sezganidek o'lchanadi
//   2) Kuwahara filtri: tekis joylarni silliqlaydi, lekin qirralarni o'tkir saqlaydi
//      (oddiy Gauss xiralashtirish qirralarni ham yeyib yuboradi — sodda variantda shakllar yo'qolardi)
//   3) k-means: ranglarni bir nechta guruhga ajratish (plakat effekti)
//   4) mayda dog'larni qo'shnisiga qo'shib yuborish
//   5) bo'laklar chegarasini vektor chiziqlarga aylantirish va silliqlash (Chaikin)
//
// Natija: har bir bo'lak yopiq (🪣 bilan bo'yash tashqariga chiqmaydi) va chiziqlar silliq,
// shuning uchun ularni uzuq-uzuq (punktir) qilib ham chizsa bo'ladi.
// Bu fayl DOM'ga bog'liq emas: Web Worker ichida ishlaydi.

export type Detail = 0 | 1 | 2

const K = [5, 7, 10]
const KUWAHARA = [6, 4, 3]
const MIN_AREA = [0.006, 0.0025, 0.0009]

export interface LineArt {
  w: number
  h: number
  /** Har bir piksel qaysi bo'lakka tegishli (0..regions-1) */
  labels: Int32Array
  regions: number
  /** Silliq chegara chiziqlari: [x0,y0,x1,y1,...] (piksel koordinatalarida) */
  paths: Float32Array[]
  /** Chiziq qalinligi, pikselda */
  thickness: number
  /** 1 = chiziq (asosiy oqimda vektor chiziqlardan to'ldiriladi) */
  lines: Uint8Array
}

// ---------------- Rang ----------------

function toLab(rgba: Uint8ClampedArray, n: number): [Float32Array, Float32Array, Float32Array] {
  const L = new Float32Array(n)
  const A = new Float32Array(n)
  const B = new Float32Array(n)
  const lin = (c: number) => {
    c /= 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  for (let i = 0; i < n; i++) {
    const a = rgba[i * 4 + 3] / 255
    const r = lin(rgba[i * 4] * a + 255 * (1 - a))
    const g = lin(rgba[i * 4 + 1] * a + 255 * (1 - a))
    const b = lin(rgba[i * 4 + 2] * a + 255 * (1 - a))
    const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.9505)
    const y = f(r * 0.2126 + g * 0.7152 + b * 0.0722)
    const z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.089)
    L[i] = 116 * y - 16
    A[i] = 500 * (x - y)
    B[i] = 200 * (y - z)
  }
  return [L, A, B]
}

/** Kuwahara: har piksel uchun 4 chorakdan eng "tekis"ining o'rtachasi olinadi */
function kuwahara(ch: [Float32Array, Float32Array, Float32Array], w: number, h: number, r: number) {
  const W = w + 1
  const integ = (src: Float32Array, sq: boolean) => {
    const I = new Float64Array(W * (h + 1))
    for (let y = 0; y < h; y++) {
      let row = 0
      for (let x = 0; x < w; x++) {
        const v = src[y * w + x]
        row += sq ? v * v : v
        I[(y + 1) * W + x + 1] = I[y * W + x + 1] + row
      }
    }
    return I
  }
  const IL = integ(ch[0], false)
  const IL2 = integ(ch[0], true)
  const IA = integ(ch[1], false)
  const IB = integ(ch[2], false)
  const sum = (I: Float64Array, x0: number, y0: number, x1: number, y1: number) =>
    I[(y1 + 1) * W + x1 + 1] - I[y0 * W + x1 + 1] - I[(y1 + 1) * W + x0] + I[y0 * W + x0]

  const out: [Float32Array, Float32Array, Float32Array] = [new Float32Array(w * h), new Float32Array(w * h), new Float32Array(w * h)]
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let best = Infinity
      let bx0 = 0
      let by0 = 0
      let bx1 = 0
      let by1 = 0
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const x0 = Math.max(0, dx < 0 ? x - r : x)
        const x1 = Math.min(w - 1, dx < 0 ? x : x + r)
        const y0 = Math.max(0, dy < 0 ? y - r : y)
        const y1 = Math.min(h - 1, dy < 0 ? y : y + r)
        const n = (x1 - x0 + 1) * (y1 - y0 + 1)
        const m = sum(IL, x0, y0, x1, y1) / n
        const v = sum(IL2, x0, y0, x1, y1) / n - m * m
        if (v < best) {
          best = v
          bx0 = x0
          by0 = y0
          bx1 = x1
          by1 = y1
        }
      }
      const n = (bx1 - bx0 + 1) * (by1 - by0 + 1)
      const i = y * w + x
      out[0][i] = sum(IL, bx0, by0, bx1, by1) / n
      out[1][i] = sum(IA, bx0, by0, bx1, by1) / n
      out[2][i] = sum(IB, bx0, by0, bx1, by1) / n
    }
  }
  return out
}

// ---------------- Guruhlash ----------------

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

function kmeans(ch: Float32Array[], n: number, k: number): Uint8Array {
  const rand = rng(12345)
  const step = Math.max(1, Math.floor(n / 8000))
  const sample: number[] = []
  for (let i = 0; i < n; i += step) sample.push(i)
  const dist = (i: number, c: number[]) => {
    const a = ch[0][i] - c[0]
    const b = ch[1][i] - c[1]
    const d = ch[2][i] - c[2]
    return a * a + b * b + d * d
  }
  const centers: number[][] = []
  const first = sample[Math.floor(rand() * sample.length)]
  centers.push([ch[0][first], ch[1][first], ch[2][first]])
  const best = new Float64Array(sample.length).fill(Infinity)
  while (centers.length < k) {
    let total = 0
    const c = centers[centers.length - 1]
    for (let s = 0; s < sample.length; s++) {
      best[s] = Math.min(best[s], dist(sample[s], c))
      total += best[s]
    }
    let at = rand() * total
    let chosen = sample[sample.length - 1]
    for (let s = 0; s < sample.length; s++) {
      at -= best[s]
      if (at <= 0) {
        chosen = sample[s]
        break
      }
    }
    centers.push([ch[0][chosen], ch[1][chosen], ch[2][chosen]])
  }
  const nearest = (i: number) => {
    let bi = 0
    let bd = Infinity
    for (let c = 0; c < k; c++) {
      const d = dist(i, centers[c])
      if (d < bd) {
        bd = d
        bi = c
      }
    }
    return bi
  }
  for (let iter = 0; iter < 12; iter++) {
    const acc = Array.from({ length: k }, () => [0, 0, 0, 0])
    for (const i of sample) {
      const c = nearest(i)
      acc[c][0] += ch[0][i]
      acc[c][1] += ch[1][i]
      acc[c][2] += ch[2][i]
      acc[c][3]++
    }
    for (let c = 0; c < k; c++) if (acc[c][3]) for (let j = 0; j < 3; j++) centers[c][j] = acc[c][j] / acc[c][3]
  }
  const lab = new Uint8Array(n)
  for (let i = 0; i < n; i++) lab[i] = nearest(i)
  return lab
}

function modeFilter(lab: Uint8Array, w: number, h: number, k: number): Uint8Array {
  const out = new Uint8Array(lab)
  const counts = new Int32Array(k)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      counts.fill(0)
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) counts[lab[(y + dy) * w + x + dx]]++
      const i = y * w + x
      let bi = lab[i]
      for (let c = 0; c < k; c++) if (counts[c] > counts[bi]) bi = c
      out[i] = bi
    }
  }
  return out
}

function components(lab: Uint8Array, w: number, h: number): { comp: Int32Array; sizes: number[] } {
  const n = w * h
  const comp = new Int32Array(n).fill(-1)
  const sizes: number[] = []
  const stack = new Int32Array(n)
  for (let s = 0; s < n; s++) {
    if (comp[s] !== -1) continue
    const id = sizes.length
    let top = 0
    stack[top++] = s
    comp[s] = id
    let size = 0
    while (top) {
      const i = stack[--top]
      size++
      const x = i % w
      const l = lab[i]
      const visit = (j: number) => {
        if (comp[j] === -1 && lab[j] === l) {
          comp[j] = id
          stack[top++] = j
        }
      }
      if (x > 0) visit(i - 1)
      if (x < w - 1) visit(i + 1)
      if (i >= w) visit(i - w)
      if (i < n - w) visit(i + w)
    }
    sizes.push(size)
  }
  return { comp, sizes }
}

function mergeSmall(comp: Int32Array, sizes: number[], w: number, h: number, minArea: number): Int32Array {
  const m = sizes.length
  const parent = Int32Array.from({ length: m }, (_, i) => i)
  const find = (a: number): number => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]]
      a = parent[a]
    }
    return a
  }
  const size = [...sizes]
  const adj: Map<number, number>[] = Array.from({ length: m }, () => new Map())
  const link = (a: number, b: number) => {
    adj[a].set(b, (adj[a].get(b) ?? 0) + 1)
    adj[b].set(a, (adj[b].get(a) ?? 0) + 1)
  }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (x < w - 1 && comp[i] !== comp[i + 1]) link(comp[i], comp[i + 1])
      if (y < h - 1 && comp[i] !== comp[i + w]) link(comp[i], comp[i + w])
    }
  const order = Array.from({ length: m }, (_, i) => i).sort((a, b) => size[a] - size[b])
  for (const r of order) {
    if (find(r) !== r || size[r] >= minArea) continue
    const score = new Map<number, number>()
    for (const [nb, cnt] of adj[r]) {
      const root = find(nb)
      if (root !== r) score.set(root, (score.get(root) ?? 0) + cnt)
    }
    let best = -1
    let bestCnt = -1
    for (const [nb, cnt] of score) {
      if (cnt > bestCnt) {
        best = nb
        bestCnt = cnt
      }
    }
    if (best < 0) continue
    parent[r] = best
    size[best] += size[r]
    for (const [nb, cnt] of adj[r]) if (find(nb) !== best) adj[best].set(nb, (adj[best].get(nb) ?? 0) + cnt)
    adj[r].clear()
  }
  const remap = new Int32Array(m).fill(-1)
  let next = 0
  const out = new Int32Array(comp.length)
  for (let i = 0; i < comp.length; i++) {
    const root = find(comp[i])
    if (remap[root] === -1) remap[root] = next++
    out[i] = remap[root]
  }
  return out
}

// ---------------- Vektor chiziqlar ----------------

/**
 * Bo'laklar orasidagi "yoriqlar" (piksel chegaralari) to'r tugunlari orqali zanjirga bog'lanadi.
 * Tugun = piksel burchagi. Zanjir faqat tarmoqlanish nuqtasida (3-4 yo'l) uziladi,
 * shuning uchun silliqlangandan keyin ham chiziqlar bir-biriga to'g'ri tutashadi.
 */
function tracePaths(labels: Int32Array, w: number, h: number): number[][] {
  const VW = w + 1
  const V = VW * (h + 1)
  const ends: number[] = [] // har bir qirra: [a, b] tugunlar
  // Har bir tugunda ko'pi bilan 4 ta qirra: ixcham jadval (millionlab kichik massiv o'rniga)
  const slots = new Int32Array(V * 4).fill(-1)
  const deg = new Uint8Array(V)
  const add = (a: number, b: number) => {
    const id = ends.length / 2
    ends.push(a, b)
    slots[a * 4 + deg[a]++] = id
    slots[b * 4 + deg[b]++] = id
  }
  const freeEdge = (v: number, used: Uint8Array) => {
    for (let k = 0; k < deg[v]; k++) if (!used[slots[v * 4 + k]]) return slots[v * 4 + k]
    return undefined
  }
  for (let y = 0; y < h; y++)
    for (let x = 1; x < w; x++) if (labels[y * w + x - 1] !== labels[y * w + x]) add(y * VW + x, (y + 1) * VW + x)
  for (let y = 1; y < h; y++)
    for (let x = 0; x < w; x++) if (labels[(y - 1) * w + x] !== labels[y * w + x]) add(y * VW + x, y * VW + x + 1)

  const used = new Uint8Array(ends.length / 2)
  const other = (e: number, v: number) => (ends[e * 2] === v ? ends[e * 2 + 1] : ends[e * 2])
  const paths: number[][] = []
  const walk = (start: number, e0: number): number[] => {
    const pts = [start]
    let v = start
    let e = e0
    for (;;) {
      used[e] = 1
      v = other(e, v)
      pts.push(v)
      if (deg[v] !== 2) break
      const next = freeEdge(v, used)
      if (next === undefined) break
      e = next
    }
    return pts
  }
  for (let e = 0; e < used.length; e++) {
    if (used[e]) continue
    const a = ends[e * 2]
    // Zanjirni ikki tomonga cho'zamiz
    const fwd = walk(a, e)
    let back: number[] = []
    if (deg[a] === 2) {
      const e2 = freeEdge(a, used)
      if (e2 !== undefined) back = walk(a, e2)
    }
    const chain = [...back.reverse(), ...fwd.slice(1)]
    paths.push(chain)
  }
  return paths.map((p) => p.flatMap((v) => [v % VW, Math.floor(v / VW)]))
}

/** Zinapoyasimon chiziqni silliqlash: o'rtacha + Chaikin; uchlari joyida qoladi */
function smooth(pts: number[], closed: boolean): Float32Array {
  let p = pts
  // 1) yengil o'rtacha (zinapoyani yo'qotadi)
  for (let pass = 0; pass < 3; pass++) {
    const q = [...p]
    const n = p.length / 2
    for (let i = 1; i < n - 1; i++) {
      q[i * 2] = (p[i * 2 - 2] + p[i * 2] * 2 + p[i * 2 + 2]) / 4
      q[i * 2 + 1] = (p[i * 2 - 1] + p[i * 2 + 1] * 2 + p[i * 2 + 3]) / 4
    }
    p = q
  }
  // 2) Chaikin
  for (let pass = 0; pass < 2; pass++) {
    const n = p.length / 2
    if (n < 3) break
    const q: number[] = [p[0], p[1]]
    for (let i = 0; i < n - 1; i++) {
      const x0 = p[i * 2]
      const y0 = p[i * 2 + 1]
      const x1 = p[i * 2 + 2]
      const y1 = p[i * 2 + 3]
      q.push(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1, 0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1)
    }
    q.push(p[p.length - 2], p[p.length - 1])
    p = q
  }
  void closed
  return new Float32Array(p)
}

function pathLength(p: number[]): number {
  let l = 0
  for (let i = 2; i < p.length; i += 2) l += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1])
  return l
}

export function makeLineArt(rgba: Uint8ClampedArray, w: number, h: number, detail: Detail): LineArt {
  const n = w * h
  let ch = toLab(rgba, n)
  const r = Math.max(2, Math.round(KUWAHARA[detail] * Math.min(w, h) / 480))
  ch = kuwahara(ch, w, h, r)
  ch = kuwahara(ch, w, h, Math.max(2, Math.round(r / 2)))
  // Rang (a, b) farqini biroz kuchaytiramiz: bir xil yorqinlikdagi qizil va yashil ajralsin
  for (let i = 0; i < n; i++) {
    ch[1][i] *= 1.4
    ch[2][i] *= 1.4
  }

  const k = K[detail]
  let lab = kmeans(ch, n, k)
  lab = modeFilter(lab, w, h, k)
  lab = modeFilter(lab, w, h, k)

  const { comp, sizes } = components(lab, w, h)
  const labels = mergeSmall(comp, sizes, w, h, n * MIN_AREA[detail])
  let regions = 0
  for (let i = 0; i < n; i++) if (labels[i] + 1 > regions) regions = labels[i] + 1

  const minLen = Math.min(w, h) * 0.02
  const paths = tracePaths(labels, w, h)
    .filter((p) => pathLength(p) >= minLen)
    .map((p) => smooth(p, false))

  const thickness = Math.max(3, Math.round(Math.min(w, h) / (detail === 0 ? 90 : detail === 1 ? 115 : 140)))
  return { w, h, labels, regions, paths, thickness, lines: new Uint8Array(n) }
}
