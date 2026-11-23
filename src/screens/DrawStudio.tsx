import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Mascot } from '../art/Mascot'
import { burst } from '../components/Fx'
import { useMascot } from '../components/GameShell'
import { HoldButton } from '../components/HoldButton'
import { invalidateHero } from '../components/Hero'
import { say, sfx } from '../lib/audio'
import { getHero, listArtworks, saveHero, type Artwork } from '../lib/db'
import { canvasToBlob, photoToCutout, trimCanvas } from '../lib/image'
import type { Profile } from '../types'
import { CharacterCut } from './CharacterCut'
import { ColoringBook } from './ColoringBook'

// 3D sahna (three.js) og'ir: faqat kerak bo'lganda yuklanadi, ilova tezroq ochiladi
const Stage = lazy(() => import('./Stage').then((m) => ({ default: m.Stage })))

// 🎨 Rasm uyi (#10): bola qahramonini chizadi (yoki qog'ozdagi rasmini suratga oladi),
// keyin u "tiriladi" va butun o'yin davomida xaritada yuradigan qahramonga aylanadi.
// Yuqoridagi 📷/🖼️ tugmalar istalgan suratdan bo'yash daftari sahifasini ham yasaydi.

const COLORS = ['#3d2c1e', '#e63946', '#f77f00', '#ffd166', '#52b788', '#118ab2', '#8e5bd6', '#ff8fab', '#8d5524']
type Tool = { kind: 'color'; color: string } | { kind: 'eraser' }

interface Props {
  profile: Profile
  onDone: () => void
  onExit: () => void
}

