import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import type { FruitKind } from '../lib/names'

// 🌍 Bog' uchun realistik assetlar (Poly Haven, CC0 — scripts/garden-fetch.mjs):
// skanerlangan olma, nok, anor va to'qilgan savat; o't, po'stloq, barg, yog'och foto-teksturalari;
// HDRI osmon (fon + yorug'lik). Bir marta yuklanadi va keshlanadi.

const BASE = `${import.meta.env.BASE_URL}assets/garden/`

export interface GardenAssets {
  fruits: Partial<Record<FruitKind, THREE.Object3D>>
  basket: THREE.Object3D | null
  tex: Record<'grass' | 'grassNor' | 'grassArm' | 'bark' | 'barkNor' | 'leaf' | 'leafNor' | 'wood' | 'woodNor', THREE.Texture | null>
  skyHdr: THREE.DataTexture | null
  skyBg: THREE.Texture | null
}

const MODEL: Partial<Record<FruitKind, string>> = {
  olma: 'food_apple_01',
  anor: 'food_pomegranate_01',
}

let cache: Promise<GardenAssets> | null = null

export function loadGardenAssets(): Promise<GardenAssets> {
  cache ??= (async () => {
    const gltf = new GLTFLoader()
    const texLoader = new THREE.TextureLoader()
    const model = (id: string) =>
      gltf
        .loadAsync(`${BASE}${id}/${id}.gltf`)
        .then((g) => g.scene as THREE.Object3D)
        .catch(() => null)
    const tex = (f: string, srgb: boolean) =>
      texLoader
        .loadAsync(`${BASE}tex/${f}.jpg`)
        .then((t) => {
          if (srgb) t.colorSpace = THREE.SRGBColorSpace
          t.wrapS = t.wrapT = THREE.RepeatWrapping
          t.anisotropy = 8
          return t
        })
        .catch(() => null)

    const kinds = Object.keys(MODEL) as FruitKind[]
    const [fruitModels, basket, grass, grassNor, grassArm, bark, barkNor, leaf, leafNor, wood, woodNor, skyHdr, skyBg] = await Promise.all([
      Promise.all(kinds.map((k) => model(MODEL[k]!))),
      model('wicker_basket_01'),
      tex('grass_diff', true),
      tex('grass_nor_gl', false),
      tex('grass_arm', false),
      tex('bark_diff', true),
      tex('bark_nor_gl', false),
      tex('leaf_diff', true),
      tex('leaf_nor_gl', false),
      tex('wood_diff', true),
      tex('wood_nor_gl', false),
      new RGBELoader().loadAsync(`${BASE}sky/sky_1k.hdr`).catch(() => null),
      texLoader.loadAsync(`${BASE}sky/sky_bg.jpg`).catch(() => null),
    ])
    if (skyBg) {
      skyBg.colorSpace = THREE.SRGBColorSpace
      skyBg.mapping = THREE.EquirectangularReflectionMapping
    }
    if (skyHdr) skyHdr.mapping = THREE.EquirectangularReflectionMapping
    const fruits: GardenAssets['fruits'] = {}
    kinds.forEach((k, i) => {
      const m = fruitModels[i]
      if (m) fruits[k] = m
    })
    return { fruits, basket, tex: { grass, grassNor, grassArm, bark, barkNor, leaf, leafNor, wood, woodNor }, skyHdr, skyBg }
  })()
  return cache
}

/** Modelni markazlab, chegaralovchi sferasi radiusini `r` ga keltiradi */
export function normalized(src: THREE.Object3D, r: number): THREE.Group {
  const inner = src.clone(true)
  const box = new THREE.Box3().setFromObject(inner)
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  const k = r / sphere.radius
  inner.scale.setScalar(k)
  inner.position.copy(sphere.center).multiplyScalar(-k)
  const g = new THREE.Group()
  g.add(inner)
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return g
}

/** Haqiqiy to'qilgan savat: kengligi `radius` ga moslanadi; `ribbon` — rang raundida lenta */
export function realBasket(src: THREE.Object3D, radius: number, ribbon?: string): THREE.Group {
  const inner = src.clone(true)
  const box = new THREE.Box3().setFromObject(inner)
  const size = box.getSize(new THREE.Vector3())
  const k = (radius * 2) / Math.max(size.x, size.z)
  inner.scale.setScalar(k)
  inner.position.set(-((box.min.x + box.max.x) / 2) * k, -box.min.y * k, -((box.min.z + box.max.z) / 2) * k)
  const g = new THREE.Group()
  g.add(inner)
  // Savat devori balandligi (ruchkasiz): pastki 60% qismi
  const h = Math.min(size.y * k * 0.62, radius * 0.9)
  if (ribbon) {
    // Rangli lenta savat devorini to'rt tomondan o'raydi (savat to'rtburchak)
    const w = size.x * k * 0.985
    const d = size.z * k * 0.985
    const t = radius * 0.06
    const m = new THREE.MeshStandardMaterial({ color: ribbon, roughness: 0.55 })
    for (const [sx, sz, x, z] of [
      [w, t, 0, d / 2],
      [w, t, 0, -d / 2],
      [t, d, w / 2, 0],
      [t, d, -w / 2, 0],
    ]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(sx, radius * 0.12, sz), m)
      band.position.set(x, size.y * k * 0.82, z)
      g.add(band)
    }
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
