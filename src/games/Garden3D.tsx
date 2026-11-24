import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { COLOR_HEX, type ColorId, type FruitKind } from '../art/Fruit'
import { burst } from '../components/Fx'
import { haptic, sfx } from '../lib/audio'
import { FRUIT_R, makeBasket, makeFruit, setRealAssets } from '../three/fruit3d'
import { loadGardenAssets, type GardenAssets } from '../three/realAssets'
import { makeBackdrop, makeGround, makeSky, makeTree, setSceneryAssets } from '../three/scenery'

// 🌳 Bog' — 3D sahna: loy uslubidagi daraxt, haqiqiy 3D mevalar, to'qilgan savatlar.
//   • daraxtga bosish yoki uni barmoq bilan silkitish → shox-shabba prujinadek tebranadi, barglar to'kiladi
//   • har meva shoxda turlicha mahkam turadi (darajaga qarab 1–4 silkitish) — hammasi birdan tushmaydi
//   • uzilgan meva tortishish bilan tushadi, yerga urilib sakraydi va DUMALAYDI (radiusga mos aylanadi)
//   • yerdagi mevani barmoq bilan ko'tarib, savatga tashlaydi; noto'g'ri savat — meva qaytib yerga tushadi

export interface G3Item {
  id: number
  kind: FruitKind
  group: string
  scale: number
}

export interface G3Group {
  id: string
  color?: ColorId
  size?: number
  kind?: FruitKind
}

interface Props {
  items: G3Item[]
  groups: G3Group[]
  /** Har meva shoxda nechta silkitishgacha turadi (eng ko'p) */
  holdMax: number
  /** Savat ustida qaysi meva tushishini ko'rsatish (oson darajalar) */
  showHint: boolean
  /** Hamma mevalar yerga tushdi */
  onAllDown: () => void
  onShake: () => void
  /** Savatga tashlandi: to'g'rimi? (noto'g'ri bo'lsa meva yerga qaytadi) */
  onDrop: (itemId: number, groupId: string) => boolean
}

const TREE = new THREE.Vector3(-3.3, 0, -1.4)
const CROWN_Y = 2.9
const ZONE = { x0: -5.2, x1: -0.3, z0: 0.1, z1: 2.4 }
const G = 9.8

type FState = 'tree' | 'loose' | 'held' | 'basket'

interface Fruit {
  item: G3Item
  obj: THREE.Group
  r: number
  state: FState
  hold: number
  v: THREE.Vector3
  rest: boolean
  bounces: number
}

