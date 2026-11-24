import * as THREE from 'three'
import type { GardenAssets } from './realAssets'

/** Haqiqiy foto-teksturalar (Poly Haven) yuklangan bo'lsa — ular ishlatiladi, aks holda kanvas chizmalari */
let A: GardenAssets | null = null
export function setSceneryAssets(a: GardenAssets | null) {
  A = a
}

// 🌳 Bog' manzarasi: haqiqiyroq daraxt (egri tana, po'stloq, minglab barg), o't-o'lan va gullar,
// fonda teraklar, mevali daraxtlar, uzoqdagi qorli tog'lar, suzib yurgan bulutlar.
// Hammasi kodda chiziladi (rasm fayli kerak emas) va InstancedMesh bilan — telefonlarda ham tez.

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Sharni "buta" shakliga keltirish: bo'rtiq shovqin */
function lumpy(geo: THREE.BufferGeometry, amp: number, seed = Math.random() * 10) {
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n =
      1 + amp * (Math.sin(v.x * 5.1 + seed) * Math.sin(v.y * 4.3 + seed * 1.7) * Math.sin(v.z * 4.7 + seed * 0.6) + 0.5 * Math.sin(v.x * 11 + v.z * 9 + seed))
    v.multiplyScalar(n)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

// ---------- Osmon va bulutlar ----------

export function makeSky(scene: THREE.Scene) {
  if (A?.skyBg) {
    // Haqiqiy HDRI osmon (bulutlari bilan) — fon; yorug'lik Garden3D da environment sifatida
    scene.background = A.skyBg
    scene.backgroundIntensity = 1
    scene.fog = new THREE.Fog('#c9d6d2', 20, 95)
    return () => {}
  }
  scene.background = canvasTex(2, 512, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 512)
    grd.addColorStop(0, '#5fa8d3')
    grd.addColorStop(0.45, '#a9d6ef')
    grd.addColorStop(0.75, '#dff0f7')
    grd.addColorStop(1, '#fbf1d9')
    g.fillStyle = grd
    g.fillRect(0, 0, 2, 512)
  })
  scene.fog = new THREE.Fog('#dcebe6', 22, 62)

  const cloudTex = canvasTex(256, 128, (g) => {
    for (let i = 0; i < 14; i++) {
      const x = 40 + Math.random() * 176
      const y = 60 + Math.random() * 30 - (Math.abs(x - 128) / 128) * 20
      const r = 22 + Math.random() * 26
      const grd = g.createRadialGradient(x, y, 0, x, y, r)
      grd.addColorStop(0, 'rgba(255,255,255,0.95)')
      grd.addColorStop(0.6, 'rgba(255,255,255,0.7)')
      grd.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grd
      g.beginPath()
      g.arc(x, y, r, 0, 7)
      g.fill()
    }
  })
  const clouds: THREE.Sprite[] = []
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: rnd(0.75, 0.95) }))
    const k = rnd(7, 12)
    s.scale.set(k, k / 2, 1)
    s.position.set(rnd(-26, 26), rnd(11, 16), rnd(-40, -30))
    scene.add(s)
    clouds.push(s)
  }
  return (dt: number) => {
    for (const c of clouds) {
      c.position.x += dt * 0.35
      if (c.position.x > 32) c.position.x = -32
    }
  }
}

// ---------- Yer: o't teksturasi, o't tolalari, gullar ----------

