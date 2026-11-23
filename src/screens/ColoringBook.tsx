import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Mascot } from '../art/Mascot'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { useMascot } from '../components/GameShell'
import { say, sfx } from '../lib/audio'
import { saveArtwork } from '../lib/db'
import { canvasToBlob, trimCanvas } from '../lib/image'
import type { Detail, LineArt } from '../lib/lineart'
import { drawPaths, lineArtAsync, loadImageData } from '../lib/lineartClient'
import type { Profile } from '../types'

// 📒 Bo'yash daftari: istalgan surat → chiziqli rasm.
//   1) Bola 3 ta variantdan birini tanlaydi (kam / o'rta / ko'p chiziq)
//   2) "Chiz": och kulrang chiziqlar ustidan barmog'i bilan yuradi (qo'l harakati, diqqat)
//   3) "Bo'ya": 🪣 bo'lakni bosib bo'yash yoki 🖌️ mo'yqalam; chiziqlar doim ustida qoladi
//   4) Tayyor rasm albomga saqlanadi

const COLORS = [
  '#e63946', '#f77f00', '#ffd166', '#52b788', '#2a9d8f', '#118ab2',
  '#8e5bd6', '#ff8fab', '#8d5524', '#f1c27d', '#adb5bd', '#3d2c1e',
]
const INK = '#3d2c1e'
/** Uzuq chiziq rangi: albomlardagidek kulrang-jigarrang */
const GUIDE = '#9c8f85'
const THRESHOLD: Record<Detail, number> = { 0: 0.6, 1: 0.55, 2: 0.5 }

type Phase = 'loading' | 'pick' | 'trace' | 'color' | 'done'

interface Props {
  profile: Profile
  file: Blob
  /** Tayyor rasmning fonsiz qismi: sahnada 3D qahramonga aylanadi */
  onDone: (cutout: Blob) => void
  onExit: () => void
}

function Preview({ art }: { art: LineArt }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    c.width = art.w
    c.height = art.h
    drawPaths(c.getContext('2d')!, art, { color: INK, width: art.thickness })
  }, [art])
  return <canvas ref={ref} className="preview-canvas" />
}

