import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { setMusic, sfx, voiceFx } from '../lib/audio'
import { buildFaceRig, renderFace, type EyeState, type FaceRig, type FaceState, type MouthState } from '../lib/faceRig'
import { buildInflated, type Inflated } from '../lib/inflate'
import { Particles } from '../lib/particles'
import { getSettings } from '../lib/settings'
import { startEcho, type EchoHandle, type EchoState } from '../lib/voiceEcho'

// 🎭 Sahna: bolaning rasmi 3D multfilm qahramoniga aylanadi va tirik jonzotdek o'zini tutadi.
//
//  Boshiga urilsa    → "voy!", ko'zini qisadi, boshi atrofida yulduzchalar aylanadi
//  Oyog'iga urilsa   → og'riganidan sakraydi, ko'zidan yosh oqadi, xafa bo'ladi
//  Qornini silasa    → qitig'i keladi: qiqirlab kuladi, titraydi, yonoqlari qizaradi
//  Boshini silasa    → huzur qiladi, ko'zlarini yumadi, yuraklar uchadi
//  Tez surib yuborsa → gir aylanib ketadi, boshi aylanadi (ko'zlari spiral)
//  Bosib tursa       → siqiladi ("iii"), qo'yib yuborsa sapchib ketadi
//  Ikki marta tegsa  → quvonib sakraydi
//  3 marta ursa      → jahli chiqadi: qizaradi, bug' chiqaradi, teskari o'girilib oladi
//  Tegmasa           → esnaydi, keyin uxlab qoladi (Z z z); tegsa cho'chib uyg'onadi
//  Gapirsa           → tinglaydi va o'sha gapni ingichka ovozda takrorlaydi

type Kind = 'bonk' | 'hurt' | 'tickle' | 'pet' | 'dizzy' | 'squeeze' | 'joy' | 'angry' | 'poke' | 'wake' | 'yawn'
type Zone = 'head' | 'body' | 'feet' | 'miss'
type Mic = EchoState | 'off' | 'denied'

const DUR: Record<Kind, number> = {
  bonk: 1.2,
  hurt: 1.8,
  tickle: 0.8,
  pet: 0.9,
  dizzy: 2.6,
  squeeze: 999,
  joy: 1.3,
  angry: 4.2,
  poke: 0.8,
  wake: 1,
  yawn: 2,
}

interface Props {
  image: Blob
  onExit: () => void
}

interface Press {
  x: number
  y: number
  t: number
  zone: Zone
  path: number
  rev: number
  sx: number
  sy: number
  lx: number
  ly: number
}

