import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Mascot } from '../art/Mascot'
import { burst } from '../components/Fx'
import { useMascot } from '../components/GameShell'
import { invalidateHero } from '../components/Hero'
import { sfx } from '../lib/audio'
import { autoCut, loadForCut, removeAt, renderCut, type CutState } from '../lib/cutout'
import { saveHero } from '../lib/db'
import { canvasToBlob } from '../lib/image'
import type { Profile } from '../types'
import { Icon } from '../art/Icon'

// ✂️ Tayyor personaj (PNG/JPEG) → fonsiz personaj → 🎭 sahna.
// Avtomatik kesishdan keyin qolib ketgan fon joyini bossa — o'sha joy o'chadi.

interface Props {
  profile: Profile
  file: Blob
  onStage: (cutout: Blob) => void
  onExit: () => void
}

export function CharacterCut({ profile, file, onStage, onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<CutState | null>(null)
  const [alpha, setAlpha] = useState<Uint8ClampedArray | null>(null)
  const history = useRef<Uint8ClampedArray[]>([])
  const [saved, setSaved] = useState(false)
  const [mascot, react] = useMascot()

  useEffect(() => {
    let alive = true
    void loadForCut(file).then((src) => {
      // Og'ir hisob: brauzer avval "yuklanmoqda" holatini chizib olsin
      setTimeout(() => {
        if (!alive) return
        const s = autoCut(src)
        setState(s)
        setAlpha(s.alpha)
        sfx.magic()
        react('happy')
      }, 50)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  // Ko'rinish: asl rasm + joriy shaffoflik
  useEffect(() => {
    if (!state || !alpha) return
    const c = canvasRef.current!
    const { width: w, height: h, data } = state.src
    c.width = w
    c.height = h
    const img = new ImageData(new Uint8ClampedArray(data), w, h)
    for (let i = 0; i < w * h; i++) img.data[i * 4 + 3] = alpha[i]
    c.getContext('2d')!.putImageData(img, 0, 0)
    if (import.meta.env.DEV) {
      let shown = 0
      for (const a of alpha) if (a > 40) shown++
      ;(window as unknown as { __cut?: unknown }).__cut = { mode: state.mode, fg: shown / alpha.length }
    }
  }, [state, alpha])

  function tap(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!state || !alpha) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * state.src.width
    const y = ((e.clientY - r.top) / r.height) * state.src.height
    const next = removeAt({ ...state, alpha }, x, y)
    if (next.every((v, i) => v === alpha[i])) return sfx.wrong()
    history.current.push(alpha)
    setAlpha(next)
    sfx.pop()
    burst(e.clientX, e.clientY, ['#fff', '#ffd166', '#a2d2ff'], 10)
  }

  async function result(): Promise<Blob | null> {
    if (!state || !alpha) return null
    const c = renderCut(state, alpha)
    if (!c) {
      sfx.wrong()
      react('oops')
      return null
    }
    return canvasToBlob(c)
  }

  return (
    <div className="screen studio cut-screen">
      <div className="studio-wall" />

      <div className="cut-area">
        {!state && (
          <motion.div className="cb-loading-mascot" animate={{ rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 0.8 }}>
            <Mascot mood="talk" />
          </motion.div>
        )}
        <canvas ref={canvasRef} className="cut-canvas" style={{ display: state ? 'block' : 'none' }} onPointerDown={tap} data-mode={state?.mode ?? ''} />
      </div>

      <div className="tools">
        <motion.button
          className="tool"
          whileTap={{ scale: 0.85 }}
          aria-label="Orqaga qaytarish"
          onClick={() => {
            const prev = history.current.pop()
            if (!prev) return sfx.wrong()
            sfx.tap()
            setAlpha(prev)
          }}
        >
          <Icon name="undo"><svg viewBox="0 0 100 100" className="art">
            <path d="M30 40H64C76 40 84 50 84 62C84 74 76 82 64 82H40" fill="none" stroke="#3d2c1e" strokeWidth={9} strokeLinecap="round" />
            <path d="M42 24L24 40L42 56" fill="none" stroke="#3d2c1e" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          </svg></Icon>
        </motion.button>
        <motion.button
          className={`tool ${saved ? 'on' : ''}`}
          whileTap={{ scale: 0.85 }}
          aria-label="Qahramonim qilish"
          onClick={async () => {
            const blob = await result()
            if (!blob) return
            await saveHero(profile.id, blob)
            invalidateHero(profile.id)
            setSaved(true)
            sfx.success()
            react('happy')
          }}
        >
          <Icon name="hero"><svg viewBox="0 0 100 100" className="art">
            <circle cx={50} cy={32} r={16} fill="#ffd166" stroke="#3d2c1e" strokeWidth={5} />
            <path d="M20 88C20 64 34 54 50 54C66 54 80 64 80 88Z" fill="#118ab2" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
            {saved && <path d="M60 70L70 80L88 58" fill="none" stroke="#06d6a0" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />}
          </svg></Icon>
        </motion.button>
        <motion.button
          className="tool done"
          whileTap={{ scale: 0.85 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          aria-label="Sahnaga"
          disabled={!state}
          onClick={async () => {
            const blob = await result()
            if (blob) onStage(blob)
          }}
        >
          <Icon name="stage"><svg viewBox="0 0 100 100" className="art">
            <path d="M10 14H90V86H10Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={5} />
            <path d="M10 14C10 50 26 70 40 86H10ZM90 14C90 50 74 70 60 86H90Z" fill="#c1121f" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
          </svg></Icon>
        </motion.button>
      </div>

      {state && (
        <div className="cut-hint">
          <svg viewBox="0 0 100 100" className="art">
            <path d="M30 70L70 30" stroke="#3d2c1e" strokeWidth={10} strokeLinecap="round" />
            <path d="M70 30L76 14L82 30L98 36L82 42L76 58L70 42L54 36Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={4} strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <button className="back-btn" onClick={onExit} aria-label="Orqaga">
        <Icon name="back"><svg viewBox="0 0 40 40" className="art">
          <path d="M24 10L12 20L24 30" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg></Icon>
      </button>
      <div className="mascot-corner">
        <Mascot key={mascot.key} mood={mascot.mood} />
      </div>
    </div>
  )
}