export function makeGround(scene: THREE.Scene) {
  const tex = canvasTex(512, 512, (g) => {
    g.fillStyle = '#86b765'
    g.fillRect(0, 0, 512, 512)
    // Katta dog'lar (o't qalinligi turlicha)
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const r = 30 + Math.random() * 70
      const grd = g.createRadialGradient(x, y, 0, x, y, r)
      const c = ['rgba(120,170,80,0.5)', 'rgba(160,200,110,0.45)', 'rgba(100,150,70,0.45)'][i % 3]
      grd.addColorStop(0, c)
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = grd
      // Chetidan oshgani qarama-qarshi chetga o'tadi — takrorlanganda chok ko'rinmasin
      for (const dx of [-512, 0, 512])
        for (const dy of [-512, 0, 512]) {
          g.save()
          g.translate(dx, dy)
          g.fillRect(x - r, y - r, r * 2, r * 2)
          g.restore()
        }
    }
    // Mayda o't chiziqlari
    for (let i = 0; i < 9000; i++) {
      g.strokeStyle = ['#6f9f52', '#a6d080', '#7fae5e', '#b6d98f', '#5e8d45'][i % 5]
      g.globalAlpha = 0.5
      g.lineWidth = 1
      const x = Math.random() * 512
      const y = Math.random() * 512
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + rnd(-2, 2), y - rnd(3, 7))
      g.stroke()
    }
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(7, 4)
  tex.anisotropy = 4
  const groundMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1 })
  if (A?.tex.grass) {
    // Fotoskanerlangan o'tloq: rang, relyef (normal) va g'adir-budurlik xaritalari
    const rep = (t: THREE.Texture) => {
      const c = t.clone()
      c.repeat.set(80, 60)
      c.needsUpdate = true
      return c
    }
    groundMat.map = rep(A.tex.grass)
    if (A.tex.grassNor) {
      groundMat.normalMap = rep(A.tex.grassNor)
      groundMat.normalScale.set(1.2, 1.2)
    }
    if (A.tex.grassArm) groundMat.roughnessMap = rep(A.tex.grassArm)
    groundMat.color.set('#c9d8a8')
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 320), groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // O't tolalari: pastdan to'q, uchi och — vertex rangi bilan
  const blade = new THREE.BufferGeometry()
  blade.setAttribute('position', new THREE.Float32BufferAttribute([-0.025, 0, 0, 0.025, 0, 0, -0.012, 0.5, 0.01, 0.012, 0.5, 0.01, 0, 1, 0.04], 3))
  blade.setAttribute('color', new THREE.Float32BufferAttribute([0.32, 0.45, 0.22, 0.32, 0.45, 0.22, 0.55, 0.72, 0.36, 0.55, 0.72, 0.36, 0.78, 0.9, 0.5], 3))
  blade.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4])
  blade.computeVertexNormals()
  const bladeMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.9 })
  const N = 7000
  const blades = new THREE.InstancedMesh(blade, bladeMat, N)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const col = new THREE.Color()
  for (let i = 0; i < N; i++) {
    const x = rnd(-12, 12)
    const z = rnd(-3.2, 9)
    // O'yin maydonida (mevalar dumalaydigan joy) o't kalta: mevalarni yashirmasin
    const play = x > -6 && x < 5.5 && z > -0.6 && z < 3.2
    const h = play ? rnd(0.06, 0.13) : rnd(0.12, 0.3)
    e.set(rnd(-0.25, 0.25), rnd(0, Math.PI), rnd(-0.25, 0.25))
    q.setFromEuler(e)
    m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(rnd(0.8, 1.4), h, 1))
    blades.setMatrixAt(i, m)
    blades.setColorAt(i, A?.tex.grass ? col.setRGB(rnd(0.5, 0.68), rnd(0.62, 0.78), rnd(0.32, 0.42)) : col.setHSL(rnd(0.24, 0.3), rnd(0.45, 0.6), rnd(0.75, 1.0)))
  }
  blades.receiveShadow = true
  scene.add(blades)

  // Gullar: oq moychechak, sariq qoqio't, pushti beda
  const flowerGeo = new THREE.SphereGeometry(0.045, 8, 6)
  const flowers = new THREE.InstancedMesh(flowerGeo, new THREE.MeshStandardMaterial({ roughness: 0.6 }), 260)
  for (let i = 0; i < 260; i++) {
    const x = rnd(-12, 12)
    let z = rnd(-3.2, 9)
    if (x > -6 && x < 5.5 && z > -0.6 && z < 3.2) z += 3.6
    m.compose(new THREE.Vector3(x, rnd(0.08, 0.2), z), q.identity(), new THREE.Vector3(1, 0.6, 1).multiplyScalar(rnd(0.8, 1.5)))
    flowers.setMatrixAt(i, m)
    flowers.setColorAt(i, col.set(['#ffffff', '#ffe66d', '#ffafcc', '#ffffff', '#cdb4db'][i % 5]))
  }
  scene.add(flowers)
}

// ---------- Fon: tepaliklar, tog'lar, teraklar, daraxtlar, panjara ----------

