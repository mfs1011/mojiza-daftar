import * as THREE from 'three'

// Sahnadagi kichik effektlar: yulduzchalar (boshga ursa), yuraklar (silasa), ko'z yoshi (og'risa),
// bug' (jahli chiqsa), Z (uxlasa), uchqunlar (kulsa). Hammasi kodda chizilgan, rasm fayli kerak emas.

export type ParticleKind = 'star' | 'heart' | 'tear' | 'steam' | 'z' | 'sparkle'

function makeTexture(kind: ParticleKind): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 96
  const g = c.getContext('2d')!
  g.translate(48, 48)
  g.lineJoin = 'round'
  g.lineWidth = 6
  g.strokeStyle = '#3d2c1e'
  switch (kind) {
    case 'star': {
      g.beginPath()
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 16 : 38
        const a = (i * Math.PI) / 5 - Math.PI / 2
        g.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      g.closePath()
      g.fillStyle = '#ffd166'
      g.fill()
      g.stroke()
      break
    }
    case 'heart':
      g.beginPath()
      g.moveTo(0, 34)
      g.bezierCurveTo(-46, 4, -26, -38, 0, -14)
      g.bezierCurveTo(26, -38, 46, 4, 0, 34)
      g.fillStyle = '#ff5d8f'
      g.fill()
      g.stroke()
      break
    case 'tear':
      g.beginPath()
      g.moveTo(0, -36)
      g.bezierCurveTo(24, -4, 26, 30, 0, 34)
      g.bezierCurveTo(-26, 30, -24, -4, 0, -36)
      g.fillStyle = '#74c0fc'
      g.fill()
      g.stroke()
      break
    case 'steam':
      g.fillStyle = '#ffffffdd'
      for (const [x, y, r] of [[-14, 6, 20], [12, 0, 24], [0, -16, 18]]) {
        g.beginPath()
        g.arc(x, y, r, 0, Math.PI * 2)
        g.fill()
      }
      break
    case 'z':
      g.font = '900 64px system-ui'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillStyle = '#e7f5ff'
      g.strokeText('Z', 0, 0)
      g.fillText('Z', 0, 0)
      break
    case 'sparkle':
      g.beginPath()
      g.moveTo(0, -40)
      g.quadraticCurveTo(6, -6, 40, 0)
      g.quadraticCurveTo(6, 6, 0, 40)
      g.quadraticCurveTo(-6, 6, -40, 0)
      g.quadraticCurveTo(-6, -6, 0, -40)
      g.fillStyle = '#fff3bf'
      g.fill()
      break
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

interface P {
  sprite: THREE.Sprite
  vel: THREE.Vector3
  life: number
  age: number
  /** yulduzchalar bosh atrofida aylanadi */
  orbit?: { c: THREE.Vector3; r: number; a: number; speed: number }
  gravity: number
  size: number
}

export class Particles {
  private textures = new Map<ParticleKind, THREE.CanvasTexture>()
  private list: P[] = []
  private parent: THREE.Object3D

  constructor(parent: THREE.Object3D) {
    this.parent = parent
  }

  private tex(kind: ParticleKind) {
    let t = this.textures.get(kind)
    if (!t) {
      t = makeTexture(kind)
      this.textures.set(kind, t)
    }
    return t
  }

  spawn(kind: ParticleKind, at: THREE.Vector3, o: { vel?: THREE.Vector3; life?: number; size?: number; gravity?: number; orbit?: P['orbit'] } = {}) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex(kind), transparent: true, depthWrite: false }))
    sprite.position.copy(at)
    const size = o.size ?? 0.28
    sprite.scale.setScalar(size)
    sprite.renderOrder = 10
    this.parent.add(sprite)
    this.list.push({ sprite, vel: o.vel ?? new THREE.Vector3(), life: o.life ?? 1.2, age: 0, orbit: o.orbit, gravity: o.gravity ?? 0, size })
  }

  update(dt: number) {
    for (const p of this.list) {
      p.age += dt
      if (p.orbit) {
        p.orbit.a += p.orbit.speed * dt
        p.sprite.position.set(p.orbit.c.x + Math.cos(p.orbit.a) * p.orbit.r, p.orbit.c.y + Math.sin(p.orbit.a * 2) * 0.05, p.orbit.c.z + Math.sin(p.orbit.a) * p.orbit.r * 0.5)
      } else {
        p.vel.y -= p.gravity * dt
        p.sprite.position.addScaledVector(p.vel, dt)
      }
      const k = p.age / p.life
      ;(p.sprite.material as THREE.SpriteMaterial).opacity = k < 0.15 ? k / 0.15 : k > 0.7 ? (1 - k) / 0.3 : 1
      p.sprite.scale.setScalar(p.size * (0.7 + Math.min(1, k * 4) * 0.3))
    }
    for (const p of this.list.filter((x) => x.age >= x.life)) {
      this.parent.remove(p.sprite)
      p.sprite.material.dispose()
    }
    this.list = this.list.filter((x) => x.age < x.life)
  }

  dispose() {
    for (const p of this.list) {
      this.parent.remove(p.sprite)
      p.sprite.material.dispose()
    }
    this.list = []
    this.textures.forEach((t) => t.dispose())
  }
}
