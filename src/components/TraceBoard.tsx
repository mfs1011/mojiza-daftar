import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../art/Icon'
import { sfx } from '../lib/audio'
import { drawGlyph, makeMask, maskPoints, scoreTrace, type Glyph, type TraceMask } from '../lib/trace'
import { burstAt } from './Fx'

// Bo'r taxtasi: bola harf, raqam yoki chiziq ustidan barmog'i bilan yurib chizadi.
// Yetarlicha qoplansa va chetga kam chiqsa — tayyor.

export function TraceBoard({ glyph, threshold, onDone, onMistake }: { glyph: Glyph; threshold: number; onDone: () => void; onMistake: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<HTMLCanvasElement>(null)
  const userRef = useRef<HTMLCanvasElement | null>(null)
  const maskRef = useRef<TraceMask | null>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [done, setDone] = useState(false)
  const doneRef = useRef(false)

  // Taxtani tayyorlash
  useEffect(() => {
    const wrap = wrapRef.current!
    const w = Math.round(wrap.clientWidth)
    const h = Math.round(wrap.clientHeight)
    const dpr = window.devicePixelRatio || 1
    for (const c of [guideRef.current!, drawRef.current!]) {
      c.width = w * dpr
      c.height = h * dpr
      c.style.width = `${w}px`
      c.style.height = `${h}px`
      c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const mask = makeMask(glyph, w, h)
    maskRef.current = mask
    const user = document.createElement('canvas')
    user.width = w
    user.height = h
    userRef.current = user

    const g = guideRef.current!.getContext('2d')!
    // Avval punktir kontur, ustidan to'liq bo'yoq: shriftning ichki chiziqlari yopiladi,
    // faqat tashqi punktir ko'rinadi
    if (typeof glyph === 'string') {
      drawGlyph(g, glyph, mask.layout, { stroke: 'rgba(255,255,255,0.85)', dash: [12, 10], strokeWidth: 7 })
      drawGlyph(g, glyph, mask.layout, { fill: '#3f8565' })
    } else {
      // Chiziq: keng yashil tasma, ustida punktir va boshlanish nuqtasi (qayerdan boshlashni ko'rsin)
      drawGlyph(g, glyph, mask.layout, { fill: '#3f8565' })
      drawGlyph(g, glyph, mask.layout, { stroke: 'rgba(255,255,255,0.9)', dash: [10, 12], strokeWidth: 5 })
      const L = mask.layout
      g.fillStyle = '#ffd166'
      g.beginPath()
      g.arc(L.x + (glyph.start[0] * L.size) / 100, L.y + (glyph.start[1] * L.size) / 100, L.lineWidth * 0.75, 0, Math.PI * 2)
      g.fill()
    }

    if (import.meta.env.DEV) {
      const r = wrap.getBoundingClientRect()
      ;(window as unknown as { __traceTargets?: [number, number][] }).__traceTargets = maskPoints(mask, r.left, r.top, 8)
    }
  }, [glyph])

  function pos(e: React.PointerEvent) {
    const r = drawRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function line(a: { x: number; y: number }, b: { x: number; y: number }) {
    const lw = maskRef.current!.layout.lineWidth
    for (const [ctx, color] of [
      [drawRef.current!.getContext('2d')!, '#ffe066'],
      [userRef.current!.getContext('2d')!, '#000'],
    ] as const) {
      ctx.strokeStyle = color
      ctx.lineWidth = lw
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
  }

  function clear(countMistake: boolean) {
    const m = maskRef.current
    if (!m) return
    const d = drawRef.current!
    d.getContext('2d')!.clearRect(0, 0, d.width, d.height)
    userRef.current!.getContext('2d')!.clearRect(0, 0, m.w, m.h)
    if (countMistake) onMistake()
  }

  function evaluate() {
    const m = maskRef.current
    if (!m || doneRef.current) return
    const data = userRef.current!.getContext('2d')!.getImageData(0, 0, m.w, m.h).data
    const s = scoreTrace(m, data)
    if (s.coverage >= threshold && s.outside <= 0.45) {
      doneRef.current = true
      setDone(true)
      const g = guideRef.current!.getContext('2d')!
      drawGlyph(g, glyph, m.layout, { fill: '#ffd166' })
      burstAt(wrapRef.current, ['#ffd166', '#fff', '#06d6a0'], 22)
      onDone()
    } else if (s.outside > 0.6 && s.userCount > 200) {
      // Juda ko'p chetga chiqdi: tozalab, qaytadan
      sfx.wrong()
      setTimeout(() => clear(true), 500)
    }
  }

  return (
    <div className="chalkboard" ref={wrapRef}>
      <canvas ref={guideRef} className="trace-canvas" />
      <motion.canvas
        ref={drawRef}
        className="trace-canvas draw"
        animate={done ? { opacity: 0 } : { opacity: 1 }}
        onPointerDown={(e) => {
          if (doneRef.current) return
          e.currentTarget.setPointerCapture(e.pointerId)
          last.current = pos(e)
          line(last.current, last.current)
        }}
        onPointerMove={(e) => {
          if (!last.current) return
          const p = pos(e)
          line(last.current, p)
          last.current = p
        }}
        onPointerUp={() => {
          last.current = null
          evaluate()
        }}
        onPointerCancel={() => (last.current = null)}
      />
      {!done && (
        <button className="sponge" onClick={() => clear(true)} aria-label="Tozalash">
          <Icon name="sponge"><svg viewBox="0 0 100 70" className="art">
            <rect x={6} y={10} width={88} height={50} rx={12} fill="#ffd166" stroke="#3d2c1e" strokeWidth={3} />
            <circle cx={30} cy={30} r={5} fill="#e9b949" />
            <circle cx={60} cy={40} r={6} fill="#e9b949" />
            <circle cx={74} cy={24} r={4} fill="#e9b949" />
          </svg></Icon>
        </button>
      )}
    </div>
  )
}