export function makeBackdrop(scene: THREE.Scene) {
  const mat = (color: string, rough = 0.95) => new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: false })

  // Uzoqdagi qorli tog'lar (O'zbekiston manzarasi) — haqiqiy osmonda ufq bor, chizma tog' kerak emas
  const snow = mat('#f1f5f9', 0.8)
  ;(A?.skyBg
    ? []
    : [
        [-24, -48, 9, 11, '#8aa1b1'],
        [-10, -52, 12, 14, '#7d94a6'],
        [6, -50, 10, 12, '#8aa1b1'],
        [22, -47, 11, 10, '#93a8b6'],
      ]
  ).forEach(([x, z, r, h, c]) => {
    const g = lumpy(new THREE.ConeGeometry(r as number, h as number, 9, 4), 0.06)
    const mtn = new THREE.Mesh(g, mat(c as string))
    mtn.position.set(x as number, (h as number) / 2 - 1, z as number)
    scene.add(mtn)
    const cap = new THREE.Mesh(new THREE.ConeGeometry((r as number) * 0.32, (h as number) * 0.32, 9), snow)
    cap.position.set(x as number, (h as number) - 1 - (h as number) * 0.16 + 0.05, z as number)
    scene.add(cap)
  })

  // Tepaliklar (haqiqiy osmonda — kerak emas: ufqni tuman beradi)
  ;(A?.skyBg ? [] : [
    [-12, -20, 10, '#9cc26e'],
    [3, -24, 13, '#a9c98a'],
    [16, -19, 9, '#9cc26e'],
    [-3, -15, 7, '#8fba63'],
  ]).forEach(([x, z, r, c]) => {
    const h = new THREE.Mesh(lumpy(new THREE.SphereGeometry(r as number, 40, 20), 0.03), mat(c as string))
    h.scale.y = 0.32
    h.position.set(x as number, 0, z as number)
    h.receiveShadow = true
    scene.add(h)
  })

  // Teraklar qatori (bog' chetida — o'zbek qishlog'ining belgisi)
  const poplarGeo = lumpy(new THREE.SphereGeometry(1, 24, 18), 0.09)
  const poplarMats = (A?.tex.leaf ? ['#2c4826', '#304f29', '#284222'] : ['#3f7d4e', '#4c8b58', '#356b43']).map((c) => mat(c, 0.85))
  const trunkMat = mat('#6b4a2f')
  for (let i = 0; i < 12; i++) {
    const x = -1 + i * 1.25 + rnd(-0.15, 0.15)
    const z = -9.5 - (i % 2) * 0.7
    const h = rnd(1.7, 2.2)
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.2, 8), trunkMat)
    t.position.set(x, 0.6, z)
    scene.add(t)
    const p = new THREE.Mesh(poplarGeo, poplarMats[i % 3])
    p.scale.set(0.46, h, 0.46)
    p.position.set(x, 0.9 + h, z)
    p.castShadow = true
    scene.add(p)
    // Terak barglari: to'q tana ustida haqiqiy barglar qatlami
    if (A?.tex.leaf) {
      const cloud = leafCloud([[0, 0, 0, 0.5, h * 1.02, 0.5]], 420, 0.26, '#7fa36a')
      cloud.position.copy(p.position)
      scene.add(cloud)
    }
  }

  // Orqadagi mevali daraxtlar (dumaloq toj)
  const bushGeo = lumpy(new THREE.SphereGeometry(1, 28, 18), 0.08)
  const bushMats = (A?.tex.leaf ? ['#2e4a27', '#33522b', '#2a4424'] : ['#5b9a52', '#6aa85d', '#4e8a49']).map((c) => mat(c, 0.85))
  ;[
    [-9.5, -9, 1.6],
    [-6.5, -11, 1.3],
    [16, -10, 1.5],
    [12.5, -12, 1.2],
    [-12, -6, 1.4],
  ].forEach(([x, z, s]) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 1.6 * s, 8), trunkMat)
    t.position.set(x, 0.8 * s, z)
    scene.add(t)
    for (let k = 0; k < 4; k++) {
      const b = new THREE.Mesh(bushGeo, bushMats[k % 3])
      b.scale.setScalar(s * rnd(0.65, 0.9))
      b.position.set(x + rnd(-0.7, 0.7) * s, 1.9 * s + rnd(-0.2, 0.5) * s, z + rnd(-0.4, 0.4) * s)
      b.castShadow = true
      scene.add(b)
      if (A?.tex.leaf) {
        const rr = b.scale.x * 1.02
        const cloud = leafCloud([[0, 0, 0, rr, rr, rr]], 420, 0.36, '#86a86f')
        cloud.position.copy(b.position)
        scene.add(cloud)
      }
    }
  })

  // Yog'och panjara: uchi o'tkir taxtachalar
  const shape = new THREE.Shape()
  shape.moveTo(-0.08, 0)
  shape.lineTo(0.08, 0)
  shape.lineTo(0.08, 0.95)
  shape.lineTo(0, 1.06)
  shape.lineTo(-0.08, 0.95)
  shape.closePath()
  const picketGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 })
  const fenceMat = mat('#c69563', 0.85)
  if (A?.tex.wood) {
    // Eskirgan yog'och taxtalar fotosi
    fenceMat.map = A.tex.wood
    fenceMat.color.set('#ffffff')
    if (A.tex.woodNor) fenceMat.normalMap = A.tex.woodNor
  }
  const pickets = new THREE.InstancedMesh(picketGeo, fenceMat, 30)
  const m = new THREE.Matrix4()
  for (let i = 0; i < 30; i++) {
    m.compose(
      new THREE.Vector3(-10 + i * 0.72, 0, -3.6),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rnd(-0.03, 0.03))),
      new THREE.Vector3(1, rnd(0.95, 1.05), 1),
    )
    pickets.setMatrixAt(i, m)
  }
  pickets.castShadow = true
  scene.add(pickets)
  for (const y of [0.32, 0.72]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(21.6, 0.09, 0.05), mat('#a87a4c', 0.85))
    rail.position.set(0.5, y, -3.63)
    rail.castShadow = true
    scene.add(rail)
  }
}

