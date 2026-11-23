import * as THREE from 'three'

// 2D chizmadan 3D "puflangan" qahramon yasash (yumshoq o'yinchoq kabi).
//   1) rasmning shaffof bo'lmagan qismi = siluet
//   2) har bir pikselning siluet chetigacha masofasi (distance transform)
//   3) balandlik = k * √masofa  → ingichka chiziqlar yumaloq naycha, katta joylar yostiq
//   4) old va orqa yuza bir-biriga chetda tutashadi → yopiq 3D shakl
// Rasmning o'zi tekstura bo'lib yopishtiriladi, shuning uchun bolaning chizig'i saqlanadi.

const GRID = 150
const TEX = 768

export interface FaceAnchor {
  /** Model koordinatalarida (bir birlik = 1 "piksel" × scale) */
  x: number
  y: number
  /** Ko'zlar orasidagi masofaning yarmi */
  spacing: number
  /** Ko'z va og'iz joyidagi sirt balandligi: yuz qismlari sirtga "botib" ketmasin */
  eyeZ: number
  mouthZ: number
}

export interface Inflated {
  group: THREE.Group
  mesh: THREE.Mesh
  materials: THREE.MeshToonMaterial[]
  face: FaceAnchor
  /** Modelning pastki chegarasi (yerga qo'yish uchun) */
  bottom: number
  height: number
  /** Asosiy shaklning yuqori/pastki chegarasi, model (to'r) koordinatalarida: bosh/oyoq zonalari uchun */
  yTop: number
  yBot: number
  /** Tekstura: yuz har kadrda shu canvasga chiziladi (base ustiga) */
  texture: THREE.CanvasTexture
  texCanvas: HTMLCanvasElement
  /** Yuzsiz toza tekstura */
  base: HTMLCanvasElement
  /** Asl chizma tekstura o'lchamida (bolaning ko'z/og'zini topish uchun) */
  src: HTMLCanvasElement
  /** To'r birligidan tekstura pikseliga */
  texScale: number
  gw: number
  gh: number
  dispose: () => void
}

function chamfer(mask: Uint8Array, w: number, h: number): Float32Array {
  const INF = 1e9
  const d = new Float32Array(w * h)
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? INF : 0
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[y * w + x])
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (!d[i]) continue
      d[i] = Math.min(d[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414)
    }
  for (let y = h - 1; y >= 0; y--)
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x
      if (!d[i]) continue
      d[i] = Math.min(d[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414)
    }
  return d
}

/** Rang "oqishi": chet piksellari tashqariga bir oz kengaytiriladi, 3D chetida qora/shaffof chiziq chiqmasin */
function bleedTexture(src: CanvasImageSource, holes: HTMLCanvasElement, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  for (const r of [10, 6, 3]) for (let a = 0; a < 8; a++) g.drawImage(src, Math.cos((a * Math.PI) / 4) * r, Math.sin((a * Math.PI) / 4) * r, w, h)
  // Yopiq bo'shliqlar (masalan, chizilgan boshning ichi) — oq "qog'oz" bilan to'ladi
  g.drawImage(holes, 0, 0, w, h)
  g.drawImage(src, 0, 0, w, h)
  return c
}

/** 4 tomonlama bog'langan bo'laklar */
function componentsOf(mask: Uint8Array, w: number, h: number): { comp: Int32Array; sizes: number[] } {
  const comp = new Int32Array(w * h).fill(-1)
  const sizes: number[] = []
  const stack: number[] = []
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || comp[s] !== -1) continue
    const id = sizes.length
    comp[s] = id
    stack.push(s)
    let size = 0
    while (stack.length) {
      const i = stack.pop()!
      size++
      const x = i % w
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j < 0 || j >= mask.length || !mask[j] || comp[j] !== -1) continue
        comp[j] = id
        stack.push(j)
      }
    }
    sizes.push(size)
  }
  return { comp, sizes }
}