export function Stage({ image, onExit }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const echoRef = useRef<EchoHandle | null>(null)
  const api = useRef<{
    down: (e: React.PointerEvent) => void
    move: (e: React.PointerEvent) => void
    up: () => void
    dance: (on: boolean) => void
  } | null>(null)
  const [mic, setMic] = useState<Mic>('off')
  const [dance, setDance] = useState(false)
  const [ready, setReady] = useState(false)

  // Sahnada fon musiqasi o'chadi: bola ovozi aniq eshitilsin
  useEffect(() => {
    setMusic(false)
    return () => setMusic(getSettings().music)
  }, [])

  useEffect(() => {
    const host = hostRef.current!
    let alive = true
    let raf = 0
    let model: Inflated | null = null
    let rig: FaceRig | null = null

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, host.clientWidth / host.clientHeight, 0.1, 100)
    camera.position.set(0, 0.35, 6.4)
    camera.lookAt(0, 0.1, 0)
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x6a4a3a, 1.6))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(2.5, 4, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffd6a5, 1.4)
    rim.position.set(-4, 2, -3)
    scene.add(rim)

    const FLOOR = -1.05
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 }))
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = FLOOR
    scene.add(shadow)
    const pivot = new THREE.Group()
    pivot.position.y = FLOOR
    scene.add(pivot)
    const fx = new Particles(scene)
    const ray = new THREE.Raycaster()

    // ---------- "Miya": holat ----------
    const clock = new THREE.Clock()
    const b = {
      reaction: null as { kind: Kind; start: number; until: number } | null,
      lastTouch: 0,
      yawned: false,
      sleeping: false,
      hits: [] as number[],
      press: null as Press | null,
      rubbing: false,
      lastTap: { t: -9, zone: 'body' as Zone },
      look: { x: 0, y: 0 },
      dance: false,
      nextBlink: 2,
      blinkUntil: 0,
      jumpV: 0,
      jumpY: 0,
      squash: 0,
      spin: 0,
      turned: 0,
      tint: 0,
      level: 0,
      faceKey: '',
      nextFx: 0,
      nextSnore: 0,
    }

    const now = () => clock.elapsedTime
    const grid = (x: number, y: number, z: number) => model!.group.localToWorld(new THREE.Vector3(x, y, z))
    const headWorld = () => {
      const f = model!.face
      return grid(f.x, f.y + f.spacing * 1.6, f.eyeZ + 3)
    }
    const eyeWorld = (i: 0 | 1) => {
      const e = rig!.eyes[i]
      const m = model!
      return grid(e.x / m.texScale - m.gw / 2, m.gh / 2 - e.y / m.texScale, m.face.eyeZ + 2)
    }

    function react(kind: Kind) {
      if (!model) return
      const t = now()
      b.reaction = { kind, start: t, until: t + DUR[kind] }
      b.lastTouch = t
      b.yawned = false
      echoRef.current?.holdOff(Math.min(DUR[kind], 3) + 0.4)
      const head = headWorld()
      switch (kind) {
        case 'bonk':
          voiceFx.bonk()
          b.squash = -0.3
          for (let i = 0; i < 5; i++) fx.spawn('star', head, { life: 1.6, size: 0.22, orbit: { c: head, r: 0.45, a: (i / 5) * Math.PI * 2, speed: 5 } })
          break
        case 'hurt':
          voiceFx.ouch()
          b.jumpV = 4.2
          for (let i = 0; i < 6; i++) {
            const e = eyeWorld((i % 2) as 0 | 1)
            fx.spawn('tear', e, { vel: new THREE.Vector3((i % 2 ? 1 : -1) * (0.5 + Math.random() * 0.4), 1 + Math.random(), 0.3), gravity: 6, life: 1, size: 0.16 })
          }
          break
        case 'tickle':
          voiceFx.giggle()
          break
        case 'pet':
          voiceFx.purr()
          break
        case 'dizzy':
          voiceFx.woo()
          break
        case 'squeeze':
          voiceFx.squeeze()
          break
        case 'joy':
          voiceFx.yay()
          b.jumpV = 6
          for (let i = 0; i < 6; i++)
            fx.spawn(i % 2 ? 'heart' : 'sparkle', head, { vel: new THREE.Vector3((Math.random() - 0.5) * 2.4, 1.2 + Math.random() * 1.2, 0.5), gravity: 1.5, life: 1.3, size: 0.24 })
          break
        case 'angry':
          voiceFx.grr()
          break
        case 'poke':
          voiceFx.hmm()
          b.jumpV = 2.4
          break
        case 'wake':
          voiceFx.boing()
          b.sleeping = false
          b.jumpV = 4.5
          break
        case 'yawn':
          voiceFx.yawn()
          break
      }
    }

    // ---------- Imo-ishoralar ----------
    function hitZone(e: React.PointerEvent): Zone | null {
      if (!model) return null
      const r = renderer.domElement.getBoundingClientRect()
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera)
      const hit = ray.intersectObject(model.mesh)[0]
      if (!hit) return null
      const local = model.group.worldToLocal(hit.point.clone())
      const rel = (local.y - model.yBot) / Math.max(1, model.yTop - model.yBot)
      return rel > 0.62 ? 'head' : rel < 0.2 ? 'feet' : 'body'
    }

    function setLook(e: React.PointerEvent) {
      const r = renderer.domElement.getBoundingClientRect()
      b.look = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) }
    }

    api.current = {
      down: (e) => {
        setLook(e)
        const t = now()
        b.lastTouch = t
        const zone = hitZone(e)
        if (b.sleeping) {
          react('wake')
          return
        }
        // Qahramonga tegmasa ham "press" yoziladi: ekran bo'ylab siltash ham uni aylantiradi
        b.press = { x: e.clientX, y: e.clientY, t, zone: zone ?? 'miss', path: 0, rev: 0, sx: 0, sy: 0, lx: e.clientX, ly: e.clientY }
        b.rubbing = false
      },
      move: (e) => {
        setLook(e)
        const p = b.press
        if (!p) return
        const dx = e.clientX - p.lx
        const dy = e.clientY - p.ly
        p.path += Math.hypot(dx, dy)
        const sx = Math.abs(dx) > 2 ? Math.sign(dx) : 0
        const sy = Math.abs(dy) > 2 ? Math.sign(dy) : 0
        if ((sx && p.sx && sx !== p.sx) || (sy && p.sy && sy !== p.sy)) p.rev++
        if (sx) p.sx = sx
        if (sy) p.sy = sy
        p.lx = e.clientX
        p.ly = e.clientY
        // Silash: oldinga-orqaga harakat
        if (p.zone !== 'miss' && p.path > 60 && p.rev >= 2) {
          b.rubbing = true
          const kind: Kind = p.zone === 'head' ? 'pet' : 'tickle'
          const t = now()
          if (b.reaction?.kind !== kind) react(kind)
          else b.reaction.until = t + DUR[kind]
          b.lastTouch = t
        }
      },
      up: () => {
        const p = b.press
        b.press = null
        if (!p) return
        const t = now()
        if (b.reaction?.kind === 'squeeze') {
          b.reaction = null
          voiceFx.boing()
          react('joy')
          return
        }
        if (b.rubbing) return
        const dist = Math.hypot(p.lx - p.x, p.ly - p.y)
        const dt = t - p.t
        if (dist > 70 && dt < 0.4) return react('dizzy')
        if (dist > 25 || p.zone === 'miss') return
        if (t - b.lastTap.t < 0.32 && b.lastTap.zone === p.zone) {
          b.lastTap.t = -9
          return react('joy')
        }
        b.lastTap = { t, zone: p.zone }
        if (p.zone !== 'body') {
          b.hits = [...b.hits.filter((h) => t - h < 3), t]
          if (b.hits.length >= 3) {
            b.hits = []
            return react('angry')
          }
        }
        react(p.zone === 'head' ? 'bonk' : p.zone === 'feet' ? 'hurt' : 'poke')
      },
      dance: (on) => {
        b.dance = on
        b.lastTouch = now()
      },
    }

    void buildInflated(image).then((m) => {
      if (!alive) return m.dispose()
      model = m
      m.group.position.y = -m.bottom
      pivot.add(m.group)
      rig = buildFaceRig(m.base, m.src, {
        x: (m.face.x + m.gw / 2) * m.texScale,
        y: (m.gh / 2 - m.face.y) * m.texScale,
        spacing: m.face.spacing * m.texScale,
      })
      setReady(true)
      sfx.magic()
      b.lastTouch = now()
      react('joy')

      if (import.meta.env.DEV) {
        const at = (rel: number) => {
          const r = renderer.domElement.getBoundingClientRect()
          const y = m.yBot + rel * (m.yTop - m.yBot)
          // Markazdan boshlab chap-o'ngga qarab, modelga haqiqatan tegadigan nuqtani qidiramiz
          for (let d = 0; d < m.gw / 2; d += 1)
            for (const x of [d, -d]) {
              const v = grid(x, y, 0).project(camera)
              ray.setFromCamera(new THREE.Vector2(v.x, v.y), camera)
              if (ray.intersectObject(m.mesh).length) return [r.left + ((v.x + 1) / 2) * r.width, r.top + ((1 - v.y) / 2) * r.height]
            }
          const v = grid(0, y, 0).project(camera)
          return [r.left + ((v.x + 1) / 2) * r.width, r.top + ((1 - v.y) / 2) * r.height]
        }
        ;(window as unknown as { __stage?: unknown }).__stage = () => ({
          reaction: b.reaction?.kind ?? null,
          sleeping: b.sleeping,
          drawnFace: rig?.drawn ?? false,
          head: at(0.85),
          body: at(0.45),
          feet: at(0.08),
        })
        ;(window as unknown as { __stageIdle?: unknown }).__stageIdle = (sec: number) => {
          b.reaction = null
          b.lastTouch = now() - sec
        }
      }
    })

    // ---------- Har kadr ----------
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, clock.getDelta())
      const t = clock.elapsedTime
      fx.update(dt)
      if (!model || !rig) {
        renderer.render(scene, camera)
        return
      }
      const echo = echoRef.current
      const st = echo?.state()
      const speaking = st === 'speaking'
      const hearing = st === 'hearing'
      if (speaking || hearing) b.lastTouch = t
      b.level += ((echo ? echo.level() : 0) - b.level) * Math.min(1, dt * 18)
      // Bosib turish (0.6 s, deyarli qimirlamasdan) → siqilish
      const pr = b.press
      if (pr && pr.zone !== 'miss' && !b.rubbing && t - pr.t > 0.6 && pr.path < 25 && b.reaction?.kind !== 'squeeze') react('squeeze')
      if (b.reaction && t > b.reaction.until) b.reaction = null
      const r = b.reaction
      const rt = r ? t - r.start : 0
      const idle = t - b.lastTouch

      // Zerikish → esnash → uyqu
      if (!r && !b.dance && !b.sleeping && idle > 12 && !b.yawned) {
        react('yawn')
        b.yawned = true
        b.lastTouch = t - 12
      }
      if (!r && !b.dance && idle > 22) b.sleeping = true

      let eyes: EyeState = 'open'
      let mouth: MouthState = 'rest'
      let open = 0
      let blush = 0
      let rotZ = Math.sin(t * 1.3) * 0.03
      let swayY = Math.sin(t * 0.7) * 0.35 + b.look.x * 0.2
      let scaleY = 1 + Math.sin(t * 2.4) * 0.025
      let tintTarget = 0
      let turnTarget = 0

      if (b.sleeping && !r) {
        eyes = 'closed'
        mouth = 'o'
        swayY = 0
        rotZ = 0.06
        scaleY = 1 + Math.sin(t * 1.2) * 0.05
        if (t > b.nextFx) {
          b.nextFx = t + 1.4
          const h = headWorld()
          fx.spawn('z', h.clone().add(new THREE.Vector3(0.3, 0, 0)), { vel: new THREE.Vector3(0.25, 0.4, 0), life: 2.2, size: 0.26 })
        }
        if (t > b.nextSnore) {
          b.nextSnore = t + 3.2
          voiceFx.snore()
        }
      } else if (r) {
        switch (r.kind) {
          case 'bonk':
            eyes = 'squeeze'
            mouth = 'ouch'
            break
          case 'hurt':
            eyes = rt < 0.6 ? 'squeeze' : 'sad'
            mouth = rt < 0.6 ? 'ouch' : 'sad'
            rotZ = Math.sin(rt * 22) * 0.16 * Math.max(0, 1 - rt / 1.2)
            break
          case 'tickle':
            eyes = 'happy'
            mouth = 'laugh'
            blush = 1
            rotZ = Math.sin(t * 38) * 0.09
            scaleY += Math.sin(t * 30) * 0.04
            if (t > b.nextFx) {
              b.nextFx = t + 0.35
              voiceFx.giggle()
              fx.spawn('sparkle', headWorld(), { vel: new THREE.Vector3((Math.random() - 0.5) * 2, 1.2, 0.4), gravity: 1, life: 0.9, size: 0.2 })
            }
            break
          case 'pet':
            eyes = 'happy'
            mouth = 'smile'
            blush = 0.8
            rotZ = Math.sin(t * 3) * 0.1
            if (t > b.nextFx) {
              b.nextFx = t + 0.5
              fx.spawn('heart', headWorld(), { vel: new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.9, 0.3), life: 1.4, size: 0.22 })
            }
            break
          case 'dizzy':
            if (rt < 0.8) {
              b.spin = (rt / 0.8) * Math.PI * 4
              eyes = 'squeeze'
              mouth = 'o'
            } else {
              b.spin = 0
              eyes = 'dizzy'
              mouth = 'o'
              rotZ = Math.sin(t * 6) * 0.14
            }
            break
          case 'squeeze':
            eyes = 'squeeze'
            mouth = 'grr'
            scaleY = 1 - Math.min(0.35, rt * 0.45)
            break
          case 'joy':
            eyes = 'happy'
            mouth = 'laugh'
            blush = 0.5
            break
          case 'angry':
            if (rt < 1.7) {
              eyes = 'angry'
              mouth = 'grr'
              tintTarget = 1
              rotZ = Math.sin(t * 40) * 0.05
              if (t > b.nextFx) {
                b.nextFx = t + 0.3
                const h = headWorld()
                for (const s of [-1, 1]) fx.spawn('steam', h.clone().add(new THREE.Vector3(s * 0.35, 0, 0)), { vel: new THREE.Vector3(s * 0.6, 1, 0), life: 0.8, size: 0.26 })
              }
            } else if (rt < 3.6) {
              // "Hmph!" — teskari o'girilib oladi
              turnTarget = Math.PI
              tintTarget = 0.5
              eyes = 'angry'
              mouth = 'sad'
            } else {
              eyes = 'happy'
              mouth = 'smile'
            }
            break
          case 'poke':
          case 'wake':
            eyes = 'wide'
            mouth = 'o'
            break
          case 'yawn':
            eyes = 'sleepy'
            mouth = 'talk'
            open = Math.sin((rt / DUR.yawn) * Math.PI)
            break
        }
      } else if (speaking) {
        mouth = 'talk'
        open = b.level
        scaleY += b.level * 0.1
      } else if (hearing) {
        eyes = 'wide'
        mouth = 'o'
        rotZ = 0.12
      } else if (b.dance) {
        eyes = 'happy'
        mouth = 'laugh'
      }

      if (b.dance && !r) {
        swayY = Math.sin(t * 5) * 0.6
        rotZ = Math.sin(t * 10) * 0.12
        b.jumpY = Math.max(b.jumpY, Math.abs(Math.sin(t * 5)) * 0.35)
      }

      // Pirpirash
      if (eyes === 'open' && t > b.nextBlink) {
        b.blinkUntil = t + 0.13
        b.nextBlink = t + 2 + Math.random() * 3
      }
      if (eyes === 'open' && t < b.blinkUntil) eyes = 'closed'

      // Sakrash fizikasi
      b.jumpV -= 16 * dt
      b.jumpY = Math.max(0, b.jumpY + b.jumpV * dt)
      if (b.jumpY === 0 && b.jumpV < 0) {
        if (b.jumpV < -3) b.squash = 0.22
        b.jumpV = 0
      }
      b.squash *= Math.pow(0.02, dt)
      b.turned += (turnTarget - b.turned) * Math.min(1, dt * 6)
      b.tint += (tintTarget - b.tint) * Math.min(1, dt * 5)

      pivot.rotation.set(0, swayY + b.spin + b.turned, rotZ)
      const sy = scaleY - b.squash
      const sx = 1 + b.squash * 0.6 + (1 - scaleY) * 0.5
      pivot.scale.set(sx, sy, sx)
      pivot.position.y = FLOOR + b.jumpY
      shadow.scale.set(1.1 * (1 - b.jumpY * 0.3), 0.5 * (1 - b.jumpY * 0.3), 1)
      model.materials[0].color.setRGB(1, 1 - b.tint * 0.45, 1 - b.tint * 0.5)
      model.materials[1].color.setRGB(0.72, 0.72 * (1 - b.tint * 0.45), 0.78 * (1 - b.tint * 0.5))

      // Yuz faqat o'zgarganda qayta chiziladi (teksturani GPU'ga yuklash qimmat)
      const face: FaceState = { eyes, mouth, open, look: b.look, blush, t }
      const fk = `${eyes}|${mouth}|${Math.round(open * 8)}|${Math.round(b.look.x * 5)}|${Math.round(b.look.y * 5)}|${Math.round(blush * 4)}|${eyes === 'dizzy' ? Math.round(t * 12) : ''}`
      if (fk !== b.faceKey) {
        b.faceKey = fk
        renderFace(model.texCanvas, model.base, rig, face)
        model.texture.needsUpdate = true
      }
      // Qarash asta-sekin markazga qaytadi
      if (!b.press) {
        b.look.x *= Math.pow(0.4, dt)
        b.look.y *= Math.pow(0.4, dt)
      }
      renderer.render(scene, camera)
    }
    loop()

    const onResize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight)
      camera.aspect = host.clientWidth / host.clientHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      alive = false
      api.current = null
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      fx.dispose()
      model?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [image])

  // Mikrofon: sahna ochilishi bilan tinglay boshlaydi
  useEffect(() => {
    let cancelled = false
    void startEcho((s) => setMic(s))
      .then((h) => {
        if (cancelled) return h.stop()
        echoRef.current = h
        setMic('listening')
      })
      .catch(() => !cancelled && setMic('denied'))
    return () => {
      cancelled = true
      echoRef.current?.stop()
      echoRef.current = null
    }
  }, [])

  return (
    <div className="screen stage-screen">
      <div className="stage-curtain left" />
      <div className="stage-curtain right" />
      <div className="stage-valance" />
      <div className="stage-floor" />
      <div className="stage-spot" />

      <div
        className="stage-canvas"
        ref={hostRef}
        data-ready={ready ? '1' : '0'}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          api.current?.down(e)
        }}
        onPointerMove={(e) => api.current?.move(e)}
        onPointerUp={() => api.current?.up()}
        onPointerCancel={() => api.current?.up()}
      />

      <motion.div
        className={`mic-badge ${mic}`}
        data-mic={mic}
        animate={mic === 'listening' ? { scale: [1, 1.08, 1] } : mic === 'hearing' ? { scale: 1.2 } : { scale: 1 }}
        transition={mic === 'listening' ? { repeat: Infinity, duration: 1.4 } : {}}
      >
        {mic === 'speaking' ? (
          <svg viewBox="0 0 100 100" className="art">
            <path d="M20 40H38L60 20V80L38 60H20Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
            <path d="M70 34C78 42 78 58 70 66M80 24C94 38 94 62 80 76" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 100 100" className="art">
            <rect x={36} y={12} width={28} height={50} rx={14} fill={mic === 'hearing' ? '#ef476f' : '#06d6a0'} stroke="#3d2c1e" strokeWidth={5} />
            <path d="M24 50C24 66 36 74 50 74C64 74 76 66 76 50M50 74V88M36 88H64" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" />
            {mic === 'denied' && <path d="M18 18L82 82" stroke="#e63946" strokeWidth={8} strokeLinecap="round" />}
          </svg>
        )}
      </motion.div>

      <div className="stage-tools">
        <motion.button
          className={`tool ${dance ? 'on' : ''}`}
          whileTap={{ scale: 0.85 }}
          aria-label="Raqs"
          onClick={() => {
            const d = !dance
            setDance(d)
            api.current?.dance(d)
            setMusic(d)
            sfx.tap()
          }}
        >
          <svg viewBox="0 0 100 100" className="art">
            <path d="M40 74V20L80 12V66" fill="none" stroke="#3d2c1e" strokeWidth={7} strokeLinejoin="round" />
            <ellipse cx={30} cy={76} rx={12} ry={9} fill="#8e5bd6" stroke="#3d2c1e" strokeWidth={5} />
            <ellipse cx={70} cy={68} rx={12} ry={9} fill="#8e5bd6" stroke="#3d2c1e" strokeWidth={5} />
          </svg>
        </motion.button>
      </div>

      <button className="back-btn" onClick={onExit} aria-label="Orqaga">
        <svg viewBox="0 0 40 40" className="art">
          <path d="M24 10L12 20L24 30" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