// ---------- Asosiy mevali daraxt ----------

function barkTexture() {
  return canvasTex(256, 512, (g) => {
    g.fillStyle = '#7a4f2c'
    g.fillRect(0, 0, 256, 512)
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * 256
      g.strokeStyle = ['#5e3a1f', '#8f6238', '#6b4426', '#a0744a'][i % 4]
      g.globalAlpha = 0.55
      g.lineWidth = rnd(2, 6)
      g.beginPath()
      g.moveTo(x, 0)
      let y = 0
      let xx = x
      while (y < 512) {
        y += rnd(20, 60)
        xx += rnd(-6, 6)
        g.lineTo(xx, y)
      }
      g.stroke()
    }
    // Ko'ndalang yoriqlar
    for (let i = 0; i < 120; i++) {
      g.strokeStyle = '#4a2c15'
      g.globalAlpha = 0.4
      g.lineWidth = 1.5
      const x = Math.random() * 256
      const y = Math.random() * 512
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + rnd(6, 18), y + rnd(-3, 3))
      g.stroke()
    }
  })
}

function leafTexture() {
  return canvasTex(128, 128, (g) => {
    g.translate(64, 64)
    g.rotate(-0.3)
    const grd = g.createLinearGradient(-40, 0, 40, 0)
    grd.addColorStop(0, '#3f7f3a')
    grd.addColorStop(0.5, '#6fb35a')
    grd.addColorStop(1, '#3a7a36')
    g.fillStyle = grd
    g.beginPath()
    g.moveTo(0, -58)
    g.bezierCurveTo(40, -36, 40, 30, 0, 58)
    g.bezierCurveTo(-40, 30, -40, -36, 0, -58)
    g.fill()
    g.strokeStyle = '#2f6a2b'
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(0, -50)
    g.lineTo(0, 54)
    g.stroke()
    g.lineWidth = 1.5
    for (let k = -36; k < 44; k += 12) {
      g.beginPath()
      g.moveTo(0, k)
      g.lineTo(22, k - 12)
      g.moveTo(0, k)
      g.lineTo(-22, k - 12)
      g.stroke()
    }
  })
}

export interface TreeParts {
  tree: THREE.Group
  crown: THREE.Group
  /** Bosiladigan qismlar (silkitish uchun) */
  hit: THREE.Object3D[]
  /** Toj yuzasining old tomondagi z koordinatasi (x,y nuqtada) — mevalar barg ustida osilsin */
  frontZ: (x: number, y: number) => number
}

