import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { setMusic, sfx, voiceFx } from '../lib/audio'
import { buildFaceRig, renderFace, type EyeState, type FaceRig, type FaceState, type MouthState } from '../lib/faceRig'
import { buildInflated, type Inflated } from '../lib/inflate'
import type { Landmarks } from '../lib/landmarks'
import { Particles } from '../lib/particles'
import { buildRig, clipPose, type Clip, type ClipCtx, type Rig } from '../lib/rig'
import { getSettings } from '../lib/settings'
import { startEcho, type EchoHandle, type EchoState } from '../lib/voiceEcho'

// 🎭 Sahna: bolaning rasmi suyakli 3D multfilm qahramoniga aylanadi.
//
//  Boshiga urilsa    → "voy!", boshini ushlaydi, ko'zini qisadi, yulduzchalar aylanadi
//  Oyog'iga urilsa   → og'rigan oyog'ini ko'tarib bir oyoqda sakraydi, ko'zidan yosh oqadi
//  Qo'liga tegsa     → qo'l silkitib salomlashadi
//  Qornini silasa    → qornini quchoqlab qiqirlab kuladi, tipirchilaydi
//  Boshini silasa    → boshini egib huzur qiladi, yuraklar uchadi
//  Tez surib yuborsa → gir aylanib, gandiraklaydi (ko'zlari spiral)
//  Bosib tursa       → qisiladi, qo'yib yuborsa sapchib quvonadi
//  Ikki marta tegsa  → qo'llarini ko'tarib sakraydi
//  3 marta ursa      → oyoq tepib jahl qiladi, keyin qo'lini qovushtirib teskari o'giriladi
//  Tegmasa           → kerishib esnaydi, keyin boshini egib uxlaydi; tegsa cho'chib uyg'onadi
//  Gapirsa           → qo'lini qulog'iga qo'yib tinglaydi, keyin o'sha gapni ingichka ovozda
//                      takrorlaydi: og'zi tovushga qarab (A/O/E/U/M) shakl oladi, qo'llari imo qiladi

type Kind = 'bonk' | 'hurt' | 'tickle' | 'pet' | 'dizzy' | 'squeeze' | 'joy' | 'angry' | 'poke' | 'wake' | 'yawn' | 'wave'
type Zone = 'head' | 'body' | 'feet' | 'hand' | 'miss'
type Mic = EchoState | 'off' | 'denied'

const DUR: Record<Kind, number> = {
  bonk: 1.3, hurt: 1.9, tickle: 0.8, pet: 0.9, dizzy: 2.6, squeeze: 999, joy: 1.4,
  angry: 4.4, poke: 0.8, wake: 1, yawn: 2.4, wave: 1.8,
}

interface Props {
  image: Blob
  marks: Landmarks
  onExit: () => void
  onEdit: () => void
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

export function Stage({ image, marks, onExit, onEdit }: Props) {
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
    let face: FaceRig | null = null
    let rig: Rig | null = null

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
      clip: 'idle' as Clip,
      clipStart: 0,
      gesture: { armL: 0, armR: 0, elbowL: 0, elbowR: 0, nod: 0 },
      lastLevel: 0,
      viseme: 'M' as MouthState,
      visemeAt: 0,
    }

