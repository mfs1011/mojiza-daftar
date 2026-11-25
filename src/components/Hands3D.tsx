import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'

// ✋ Barmoqlar bilan sanash — haqiqiy 3D qo'llar (WebXR generic-hand modeli, har barmoqda 3–4 bo'g'im).
// Chap qo'lda 1–5, o'ng qo'lda 6–10; sanash tartibi: bosh barmoq, ko'rsatkich, o'rta, nomsiz, jimjiloq.
// Barmoq bukilganda har bo'g'im alohida, tabiiy egiladi va silliq harakatlanadi.

const BASE = `${import.meta.env.BASE_URL}assets/characters/`
const FINGERS = ['thumb', 'index-finger', 'middle-finger', 'ring-finger', 'pinky-finger'] as const

/** Barmoq zanjiri: bo'g'imlar modelda ierarxiyasiz (WebXR), shuning uchun egilishni o'zimiz hisoblaymiz */
interface Chain {
  bones: THREE.Object3D[]
  pos: THREE.Vector3[]
  quat: THREE.Quaternion[]
  /** Har bo'g'imdagi to'liq bukilish burchagi */
  angles: number[]
  axis: THREE.Vector3
}

let cache: Promise<THREE.Group[]> | null = null
function loadHands() {
  cache ??= Promise.all(
    ['hand-left.glb', 'hand-right.glb'].map(
      (f) => new Promise<THREE.Group>((res, rej) => new GLTFLoader().load(BASE + f, (g) => res(g.scene), undefined, rej)),
    ),
  )
  return cache
}

export function Hands3D({ n, small }: { n: number; small?: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const target = useRef(n)
  useEffect(() => {
    target.current = n
  }, [n])

  useEffect(() => {
    const el = host.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(26, 1, 0.01, 10)
    scene.add(new THREE.HemisphereLight('#fff6ea', '#c9a27e', 1.6))
    const key = new THREE.DirectionalLight('#ffffff', 2.2)
    key.position.set(0.4, 0.8, 1)
    scene.add(key)
    const rim = new THREE.DirectionalLight('#ffe0c2', 1.1)
    rim.position.set(-0.6, 0.3, -0.8)
    scene.add(rim)

    const skin = new THREE.MeshPhysicalMaterial({ color: '#f0c29a', roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color('#ffb8a0'), sheenRoughness: 0.6 })
    const hands: { chains: Chain[]; curl: number[] }[] = []
    let alive = true
    const clock = new THREE.Clock()

    void loadHands().then((models) => {
      if (!alive) return
      models.forEach((src, side) => {
        // Skinned mesh: suyaklari bilan birga nusxalanadi (oddiy clone asl suyaklarga bog'lanib qoladi)
        const hand = cloneSkinned(src) as THREE.Group
        hand.traverse((o) => {
          const m = o as THREE.SkinnedMesh
          if (m.isSkinnedMesh) {
            m.material = skin
            m.frustumCulled = false
          }
        })
        // Kaft orqasi bolaga qaraydi, barmoqlar tepaga (modelda barmoqlar −Y, kaft orqasi chapda −X, o'ngda +X)
        const holder = new THREE.Group()
        const basis = new THREE.Matrix4()
        if (side === 0) basis.makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, -1, 0), new THREE.Vector3(-1, 0, 0))
        else basis.makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0))
        hand.quaternion.setFromRotationMatrix(basis)
        holder.add(hand)
        holder.updateMatrixWorld(true)
        const box = new THREE.Box3().setFromObject(hand)
        const c = box.getCenter(new THREE.Vector3())
        hand.position.sub(c)
        // Qo'llar biroz ichkariga og'gan — tabiiyroq
        holder.rotation.z = side === 0 ? 0.08 : -0.08
        holder.position.set(side === 0 ? -0.078 : 0.078, 0, 0)
        scene.add(holder)
        // Modelda: barmoqlar −Y tomonga, kaft chap qo'lda +X, o'ngda −X tomonga qaragan
        const sgn = side === 0 ? 1 : -1
        const chains: Chain[] = FINGERS.map((f) => {
          const names =
            f === 'thumb'
              ? ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip']
              : [`${f}-phalanx-proximal`, `${f}-phalanx-intermediate`, `${f}-phalanx-distal`, `${f}-tip`]
          const bones = names.map((nm) => hand.getObjectByName(nm)!).filter(Boolean)
          // Bukilish o'qi har barmoqning o'z yo'nalishiga perpendikulyar (jimjiloq qiya turadi)
          const dir = bones[1].position.clone().sub(bones[0].position).normalize()
          const fingerAxis = dir.cross(new THREE.Vector3(sgn, 0, 0)).normalize()
          return {
            bones,
            pos: bones.map((b) => b.position.clone()),
            quat: bones.map((b) => b.quaternion.clone()),
            angles: f === 'thumb' ? [0.5, 0.55, 0.75] : [1.45, 1.55, 0.8],
            // Barmoq kaft tomonga bukiladi; bosh barmoq kaft ustidan jimjiloq tomonga
            axis: f === 'thumb' ? new THREE.Vector3(0.35 * sgn, -1 * sgn, 0.25 * sgn).normalize() : fingerAxis,
          }
        })
        hands.push({ chains, curl: [1, 1, 1, 1, 1] })
      })
    })

    const q = new THREE.Quaternion()
    const rot = new THREE.Quaternion()
    const tmp = new THREE.Vector3()
    const seg = new THREE.Vector3()
    function frame() {
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      hands.forEach((h, side) => {
        const up = side === 0 ? Math.min(5, target.current) : Math.max(0, target.current - 5)
        h.chains.forEach((ch, f) => {
          const want = f < up ? 0 : 1
          h.curl[f] += (want - h.curl[f]) * Math.min(1, dt * 9)
          const c = h.curl[f]
          // To'g'ri kinematika: har bo'g'imda burilish yig'iladi, keyingi bo'g'im shu burilish bilan siljiydi
          const R = q.identity()
          const p = tmp.copy(ch.pos[0])
          for (let k = 0; k < ch.bones.length; k++) {
            if (k > 0) p.add(seg.subVectors(ch.pos[k], ch.pos[k - 1]).applyQuaternion(R))
            if (k < ch.angles.length) R.premultiply(rot.setFromAxisAngle(ch.axis, ch.angles[k] * c))
            ch.bones[k].position.copy(p)
            ch.bones[k].quaternion.copy(R).multiply(ch.quat[k])
          }
        })
      })
      // Yengil "nafas": qo'llar ozgina tebranadi
      scene.rotation.y = Math.sin(t * 0.7) * 0.05
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(frame)

    function resize() {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      // Ikkala qo'l to'liq sig'sin
      const dist = Math.max(0.66, 0.56 / camera.aspect)
      camera.position.set(0, 0.02, dist)
      camera.lookAt(0, 0.0, 0)
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    return () => {
      alive = false
      ro.disconnect()
      renderer.setAnimationLoop(null)
      renderer.dispose()
      renderer.forceContextLoss()
      el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={host} className={`hands3d ${small ? 'small' : ''}`} data-n={n} />
}