export function makeTree(crownY: number): TreeParts {
  const tree = new THREE.Group()
  const barkTex = barkTexture()
  barkTex.wrapS = barkTex.wrapT = THREE.RepeatWrapping
  barkTex.repeat.set(2, 1)
  const bark = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.95, bumpMap: barkTex, bumpScale: 0.04 })
  if (A?.tex.bark) {
    // Haqiqiy po'stloq fotosi va relyefi
    const rep = (t: THREE.Texture) => {
      const c = t.clone()
      c.repeat.set(1.5, 2.5)
      c.needsUpdate = true
      return c
    }
    bark.map = rep(A.tex.bark)
    bark.bumpMap = null
    if (A.tex.barkNor) {
      bark.normalMap = rep(A.tex.barkNor)
      bark.normalScale.set(1.5, 1.5)
    }
  }

  // Tana: pastda kengayadi (ildiz), biroz egilgan
  const trunkGeo = new THREE.CylinderGeometry(0.24, 0.42, crownY + 0.3, 20, 24)
  const tp = trunkGeo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < tp.count; i++) {
    v.fromBufferAttribute(tp, i)
    const t = (v.y + (crownY + 0.3) / 2) / (crownY + 0.3)
    const flare = 1 + Math.max(0, 0.25 - t) * 2.4 * (1 + 0.35 * Math.sin(Math.atan2(v.z, v.x) * 5))
    v.x *= flare
    v.z *= flare
    v.x += Math.sin(t * 2.6) * 0.14
    tp.setXYZ(i, v.x, v.y, v.z)
  }
  trunkGeo.computeVertexNormals()
  const trunk = new THREE.Mesh(trunkGeo, bark)
  trunk.position.y = (crownY + 0.3) / 2
  trunk.castShadow = true
  trunk.receiveShadow = true
  tree.add(trunk)

  // Asosiy shoxlar: tanadan tojga
  const branchDirs: [number, number, number, number][] = [
    [-1, 0.9, 0.2, 1.5],
    [1, 0.85, 0.1, 1.5],
    [-0.4, 1.2, -0.5, 1.3],
    [0.5, 1.1, 0.5, 1.2],
    [0.1, 1.4, 0.1, 1.2],
  ]
  for (const [x, y, z, len] of branchDirs) {
    const dir = new THREE.Vector3(x, y, z).normalize()
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.15, len, 10), bark)
    b.position.set(0, crownY - 0.2, 0).addScaledVector(dir, len / 2)
    b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    b.castShadow = true
    tree.add(b)
  }

  // Toj: ichida to'q "to'ldiruvchi" bo'laklar (orasidan osmon ko'rinmasin) + ustida minglab barglar
  const crown = new THREE.Group()
  crown.position.y = crownY
  tree.add(crown)
  const blobs: [number, number, number, number][] = [
    [0, 0.9, 0, 1.25],
    [-1.15, 0.35, 0.2, 0.95],
    [1.15, 0.35, 0.2, 0.95],
    [-0.6, 1.55, -0.2, 0.85],
    [0.65, 1.5, -0.1, 0.85],
    [0, 0.2, 0.7, 0.9],
    [-1.6, -0.15, -0.3, 0.7],
    [1.6, -0.15, -0.3, 0.7],
    [0, 1.9, 0.3, 0.7],
    [-0.75, 0.6, -0.8, 0.9],
    [0.8, 0.6, -0.8, 0.9],
  ]
  const fillGeo = lumpy(new THREE.SphereGeometry(1, 32, 22), 0.06)
  const fillMat = new THREE.MeshStandardMaterial({ color: A?.tex.leaf ? '#16240f' : '#2f6b35', roughness: 0.9 })
  const hit: THREE.Object3D[] = [trunk]
  for (const [x, y, z, r] of blobs) {
    const m = new THREE.Mesh(fillGeo, fillMat)
    m.position.set(x, y, z)
    m.scale.setScalar(r * 0.86)
    m.castShadow = true
    m.receiveShadow = true
    crown.add(m)
    hit.push(m)
  }

  const leaves = leafCloud(
    blobs.map(([x, y, z, r]) => [x, y, z, r, r, r]),
    230,
    0.34,
  )
  leaves.castShadow = true
  leaves.receiveShadow = true
  crown.add(leaves)

  const frontZ = (fx: number, fy: number) => {
    let best = 0
    for (const [x, y, z, r] of blobs) {
      const d2 = r * r * 1.04 - (fx - x) ** 2 - (fy - y) ** 2
      if (d2 > 0) best = Math.max(best, z + Math.sqrt(d2))
    }
    return best
  }

  return { tree, crown, hit, frontZ }
}

// ---------- Barglar buluti (asosiy daraxt, teraklar, fondagi daraxtlar) ----------

