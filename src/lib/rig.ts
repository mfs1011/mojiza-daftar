import * as THREE from 'three'
import type { Inflated } from './inflate'
import type { Landmarks } from './landmarks'

// Suyakli rig: 3D "puflangan" qahramonga skelet qo'yiladi va u prujinali harakat bilan jonlanadi.
//
//   root (bel) ─ chest (ko'krak) ─ head (bo'yin bo'g'ini, bosh)
//                               ├ shoulderL ─ elbowL      (qo'llar)
//                               └ shoulderR ─ elbowR
//              ├ hipL ─ kneeL                             (oyoqlar)
//              └ hipR ─ kneeR
//
// Har bir piksel qaysi suyakka tegishli ekani SHAKL ICHIDAGI masofa (geodezik) bo'yicha topiladi:
// tanaga tegib turgan qo'l ham faqat o'z suyagi bilan harakatlanadi, tana cho'zilib ketmaydi.
// Bo'g'inlarda og'irliklar silliq aralashadi — bukilish yumshoq chiqadi.

type V = { x: number; y: number }

export interface Pose {
  /** butun tana og'ishi (bel atrofida), radian */
  root: number
  chest: number
  /** bosh: yonga og'ish, bosh irg'ash (oldinga/orqaga), burilish */
  head: number
  headX: number
  headY: number
  /** qo'l yo'nalishi: 0 = yonga, +π/2 = tepaga, −π/2 = pastga (ikkala tomon uchun bir xil ma'noda) */
  armL: number
  armR: number
  /** tirsak: + = bilak soat strelkasiga teskari tomonga (yondagi qo'lda tepaga), − = tana tomonga (quchoqlash) */
  elbowL: number
  elbowR: number
  /** oyoq: 0 = tik, + = tashqariga ko'tarish; tizza: + = tashqariga (cho'kkalash), − = ichkariga (oyoqni bukib olish) */
  legL: number
  legR: number
  kneeL: number
  kneeR: number
}

export type PoseKey = keyof Pose

const STIFF: Record<PoseKey, number> = {
  root: 110, chest: 130, head: 150, headX: 150, headY: 120,
  armL: 170, armR: 170, elbowL: 190, elbowR: 190,
  legL: 220, legR: 220, kneeL: 240, kneeR: 240,
}

export interface Rig {
  rest: Pose
  hasArms: { L: boolean; R: boolean }
  hasLegs: { L: boolean; R: boolean }
  /** Belgilar to'r (grid) koordinatalarida — zonalar uchun */
  grid: { eyeY: number; mouthY: number; eyeDist: number; kneeY: number | null; hands: (V | null)[] }
  /** Maqsad pozani berib, prujinalar bilan yaqinlashtiradi */
  update: (target: Partial<Pose>, dt: number) => void
  dispose: () => void
}

const lerp = (a: V, b: V, t: number): V => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

/** Niqob ichida geodezik masofa (BFS) — berilgan kesma nuqtalaridan */
function geodesic(mask: Uint8Array, w: number, h: number, a: V, b: V): Float32Array {
  const INF = 1e9
  const d = new Float32Array(w * h).fill(INF)
  const q = new Int32Array(w * h)
  let head = 0
  let tail = 0
  const steps = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)))
  const seed = (x: number, y: number) => {
    const xi = Math.round(x)
    const yi = Math.round(y)
    if (xi < 0 || yi < 0 || xi >= w || yi >= h) return
    const i = yi * w + xi
    if (!mask[i] || d[i] === 0) return
    d[i] = 0
    q[tail++] = i
  }
  for (let s = 0; s <= steps; s++) seed(a.x + ((b.x - a.x) * s) / steps, a.y + ((b.y - a.y) * s) / steps)
  // Kesma shakldan tashqarida bo'lsa (masalan, ingichka qo'l yonidan o'tsa) — eng yaqin ichki nuqta
  if (!tail) {
    let best = -1
    let bd = Infinity
    const m = lerp(a, b, 0.5)
    for (let i = 0; i < mask.length; i++) {
      if (!mask[i]) continue
      const dd = Math.hypot((i % w) - m.x, Math.floor(i / w) - m.y)
      if (dd < bd) {
        bd = dd
        best = i
      }
    }
    if (best >= 0) {
      d[best] = 0
      q[tail++] = best
    }
  }
  while (head < tail) {
    const i = q[head++]
    const x = i % w
    const nd = d[i] + 1
    for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
      if (j < 0 || j >= mask.length || !mask[j] || d[j] <= nd) continue
      d[j] = nd
      q[tail++] = j
    }
  }
  return d
}

