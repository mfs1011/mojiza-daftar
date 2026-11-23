import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { Icon } from '../art/Icon'
import { robotFx, setMusic, sfx, voiceFx } from '../lib/audio'
import { asset } from '../lib/assets'
import { getSettings } from '../lib/settings'
import { startEcho, type EchoHandle, type EchoState } from '../lib/voiceEcho'

// 🤖 Professional 3D qahramon: rassom yasagan model, skelet va motion-capture uslubidagi animatsiyalar
// (RobotExpressive, CC0 — public/assets/characters/CREDITS.md).
// Bolaning chizmasi qahramonni "kiyintiradi": ko'kragida nishon bo'lib turadi, tanasi chizmaning rangiga bo'yaladi.

type Kind = 'bonk' | 'hurt' | 'tickle' | 'pet' | 'dizzy' | 'joy' | 'angry' | 'poke' | 'wave' | 'squeeze'
type Zone = 'head' | 'body' | 'feet' | 'hand' | 'miss'
type Mic = EchoState | 'off' | 'denied'

/** Reaksiya → modelning tayyor animatsiyasi + yuz shakli */
const REACT: Record<Kind, { clip: string; then?: string; morph?: [string, number]; sound: keyof typeof voiceFx; dur: number }> = {
  bonk: { clip: 'No', morph: ['Sad', 1], sound: 'bonk', dur: 1.6 },
  hurt: { clip: 'Sitting', then: 'Standing', morph: ['Sad', 1], sound: 'ouch', dur: 3.2 },
  tickle: { clip: 'Dance', morph: ['Surprised', 0.8], sound: 'giggle', dur: 1.2 },
  pet: { clip: 'Yes', sound: 'purr', dur: 1.6 },
  dizzy: { clip: 'Death', then: 'Standing', morph: ['Surprised', 1], sound: 'woo', dur: 3.4 },
  joy: { clip: 'Jump', then: 'ThumbsUp', sound: 'yay', dur: 2.2 },
  angry: { clip: 'Punch', morph: ['Angry', 1], sound: 'grr', dur: 1.8 },
  poke: { clip: 'Jump', morph: ['Surprised', 1], sound: 'hmm', dur: 1 },
  wave: { clip: 'Wave', sound: 'yay', dur: 1.8 },
  squeeze: { clip: 'Sitting', morph: ['Angry', 0.6], sound: 'squeeze', dur: 1.2 },
}

interface Props {
  /** Qahramonni "kiyintiradigan" chizma (bo'lmasa — asl rangda) */
  decal: Blob | null
  onExit: () => void
}

/** Chizmaning eng ko'p uchraydigan to'yingan rangi — qahramon tanasi shu rangga bo'yaladi */
async function dominantColor(blob: Blob): Promise<THREE.Color | null> {
  const bmp = await createImageBitmap(blob)
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.drawImage(bmp, 0, 0, 64, 64)
  bmp.close()
  const d = g.getImageData(0, 0, 64, 64).data
  const bins = new Map<number, [number, number, number, number]>()
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue
    const max = Math.max(d[i], d[i + 1], d[i + 2])
    const min = Math.min(d[i], d[i + 1], d[i + 2])
    if (max - min < 40 || max < 60) continue // kulrang/qora chiziqlar emas, rangli joylar
    const k = ((d[i] >> 5) << 6) | ((d[i + 1] >> 5) << 3) | (d[i + 2] >> 5)
    const e = bins.get(k) ?? [0, 0, 0, 0]
    e[0] += d[i]
    e[1] += d[i + 1]
    e[2] += d[i + 2]
    e[3]++
    bins.set(k, e)
  }
  let best: [number, number, number, number] | null = null
  for (const e of bins.values()) if (!best || e[3] > best[3]) best = e
  if (!best || best[3] < 20) return null
  return new THREE.Color(best[0] / best[3] / 255, best[1] / best[3] / 255, best[2] / best[3] / 255).convertSRGBToLinear()
}