/**
 * Barg kartochkalari ikki tomonlama: orqa tomoni ko'ringanda three.js normalni teskari qiladi va barg qorayadi.
 * Toj bitta hajmdek yoritilishi uchun bu teskari qilishni bekor qilamiz (normal — doim tojdan tashqariga).
 */
function foliageShading(m: THREE.MeshStandardMaterial) {
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <normal_fragment_begin>',
      '#include <normal_fragment_begin>\n#ifdef DOUBLE_SIDED\nnormal *= faceDirection;\n#endif',
    )
  }
  m.customProgramCacheKey = () => 'foliage'
}

let leafMatCache: { mat: THREE.MeshStandardMaterial; depth: THREE.MeshDepthMaterial; card: boolean } | null = null
function leafMaterial() {
  if (leafMatCache) return leafMatCache
  const img = A?.tex.leaf?.image as (CanvasImageSource & { width: number; height: number }) | undefined
  if (img && img.width) {
    // Haqiqiy barg shoxchalari (foto atlasning chap qismi): qora fon shaffof qilinadi
    const W = img.width
    const H = img.height
    const card = canvasTex(256, 512, (g) => {
      g.drawImage(img, 0, 0, W * 0.44, H, 0, 0, 256, 512)
      const d = g.getImageData(0, 0, 256, 512)
      for (let i = 0; i < d.data.length; i += 4) {
        const m = Math.max(d.data[i], d.data[i + 1], d.data[i + 2])
        d.data[i + 3] = m < 22 ? 0 : 255
      }
      g.putImageData(d, 0, 0)
    })
    const mat = new THREE.MeshStandardMaterial({ map: card, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.65 })
foliageShading(mat)
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: card, alphaTest: 0.5 })
    leafMatCache = { mat, depth, card: true }
    return leafMatCache
  }
  const silhouette = leafTexture()
  const mat = new THREE.MeshStandardMaterial({ map: silhouette, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7 })
  foliageShading(mat)
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: silhouette, alphaTest: 0.5 })
  leafMatCache = { mat, depth, card: false }
  return leafMatCache
}

/** Ellipsoidlar yuzasiga tarqatilgan barglar (InstancedMesh). blob: [x, y, z, rx, ry, rz] */
function leafCloud(blobs: number[][], perBlob: number, size: number, tint = '#ffffff') {
  const { mat, depth, card } = leafMaterial()
  // Foto kartochka — bitta shoxchada o'nlab barg: kartochkalar kattaroq, soni kamroq
  if (card) {
    perBlob = Math.round(perBlob * 0.62)
    tint = '#ffffff'
  }
  const geo = card ? new THREE.PlaneGeometry(size * 1.25, size * 2.5) : new THREE.PlaneGeometry(size, size)
  const leaves = new THREE.InstancedMesh(geo, mat, blobs.length * perBlob)
  leaves.customDepthMaterial = depth
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const n = new THREE.Vector3()
  const p = new THREE.Vector3()
  const col = new THREE.Color()
  const base = new THREE.Color(tint)
  const Z = new THREE.Vector3(0, 0, 1)
  const X = new THREE.Vector3(1, 0, 0)
  let k = 0
  for (const [x, y, z, rx, ry, rz] of blobs) {
    for (let i = 0; i < perBlob; i++) {
      n.set(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize()
      const d = rnd(0.86, 1.02)
      p.set(x + n.x * rx * d, y + n.y * ry * d, z + n.z * rz * d)
      q.setFromUnitVectors(Z, n).multiply(new THREE.Quaternion().setFromAxisAngle(Z, rnd(0, Math.PI * 2)))
      q.multiply(new THREE.Quaternion().setFromAxisAngle(X, rnd(-0.3, 0.3)))
      m4.compose(p, q, new THREE.Vector3(1, 1, 1).multiplyScalar(rnd(0.75, 1.2)))
      leaves.setMatrixAt(k, m4)
      // Soya (ambient occlusion): pastki va ichkaridagi barglar to'qroq, tepadagilar quyoshda ochroq
      const ao = (0.55 + 0.45 * (n.y * 0.5 + 0.5)) * (0.75 + (0.25 * (d - 0.86)) / 0.16)
      leaves.setColorAt(k, col.copy(base).multiplyScalar(ao * rnd(0.92, 1.06)).multiply(new THREE.Color(rnd(0.94, 1.04), 1, rnd(0.9, 1))))
      k++
    }
  }
  leaves.castShadow = true
  leaves.receiveShadow = true
  return leaves
}