export function DrawStudio({ profile, onDone, onExit }: Props) {
  const paperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [picked, setPicked] = useState<Blob | null>(null)
  const [coloring, setColoring] = useState<Blob | null>(null)
  const [cutting, setCutting] = useState<Blob | null>(null)
  const [album, setAlbum] = useState<{ art: Artwork; url: string }[] | null>(null)
  const [bigArt, setBigArt] = useState<{ art: Artwork; url: string } | null>(null)
  const [stage, setStage] = useState<Blob | null>(null)
  const history = useRef<ImageData[]>([])
  const last = useRef<{ x: number; y: number } | null>(null)
  const [tool, setTool] = useState<Tool>({ kind: 'color', color: COLORS[1] })
  const [thick, setThick] = useState(true)
  const [alive, setAlive] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [mascot, react] = useMascot()

  useEffect(() => {
    const paper = paperRef.current!
    const c = canvasRef.current!
    const dpr = window.devicePixelRatio || 1
    c.width = paper.clientWidth * dpr
    c.height = paper.clientHeight * dpr
    c.style.width = `${paper.clientWidth}px`
    c.style.height = `${paper.clientHeight}px`
    c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0)
    void say('rasm_intro')
  }, [])

  const ctx = () => canvasRef.current!.getContext('2d')!

  function snapshot() {
    const c = canvasRef.current!
    history.current.push(ctx().getImageData(0, 0, c.width, c.height))
    if (history.current.length > 20) history.current.shift()
  }

  function undo() {
    const prev = history.current.pop()
    if (!prev) return sfx.wrong()
    sfx.tap()
    ctx().putImageData(prev, 0, 0)
  }

  function clearAll() {
    snapshot()
    const c = canvasRef.current!
    ctx().clearRect(0, 0, c.width, c.height)
    sfx.whoosh()
  }

  function pos(e: React.PointerEvent) {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function segment(a: { x: number; y: number }, b: { x: number; y: number }) {
    const g = ctx()
    g.globalCompositeOperation = tool.kind === 'eraser' ? 'destination-out' : 'source-over'
    g.strokeStyle = tool.kind === 'color' ? tool.color : '#000'
    g.lineWidth = tool.kind === 'eraser' ? 34 : thick ? 16 : 7
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.beginPath()
    g.moveTo(a.x, a.y)
    g.lineTo(b.x, b.y)
    g.stroke()
    g.globalCompositeOperation = 'source-over'
  }

  async function fromPhoto(file: File) {
    setBusy(true)
    try {
      const cut = await photoToCutout(file)
      if (!cut) {
        react('oops')
        sfx.wrong()
        return
      }
      snapshot()
      const c = canvasRef.current!
      const w = c.clientWidth
      const h = c.clientHeight
      const s = Math.min((w * 0.9) / cut.width, (h * 0.9) / cut.height)
      ctx().clearRect(0, 0, c.width, c.height)
      ctx().drawImage(cut, (w - cut.width * s) / 2, (h - cut.height * s) / 2, cut.width * s, cut.height * s)
      sfx.magic()
      react('happy')
    } finally {
      setBusy(false)
    }
  }

  /** Sahnaga: hozirgi chizma (bo'sh bo'lmasa), aks holda saqlangan qahramon */
  async function openStage() {
    const trimmed = trimCanvas(canvasRef.current!, 12)
    const blob = trimmed ? await canvasToBlob(trimmed) : await getHero(profile.id)
    if (!blob) {
      sfx.wrong()
      react('oops')
      void say('rasm_intro')
      return
    }
    sfx.pop()
    setStage(blob)
  }

  function onPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) {
      sfx.pop()
      setPicked(f)
    }
  }

  async function bringToLife() {
    const trimmed = trimCanvas(canvasRef.current!, 12)
    if (!trimmed) {
      sfx.wrong()
      react('oops')
      void say('rasm_intro')
      return
    }
    const blob = await canvasToBlob(trimmed)
    setAlive(URL.createObjectURL(blob))
    sfx.magic()
    const r = paperRef.current!.getBoundingClientRect()
    burst(r.left + r.width / 2, r.top + r.height / 2, undefined, 28)
    await saveHero(profile.id, blob)
    invalidateHero(profile.id)
    await Promise.all([say('rasm_tirildi'), new Promise((res) => setTimeout(res, 3800))])
    onDone()
  }

  return (
    <div className="screen studio">
      <div className="studio-wall" />

      <div className="palette">
        {COLORS.map((c) => (
          <motion.button
            key={c}
            className={`swatch ${tool.kind === 'color' && tool.color === c ? 'on' : ''}`}
            style={{ background: c }}
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              sfx.tap()
              setTool({ kind: 'color', color: c })
            }}
          />
        ))}
        <button className={`thick-btn ${thick ? 'on' : ''}`} onClick={() => (sfx.tap(), setThick(true))} aria-label="Qalin">
          <span style={{ width: '5vmin', height: '5vmin' }} />
        </button>
        <button className={`thick-btn ${!thick ? 'on' : ''}`} onClick={() => (sfx.tap(), setThick(false))} aria-label="Ingichka">
          <span style={{ width: '2.2vmin', height: '2.2vmin' }} />
        </button>
      </div>

      <div className="paper" ref={paperRef}>
        <canvas
          ref={canvasRef}
          className="draw-canvas"
          onPointerDown={(e) => {
            if (alive || !e.isPrimary) return
            e.currentTarget.setPointerCapture(e.pointerId)
            snapshot()
            last.current = pos(e)
            segment(last.current, last.current)
          }}
          onPointerMove={(e) => {
            if (!last.current || !e.isPrimary) return
            const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
            const r = canvasRef.current!.getBoundingClientRect()
            for (const ev of events) {
              const p = { x: ev.clientX - r.left, y: ev.clientY - r.top }
              segment(last.current, p)
              last.current = p
            }
          }}
          onPointerUp={() => (last.current = null)}
          onPointerCancel={() => (last.current = null)}
        />
      </div>

      <div className="tools">
        <motion.button className={`tool ${tool.kind === 'eraser' ? 'on' : ''}`} whileTap={{ scale: 0.85 }} onClick={() => (sfx.tap(), setTool({ kind: 'eraser' }))} aria-label="O'chirg'ich">
          <svg viewBox="0 0 100 100" className="art">
            <path d="M20 66L56 22L86 46L54 86H30Z" fill="#ff8fab" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
            <path d="M38 46L68 70" stroke="#3d2c1e" strokeWidth={5} />
          </svg>
        </motion.button>
        <motion.button className="tool" whileTap={{ scale: 0.85 }} onClick={undo} aria-label="Orqaga qaytarish">
          <svg viewBox="0 0 100 100" className="art">
            <path d="M30 40H64C76 40 84 50 84 62C84 74 76 82 64 82H40" fill="none" stroke="#3d2c1e" strokeWidth={9} strokeLinecap="round" />
            <path d="M42 24L24 40L42 56" fill="none" stroke="#3d2c1e" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
        <HoldButton className="tool hold-clear" ms={900} onDone={clearAll}>
          <svg viewBox="0 0 100 100" className="art">
            <path d="M26 34H74L70 86H30Z" fill="#adb5bd" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
            <path d="M20 34H80M40 22H60" stroke="#3d2c1e" strokeWidth={6} strokeLinecap="round" />
          </svg>
        </HoldButton>
        <motion.button
          className="tool done"
          whileTap={{ scale: 0.85 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          onClick={() => void bringToLife()}
          aria-label="Tiriltirish"
        >
          <svg viewBox="0 0 100 100" className="art">
            <path d="M50 10L60 38L90 40L66 58L74 88L50 70L26 88L34 58L10 40L40 38Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>

      <div className="studio-top">
        <motion.button className="tool" whileTap={{ scale: 0.85 }} onClick={() => cameraRef.current?.click()} disabled={busy} aria-label="Suratga olish">
          <svg viewBox="0 0 100 100" className="art">
            <rect x={12} y={30} width={76} height={54} rx={10} fill="#118ab2" stroke="#3d2c1e" strokeWidth={5} />
            <path d="M34 30L40 18H60L66 30" fill="#118ab2" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
            <circle cx={50} cy={57} r={15} fill="#fff" stroke="#3d2c1e" strokeWidth={5} />
          </svg>
        </motion.button>
        <motion.button className="tool" whileTap={{ scale: 0.85 }} onClick={() => galleryRef.current?.click()} disabled={busy} aria-label="Galereyadan tanlash">
          <svg viewBox="0 0 100 100" className="art">
            <rect x={12} y={18} width={76} height={64} rx={8} fill="#fff" stroke="#3d2c1e" strokeWidth={5} />
            <path d="M16 74L38 48L54 64L64 54L84 74Z" fill="#52b788" stroke="#3d2c1e" strokeWidth={4} strokeLinejoin="round" />
            <circle cx={66} cy={36} r={8} fill="#ffd166" stroke="#3d2c1e" strokeWidth={4} />
          </svg>
        </motion.button>
        <motion.button
          className="tool"
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            sfx.tap()
            void listArtworks(profile.id).then((list) => setAlbum(list.map((art) => ({ art, url: URL.createObjectURL(art.png) }))))
          }}
          aria-label="Albom"
        >
          <svg viewBox="0 0 100 100" className="art">
            <rect x={18} y={14} width={64} height={74} rx={6} fill="#ef476f" stroke="#3d2c1e" strokeWidth={5} />
            <rect x={30} y={28} width={40} height={30} rx={4} fill="#fff" stroke="#3d2c1e" strokeWidth={4} />
            <path d="M18 76H82" stroke="#3d2c1e" strokeWidth={4} />
          </svg>
        </motion.button>
        <motion.button className="tool" whileTap={{ scale: 0.85 }} onClick={() => void openStage()} aria-label="Sahna">
          <svg viewBox="0 0 100 100" className="art">
            <path d="M10 14H90V86H10Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={5} />
            <path d="M10 14C10 50 26 70 40 86H10ZM90 14C90 50 74 70 60 86H90Z" fill="#c1121f" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
            <path d="M10 14H90V26H10Z" fill="#9d0208" stroke="#3d2c1e" strokeWidth={5} />
          </svg>
        </motion.button>
      </div>

      {/* 📷 to'g'ridan-to'g'ri kamera; 🖼️ galereya (Android tanlov oynasini ochadi) */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden data-source="camera" onChange={onPicked} />
      <input ref={galleryRef} type="file" accept="image/*" hidden data-source="gallery" onChange={onPicked} />

      <button className="back-btn" onClick={onExit} aria-label="Orqaga">
        <svg viewBox="0 0 40 40" className="art">
          <path d="M24 10L12 20L24 30" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="mascot-corner">
        <Mascot key={mascot.key} mood={mascot.mood} />
      </div>

      <AnimatePresence>
        {alive && (
          <motion.div className="alive-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="alive-rays" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }} />
            <motion.div
              className="alive-hero-wrap"
              initial={{ scale: 0.5, y: 60 }}
              animate={{ scale: [0.5, 1.25, 1], y: [60, -30, 0] }}
              transition={{ duration: 1.2 }}
            >
              {/* Qog'ozdan ko'tarilib, raqsga tushadi */}
              <motion.img
                src={alive}
                className="alive-hero"
                style={{ originY: 1 }}
                animate={{ y: [0, -26, 0], rotate: [-9, 9, -9], scaleY: [0.92, 1.07, 0.92] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 1.2 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {picked && (
          <motion.div className="choice-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPicked(null)}>
            <motion.button
              className="choice-card"
              data-choice="boyash"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation()
                setColoring(picked)
                setPicked(null)
              }}
            >
              <svg viewBox="0 0 100 100" className="art">
                <path d="M20 70C20 40 40 22 60 26C82 30 86 58 70 72C58 82 30 84 20 70Z" fill="#fff" stroke="#3d2c1e" strokeWidth={3} strokeDasharray="7 5" />
                <path d="M40 60C46 46 58 42 64 50" fill="none" stroke="#3d2c1e" strokeWidth={3} strokeDasharray="7 5" />
                <path d="M60 86L66 70L86 50L96 60L76 80Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
              </svg>
              <span>Chizib bo'yash</span>
            </motion.button>
            <motion.button
              className="choice-card"
              data-choice="qahramon"
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation()
                const f = picked
                setPicked(null)
                void fromPhoto(f as File)
              }}
            >
              <svg viewBox="0 0 100 100" className="art">
                <circle cx={50} cy={30} r={14} fill="#f77f00" stroke="#3d2c1e" strokeWidth={4} />
                <path d="M50 44V70M30 54H70M50 70L36 90M50 70L64 90" stroke="#118ab2" strokeWidth={7} strokeLinecap="round" />
                <path d="M80 12L84 22L94 24L86 30L88 40L80 34L72 40L74 30L66 24L76 22Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={2.5} />
              </svg>
              <span>Qahramon qilish</span>
            </motion.button>
            <motion.button
              className="choice-card"
              data-choice="personaj"
              initial={{ scale: 0, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation()
                setCutting(picked)
                setPicked(null)
              }}
            >
              <svg viewBox="0 0 100 100" className="art">
                <path d="M8 12H92V88H8Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={4} />
                <path d="M8 12C8 46 22 66 34 88H8ZM92 12C92 46 78 66 66 88H92Z" fill="#c1121f" stroke="#3d2c1e" strokeWidth={4} strokeLinejoin="round" />
                <circle cx={50} cy={46} r={16} fill="#8ecae6" stroke="#3d2c1e" strokeWidth={4} />
                <circle cx={44} cy={43} r={3} fill="#3d2c1e" />
                <circle cx={56} cy={43} r={3} fill="#3d2c1e" />
                <path d="M43 52Q50 60 57 52" fill="#5a1020" stroke="#3d2c1e" strokeWidth={3} />
                <path d="M36 70Q50 62 64 70V84H36Z" fill="#8ecae6" stroke="#3d2c1e" strokeWidth={4} />
              </svg>
              <span>Gapirtirish</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {album && (
        <div
          className="album-overlay"
          onClick={() => {
            album.forEach((a) => URL.revokeObjectURL(a.url))
            setAlbum(null)
            setBigArt(null)
          }}
        >
          {bigArt ? (
            <div className="album-big-wrap">
              <motion.img src={bigArt.url} className="album-big" initial={{ scale: 0.6 }} animate={{ scale: 1 }} />
              <motion.button
                className="tool album-stage"
                whileTap={{ scale: 0.85 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                aria-label="Sahnaga chiqarish"
                onClick={(e) => {
                  e.stopPropagation()
                  const blob = bigArt.art.cutout ?? bigArt.art.png
                  album.forEach((a) => URL.revokeObjectURL(a.url))
                  setAlbum(null)
                  setBigArt(null)
                  setStage(blob)
                }}
              >
                <svg viewBox="0 0 100 100" className="art">
                  <path d="M10 14H90V86H10Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={5} />
                  <path d="M10 14C10 50 26 70 40 86H10ZM90 14C90 50 74 70 60 86H90Z" fill="#c1121f" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>
          ) : album.length ? (
            <div className="album-grid">
              {album.map((a) => (
                <motion.button
                  key={a.url}
                  className="album-item"
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setBigArt(a)
                  }}
                >
                  <img src={a.url} alt="" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="album-empty">
              <Mascot mood="oops" />
            </div>
          )}
        </div>
      )}

      {coloring && (
        <ColoringBook
          profile={profile}
          file={coloring}
          onExit={() => setColoring(null)}
          onDone={(cutout) => {
            setColoring(null)
            setStage(cutout)
          }}
        />
      )}

      {cutting && (
        <CharacterCut
          profile={profile}
          file={cutting}
          onExit={() => setCutting(null)}
          onStage={(blob) => {
            setCutting(null)
            setStage(blob)
          }}
        />
      )}

      {stage && (
        <Suspense fallback={<div className="screen stage-screen" />}>
          <Stage image={stage} onExit={() => setStage(null)} />
        </Suspense>
      )}
    </div>
  )
}