export async function buildInflated(blob: Blob): Promise<Inflated> {
  const bmp = await createImageBitmap(blob)
  const s = GRID / Math.max(bmp.width, bmp.height)
  const gw = Math.max(8, Math.round(bmp.width * s))
  const gh = Math.max(8, Math.round(bmp.height * s))

  const mc = document.createElement('canvas')
  mc.width = gw
  mc.height = gh
  const mg = mc.getContext('2d', { willReadFrequently: true })!
  mg.drawImage(bmp, 0, 0, gw, gh)
  const md = mg.getImageData(0, 0, gw, gh).data
  const mask = new Uint8Array(gw * gh)
  let filled = 0
  for (let i = 0; i < mask.length; i++) {
    mask[i] = md[i * 4 + 3] > 40 ? 1 : 0
    filled += mask[i]
  }
  // To'liq to'rtburchak rasm (fonsiz): burchaklarini yumaloqlab "yostiqcha" qilamiz
  if (filled > mask.length * 0.97) {
    const r = Math.min(gw, gh) * 0.18
    for (let y = 0; y < gh; y++)
      for (let x = 0; x < gw; x++) {
        const dx = Math.max(0, r - x, x - (gw - 1 - r))
        const dy = Math.max(0, r - y, y - (gh - 1 - r))
        if (dx * dx + dy * dy > r * r) mask[y * gw + x] = 0
      }
  }

  // Yopiq bo'shliqlarni to'ldirish: chetdan "suv quyamiz", yetib bormagan bo'sh joylar = bo'shliq
  const outside = new Uint8Array(gw * gh)
  const q: number[] = []
  for (let x = 0; x < gw; x++) q.push(x, (gh - 1) * gw + x)
  for (let y = 0; y < gh; y++) q.push(y * gw, y * gw + gw - 1)
  while (q.length) {
    const i = q.pop()!
    if (outside[i] || mask[i]) continue
    outside[i] = 1
    const x = i % gw
    if (x > 0) q.push(i - 1)
    if (x < gw - 1) q.push(i + 1)
    if (i >= gw) q.push(i - gw)
    if (i < gw * (gh - 1)) q.push(i + gw)
  }
  const holes = document.createElement('canvas')
  holes.width = gw
  holes.height = gh
  const hg = holes.getContext('2d')!
  const hd = hg.createImageData(gw, gh)
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] || outside[i]) continue
    mask[i] = 1
    hd.data[i * 4] = hd.data[i * 4 + 1] = hd.data[i * 4 + 2] = hd.data[i * 4 + 3] = 255
  }
  hg.putImageData(hd, 0, 0)

  // Mayda dog'lar olib tashlanadi; yuz eng katta bo'lakka (asosiy qahramon) qo'yiladi
  const { comp, sizes } = componentsOf(mask, gw, gh)
  const biggest = sizes.length ? sizes.indexOf(Math.max(...sizes)) : -1
  const minKeep = Math.max(...sizes, 0) * 0.12
  for (let i = 0; i < mask.length; i++) if (mask[i] && sizes[comp[i]] < minKeep) mask[i] = 0

  const dist = chamfer(mask, gw, gh)
  // Har bir to'r tugunining balandligi (tugun = 4 ta qo'shni piksel burchagi)
  const vw = gw + 1
  const vh = gh + 1
  const inside = new Uint8Array(vw * vh)
  const height = new Float32Array(vw * vh)
  for (let y = 0; y < vh; y++)
    for (let x = 0; x < vw; x++) {
      let sum = 0
      let cnt = 0
      for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) {
        const px = x + dx
        const py = y + dy
        if (px < 0 || py < 0 || px >= gw || py >= gh) continue
        if (mask[py * gw + px]) {
          sum += dist[py * gw + px]
          cnt++
        }
      }
      const vi = y * vw + x
      inside[vi] = cnt === 4 ? 1 : 0
      height[vi] = cnt === 4 ? 2.1 * Math.sqrt(Math.max(0, sum / cnt - 0.5)) : 0
    }

  // Old va orqa yuzalar (orqasi yupqaroq)
  const pos: number[] = []
  const uv: number[] = []
  const indexOf = new Int32Array(vw * vh).fill(-1)
  const backOf = new Int32Array(vw * vh).fill(-1)
  const cellUsed = (x: number, y: number) => mask[y * gw + x] === 1
  let n = 0
  const vert = (x: number, y: number, back: boolean) => {
    const vi = y * vw + x
    const table = back ? backOf : indexOf
    if (table[vi] >= 0) return table[vi]
    const z = back ? -height[vi] * 0.55 : height[vi]
    pos.push(x - gw / 2, gh / 2 - y, z)
    uv.push(x / gw, 1 - y / gh)
    table[vi] = n++
    return table[vi]
  }
  const front: number[] = []
  const backIdx: number[] = []
  for (let y = 0; y < gh; y++)
    for (let x = 0; x < gw; x++) {
      if (!cellUsed(x, y)) continue
      const a = vert(x, y, false)
      const b = vert(x + 1, y, false)
      const c = vert(x, y + 1, false)
      const d = vert(x + 1, y + 1, false)
      front.push(a, c, b, b, c, d)
      // Chetdagi (balandligi 0) tugunlar old va orqada umumiy bo'lsin: shakl yopiq bo'ladi
      const bk = (xx: number, yy: number) => (inside[yy * vw + xx] ? vert(xx, yy, true) : vert(xx, yy, false))
      const ba = bk(x, y)
      const bb = bk(x + 1, y)
      const bc = bk(x, y + 1)
      const bd = bk(x + 1, y + 1)
      backIdx.push(ba, bb, bc, bb, bd, bc)
    }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex([...front, ...backIdx])
  geo.addGroup(0, front.length, 0)
  geo.addGroup(front.length, backIdx.length, 1)
  geo.computeVertexNormals()

  const texH = Math.round((TEX * gh) / gw)
  const base = bleedTexture(bmp, holes, TEX, texH)
  const src = document.createElement('canvas')
  src.width = TEX
  src.height = texH
  src.getContext('2d')!.drawImage(bmp, 0, 0, TEX, texH)
  const texCanvas = document.createElement('canvas')
  texCanvas.width = TEX
  texCanvas.height = texH
  texCanvas.getContext('2d')!.drawImage(base, 0, 0)
  const tex = new THREE.CanvasTexture(texCanvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  bmp.close()

  // Multfilm yorug'ligi: 3 pog'onali "toon" soya
  const grad = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 180, 180, 180, 255, 255, 255, 255, 255]), 3, 1)
  grad.minFilter = THREE.NearestFilter
  grad.magFilter = THREE.NearestFilter
  grad.needsUpdate = true
  const frontMat = new THREE.MeshToonMaterial({ map: tex, gradientMap: grad })
  const backMat = new THREE.MeshToonMaterial({ map: tex, gradientMap: grad, color: 0xb8b8c8 })
  const mesh = new THREE.Mesh(geo, [frontMat, backMat])

  // Yuz uchun joy: siluetning yuqori qismining markazi (odatda bosh)
  let top = gh
  let bot = 0
  const isMain = (i: number) => mask[i] === 1 && comp[i] === biggest
  for (let y = 0; y < gh; y++)
    for (let x = 0; x < gw; x++)
      if (isMain(y * gw + x)) {
        top = Math.min(top, y)
        bot = Math.max(bot, y)
      }
  const bandEnd = top + Math.max(4, (bot - top) * 0.42)
  let sx = 0
  let sy = 0
  let sc = 0
  let best = 0
  let bx = gw / 2
  let by = (top + bot) / 2
  for (let y = top; y <= bandEnd; y++)
    for (let x = 0; x < gw; x++) {
      const i = y * gw + x
      if (!isMain(i)) continue
      sx += x
      sy += y
      sc++
      if (dist[i] > best) {
        best = dist[i]
        bx = x
        by = y
      }
    }
  // Yuqori qismdagi eng "qalin" nuqta (bosh markazi) va o'rtacha markazning o'rtasi
  const fx = sc ? (bx + sx / sc) / 2 : bx
  const fy = sc ? (by + sy / sc) / 2 : by
  const spacing = Math.max(3, Math.min(best * 0.55, (bot - top) * 0.12, 14))
  // Nuqta atrofidagi eng baland sirt (radius ichida)
  const surfaceZ = (px: number, py: number, r: number) => {
    let m = 0
    for (let y = Math.round(py - r); y <= py + r; y++)
      for (let x = Math.round(px - r); x <= px + r; x++)
        if (x >= 0 && y >= 0 && x < gw && y < gh) m = Math.max(m, dist[y * gw + x])
    return 2.1 * Math.sqrt(Math.max(0, m - 0.5))
  }
  const eyeY = fy - spacing * 0.25
  const eyeZ = Math.max(surfaceZ(fx - spacing, eyeY, spacing * 0.6), surfaceZ(fx + spacing, eyeY, spacing * 0.6))
  const mouthZ = surfaceZ(fx, fy + spacing * 0.95, spacing * 0.6)

  const group = new THREE.Group()
  group.add(mesh)
  const k = 2.4 / Math.max(gw, gh)
  group.scale.setScalar(k)

  return {
    group,
    mesh,
    materials: [frontMat, backMat],
    face: { x: fx - gw / 2, y: gh / 2 - fy, spacing, eyeZ, mouthZ },
    bottom: (gh / 2 - bot - 1) * k,
    height: (bot - top) * k,
    yTop: gh / 2 - top,
    yBot: gh / 2 - bot,
    texture: tex,
    texCanvas,
    base,
    src,
    texScale: TEX / gw,
    gw,
    gh,
    dispose: () => {
      geo.dispose()
      tex.dispose()
      grad.dispose()
      frontMat.dispose()
      backMat.dispose()
    },
  }
}