export function buildRig(model: Inflated, marks: Landmarks): Rig {
  const { gw, gh, mask, geo, materials, group } = model
  const G = (p: { x: number; y: number }): V => ({ x: p.x * gw, y: p.y * gh })
  const eyeL = G(marks.eyeL)
  const eyeR = G(marks.eyeR)
  const mouth = G(marks.mouth)
  const eyeDist = Math.max(3, Math.hypot(eyeR.x - eyeL.x, eyeR.y - eyeL.y))
  const eyeMid = lerp(eyeL, eyeR, 0.5)
  const headC = lerp(eyeMid, mouth, 0.5)
  const hands = [marks.handL && G(marks.handL), marks.handR && G(marks.handR)]
  const feet = [marks.footL && G(marks.footL), marks.footR && G(marks.footR)]

  // Tana markazi: og'izdan pastdagi shakl qismining o'rtasi
  let sx = 0
  let sy = 0
  let sc = 0
  let bottom = 0
  for (let y = 0; y < gh; y++)
    for (let x = 0; x < gw; x++) {
      if (!mask[y * gw + x]) continue
      bottom = Math.max(bottom, y)
      if (y > mouth.y + eyeDist * 0.6) {
        sx += x
        sy += y
        sc++
      }
    }
  const hasBody = sc > mask.length * 0.01
  const body: V = hasBody ? { x: sx / sc, y: sy / sc } : { x: headC.x, y: Math.min(bottom, headC.y + eyeDist) }
  const neck: V = { x: headC.x + (body.x - headC.x) * 0.3, y: mouth.y + Math.max(eyeDist * 0.55, (body.y - mouth.y) * 0.28) }
  const footY = feet.filter(Boolean).reduce((m, f) => Math.max(m, f!.y), body.y)
  const rootP: V = feet[0] || feet[1] ? { x: body.x, y: body.y + (footY - body.y) * 0.22 } : body
  const chestP = lerp(neck, rootP, 0.45)

  // Bo'g'inlar
  const shoulder = hands.map((hp) => (hp ? lerp(chestP, hp, 0.3) : null))
  const elbow = hands.map((hp, i) => (hp ? lerp(shoulder[i]!, hp, 0.5) : null))
  const hip = feet.map((fp) => (fp ? { x: rootP.x + (fp.x - rootP.x) * 0.35, y: rootP.y } : null))
  const knee = feet.map((fp, i) => (fp ? lerp(hip[i]!, fp, 0.5) : null))

  // Suyaklar (model mahalliy koordinatalari: x o'ngga, y tepaga)
  const L = (p: V) => new THREE.Vector3(p.x - gw / 2, gh / 2 - p.y, 0)
  type BoneDef = { name: string; at: V; parent: number; seg: [V, V] }
  const defs: BoneDef[] = [
    { name: 'root', at: rootP, parent: -1, seg: [{ x: rootP.x, y: Math.max(rootP.y, bottom) }, chestP] },
    { name: 'chest', at: chestP, parent: 0, seg: [chestP, neck] },
    { name: 'head', at: neck, parent: 1, seg: [neck, { x: headC.x, y: Math.min(eyeMid.y - eyeDist * 0.4, headC.y) }] },
  ]
  const idx: Record<string, number> = {}
  ;['L', 'R'].forEach((s, i) => {
    if (!hands[i]) return
    idx[`shoulder${s}`] = defs.push({ name: `shoulder${s}`, at: shoulder[i]!, parent: 1, seg: [shoulder[i]!, elbow[i]!] }) - 1
    idx[`elbow${s}`] = defs.push({ name: `elbow${s}`, at: elbow[i]!, parent: idx[`shoulder${s}`], seg: [elbow[i]!, hands[i]!] }) - 1
  })
  ;['L', 'R'].forEach((s, i) => {
    if (!feet[i]) return
    idx[`hip${s}`] = defs.push({ name: `hip${s}`, at: hip[i]!, parent: 0, seg: [hip[i]!, knee[i]!] }) - 1
    idx[`knee${s}`] = defs.push({ name: `knee${s}`, at: knee[i]!, parent: idx[`hip${s}`], seg: [knee[i]!, feet[i]!] }) - 1
  })

  const bones = defs.map((d) => {
    const b = new THREE.Bone()
    b.name = d.name
    return b
  })
  defs.forEach((d, i) => {
    const abs = L(d.at)
    if (d.parent < 0) bones[i].position.copy(abs)
    else bones[i].position.copy(abs.sub(L(defs[d.parent].at)))
    if (d.parent >= 0) bones[d.parent].add(bones[i])
  })

  // Og'irliklar: har bir suyak kesmasigacha geodezik masofa → yumshoq "softmax"
  const fields = defs.map((d) => geodesic(mask, gw, gh, d.seg[0], d.seg[1]))
  const TAU = Math.max(1.6, eyeDist * 0.18)
  const cellW = new Float32Array(gw * gh * 4)
  const cellI = new Uint16Array(gw * gh * 4)
  for (let i = 0; i < gw * gh; i++) {
    if (!mask[i]) continue
    let dmin = Infinity
    for (const f of fields) dmin = Math.min(dmin, f[i])
    const ws = fields.map((f, b) => ({ b, w: Math.exp(-(f[i] - dmin) / TAU) })).sort((p, q) => q.w - p.w).slice(0, 4)
    const sum = ws.reduce((a, x) => a + x.w, 0)
    ws.forEach((x, k) => {
      cellW[i * 4 + k] = x.w / sum
      cellI[i * 4 + k] = x.b
    })
  }

  const pos = geo.getAttribute('position')
  const skinIndex = new Uint16Array(pos.count * 4)
  const skinWeight = new Float32Array(pos.count * 4)
  for (let v = 0; v < pos.count; v++) {
    const vx = pos.getX(v) + gw / 2
    const vy = gh / 2 - pos.getY(v)
    // Tugunga tegib turgan 4 katakdan birinchi ichkisi
    let cell = -1
    for (const [dx, dy] of [[0, 0], [-1, 0], [0, -1], [-1, -1], [1, 0], [0, 1]]) {
      const cx = Math.round(vx) + dx
      const cy = Math.round(vy) + dy
      if (cx >= 0 && cy >= 0 && cx < gw && cy < gh && mask[cy * gw + cx]) {
        cell = cy * gw + cx
        break
      }
    }
    if (cell < 0) {
      skinIndex[v * 4] = 0
      skinWeight[v * 4] = 1
      continue
    }
    for (let k = 0; k < 4; k++) {
      skinIndex[v * 4 + k] = cellI[cell * 4 + k]
      skinWeight[v * 4 + k] = cellW[cell * 4 + k]
    }
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4))
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4))

  const skinned = new THREE.SkinnedMesh(geo, materials)
  skinned.add(bones[0])
  skinned.bind(new THREE.Skeleton(bones))
  group.remove(model.mesh)
  group.add(skinned)
  model.mesh = skinned

  // Dam olish holatidagi yo'nalishlar (qo'llar uchun "0 = yonga" o'lchovida)
  const armRest = (i: number): number => {
    const s = hands[i]
    if (!s) return -1.2
    const dx = (s.x - shoulder[i]!.x) * (i === 0 ? -1 : 1)
    const dy = -(s.y - shoulder[i]!.y)
    return Math.atan2(dy, dx)
  }
  const rest: Pose = {
    root: 0, chest: 0, head: 0, headX: 0, headY: 0,
    armL: armRest(0), armR: armRest(1), elbowL: 0, elbowR: 0,
    legL: 0, legR: 0, kneeL: 0, kneeR: 0,
  }

  const state = Object.fromEntries((Object.keys(rest) as PoseKey[]).map((k) => [k, { v: rest[k], vel: 0 }])) as Record<PoseKey, { v: number; vel: number }>
  const B = (name: string) => bones[defs.findIndex((d) => d.name === name)]

  function update(target: Partial<Pose>, dt: number) {
    // Prujina: tez yetib boradi, biroz o'tib ketib, qaytadi — tirik harakat
    for (const k of Object.keys(state) as PoseKey[]) {
      const goal = target[k] ?? rest[k]
      const st = state[k]
      const kk = STIFF[k]
      const damp = 2 * Math.sqrt(kk) * 0.72
      const err = k.startsWith('arm') ? wrap(goal - st.v) : goal - st.v
      st.vel += (kk * err - damp * st.vel) * dt
      st.v += st.vel * dt
    }
    const v = (k: PoseKey) => state[k].v
    bones[0].rotation.z = v('root')
    B('chest').rotation.z = v('chest')
    const hb = B('head')
    hb.rotation.set(v('headX'), v('headY'), v('head'))
    ;(['L', 'R'] as const).forEach((s, i) => {
      const side = i === 0 ? -1 : 1
      if (hands[i]) {
        // "Yonga=0, tepaga=+" o'lchovidagi farq → suyakning haqiqiy aylanishi
        B(`shoulder${s}`).rotation.z = side * wrap(v(`arm${s}`) - rest[`arm${s}`])
        B(`elbow${s}`).rotation.z = side * v(`elbow${s}`)
      }
      if (feet[i]) {
        B(`hip${s}`).rotation.z = side * v(`leg${s}`)
        B(`knee${s}`).rotation.z = side * v(`knee${s}`)
      }
    })
  }

  return {
    rest,
    hasArms: { L: !!hands[0], R: !!hands[1] },
    hasLegs: { L: !!feet[0], R: !!feet[1] },
    grid: { eyeY: eyeMid.y, mouthY: mouth.y, eyeDist, kneeY: knee[0]?.y ?? knee[1]?.y ?? null, hands },
    update,
    dispose: () => skinned.skeleton.dispose(),
  }
}

