import * as THREE from 'three'
import type { FruitKind } from '../lib/names'

// 🍎 3D mevalar va savatlar — protsedural (fayl kerak emas), "loy" uslubida: yumshoq, mat, ozgina jilo.
// Har model markazi (0,0,0), radiusi `FRUIT_R[kind]` atrofida: fizika shu radius bilan dumalatadi.

export const FRUIT_R: Record<FruitKind, number> = {
  olma: 0.3,
  anor: 0.32,
  orik: 0.24,
  nok: 0.3,
  behi: 0.32,
  gilos: 0.22,
  uzum: 0.3,
  tarvuz: 0.42,
  qovun: 0.38,
  anjir: 0.27,
}

const mat = (color: string, rough = 0.55, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra })

/** Kanvasdan tekstura (tarvuz yo'llari, qovun to'ri, savat to'qimasi) */
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  return t
}

let texCache: Record<string, THREE.Texture> | null = null
function textures() {
  if (texCache) return texCache
  texCache = {
    tarvuz: canvasTex(256, 128, (g) => {
      g.fillStyle = '#2d6a4f'
      g.fillRect(0, 0, 256, 128)
      g.fillStyle = '#74c69d'
      for (let i = 0; i < 12; i++) {
        g.beginPath()
        const x = i * 21.3
        for (let y = 0; y <= 128; y += 8) g.lineTo(x + Math.sin(y * 0.15 + i) * 3, y)
        for (let y = 128; y >= 0; y -= 8) g.lineTo(x + 8 + Math.sin(y * 0.15 + i) * 3, y)
        g.fill()
      }
    }),
    qovun: canvasTex(256, 128, (g) => {
      g.fillStyle = '#e9c46a'
      g.fillRect(0, 0, 256, 128)
      g.strokeStyle = '#c9a227'
      g.lineWidth = 2
      for (let i = 0; i < 60; i++) {
        g.beginPath()
        g.moveTo(Math.random() * 256, Math.random() * 128)
        g.lineTo(Math.random() * 256, Math.random() * 128)
        g.stroke()
      }
    }),
    savat: canvasTex(256, 128, (g) => {
      // To'qilgan savat: navbatma-navbat chiziqlar
      g.fillStyle = '#b07d4f'
      g.fillRect(0, 0, 256, 128)
      for (let y = 0; y < 128; y += 16)
        for (let x = 0; x < 256; x += 32) {
          const odd = (y / 16 + x / 32) % 2
          const grd = g.createLinearGradient(x, y, x, y + 16)
          grd.addColorStop(0, odd ? '#d4a373' : '#c08a57')
          grd.addColorStop(0.5, odd ? '#e9c08a' : '#d4a373')
          grd.addColorStop(1, '#8d5524')
          g.fillStyle = grd
          g.beginPath()
          g.roundRect(x + 1, y + 1, 30, 14, 6)
          g.fill()
        }
    }),
  }
  return texCache
}

/** Lathe: profil nuqtalari (radius, balandlik) bo'yicha aylanma jism */
function lathe(points: [number, number][], m: THREE.Material, seg = 28) {
  return new THREE.Mesh(
    new THREE.LatheGeometry(
      points.map(([x, y]) => new THREE.Vector2(x, y)),
      seg,
    ),
    m,
  )
}

function stem(h = 0.12, color = '#6b4226') {
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, h, 8), mat(color, 0.8))
  s.position.y = h / 2
  return s
}

function leaf(size = 0.16) {
  const l = new THREE.Mesh(new THREE.SphereGeometry(size, 12, 8), mat('#52b788', 0.6))
  l.scale.set(1, 0.18, 0.5)
  return l
}