export function ProStage({ decal, onExit }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const echoRef = useRef<EchoHandle | null>(null)
  const api = useRef<{ down: (e: React.PointerEvent) => void; move: (e: React.PointerEvent) => void; up: () => void; dance: (on: boolean) => void } | null>(null)
  const [mic, setMic] = useState<Mic>('off')
  const [dance, setDance] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMusic(false)
    return () => setMusic(getSettings().music)
  }, [])

  useEffect(() => {
    const host = hostRef.current!
    let alive = true
    let raf = 0
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, host.clientWidth / host.clientHeight, 0.1, 100)
    camera.position.set(0, 3.4, 16)
    camera.lookAt(0, 2.5, 0)
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x5a3a2a, 1.4))
    const key = new THREE.DirectionalLight(0xffffff, 2.6)
    key.position.set(4, 9, 7)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -4
    key.shadow.camera.right = 4
    key.shadow.camera.top = 7
    key.shadow.camera.bottom = -1
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffc98a, 1.6)
    rim.position.set(-6, 5, -6)
    scene.add(rim)
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 48), new THREE.ShadowMaterial({ opacity: 0.32 }))
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    const ray = new THREE.Raycaster()
    const clock = new THREE.Clock()
    let mixer: THREE.AnimationMixer | null = null
    const actions = new Map<string, THREE.AnimationAction>()
    let current: THREE.AnimationAction | null = null
    let model: THREE.Object3D | null = null
    let headMesh: THREE.Mesh | null = null
    const bones: Record<string, THREE.Object3D | undefined> = {}
    const morphTarget: Record<string, number> = { Angry: 0, Surprised: 0, Sad: 0 }

    const b = {
      reaction: null as { kind: Kind; until: number } | null,
      lastTouch: 0,
      hits: [] as number[],
      press: null as null | { x: number; y: number; t: number; zone: Zone; path: number; rev: number; sx: number; lx: number; ly: number },
      rubbing: false,
      lastTap: { t: -9, zone: 'body' as Zone },
      dance: false,
      turn: 0,
      level: 0,
    }
    const now = () => clock.elapsedTime

    function play(name: string, once: boolean, fade = 0.25) {
      const a = actions.get(name)
      if (!a || a === current) return
      a.reset()
      a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity)
      a.clampWhenFinished = once
      a.enabled = true
      if (current) a.crossFadeFrom(current, fade, true)
      a.play()
      current = a
    }

    function react(kind: Kind) {
      const r = REACT[kind]
      const t = now()
      b.reaction = { kind, until: t + r.dur }
      b.lastTouch = t
      echoRef.current?.holdOff(r.dur + 0.4)
      // 3D robot — robotcha ovoz (sfx/robot-*)
      robotFx[r.sound]()
      play(r.clip, true)
      for (const k of Object.keys(morphTarget)) morphTarget[k] = 0
      if (r.morph) morphTarget[r.morph[0]] = r.morph[1]
      if (r.then) {
        const dur = actions.get(r.clip)?.getClip().duration ?? 1
        setTimeout(() => alive && b.reaction?.kind === kind && play(r.then!, true), dur * 1000 * 0.95)
      }
      if (kind === 'angry') b.turn = Math.PI
    }

    function zoneOf(e: React.PointerEvent): Zone {
      if (!model) return 'miss'
      const r = renderer.domElement.getBoundingClientRect()
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera)
      const hit = ray.intersectObject(model, true)[0]
      if (!hit) return 'miss'
      // Tekkan nuqtaga eng yaqin suyak (three.js nomlardan nuqtani olib tashlaydi: Foot.L → FootL)
      let best: Zone = 'body'
      let bd = Infinity
      const cand: [Zone, string][] = [['head', 'Head'], ['hand', 'HandL'], ['hand', 'HandR'], ['feet', 'FootL'], ['feet', 'FootR'], ['body', 'Torso']]
      for (const [z, n] of cand) {
        const bone = bones[n]
        if (!bone) continue
        const d = bone.getWorldPosition(new THREE.Vector3()).distanceTo(hit.point)
        if (d < bd) {
          bd = d
          best = z
        }
      }
      return best
    }

    api.current = {
      down: (e) => {
        b.lastTouch = now()
        const zone = zoneOf(e)
        b.press = { x: e.clientX, y: e.clientY, t: now(), zone, path: 0, rev: 0, sx: 0, lx: e.clientX, ly: e.clientY }
        b.rubbing = false
      },
      move: (e) => {
        const p = b.press
        if (!p) return
        const dx = e.clientX - p.lx
        p.path += Math.hypot(dx, e.clientY - p.ly)
        const sx = Math.abs(dx) > 2 ? Math.sign(dx) : 0
        if (sx && p.sx && sx !== p.sx) p.rev++
        if (sx) p.sx = sx
        p.lx = e.clientX
        p.ly = e.clientY
        if (p.zone !== 'miss' && p.path > 60 && p.rev >= 2 && !b.rubbing) {
          b.rubbing = true
          react(p.zone === 'head' ? 'pet' : 'tickle')
        }
      },
      up: () => {
        const p = b.press
        b.press = null
        if (!p || b.rubbing) return
        const t = now()
        if (b.reaction?.kind === 'squeeze') return react('joy')
        const dist = Math.hypot(p.lx - p.x, p.ly - p.y)
        if (dist > 70 && t - p.t < 0.4) return react('dizzy')
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
        if (!on) play('Idle', false)
      },
    }

    const url = asset('characters/robot.glb')
    if (url)
      new GLTFLoader().load(url, async (gltf) => {
        if (!alive) return
        model = SkeletonUtils.clone(gltf.scene)
        model.scale.setScalar(1.05)
        model.traverse((o) => {
          const m = o as THREE.Mesh
          if (m.isMesh) {
            m.castShadow = true
            if (m.morphTargetDictionary && 'Surprised' in m.morphTargetDictionary) headMesh = m
          }
          // Bo'g'inlar: modelda ular Bone yoki oddiy Object3D bo'lishi mumkin — nom bo'yicha olamiz
          if (o.name && (!bones[o.name] || (o as THREE.Bone).isBone)) bones[o.name] = o
        })
        // Chizma bilan "kiyintirish": tana rangi + ko'krakdagi nishon
        if (decal) {
          const col = await dominantColor(decal).catch(() => null)
          model.traverse((o) => {
            const m = o as THREE.Mesh
            const mat = m.material as THREE.MeshStandardMaterial | undefined
            if (m.isMesh && mat?.name === 'Main' && col) {
              m.material = mat.clone()
              ;(m.material as THREE.MeshStandardMaterial).color.copy(col)
            }
          })
          const bmp = await createImageBitmap(decal)
          const tex = new THREE.CanvasTexture(
            (() => {
              const c = document.createElement('canvas')
              const s = 256
              c.width = s
              c.height = s
              const g = c.getContext('2d')!
              // Oq "nishon" doirasi ichida bolaning rasmi
              g.fillStyle = '#fff'
              g.beginPath()
              g.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2)
              g.fill()
              g.lineWidth = 10
              g.strokeStyle = '#ffd166'
              g.stroke()
              const k = Math.min((s * 0.7) / bmp.width, (s * 0.7) / bmp.height)
              g.drawImage(bmp, (s - bmp.width * k) / 2, (s - bmp.height * k) / 2, bmp.width * k, bmp.height * k)
              return c
            })(),
          )
          tex.colorSpace = THREE.SRGBColorSpace
          const badge = new THREE.Mesh(new THREE.CircleGeometry(0.5, 40), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }))
          // Nishonni dunyo koordinatalarida ko'krak oldiga qo'yib, keyin ko'krak suyagiga biriktiramiz
          // (attach — dunyodagi joyi saqlanadi; robot harakatlansa, nishon ham u bilan birga yuradi)
          const chest = bones['Abdomen'] ?? bones['Torso']
          if (chest) {
            model.updateMatrixWorld(true)
            const box = new THREE.Box3().setFromObject(model)
            const c = chest.getWorldPosition(new THREE.Vector3())
            const bodyW = box.max.x - box.min.x
            badge.scale.setScalar(bodyW * 0.32)
            badge.position.set(c.x, c.y + bodyW * 0.08, box.max.z * 0.55)
            scene.add(badge)
            chest.attach(badge)
          }
        }
        scene.add(model)
        mixer = new THREE.AnimationMixer(model)
        for (const clip of gltf.animations) actions.set(clip.name, mixer.clipAction(clip))
        mixer.addEventListener('finished', () => {
          if (!b.reaction) play(b.dance ? 'Dance' : 'Idle', false, 0.35)
        })
        play('Idle', false)
        setReady(true)
        sfx.magic()
        react('wave')
        if (import.meta.env.DEV)
          (window as unknown as { __pro?: unknown }).__pro = () => {
            const at = (n: string) => {
              if (!bones[n]) return [0, 0]
              const v = bones[n]!.getWorldPosition(new THREE.Vector3()).project(camera)
              const r = renderer.domElement.getBoundingClientRect()
              return [r.left + ((v.x + 1) / 2) * r.width, r.top + ((1 - v.y) / 2) * r.height]
            }
            return { names: Object.keys(bones).join(','), reaction: b.reaction?.kind ?? null, clip: current?.getClip().name, head: at('Head'), body: at('Torso'), feet: at('FootL'), hand: at('HandR') }
          }
      })

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, clock.getDelta())
      const t = clock.elapsedTime
      mixer?.update(dt)
      if (model) {
        const echo = echoRef.current
        const st = echo?.state()
        const lvl = echo ? echo.level() : 0
        b.level += (lvl - b.level) * Math.min(1, dt * 18)
        if (b.reaction && t > b.reaction.until) {
          b.reaction = null
          b.turn = 0
          for (const k of Object.keys(morphTarget)) morphTarget[k] = 0
          play(b.dance ? 'Dance' : 'Idle', false, 0.4)
        }
        if (!b.reaction) {
          if (b.dance) play('Dance', false)
          morphTarget.Surprised = st === 'speaking' ? Math.min(1, b.level * 1.6) : st === 'hearing' ? 0.35 : 0
        }
        // Yuz shakllari silliq o'zgaradi
        if (headMesh?.morphTargetDictionary && headMesh.morphTargetInfluences) {
          for (const [k, v] of Object.entries(morphTarget)) {
            const i = headMesh.morphTargetDictionary[k]
            if (i !== undefined) headMesh.morphTargetInfluences[i] += (v - headMesh.morphTargetInfluences[i]) * Math.min(1, dt * 12)
          }
        }
        // Gapirganda bosh tovushga qarab irg'aydi (animatsiya ustidan)
        const head = bones['Head']
        if (head && st === 'speaking' && !b.reaction) head.rotation.x += b.level * 0.25
        if (head && st === 'hearing' && !b.reaction) head.rotation.z += 0.2
        model.rotation.y += (b.turn + Math.sin(t * 0.5) * 0.15 - model.rotation.y) * Math.min(1, dt * 4)
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
      mixer?.stopAllAction()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [decal])

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
      <motion.div className={`mic-badge ${mic}`} data-mic={mic} animate={mic === 'listening' ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={mic === 'listening' ? { repeat: Infinity, duration: 1.4 } : {}}>
        <svg viewBox="0 0 100 100" className="art">
          <rect x={36} y={12} width={28} height={50} rx={14} fill={mic === 'hearing' ? '#ef476f' : '#06d6a0'} stroke="#3d2c1e" strokeWidth={5} />
          <path d="M24 50C24 66 36 74 50 74C64 74 76 66 76 50M50 74V88M36 88H64" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" />
        </svg>
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
          <Icon name="music">
            <svg viewBox="0 0 100 100" className="art">
              <path d="M40 74V20L80 12V66" fill="none" stroke="#3d2c1e" strokeWidth={7} strokeLinejoin="round" />
              <ellipse cx={30} cy={76} rx={12} ry={9} fill="#8e5bd6" stroke="#3d2c1e" strokeWidth={5} />
              <ellipse cx={70} cy={68} rx={12} ry={9} fill="#8e5bd6" stroke="#3d2c1e" strokeWidth={5} />
            </svg>
          </Icon>
        </motion.button>
      </div>
      <button className="back-btn" onClick={onExit} aria-label="Orqaga">
        <Icon name="back">
          <svg viewBox="0 0 40 40" className="art">
            <path d="M24 10L12 20L24 30" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Icon>
      </button>
    </div>
  )
}