// ---------------- Animatsiyalar ----------------
// Har biri vaqtga qarab maqsad pozani qaytaradi; prujinalar uni silliq, "og'irlik bilan" bajaradi.

export type Clip =
  | 'idle' | 'talk' | 'listen' | 'wave' | 'joy' | 'bonk' | 'hurt' | 'tickle' | 'pet'
  | 'dizzy' | 'squeeze' | 'angry' | 'sulk' | 'startle' | 'yawn' | 'sleep' | 'dance'

export interface ClipCtx {
  t: number
  /** klip boshlanganidan beri o'tgan vaqt */
  rt: number
  rest: Pose
  level: number
  look: { x: number; y: number }
  /** gapirish imo-ishorasi (har bo'g'inda yangilanadi) */
  gesture: { armL: number; armR: number; elbowL: number; elbowR: number; nod: number }
}

const UP = Math.PI / 2

export function clipPose(clip: Clip, c: ClipCtx): Partial<Pose> {
  const { t, rt, rest } = c
  const s = Math.sin
  const breathe = s(t * 1.8) * 0.02
  const base: Partial<Pose> = {
    root: s(t * 0.9) * 0.035,
    chest: s(t * 0.9 + 0.6) * 0.03 + breathe,
    head: s(t * 0.7) * 0.05,
    headY: c.look.x * 0.45,
    headX: -c.look.y * 0.2,
    armL: rest.armL + s(t * 1.1) * 0.06,
    armR: rest.armR + s(t * 1.1 + Math.PI) * 0.06,
  }
  switch (clip) {
    case 'idle':
      // Har ~6 soniyada atrofga qarab qo'yadi
      return { ...base, headY: (base.headY ?? 0) + Math.max(0, s(t * 0.55)) ** 6 * 0.6 * Math.sign(s(t * 0.13)) }
    case 'talk':
      return {
        ...base,
        headX: -c.level * 0.22 + c.gesture.nod,
        head: s(t * 2.2) * 0.06,
        chest: (base.chest ?? 0) + c.level * 0.05,
        armL: rest.armL + c.gesture.armL,
        armR: rest.armR + c.gesture.armR,
        elbowL: c.gesture.elbowL,
        elbowR: c.gesture.elbowR,
      }
    case 'listen':
      // Qo'lini qulog'iga qo'yib tinglaydi
      return { ...base, head: 0.22, headY: 0.25, armR: UP * 0.95, elbowR: 2.1, armL: rest.armL }
    case 'wave':
      return { ...base, head: 0.12, armR: 1.25, elbowR: 0.6 + s(rt * 12) * 0.55 }
    case 'joy':
      return {
        root: 0, chest: -0.05, head: s(t * 8) * 0.08, headX: -0.18,
        armL: 1.15 + s(t * 14) * 0.12, armR: 1.15 + s(t * 14 + 1) * 0.12, elbowL: 0.3, elbowR: 0.3,
        kneeL: rt < 0.18 ? 0.7 : 0.15, kneeR: rt < 0.18 ? 0.7 : 0.15, legL: 0.12, legR: 0.12,
      }
    case 'bonk':
      // Boshini ushlab, ichiga tortiladi
      return { root: 0, chest: 0.04, head: 0.12, headX: 0.38, armL: 1.75, armR: 1.75, elbowL: 2.3, elbowR: 2.3, kneeL: 0.45, kneeR: 0.45 }
    case 'hurt':
      // Og'rigan oyog'ini ko'tarib, bir oyoqda sakraydi
      return {
        root: -0.1 + s(rt * 9) * 0.06, chest: 0.08, head: -0.15, headX: -0.2,
        armR: -0.95, elbowR: 0.4, armL: 0.55 + s(rt * 15) * 0.35, elbowL: 0.8,
        legR: 0.45, kneeR: -1.5, legL: 0, kneeL: 0.25 + Math.abs(s(rt * 9)) * 0.3,
      }
    case 'tickle':
      return {
        root: s(t * 17 + 1) * 0.12, chest: s(t * 17) * 0.22, head: s(t * 17 + 2) * 0.18, headX: -0.22,
        armL: -1.15, armR: -1.15, elbowL: -1.9, elbowR: -1.9,
        legL: -0.12, legR: -0.12, kneeL: -0.5, kneeR: -0.5,
      }
    case 'pet':
      return { root: s(t * 2) * 0.05, chest: 0, head: 0.25, headX: -0.08, armL: rest.armL - 0.25, armR: rest.armR - 0.25 }
    case 'dizzy':
      return {
        root: s(t * 5) * 0.18, chest: s(t * 5 + 0.8) * 0.16, head: s(t * 5 + 1.6) * 0.26, headX: s(t * 3) * 0.15,
        armL: rest.armL + 0.4 + s(t * 5) * 0.55, armR: rest.armR + 0.4 + s(t * 5 + 2) * 0.55, elbowL: 0.7, elbowR: 0.7,
        kneeL: 0.3 + s(t * 5) * 0.2, kneeR: 0.3 - s(t * 5) * 0.2,
      }
    case 'squeeze':
      return { root: 0, chest: 0, head: 0, headX: 0.15, armL: -1.3, armR: -1.3, elbowL: -1.6, elbowR: -1.6, kneeL: 0.65, kneeR: 0.65 }
    case 'angry': {
      // Oyoq tepib, mushtlarini silkitadi
      const stomp = s(rt * 9)
      return {
        root: 0, chest: 0.03, head: 0, headX: 0.16,
        armL: -0.35, armR: -0.35, elbowL: 1.6 + s(t * 32) * 0.18, elbowR: 1.6 + s(t * 32 + 1) * 0.18,
        legL: Math.max(0, stomp) * 0.28, kneeL: Math.max(0, stomp) * 0.9,
        legR: Math.max(0, -stomp) * 0.28, kneeR: Math.max(0, -stomp) * 0.9,
      }
    }
    case 'sulk':
      // Qo'llarini qovushtirib, teskari o'girilgan
      return { root: 0, chest: 0, head: -0.1, headX: 0.12, armL: -0.55, armR: -0.55, elbowL: -2.4, elbowR: -2.4 }
    case 'startle':
      return { root: 0, chest: -0.06, head: 0, headX: -0.22, armL: 0.35, armR: 0.35, elbowL: 0.35, elbowR: 0.35, kneeL: 0.2, kneeR: 0.2 }
    case 'yawn': {
      const k = s(Math.min(1, rt / 2) * Math.PI)
      return { ...base, headX: -0.32 * k, chest: -0.08 * k, armL: rest.armL + (UP * 0.95 - rest.armL) * k, armR: rest.armR + (UP * 0.95 - rest.armR) * k, elbowL: 0.3 * k, elbowR: 0.3 * k }
    }
    case 'sleep':
      return { root: 0.05, chest: s(t * 1.2) * 0.03, head: 0.28, headX: 0.38, armL: -1.35, armR: -1.35, elbowL: 0.15, elbowR: 0.15, kneeL: 0.1, kneeR: 0.1 }
    case 'dance': {
      const beat = t * 5
      const move = Math.floor(t / 3.2) % 3
      const bounce = Math.max(0, s(beat * 2)) * 0.5
      const common = { root: s(beat) * 0.15, chest: s(beat + 0.5) * 0.12, head: s(beat + 1) * 0.12, headX: s(beat * 2) * 0.12, kneeL: bounce, kneeR: bounce }
      if (move === 0) return { ...common, armL: s(beat) * 1.2, armR: -s(beat) * 1.2, elbowL: 0.6, elbowR: 0.6 }
      if (move === 1) return { ...common, armL: rest.armL, armR: 1.3 + s(beat * 2) * 0.25, elbowR: 0.2, legL: Math.max(0, s(beat)) * 0.3 }
      return { ...common, armL: 0.3 + s(beat * 2) * 0.5, armR: 0.3 - s(beat * 2) * 0.5, elbowL: 1.2, elbowR: 1.2, legR: Math.max(0, -s(beat)) * 0.3 }
    }
  }
}