export function Garden3D({ items, groups, holdMax, showHint, onAllDown, onShake, onDrop }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const cb = useRef({ onAllDown, onShake, onDrop })
  useEffect(() => {
    cb.current = { onAllDown, onShake, onDrop }
  })

  useEffect(() => {
    // Realistik assetlar (Poly Haven) yuklangach sahna quriladi; uzoq cho'zilsa — kanvas chizmalari bilan
    let dead = false
    let cleanup: (() => void) | null = null
    const timeout = new Promise<null>((res) => setTimeout(() => res(null), 6000))
    void Promise.race([loadGardenAssets().catch(() => null), timeout]).then((a) => {
      if (dead) return
      setRealAssets(a ? { fruits: a.fruits, basket: a.basket } : null)
      setSceneryAssets(a)
      cleanup = build(a)
    })
    return () => {
      dead = true
      cleanup?.()
    }

    function build(assets: GardenAssets | null): () => void {
      const host = hostRef.current!
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      host.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      // Osmon gradienti va suzib yurgan bulutlar
      const updateSky = makeSky(scene)

      const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 80)
      camera.position.set(0.3, 3.6, 11.2)
      camera.lookAt(0.3, 2.05, 0)

      // Yorug'lik: osmon + quyosh (yumshoq soyalar)
      const hemi = new THREE.HemisphereLight('#fff7e6', '#6a994e', 1.15)
      scene.add(hemi)
      // HDRI osmon yorug'ligi: atrofdan tushadigan tabiiy yorug'lik va akslar
      if (assets?.skyHdr) {
        const pm = new THREE.PMREMGenerator(renderer)
        scene.environment = pm.fromEquirectangular(assets.skyHdr).texture
        scene.environmentIntensity = 0.85
        pm.dispose()
        hemi.intensity = 0.45
      }
      const sun = new THREE.DirectionalLight('#fff1d6', 2.1)
      sun.position.set(-4, 9, 6)
      sun.castShadow = true
      sun.shadow.mapSize.set(2048, 2048)
      sun.shadow.camera.left = -8
      sun.shadow.camera.right = 8
      sun.shadow.camera.top = 8
      sun.shadow.camera.bottom = -4
      sun.shadow.radius = 4
      sun.shadow.bias = -0.0005
      scene.add(sun)

      // Yer, o't, gullar, tepaliklar, tog'lar, teraklar, panjara
      makeGround(scene)
      makeBackdrop(scene)

      // ---------- Daraxt (egri tana, po'stloq, minglab barg) ----------
      const { tree, crown, hit: crownHit, frontZ } = makeTree(CROWN_Y)
      tree.position.copy(TREE)
      scene.add(tree)

      // ---------- Mevalar: shox-shabbaning old yuzasiga ----------
      const fruits: Fruit[] = items.map((item, i) => {
        const obj = makeFruit(item.kind)
        obj.scale.setScalar(item.scale)
        // Old yarim sfera bo'ylab tekis tarqatamiz (bola ko'rib tursin)
        const n = items.length
        const a = -2.2 + (4.4 * (i + 0.5)) / n + (Math.random() - 0.5) * 0.25
        const row = i % 3
        const y = 0.05 + row * 0.75 + (Math.random() - 0.5) * 0.15
        const fx = Math.sin(a * 0.7) * 1.75
        // Barglar ustida osilib tursin (yarmi barg ichida — shoxga bog'langandek)
        obj.position.set(fx, y, Math.max(1.05, frontZ(fx, y) - 0.05) + FRUIT_R[item.kind] * item.scale * 0.35)
        obj.rotation.set(Math.random() * 0.4, Math.random() * 6, Math.random() * 0.4)
        crown.add(obj)
        return {
          item,
          obj,
          r: FRUIT_R[item.kind] * item.scale,
          state: 'tree',
          hold: 1 + Math.floor(Math.random() * Math.max(1, holdMax)),
          v: new THREE.Vector3(),
          rest: false,
          bounces: 0,
        }
      })

      // ---------- Savatlar ----------
      const baskets = groups.map((gr, i) => {
        const radius = 0.62 * (gr.size ?? 1) * (groups.length >= 4 ? 0.85 : 1)
        const b = makeBasket(radius, gr.color ? COLOR_HEX[gr.color] : undefined)
        const span = groups.length >= 4 ? 4.1 : 3.6
        const x = 0.9 + (groups.length === 1 ? span / 2 : (span * i) / (groups.length - 1))
        b.position.set(x, 0, 1.0)
        scene.add(b)
        // Ko'rsatma: savat ustida qaysi meva tushishi aylanib turadi
        let hint: THREE.Group | null = null
        if (showHint && (gr.kind || gr.color)) {
          const kind = gr.kind ?? items.find((it) => it.group === gr.id)?.kind
          if (kind) {
            hint = makeFruit(kind)
            hint.scale.setScalar(0.55 * (gr.size ?? 1))
            hint.position.set(x, b.userData.height + 0.75, 1.0)
            scene.add(hint)
          }
        }
        return { gr, obj: b, radius, hint, count: 0, wiggle: 0 }
      })

      // ---------- Barglar (silkitganda to'kiladi) ----------
      const leafBits: { m: THREE.Mesh; v: THREE.Vector3; spin: number; life: number }[] = []
      const leafBitGeo = new THREE.CircleGeometry(0.09, 6)
      function dropLeaves(n: number) {
        for (let i = 0; i < n; i++) {
          const m = new THREE.Mesh(leafBitGeo, new THREE.MeshStandardMaterial({ color: '#52b788', side: THREE.DoubleSide, transparent: true }))
          m.scale.y = 0.55
          const p = crown.localToWorld(new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 1.5, 0.9))
          m.position.copy(p)
          scene.add(m)
          leafBits.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 0.8, -0.4, Math.random() * 0.6), spin: Math.random() * 6, life: 2.2 })
        }
      }

      // ---------- Tebranish (prujina) ----------
      let swing = 0
      let swingV = 0
      let crownWob = 0
      let crownWobV = 0
      let allDownSent = false

      function shake(dir: number) {
        swingV += 0.55 * dir
        crownWobV += 2.2 * dir
        sfx.rustle()
        haptic.thud()
        dropLeaves(5)
        cb.current.onShake()
        for (const f of fruits) {
          if (f.state !== 'tree') continue
          // Har silkitish mustahkamlikni kamaytiradi (hammasi birdan emas)
          if (Math.random() < 0.7) f.hold--
          if (f.hold > 0) continue
          const wp = f.obj.getWorldPosition(new THREE.Vector3())
          const wq = f.obj.getWorldQuaternion(new THREE.Quaternion())
          crown.remove(f.obj)
          f.obj.position.copy(wp)
          f.obj.quaternion.copy(wq)
          scene.add(f.obj)
          f.state = 'loose'
          lastDetach = performance.now()
          f.v.set((Math.random() - 0.5) * 1.2 + 0.6, 0.6 + Math.random() * 0.6, 0.9 + Math.random() * 1.2)
        }
      }

      // ---------- Bosish va sudrash ----------
      const ray = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      const liftPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.95)
      let held: Fruit | null = null
      const target = new THREE.Vector3()
      let swipe: { x: number; t: number } | null = null
      /** Barmoqning ekrandagi oxirgi joyi (savatga tushdimi — ekran bo'yicha tekshiriladi) */
      const finger = { x: 0, y: 0 }
      /** Oxirgi meva uzilgan payt: shundan 1.6 s keyin "hammasi tushdi" */
      let lastDetach = 0

      function pointer(e: PointerEvent) {
        finger.x = e.clientX
        finger.y = e.clientY
        const b = renderer.domElement.getBoundingClientRect()
        ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1)
        ray.setFromCamera(ndc, camera)
      }

      const onDown = (e: PointerEvent) => {
        pointer(e)
        // Yerdagi mevani ushlash
        const loose = fruits.filter((f) => f.state === 'loose')
        const hit = ray.intersectObjects(
          loose.map((f) => f.obj),
          true,
        )[0]
        if (hit) {
          const owner = (o: THREE.Object3D | null): Fruit | undefined => (o ? (loose.find((f) => f.obj === o) ?? owner(o.parent)) : undefined)
          held = owner(hit.object)!
          held.state = 'held'
          held.v.set(0, 0, 0)
          sfx.tap()
          renderer.domElement.setPointerCapture(e.pointerId)
          return
        }
        // Daraxtga tegish — silkitish
        if (ray.intersectObjects(crownHit, false).length) {
          shake(Math.random() < 0.5 ? -1 : 1)
          swipe = { x: e.clientX, t: performance.now() }
        }
      }
      const onMove = (e: PointerEvent) => {
        pointer(e)
        if (held) {
          ray.ray.intersectPlane(liftPlane, target)
          return
        }
        // Daraxt ustida barmoqni o'ngga-chapga yurgizish ham silkitadi
        if (swipe && Math.abs(e.clientX - swipe.x) > 60 && performance.now() - swipe.t > 140) {
          shake(Math.sign(e.clientX - swipe.x))
          swipe = { x: e.clientX, t: performance.now() }
        }
      }
      const onUp = () => {
        swipe = null
        if (!held) return
        const f = held
        held = null
        const p = f.obj.position
        // Ko'tarilgan meva savatdan balandda: 3D'da emas, EKRANDA savat ustidami — shunga qaraymiz
        const bk = baskets.find((b) => {
          const top = b.obj.position.clone().setY(b.obj.userData.height)
          const c = toScreen(top)
          const edge = toScreen(top.clone().setX(top.x + b.radius))
          const rs = Math.abs(edge.x - c.x)
          return Math.hypot(finger.x - c.x, (finger.y - c.y) * 0.8) < rs * 1.5
        })
        if (bk && cb.current.onDrop(f.item.id, bk.gr.id)) {
          // Savatga: ichiga joylashadi
          f.state = 'basket'
          const k = bk.count++
          const ang = k * 2.4
          const rr = Math.min(bk.radius * 0.45, 0.12 * Math.sqrt(k + 1))
          f.obj.position.set(
            bk.obj.position.x + Math.cos(ang) * rr,
            bk.obj.userData.height * 0.55 + f.r * 0.6 + Math.floor(k / 5) * f.r,
            bk.obj.position.z + Math.sin(ang) * rr,
          )
          const s = toScreen(f.obj.position)
          burst(s.x, s.y, bk.gr.color ? [COLOR_HEX[bk.gr.color], '#ffd166', '#fff'] : ['#ffd166', '#06d6a0', '#fff'], 16)
          return
        }
        if (bk) bk.wiggle = 1
        // Noto'g'ri savat yoki bo'sh joy: meva qo'yib yuboriladi va yerga tushadi
        f.state = 'loose'
        f.rest = false
        f.bounces = 0
        f.v.set(bk ? (TREE.x - p.x) * 0.25 : 0, 0.4, bk ? 0.6 : 0)
      }
      renderer.domElement.addEventListener('pointerdown', onDown)
      renderer.domElement.addEventListener('pointermove', onMove)
      renderer.domElement.addEventListener('pointerup', onUp)
      renderer.domElement.addEventListener('pointercancel', onUp)

      // Telefonni silkitish ham daraxtni silkitadi
      let lastMotion = 0
      const onMotion = (e: DeviceMotionEvent) => {
        const a = e.accelerationIncludingGravity
        if (!a || performance.now() - lastMotion < 350) return
        if (Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0) > 22) {
          lastMotion = performance.now()
          shake((a.x ?? 1) > 0 ? 1 : -1)
        }
      }
      window.addEventListener('devicemotion', onMotion)

      function toScreen(v: THREE.Vector3) {
        const p = v.clone().project(camera)
        const b = renderer.domElement.getBoundingClientRect()
        return { x: b.left + ((p.x + 1) / 2) * b.width, y: b.top + ((1 - p.y) / 2) * b.height }
      }

      // ---------- O'lcham ----------
      function resize() {
        const w = host.clientWidth
        const h = host.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        // Tor ekranlarda (planshet) ko'proq ko'rinsin
        camera.fov = w / h < 1.5 ? 46 : 38
        camera.updateProjectionMatrix()
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(host)

      // ---------- Kadr ----------
      const clock = new THREE.Clock()
      const axis = new THREE.Vector3()
      const dq = new THREE.Quaternion()
      renderer.setAnimationLoop(() => {
        const dt = Math.min(clock.getDelta(), 1 / 30)
        const t = clock.elapsedTime
        updateSky(dt)

        // Daraxt: prujina + yengil shabada
        swingV += (-28 * swing - 3.2 * swingV) * dt
        swing += swingV * dt
        crownWobV += (-60 * crownWob - 5 * crownWobV) * dt
        crownWob += crownWobV * dt
        tree.rotation.z = swing * 0.12 + Math.sin(t * 0.9) * 0.008
        crown.rotation.z = crownWob * 0.05
        crown.rotation.x = Math.sin(t * 1.3) * 0.01

        // Mevalar
        for (const f of fruits) {
          if (f.state === 'held') {
            f.obj.position.lerp(target, Math.min(1, dt * 14))
            f.obj.rotation.y += dt * 2
            continue
          }
          if (f.state !== 'loose' || f.rest) continue
          f.v.y -= G * dt
          f.obj.position.addScaledVector(f.v, dt)
          const p = f.obj.position
          // Maydon chegaralari: yumshoq qaytish
          if (p.x < ZONE.x0) ((p.x = ZONE.x0), (f.v.x = Math.abs(f.v.x) * 0.4))
          if (p.x > ZONE.x1) ((p.x = ZONE.x1), (f.v.x = -Math.abs(f.v.x) * 0.4))
          if (p.z < ZONE.z0) ((p.z = ZONE.z0), (f.v.z = Math.abs(f.v.z) * 0.4))
          if (p.z > ZONE.z1) ((p.z = ZONE.z1), (f.v.z = -Math.abs(f.v.z) * 0.4))
          if (p.y <= f.r) {
            p.y = f.r
            if (f.v.y < -1) {
              // Urilish: sakraydi, birinchi urilishda "tup"
              if (f.bounces++ === 0) sfx.thump()
              f.v.y = -f.v.y * 0.36
            } else f.v.y = 0
            // Ishqalanish: dumalab sekinlashadi
            const fr = Math.exp(-1.6 * dt)
            f.v.x *= fr
            f.v.z *= fr
          }
          // Dumalash: harakat yo'nalishiga perpendikulyar o'q atrofida, burchak = yo'l / radius
          const sp = Math.hypot(f.v.x, f.v.z)
          if (p.y <= f.r + 0.01 && sp > 0.01) {
            axis.set(f.v.z, 0, -f.v.x).normalize()
            dq.setFromAxisAngle(axis, (sp * dt) / f.r)
            f.obj.quaternion.premultiply(dq)
          }
          if (p.y <= f.r + 0.001 && sp < 0.04 && Math.abs(f.v.y) < 0.01) f.rest = true
        }
        // Mevalar bir-birini itaradi (yerda ustma-ust tushmasin)
        const ground = fruits.filter((f) => f.state === 'loose')
        for (let i = 0; i < ground.length; i++)
          for (let j = i + 1; j < ground.length; j++) {
            const a = ground[i].obj.position
            const b = ground[j].obj.position
            const dx = b.x - a.x
            const dz = b.z - a.z
            const d = Math.hypot(dx, dz)
            const min = ground[i].r + ground[j].r
            if (d > 0.0001 && d < min) {
              const push = (min - d) / 2
              a.x -= (dx / d) * push
              a.z -= (dz / d) * push
              b.x += (dx / d) * push
              b.z += (dz / d) * push
              if (push > 0.02) ground[i].rest = ground[j].rest = false
            }
          }

        if (!allDownSent && fruits.every((f) => f.state !== 'tree') && performance.now() - lastDetach > 1600) {
          allDownSent = true
          cb.current.onAllDown()
        }

        // Barglar: aylanib, tebranib tushadi
        for (let i = leafBits.length - 1; i >= 0; i--) {
          const l = leafBits[i]
          l.life -= dt
          l.v.y = Math.max(l.v.y - 1.2 * dt, -0.9)
          l.m.position.addScaledVector(l.v, dt)
          l.m.position.x += Math.sin(t * 4 + l.spin) * dt * 0.6
          l.m.rotation.set(t * l.spin, t * 2, 0)
          ;(l.m.material as THREE.MeshStandardMaterial).opacity = Math.min(1, l.life)
          if (l.life <= 0 || l.m.position.y < 0.02) {
            scene.remove(l.m)
            leafBits.splice(i, 1)
          }
        }

        // Savatlar: noto'g'ri tashlanganda tebranadi; ko'rsatma mevalari aylanadi
        for (const b of baskets) {
          if (b.wiggle > 0) b.wiggle = Math.max(0, b.wiggle - dt * 2.5)
          b.obj.rotation.z = Math.sin(b.wiggle * 30) * b.wiggle * 0.15
          if (b.hint) {
            b.hint.rotation.y = t * 1.2
            b.hint.position.y = b.obj.userData.height + 0.75 + Math.sin(t * 2) * 0.06
          }
        }

        // Daraxtga ishora (hali mevalar shoxda bo'lsa)
        if (hintRef.current) {
          const any = fruits.some((f) => f.state === 'tree')
          hintRef.current.style.display = any ? 'block' : 'none'
          if (any) {
            const s = toScreen(new THREE.Vector3(TREE.x, CROWN_Y + 0.6, TREE.z + 1.4))
            const hb = host.getBoundingClientRect()
            hintRef.current.style.transform = `translate(${s.x - hb.left}px, ${s.y - hb.top}px)`
          }
        }

        // Faqat testlar uchun: mevalar va savatlarning ekrandagi joyi
        if (import.meta.env.DEV)
          (window as unknown as { __g3?: unknown }).__g3 = {
            fruits: fruits.filter((f) => f.state === 'loose').map((f) => ({ id: f.item.id, group: f.item.group, ...toScreen(f.obj.position) })),
            baskets: baskets.map((b) => ({ id: b.gr.id, ...toScreen(b.obj.position.clone().setY(b.obj.userData.height)) })),
          }

        renderer.render(scene, camera)
      })

      return () => {
        renderer.setAnimationLoop(null)
        ro.disconnect()
        window.removeEventListener('devicemotion', onMotion)
        renderer.domElement.removeEventListener('pointerdown', onDown)
        renderer.domElement.removeEventListener('pointermove', onMove)
        renderer.domElement.removeEventListener('pointerup', onUp)
        renderer.domElement.removeEventListener('pointercancel', onUp)
        scene.traverse((o) => {
          const m = o as THREE.Mesh
          if (m.isMesh) {
            m.geometry.dispose()
            const mm = m.material as THREE.Material | THREE.Material[]
            ;(Array.isArray(mm) ? mm : [mm]).forEach((x) => x.dispose())
          }
        })
        renderer.dispose()
        host.removeChild(renderer.domElement)
      }
    }
    // Har raund — yangi sahna (Garden komponenti key bilan qayta yaratadi)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="garden3d" ref={hostRef}>
      <div className="g3-hint" ref={hintRef}>
        <span />
      </div>
    </div>
  )
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
