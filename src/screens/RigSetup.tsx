import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Mascot } from '../art/Mascot'
import { say, sfx } from '../lib/audio'
import type { Landmarks } from '../lib/landmarks'
import { Icon } from '../art/Icon'

// 🦴 Belgilash: ko'zlar, og'iz, qo'llar va oyoqlar qayerda?
// Avtomatik taxmin oldindan qo'yilgan; noto'g'ri bo'lsa barmoq bilan suriladi.
// Qo'l yoki oyoq yo'q bo'lsa (to'p, uy, mashina) — ✕ bilan olib tashlanadi.

type Key = keyof Landmarks
const LIMBS: Key[] = ['handL', 'handR', 'footL', 'footR']

function MarkIcon({ k }: { k: Key }) {
  if (k === 'eyeL' || k === 'eyeR')
    return (
      <svg viewBox="0 0 40 40" className="art">
        <ellipse cx={20} cy={20} rx={15} ry={17} fill="#fff" stroke="#3d2c1e" strokeWidth={3.5} />
        <circle cx={22} cy={22} r={7} fill="#1b1b1b" />
      </svg>
    )
  if (k === 'mouth')
    return (
      <svg viewBox="0 0 40 40" className="art">
        <path d="M6 16Q20 36 34 16Z" fill="#c1121f" stroke="#3d2c1e" strokeWidth={3.5} strokeLinejoin="round" />
      </svg>
    )
  if (k === 'handL' || k === 'handR')
    return (
      <svg viewBox="0 0 40 40" className="art" style={k === 'handL' ? { transform: 'scaleX(-1)' } : undefined}>
        <path d="M10 22V12a3 3 0 0 1 6 0v8V8a3 3 0 0 1 6 0v12V10a3 3 0 0 1 6 0v12l3-4a3 3 0 0 1 5 3l-6 11a8 8 0 0 1-7 4h-5a8 8 0 0 1-8-8Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 40 40" className="art" style={k === 'footL' ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M8 28V12a5 5 0 0 1 10 0v8l10 2a8 8 0 0 1 6 8v2H8Z" fill="#118ab2" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
    </svg>
  )
}

interface Props {
  image: Blob
  initial: Landmarks
  auto: Landmarks
  onDone: (m: Landmarks) => void
  onExit: () => void
}

export function RigSetup({ image, initial, auto, onDone, onExit }: Props) {
  const [marks, setMarks] = useState<Landmarks>(initial)
  const url = useMemo(() => URL.createObjectURL(image), [image])
  const [aspect, setAspect] = useState(1)
  const [drag, setDrag] = useState<Key | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)

  // URL faqat haqiqatan yopilganda bekor qilinadi (StrictMode qayta ulashda rasm yo'qolmasin)
  const revokeTimer = useRef<number | undefined>(undefined)
  useEffect(() => {
    window.clearTimeout(revokeTimer.current)
    const img = new Image()
    img.onload = () => setAspect(img.width / img.height)
    img.src = url
    void say('rig_belgila')
    return () => {
      revokeTimer.current = window.setTimeout(() => URL.revokeObjectURL(url), 1500)
    }
  }, [url])

  useEffect(() => {
    const r = areaRef.current!.getBoundingClientRect()
    const w = Math.min(r.width, r.height * aspect)
    setBox({ w, h: w / aspect })
  }, [aspect])

  const move = (e: React.PointerEvent) => {
    if (!drag) return
    const r = boxRef.current!.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    setMarks((m) => ({ ...m, [drag]: { x, y } }))
  }

  const removed = LIMBS.filter((k) => !marks[k])
  const restore = (k: Key) => {
    sfx.pop()
    // Avtomatik taxmin bo'lsa o'sha joyga, aks holda tana chetiga
    const fallback: Record<string, { x: number; y: number }> = {
      handL: { x: 0.15, y: 0.5 },
      handR: { x: 0.85, y: 0.5 },
      footL: { x: 0.38, y: 0.95 },
      footR: { x: 0.62, y: 0.95 },
    }
    setMarks((m) => ({ ...m, [k]: auto[k] ?? fallback[k] }))
  }

  return (
    <div className="screen studio rig-setup" onPointerMove={move} onPointerUp={() => setDrag(null)}>
      <div className="studio-wall" />
      <div className="rig-area" ref={areaRef}>
        {box && url && (
          <div className="rig-box" ref={boxRef} style={{ width: box.w, height: box.h }}>
            <img src={url} alt="" draggable={false} />
            <svg className="rig-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={[marks.eyeL, marks.mouth, marks.eyeR].map((p) => `${p.x * 100},${p.y * 100}`).join(' ')}
                fill="none"
                stroke="#ffd166"
                strokeWidth={0.6}
                strokeDasharray="2 2"
              />
            </svg>
            {(Object.keys(marks) as Key[]).map((k) => {
              const p = marks[k]
              if (!p) return null
              return (
                <motion.div
                  key={k}
                  className={`rig-mark ${k.startsWith('eye') || k === 'mouth' ? 'face' : 'limb'} ${drag === k ? 'drag' : ''}`}
                  data-mark={k}
                  style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: drag === k ? 1.25 : 1 }}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    ;(e.target as Element).setPointerCapture?.(e.pointerId)
                    setDrag(k)
                    sfx.tap()
                  }}
                >
                  <MarkIcon k={k} />
                  {LIMBS.includes(k) && (
                    <button
                      className="rig-x"
                      aria-label="Olib tashlash"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        sfx.whoosh()
                        setMarks((m) => ({ ...m, [k]: null }))
                      }}
                    >
                      ✕
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {removed.length > 0 && (
        <div className="rig-tray">
          {removed.map((k) => (
            <motion.button key={k} className="rig-add" data-add={k} whileTap={{ scale: 0.9 }} onClick={() => restore(k)} aria-label="Qaytarish">
              <MarkIcon k={k} />
              <span>+</span>
            </motion.button>
          ))}
        </div>
      )}

      <div className="tools">
        <motion.button className="tool" whileTap={{ scale: 0.85 }} aria-label="Avtomatik" onClick={() => (sfx.tap(), setMarks(auto))}>
          <Icon name="reset"><svg viewBox="0 0 100 100" className="art">
            <path d="M78 40A30 30 0 1 0 80 62" fill="none" stroke="#3d2c1e" strokeWidth={9} strokeLinecap="round" />
            <path d="M84 20V44H60" fill="none" stroke="#3d2c1e" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          </svg></Icon>
        </motion.button>
        <motion.button
          className="tool done"
          whileTap={{ scale: 0.85 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          aria-label="Tayyor"
          onClick={() => {
            sfx.success()
            onDone(marks)
          }}
        >
          <Icon name="done"><svg viewBox="0 0 100 100" className="art">
            <path d="M22 52L42 72L80 30" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          </svg></Icon>
        </motion.button>
      </div>

      <button className="back-btn" onClick={onExit} aria-label="Orqaga">
        <Icon name="back"><svg viewBox="0 0 40 40" className="art">
          <path d="M24 10L12 20L24 30" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg></Icon>
      </button>
      <div className="mascot-corner">
        <Mascot mood="talk" />
      </div>
    </div>
  )
}