export function ColoringBook({ profile, file, onDone, onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [variants, setVariants] = useState<(LineArt | null)[]>([null, null, null])
  const [detail, setDetail] = useState<Detail>(0)
  const [art, setArt] = useState<LineArt | null>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const [coverage, setCoverage] = useState(0)
  const [tool, setTool] = useState<'fill' | 'brush'>('fill')
  const [color, setColor] = useState(COLORS[0])
  const [mascot, react] = useMascot()
  const cutoutRef = useRef<Blob | null>(null)

  const areaRef = useRef<HTMLDivElement>(null)
  const colorRef = useRef<HTMLCanvasElement>(null)
  const lineRef = useRef<HTMLCanvasElement>(null)
  const traceRef = useRef<HTMLCanvasElement>(null)
  /** Qamrovni o'lchash uchun ko'rinmas nusxa (rasm aniqligida) */
  const measureRef = useRef<HTMLCanvasElement | null>(null)
  /** Ekran canvas piksellari / rasm piksellari */
  const hiScale = useRef(1)
  const last = useRef<{ x: number; y: number } | null>(null)
  const history = useRef<ImageData[]>([])

  // 1) Suratni yuklash va 3 xil variant yasash (Web Worker'da)
  useEffect(() => {
    let alive = true
    void (async () => {
      const img = await loadImageData(file)
      for (const d of [0, 1, 2] as Detail[]) {
        const a = await lineArtAsync(img, d)
        if (!alive) return
        setVariants((v) => v.map((x, i) => (i === d ? a : x)))
        if (d === 0) {
          setPhase('pick')
          void say('boyash_tanla')
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [file])

  function choose(d: Detail) {
    const a = variants[d]
    if (!a) return
    sfx.pop()
    setDetail(d)
    setArt(a)
    setPhase('trace')
    void say('boyash_chiz')
  }

  // 2) Varaqni ekranga moslab joylash
  useLayoutEffect(() => {
    if (!art || !areaRef.current) return
    const r = areaRef.current.getBoundingClientRect()
    const s = Math.min(r.width / art.w, r.height / art.h)
    setSize({ w: art.w * s, h: art.h * s })
  }, [art])

  useEffect(() => {
    if (!art || !size) return
    // Bo'yoq qatlami rasm aniqligida (bo'laklar shu bo'yicha), chiziqlar esa ekran aniqligida — tiniq chiqadi
    const c0 = colorRef.current!
    c0.width = art.w
    c0.height = art.h
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    hiScale.current = (size.w * dpr) / art.w
    for (const c of [lineRef.current!, traceRef.current!]) {
      c.width = Math.round(size.w * dpr)
      c.height = Math.round(size.h * dpr)
    }
    const m = document.createElement('canvas')
    m.width = art.w
    m.height = art.h
    measureRef.current = m
    const cc = c0.getContext('2d')!
    cc.fillStyle = '#fff'
    cc.fillRect(0, 0, art.w, art.h)
    drawPaths(lineRef.current!.getContext('2d')!, art, { color: GUIDE, width: art.thickness * 0.8, scale: hiScale.current, dash: true })

    if (import.meta.env.DEV) {
      const r = lineRef.current!.getBoundingClientRect()
      const k = r.width / art.w
      const pts: [number, number][] = []
      for (let y = 0; y < art.h; y += 4)
        for (let x = 0; x < art.w; x += 4) if (art.lines[y * art.w + x]) pts.push([r.left + x * k, r.top + y * k])
      ;(window as unknown as { __linePoints?: [number, number][] }).__linePoints = pts
    }
  }, [art, size])

  const toWork = (e: React.PointerEvent) => {
    const r = lineRef.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) * art!.w) / r.width, y: ((e.clientY - r.top) * art!.h) / r.height }
  }

  function stroke(ctx: CanvasRenderingContext2D, a: { x: number; y: number }, b: { x: number; y: number }, c: string, width: number) {
    ctx.strokeStyle = c
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  // ---------- Chizish (trace) ----------

  function measure() {
    if (!art) return
    const d = measureRef.current!.getContext('2d')!.getImageData(0, 0, art.w, art.h).data
    let total = 0
    let hit = 0
    for (let i = 0; i < art.lines.length; i += 3) {
      if (!art.lines[i]) continue
      total++
      if (d[i * 4 + 3] > 30) hit++
    }
    const cov = total ? hit / total : 1
    setCoverage(cov)
    if (cov >= THRESHOLD[detail]) traced()
  }

  function traced() {
    sfx.magic()
    react('happy', 2000)
    burstAt(lineRef.current, ['#ffd166', '#06d6a0', '#ef476f'], 26)
    void say('barakalla')
    setPhase('color')
    const lc = lineRef.current!.getContext('2d')!
    lc.clearRect(0, 0, lineRef.current!.width, lineRef.current!.height)
    drawPaths(lc, art!, { color: INK, width: art!.thickness, scale: hiScale.current })
    setTimeout(() => void say('boyash_rang'), 1300)
  }

  // ---------- Bo'yash (color) ----------

  function snapshot() {
    const c = colorRef.current!
    history.current.push(c.getContext('2d')!.getImageData(0, 0, c.width, c.height))
    if (history.current.length > 12) history.current.shift()
  }

  function undo() {
    const prev = history.current.pop()
    if (!prev) return sfx.wrong()
    sfx.tap()
    colorRef.current!.getContext('2d')!.putImageData(prev, 0, 0)
  }

  function fill(p: { x: number; y: number }) {
    const a = art!
    let x = Math.min(a.w - 1, Math.max(0, Math.round(p.x)))
    let y = Math.min(a.h - 1, Math.max(0, Math.round(p.y)))
    // Chiziq ustiga bosilsa, eng yaqin bo'lakni topamiz
    if (a.lines[y * a.w + x]) {
      search: for (let r = 1; r < a.thickness * 3; r++)
        for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
          const xx = x + dx
          const yy = y + dy
          if (xx >= 0 && yy >= 0 && xx < a.w && yy < a.h && !a.lines[yy * a.w + xx]) {
            x = xx
            y = yy
            break search
          }
        }
    }
    const label = a.labels[y * a.w + x]
    snapshot()
    const ctx = colorRef.current!.getContext('2d')!
    const img = ctx.getImageData(0, 0, a.w, a.h)
    const d = img.data
    const rgb = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)]
    for (let i = 0; i < a.labels.length; i++) {
      if (a.labels[i] !== label) continue
      d[i * 4] = rgb[0]
      d[i * 4 + 1] = rgb[1]
      d[i * 4 + 2] = rgb[2]
      d[i * 4 + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    sfx.pop()
  }

  async function finish() {
    const a = art!
    // Albom uchun: ekran aniqligida (tiniq chiziqlar bilan)
    const out = document.createElement('canvas')
    out.width = lineRef.current!.width
    out.height = lineRef.current!.height
    const g = out.getContext('2d')!
    g.imageSmoothingEnabled = false
    g.drawImage(colorRef.current!, 0, 0, out.width, out.height)
    g.drawImage(lineRef.current!, 0, 0)

    // Sahna uchun "qahramon": rasm chetiga tegib turgan bo'laklar (osmon, yer, stol) fon hisoblanadi.
    // Qolgan bo'laklar (o'rtadagi narsa) kesib olinadi. Hech narsa qolmasa — butun rasm.
    const border = new Set<number>()
    for (let x = 0; x < a.w; x++) border.add(a.labels[x]).add(a.labels[(a.h - 1) * a.w + x])
    for (let y = 0; y < a.h; y++) border.add(a.labels[y * a.w]).add(a.labels[y * a.w + a.w - 1])
    const cut = document.createElement('canvas')
    cut.width = a.w
    cut.height = a.h
    const cg = cut.getContext('2d')!
    cg.drawImage(out, 0, 0, a.w, a.h)
    const img = cg.getImageData(0, 0, a.w, a.h)
    let kept = 0
    for (let i = 0; i < a.labels.length; i++) {
      // Fon bo'lagi, lekin boshqa bo'lak bilan chegaradagi chiziq qahramonga tegishli bo'lib qoladi
      const keep = !border.has(a.labels[i]) || (a.lines[i] && ((i % a.w > 0 && !border.has(a.labels[i - 1])) || (i % a.w < a.w - 1 && !border.has(a.labels[i + 1])) || (i >= a.w && !border.has(a.labels[i - a.w])) || (i < a.labels.length - a.w && !border.has(a.labels[i + a.w]))))
      if (keep) kept++
      else img.data[i * 4 + 3] = 0
    }
    cg.putImageData(img, 0, 0)
    const trimmed = kept > a.labels.length * 0.04 ? trimCanvas(cut, 6) : null
    const png = await canvasToBlob(out)
    const cutout = trimmed ? await canvasToBlob(trimmed) : png
    cutoutRef.current = cutout
    await saveArtwork(profile.id, png, cutout)
    setPhase('done')
  }

  // ---------- Ko'rinish ----------

  /** Chizish bosqichida: ekranda tiniq iz + o'lchash uchun nusxa */
  function traceStroke(a: { x: number; y: number }, b: { x: number; y: number }) {
    const k = hiScale.current
    const w = art!.thickness * 2.2
    stroke(traceRef.current!.getContext('2d')!, { x: a.x * k, y: a.y * k }, { x: b.x * k, y: b.y * k }, INK, w * k)
    stroke(measureRef.current!.getContext('2d')!, a, b, '#000', w)
  }

  const pointer = {
    onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!art || !e.isPrimary) return
      const p = toWork(e)
      if (phase === 'color' && tool === 'fill') return fill(p)
      e.currentTarget.setPointerCapture(e.pointerId)
      last.current = p
      if (phase === 'trace') return traceStroke(p, p)
      snapshot()
      stroke(colorRef.current!.getContext('2d')!, p, p, color, art.thickness * 3)
    },
    onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!last.current || !art) return
      const p = toWork(e)
      if (phase === 'trace') traceStroke(last.current, p)
      else stroke(colorRef.current!.getContext('2d')!, last.current, p, color, art.thickness * 3)
      last.current = p
    },
    onPointerUp: () => {
      if (!last.current) return
      last.current = null
      if (phase === 'trace') measure()
    },
    onPointerCancel: () => (last.current = null),
  }

  const goal = THRESHOLD[detail]

  return (
    <div className="screen studio coloring" data-phase={phase}>
      <div className="studio-wall" />

      {phase === 'loading' && (
        <div className="cb-loading">
          <motion.div className="cb-loading-mascot" animate={{ rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 0.8 }}>
            <Mascot mood="talk" />
          </motion.div>
          <div className="cb-dots">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }} />
            ))}
          </div>
        </div>
      )}

      {phase === 'pick' && (
        <div className="cb-pick">
          {variants.map((v, i) => (
            <motion.button
              key={i}
              className="cb-variant"
              data-detail={i}
              disabled={!v}
              onClick={() => choose(i as Detail)}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: i * 0.1 }}
              whileTap={{ scale: 0.92 }}
            >
              {v ? <Preview art={v} /> : <span className="cb-wait" />}
              <span className="cb-level">
                {Array.from({ length: i + 1 }, (_, j) => (
                  <i key={j} />
                ))}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {(phase === 'trace' || phase === 'color' || phase === 'done') && art && (
        <>
          {phase === 'trace' && (
            <div className="trace-progress">
              <motion.div className="trace-fill" animate={{ width: `${Math.min(100, (coverage / goal) * 100)}%` }} />
              <svg viewBox="0 0 40 40" className="art trace-pencil" style={{ left: `${Math.min(100, (coverage / goal) * 100)}%` }}>
                <path d="M6 34L10 22L28 4L36 12L18 30Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
                <path d="M6 34L10 22L18 30Z" fill="#f1c27d" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {phase === 'color' && (
            <div className="palette cb-palette">
              {COLORS.map((c) => (
                <motion.button
                  key={c}
                  className={`swatch ${color === c ? 'on' : ''}`}
                  style={{ background: c }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => (sfx.tap(), setColor(c))}
                />
              ))}
            </div>
          )}

          <div className="sheet-area" ref={areaRef}>
            {size && (
              <div className="sheet" style={{ width: size.w, height: size.h }}>
                <canvas ref={colorRef} className="sheet-layer" />
                <canvas ref={lineRef} className="sheet-layer" />
                <motion.canvas
                  ref={traceRef}
                  className="sheet-layer"
                  animate={{ opacity: phase === 'trace' ? 1 : 0 }}
                  style={{ pointerEvents: 'none' }}
                />
                <canvas className="sheet-layer touch" {...pointer} />
              </div>
            )}
          </div>

          <div className="tools">
            {phase === 'trace' ? (
              <motion.button className="tool" whileTap={{ scale: 0.85 }} onClick={traced} aria-label="O'tkazib yuborish">
                <svg viewBox="0 0 100 100" className="art">
                  <path d="M20 22L52 50L20 78ZM52 22L84 50L52 78Z" fill="#adb5bd" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
                </svg>
              </motion.button>
            ) : (
              <>
                <motion.button className={`tool ${tool === 'fill' ? 'on' : ''}`} whileTap={{ scale: 0.85 }} onClick={() => (sfx.tap(), setTool('fill'))} aria-label="Bo'yoq chelak">
                  <svg viewBox="0 0 100 100" className="art">
                    <path d="M22 44L50 16L78 44L50 72Z" fill={color} stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
                    <path d="M78 52C78 52 88 66 88 72C88 78 83 82 78 82C73 82 68 78 68 72C68 66 78 52 78 52Z" fill={color} stroke="#3d2c1e" strokeWidth={4} />
                  </svg>
                </motion.button>
                <motion.button className={`tool ${tool === 'brush' ? 'on' : ''}`} whileTap={{ scale: 0.85 }} onClick={() => (sfx.tap(), setTool('brush'))} aria-label="Mo'yqalam">
                  <svg viewBox="0 0 100 100" className="art">
                    <path d="M62 14L86 38L50 62L38 50Z" fill="#c68b59" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
                    <path d="M38 50L50 62C46 80 30 86 14 86C14 70 20 54 38 50Z" fill={color} stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
                  </svg>
                </motion.button>
                <motion.button className="tool" whileTap={{ scale: 0.85 }} onClick={undo} aria-label="Orqaga qaytarish">
                  <svg viewBox="0 0 100 100" className="art">
                    <path d="M30 40H64C76 40 84 50 84 62C84 74 76 82 64 82H40" fill="none" stroke="#3d2c1e" strokeWidth={9} strokeLinecap="round" />
                    <path d="M42 24L24 40L42 56" fill="none" stroke="#3d2c1e" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
                <motion.button
                  className="tool done"
                  whileTap={{ scale: 0.85 }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  onClick={() => void finish()}
                  aria-label="Tayyor"
                >
                  <svg viewBox="0 0 100 100" className="art">
                    <path d="M50 10L60 38L90 40L66 58L74 88L50 70L26 88L34 58L10 40L40 38Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </>
            )}
          </div>
        </>
      )}

      <button className="back-btn" onClick={onExit} aria-label="Orqaga">
        <svg viewBox="0 0 40 40" className="art">
          <path d="M24 10L12 20L24 30" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="mascot-corner">
        <Mascot key={mascot.key} mood={mascot.mood} />
      </div>

      {phase === 'done' && <Celebration voice={['boyash_tayyor']} onDone={() => onDone(cutoutRef.current!)} />}
    </div>
  )
}