/** Meva modeli. Har qismi soya tashlaydi */
export function makeFruit(kind: FruitKind): THREE.Group {
  const g = new THREE.Group()
  const r = FRUIT_R[kind]
  const tex = textures()
  switch (kind) {
    case 'olma': {
      // Olma: ustida chuqurcha, pasti biroz torroq
      const body = lathe(
        [
          [0.001, -0.92],
          [0.42, -0.86],
          [0.82, -0.5],
          [0.98, 0],
          [0.9, 0.5],
          [0.55, 0.82],
          [0.18, 0.74],
          [0.001, 0.6],
        ].map(([x, y]) => [x * r, y * r] as [number, number]),
        mat('#d62828', 0.42),
      )
      g.add(body)
      const s = stem()
      s.position.y = r * 0.6
      g.add(s)
      const l = leaf()
      l.position.set(0.08, r * 0.6 + 0.09, 0)
      l.rotation.z = -0.6
      g.add(l)
      break
    }
    case 'anor': {
      const body = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), mat('#9d0208', 0.5))
      body.scale.y = 0.92
      g.add(body)
      // Toj: kichik silindr + tishchalar
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.22, r * 0.18, r * 0.25, 10), mat('#7b2d26', 0.7))
      crown.position.y = r * 0.95
      g.add(crown)
      for (let i = 0; i < 6; i++) {
        const t = new THREE.Mesh(new THREE.ConeGeometry(r * 0.07, r * 0.22, 6), mat('#7b2d26', 0.7))
        const a = (i / 6) * Math.PI * 2
        t.position.set(Math.cos(a) * r * 0.2, r * 1.15, Math.sin(a) * r * 0.2)
        g.add(t)
      }
      break
    }
    case 'orik': {
      const body = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), mat('#f77f00', 0.5))
      body.scale.set(1, 0.95, 0.9)
      g.add(body)
      const s = stem(0.08)
      s.position.y = r * 0.9
      g.add(s)
      break
    }
    case 'nok': {
      const body = lathe(
        [
          [0.001, -1],
          [0.6, -0.92],
          [0.95, -0.55],
          [0.9, -0.05],
          [0.55, 0.35],
          [0.42, 0.75],
          [0.25, 1.05],
          [0.001, 1.12],
        ].map(([x, y]) => [x * r, y * r * 0.95] as [number, number]),
        mat('#b5c936', 0.5),
      )
      g.add(body)
      const s = stem(0.14)
      s.position.y = r * 1.05
      g.add(s)
      break
    }
    case 'behi': {
      const body = lathe(
        [
          [0.001, -0.95],
          [0.55, -0.88],
          [0.95, -0.4],
          [1, 0.1],
          [0.8, 0.6],
          [0.45, 0.9],
          [0.001, 0.98],
        ].map(([x, y]) => [x * r, y * r] as [number, number]),
        mat('#ffd166', 0.6),
        14,
      )
      g.add(body)
      const l = leaf(0.13)
      l.position.set(0.06, r * 0.98, 0)
      l.rotation.z = -0.4
      g.add(l)
      break
    }
    case 'gilos': {
      // Ikkita gilos bitta bandda
      for (const dx of [-0.11, 0.11]) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(r * 0.55, 18, 14), mat('#a4161a', 0.35))
        c.position.set(dx, -r * 0.35, 0)
        g.add(c)
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, r * 1.4, 6), mat('#386641', 0.8))
        st.position.set(dx / 2, r * 0.3, 0)
        st.rotation.z = dx > 0 ? -0.35 : 0.35
        g.add(st)
      }
      break
    }
    case 'uzum': {
      // Shingil: pastga torayib boradigan donalar
      const m = mat('#6a4c93', 0.35)
      const rows = [5, 4, 3, 2, 1]
      rows.forEach((n, row) => {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + row
          const rr = n === 1 ? 0 : r * 0.12 * n
          const d = new THREE.Mesh(new THREE.SphereGeometry(r * 0.24, 12, 10), m)
          d.position.set(Math.cos(a) * rr, r * 0.55 - row * r * 0.32, Math.sin(a) * rr)
          g.add(d)
        }
      })
      const s = stem(0.12, '#6b4226')
      s.position.y = r * 0.7
      g.add(s)
      break
    }
    case 'tarvuz': {
      const body = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 22), mat('#ffffff', 0.45, { map: tex.tarvuz }))
      body.scale.set(1.15, 0.95, 1)
      g.add(body)
      break
    }
    case 'qovun': {
      const body = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 22), mat('#ffffff', 0.7, { map: tex.qovun }))
      body.scale.set(1.25, 0.9, 0.95)
      g.add(body)
      break
    }
    case 'anjir': {
      const body = lathe(
        [
          [0.001, -0.95],
          [0.7, -0.75],
          [0.95, -0.25],
          [0.8, 0.3],
          [0.4, 0.75],
          [0.12, 1],
          [0.001, 1.05],
        ].map(([x, y]) => [x * r, y * r] as [number, number]),
        mat('#5a189a', 0.45),
      )
      g.add(body)
      break
    }
  }
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return g
}

/** To'qilgan savat: ochiq idish, qalin chekka, ruchka; `ribbon` — rang raundida savatdagi lenta */
export function makeBasket(radius: number, ribbon?: string): THREE.Group {
  const g = new THREE.Group()
  const tex = textures().savat.clone()
  tex.repeat.set(3, 1)
  tex.needsUpdate = true
  const h = radius * 0.75
  const wall = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [radius * 0.72, 0],
        [radius * 0.86, h * 0.35],
        [radius, h],
        [radius * 0.92, h],
        [radius * 0.8, h * 0.35],
        [radius * 0.66, 0.04],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      40,
    ),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, side: THREE.DoubleSide }),
  )
  g.add(wall)
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.7, 32), new THREE.MeshStandardMaterial({ color: '#8d5524', roughness: 0.9 }))
  bottom.rotation.x = -Math.PI / 2
  bottom.position.y = 0.05
  g.add(bottom)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.97, radius * 0.07, 10, 40), new THREE.MeshStandardMaterial({ color: '#a0693a', roughness: 0.8 }))
  rim.rotation.x = Math.PI / 2
  rim.position.y = h
  g.add(rim)
  const handle = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.85, radius * 0.06, 8, 30, Math.PI), new THREE.MeshStandardMaterial({ color: '#a0693a', roughness: 0.8 }))
  handle.position.y = h
  handle.rotation.y = Math.PI / 2
  g.add(handle)
  if (ribbon) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.93, radius * 0.08, 8, 40), new THREE.MeshStandardMaterial({ color: ribbon, roughness: 0.5 }))
    band.rotation.x = Math.PI / 2
    band.position.y = h * 0.55
    band.scale.set(1, 1, 1.6)
    g.add(band)
  }
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  g.userData.height = h
  return g
}