    const now = () => clock.elapsedTime
    const grid = (x: number, y: number, z: number) => model!.group.localToWorld(new THREE.Vector3(x, y, z))
    const gridPt = (gx: number, gy: number, z: number) => grid(gx - model!.gw / 2, model!.gh / 2 - gy, z)
    const headWorld = () => {
      const m = model!
      return gridPt(((marks.eyeL.x + marks.eyeR.x) / 2) * m.gw, Math.min(marks.eyeL.y, marks.eyeR.y) * m.gh - rig!.grid.eyeDist * 1.1, m.face.eyeZ + 3)
    }
    const eyeWorld = (i: 0 | 1) => {
      const m = model!
      const e = i === 0 ? marks.eyeL : marks.eyeR
      return gridPt(e.x * m.gw, e.y * m.gh, m.face.eyeZ + 2)
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
          b.squash = -0.18
          for (let i = 0; i < 5; i++) fx.spawn('star', head, { life: 1.6, size: 0.22, orbit: { c: head, r: 0.45, a: (i / 5) * Math.PI * 2, speed: 5 } })
          break
        case 'hurt':
          voiceFx.ouch()
          b.jumpV = 3.2
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
          b.jumpV = 5.5
          for (let i = 0; i < 6; i++)
            fx.spawn(i % 2 ? 'heart' : 'sparkle', head, { vel: new THREE.Vector3((Math.random() - 0.5) * 2.4, 1.2 + Math.random() * 1.2, 0.5), gravity: 1.5, life: 1.3, size: 0.24 })
          break
        case 'wave':
          voiceFx.hmm()
          setTimeout(() => voiceFx.yay(), 250)
          break
        case 'angry':
          voiceFx.grr()
          break
        case 'poke':
          voiceFx.hmm()
          b.jumpV = 2.2
          break
        case 'wake':
          voiceFx.boing()
          b.sleeping = false
          b.jumpV = 4
          break
        case 'yawn':
          voiceFx.yawn()
          break
      }
    }

    // ---------- Imo-ishoralar ----------
    function hitZone(e: React.PointerEvent): Zone | null {
      if (!model || !rig) return null
      const r = renderer.domElement.getBoundingClientRect()
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera)
      const hit = ray.intersectObject(model.mesh)[0]
      if (!hit || !hit.uv) return null
      // UV = asl rasmdagi joy (poza qanday bo'lishidan qat'i nazar): qo'l qulog'ida bo'lsa ham "qo'l"
      const gx = hit.uv.x * model.gw
      const gy = (1 - hit.uv.y) * model.gh
      const local = { y: model.gh / 2 - gy }
      const g = rig.grid
      for (const hp of g.hands) if (hp && Math.hypot(hp.x - gx, hp.y - gy) < g.eyeDist * 1.1) return 'hand'
      if (gy < g.mouthY + g.eyeDist * 0.35) return 'head'
      // Oyoq: tizzadan pastda; oyoqsiz personajda — eng pastki 15%
      const rel = (local.y - model.yBot) / Math.max(1, model.yTop - model.yBot)
      if (g.kneeY !== null ? gy > g.kneeY - g.eyeDist * 0.2 : rel < 0.15) return 'feet'
      return 'body'
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
        if (p.zone === 'hand') return react('wave')
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
      const tw = m.texCanvas.width
      const th = m.texCanvas.height
      face = buildFaceRig(
        m.base,
        m.src,
        { x: (m.face.x + m.gw / 2) * m.texScale, y: (m.gh / 2 - m.face.y) * m.texScale, spacing: m.face.spacing * m.texScale },
        {
          eyeL: { x: marks.eyeL.x * tw, y: marks.eyeL.y * th },
          eyeR: { x: marks.eyeR.x * tw, y: marks.eyeR.y * th },
          mouth: { x: marks.mouth.x * tw, y: marks.mouth.y * th },
        },
      )
      rig = buildRig(m, marks)
      setReady(true)
      sfx.magic()
      b.lastTouch = now()
      react('wave')

      if (import.meta.env.DEV) {
        const project = (gx: number, gy: number) => {
          const v = gridPt(gx, gy, m.face.eyeZ + 1).project(camera)
          const r = renderer.domElement.getBoundingClientRect()
          return [r.left + ((v.x + 1) / 2) * r.width, r.top + ((1 - v.y) / 2) * r.height]
        }
        // Modelga haqiqatan tegadigan nuqtani qidirish (ingichka qo'l/oyoqlar uchun)
        const onModel = (gx: number, gy: number) => {
          for (let d = 0; d < 20; d++)
            for (const [ox, oy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) {
              const v = gridPt(gx + ox, gy + oy, 0).project(camera)
              ray.setFromCamera(new THREE.Vector2(v.x, v.y), camera)
              if (ray.intersectObject(m.mesh).length) return project(gx + ox, gy + oy)
            }
          return project(gx, gy)
        }
        const g = () => rig!.grid
        ;(window as unknown as { __stage?: unknown }).__stage = () => ({
          reaction: b.reaction?.kind ?? null,
          clip: b.clip,
          viseme: b.viseme,
          sleeping: b.sleeping,
          drawnFace: face?.drawn ?? false,
          overlay: face?.overlay ?? null,
          head: onModel(((marks.eyeL.x + marks.eyeR.x) / 2) * m.gw, g().eyeY - g().eyeDist * 0.3),
          body: onModel(((marks.eyeL.x + marks.eyeR.x) / 2) * m.gw, g().mouthY + g().eyeDist * 1.6),
          feet: marks.footL ? onModel(marks.footL.x * m.gw, marks.footL.y * m.gh - g().eyeDist * 0.5) : onModel(m.gw / 2, m.gh / 2 - m.yBot - 3),
          hand: marks.handR ? onModel(marks.handR.x * m.gw - g().eyeDist * 0.5, marks.handR.y * m.gh) : null,
        })
        ;(window as unknown as { __stageZone?: unknown }).__stageZone = (x: number, y: number) =>
          hitZone({ clientX: x, clientY: y } as React.PointerEvent)
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
      if (!model || !face || !rig) {
        renderer.render(scene, camera)
        return
      }
      const echo = echoRef.current
      const st = echo?.state()
      const speaking = st === 'speaking'
      const hearing = st === 'hearing'
      if (speaking || hearing) b.lastTouch = t
      const lvl = echo ? echo.level() : 0
      b.level += (lvl - b.level) * Math.min(1, dt * 18)

      const pr = b.press
      if (pr && pr.zone !== 'miss' && pr.zone !== 'hand' && !b.rubbing && t - pr.t > 0.6 && pr.path < 25 && b.reaction?.kind !== 'squeeze') react('squeeze')
      if (b.reaction && t > b.reaction.until) b.reaction = null
      const r = b.reaction
      const rt = r ? t - r.start : 0
      const idle = t - b.lastTouch

      if (!r && !b.dance && !b.sleeping && idle > 12 && !b.yawned) {
        react('yawn')
        b.yawned = true
        b.lastTouch = t - 12
      }
      if (!r && !b.dance && idle > 22) b.sleeping = true

      // ---- Qaysi klip, qanday yuz ----
      let clip: Clip = 'idle'
      let eyes: EyeState = 'open'
      let mouth: MouthState = 'rest'
      let open = 0
      let blush = 0
      let tintTarget = 0
      let turnTarget = 0

      if (b.sleeping && !r) {
        clip = 'sleep'
        eyes = 'closed'
        mouth = 'o'
        if (t > b.nextFx) {
          b.nextFx = t + 1.4
          fx.spawn('z', headWorld().add(new THREE.Vector3(0.3, 0, 0)), { vel: new THREE.Vector3(0.25, 0.4, 0), life: 2.2, size: 0.26 })
        }
        if (t > b.nextSnore) {
          b.nextSnore = t + 3.2
          voiceFx.snore()
        }
      } else if (r) {
        switch (r.kind) {
          case 'bonk':
            clip = 'bonk'
            eyes = 'squeeze'
            mouth = 'ouch'
            break
          case 'hurt':
            clip = 'hurt'
            eyes = rt < 0.6 ? 'squeeze' : 'sad'
            mouth = rt < 0.6 ? 'ouch' : 'sad'
            break
          case 'tickle':
            clip = 'tickle'
            eyes = 'happy'
            mouth = 'laugh'
            blush = 1
            if (t > b.nextFx) {
              b.nextFx = t + 0.35
              voiceFx.giggle()
              fx.spawn('sparkle', headWorld(), { vel: new THREE.Vector3((Math.random() - 0.5) * 2, 1.2, 0.4), gravity: 1, life: 0.9, size: 0.2 })
            }
            break
          case 'pet':
            clip = 'pet'
            eyes = 'happy'
            mouth = 'smile'
            blush = 0.8
            if (t > b.nextFx) {
              b.nextFx = t + 0.5
              fx.spawn('heart', headWorld(), { vel: new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.9, 0.3), life: 1.4, size: 0.22 })
            }
            break
          case 'dizzy':
            clip = 'dizzy'
            if (rt < 0.8) {
              b.spin = (rt / 0.8) * Math.PI * 4
              eyes = 'squeeze'
              mouth = 'o'
            } else {
              b.spin = 0
              eyes = 'dizzy'
              mouth = 'o'
            }
            break
          case 'squeeze':
            clip = 'squeeze'
            eyes = 'squeeze'
            mouth = 'grr'
            break
          case 'joy':
            clip = 'joy'
            eyes = 'happy'
            mouth = 'laugh'
            blush = 0.5
            break
          case 'wave':
            clip = 'wave'
            eyes = rt < 1.2 ? 'happy' : 'open'
            mouth = 'smile'
            break
          case 'angry':
            if (rt < 1.8) {
              clip = 'angry'
              eyes = 'angry'
              mouth = 'grr'
              tintTarget = 1
              if (t > b.nextFx) {
                b.nextFx = t + 0.3
                const h = headWorld()
                for (const s of [-1, 1]) fx.spawn('steam', h.clone().add(new THREE.Vector3(s * 0.35, 0, 0)), { vel: new THREE.Vector3(s * 0.6, 1, 0), life: 0.8, size: 0.26 })
              }
            } else if (rt < 3.8) {
              clip = 'sulk'
              turnTarget = Math.PI
              tintTarget = 0.5
              eyes = 'angry'
              mouth = 'sad'
            } else {
              clip = 'wave'
              eyes = 'happy'
              mouth = 'smile'
            }
            break
          case 'poke':
          case 'wake':
            clip = 'startle'
            eyes = 'wide'
            mouth = 'o'
            break
          case 'yawn':
            clip = 'yawn'
            eyes = 'sleepy'
            mouth = 'talk'
            open = Math.sin(Math.min(1, rt / DUR.yawn) * Math.PI)
            break
        }
      } else if (speaking) {
        clip = 'talk'
        // Lip-sync: ovoz chastotalariga qarab og'iz shakli (har 70 ms dan tez almashmaydi)
        if (t - b.visemeAt > 0.07) {
          b.visemeAt = t
          const [lo, mid, hi] = echo!.bands()
          const tot = lo + mid + hi + 1e-3
          // Nisbiy ulushlar: yuqori chastota ko'p — "E/I" (keng og'iz), past chastota ko'p — "O/U" (dumaloq)
          if (b.level < 0.07) b.viseme = 'M'
          else if (hi / tot > 0.27) b.viseme = 'E'
          else if (lo / tot > 0.56) b.viseme = b.level < 0.35 ? 'U' : 'O'
          else b.viseme = 'A'
        }
        mouth = b.viseme
        open = b.level
        // Har bo'g'in boshida yangi qo'l imo-ishorasi va bosh irg'ash
        if (b.level > 0.32 && b.lastLevel <= 0.32) {
          const R = Math.random
          b.gesture = {
            armL: rig.hasArms.L && R() < 0.6 ? 0.3 + R() * 0.9 : 0,
            armR: rig.hasArms.R && R() < 0.7 ? 0.3 + R() * 1.0 : 0,
            elbowL: R() * 1.2,
            elbowR: R() * 1.3,
            nod: (R() - 0.3) * 0.2,
          }
        }
        b.lastLevel = b.level
      } else if (hearing) {
        clip = 'listen'
        eyes = 'wide'
        mouth = 'o'
      } else if (b.dance) {
        clip = 'dance'
        eyes = 'happy'
        mouth = 'laugh'
      }
      if (!speaking) b.gesture = { armL: 0, armR: 0, elbowL: 0, elbowR: 0, nod: 0 }

      if (clip !== b.clip) {
        b.clip = clip
        b.clipStart = t
      }
      const ctx: ClipCtx = { t, rt: r ? rt : t - b.clipStart, rest: rig.rest, level: b.level, look: b.look, gesture: b.gesture }
      rig.update(clipPose(clip, ctx), dt)

      if (eyes === 'open' && t > b.nextBlink) {
        b.blinkUntil = t + 0.13
        b.nextBlink = t + 2 + Math.random() * 3
      }
      if (eyes === 'open' && t < b.blinkUntil) eyes = 'closed'

      // Butun tana: sakrash fizikasi, yengil burilish, jahlda o'girilish
      b.jumpV -= 16 * dt
      b.jumpY = Math.max(0, b.jumpY + b.jumpV * dt)
      if (b.jumpY === 0 && b.jumpV < 0) {
        if (b.jumpV < -3) b.squash = 0.14
        b.jumpV = 0
      }
      b.squash *= Math.pow(0.02, dt)
      b.turned += (turnTarget - b.turned) * Math.min(1, dt * 6)
      b.tint += (tintTarget - b.tint) * Math.min(1, dt * 5)
      pivot.rotation.set(0, Math.sin(t * 0.5) * 0.18 + b.spin + b.turned, 0)
      pivot.scale.set(1 + b.squash * 0.6, 1 - b.squash, 1 + b.squash * 0.6)
      pivot.position.y = FLOOR + b.jumpY
      shadow.scale.set(1.1 * (1 - b.jumpY * 0.3), 0.5 * (1 - b.jumpY * 0.3), 1)
      model.materials[0].color.setRGB(1, 1 - b.tint * 0.45, 1 - b.tint * 0.5)
      model.materials[1].color.setRGB(0.72, 0.72 * (1 - b.tint * 0.45), 0.78 * (1 - b.tint * 0.5))

      const fs: FaceState = { eyes, mouth, open, look: b.look, blush, t }
      const fk = `${eyes}|${mouth}|${Math.round(open * 8)}|${Math.round(b.look.x * 5)}|${Math.round(b.look.y * 5)}|${Math.round(blush * 4)}|${eyes === 'dizzy' ? Math.round(t * 12) : ''}`
      if (fk !== b.faceKey) {
        b.faceKey = fk
        renderFace(model.texCanvas, model.base, face, fs)
        model.texture.needsUpdate = true
      }
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
      rig?.dispose()
      model?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [image, marks])

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
        <motion.button className="tool" whileTap={{ scale: 0.85 }} aria-label="Belgilarni tuzatish" onClick={() => (sfx.tap(), onEdit())}>
          <svg viewBox="0 0 100 100" className="art">
            <circle cx={30} cy={30} r={12} fill="#fff" stroke="#3d2c1e" strokeWidth={5} />
            <circle cx={70} cy={70} r={12} fill="#fff" stroke="#3d2c1e" strokeWidth={5} />
            <path d="M38 38L62 62" stroke="#3d2c1e" strokeWidth={10} strokeLinecap="round" />
          </svg>
        </motion.button>
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
