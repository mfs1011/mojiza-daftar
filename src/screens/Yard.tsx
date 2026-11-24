import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../art/Icon'
import { DecorArt, type DecorKind } from '../art/Scenery'
import { burst } from '../components/Fx'
import { Hero } from '../components/Hero'
import { artUrl } from '../lib/assets'
import { objectSound, say, sfx } from '../lib/audio'
import type { PlacedDecor, Profile } from '../types'

// 🏡 Mening hovlim: bekat yo'llarida yutilgan sovg'alar shu yerga joylanadi (qishloq xaritasi toza qoladi).
//   • pastdagi qutidan sovg'ani tanlab, hovlining istalgan joyiga bosib qo'yadi
//   • qo'yilgan narsani sudrab joyini o'zgartiradi
//   • narsaga tegsa — o'z ovozini chiqaradi (hayvon — haqiqiy ovoz, quduq — suv, daraxt — barglar...)

interface Props {
  profile: Profile
  village: PlacedDecor[]
  inbox: DecorKind[]
  onSave: (village: PlacedDecor[], inbox: DecorKind[]) => void
  onBack: () => void
}

export function Yard({ profile, village, inbox, onSave, onBack }: Props) {
  const groundRef = useRef<HTMLDivElement>(null)
  const [placing, setPlacing] = useState<number | null>(null)
  const [poked, setPoked] = useState<{ i: number; n: number } | null>(null)
  const dragged = useRef(false)
  const bg = artUrl('bg/garden')

  useEffect(() => {
    if (inbox.length) void say('hovli_joyla')
    // Faqat ochilganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Ekran nuqtasi → hovlidagi % (pastki 55% — yer) */
  function toYard(x: number, y: number) {
    const r = groundRef.current!.getBoundingClientRect()
    return {
      x: Math.max(4, Math.min(96, ((x - r.left) / r.width) * 100)),
      y: Math.max(42, Math.min(96, ((y - r.top) / r.height) * 100)),
    }
  }

  function place(e: React.MouseEvent) {
    if (placing === null) return
    const p = toYard(e.clientX, e.clientY)
    sfx.thump()
    burst(e.clientX, e.clientY, ['#ffd166', '#06d6a0', '#ef476f'], 16)
    const kind = inbox[placing]
    onSave([...village, { kind, ...p }], inbox.filter((_, i) => i !== placing))
    setPlacing(null)
    void objectSound(kind)
  }

  return (
    <div className="screen yard" style={bg ? { backgroundImage: `url("${bg}")` } : undefined}>
      <div className="yard-ground" ref={groundRef} onClick={place}>
        {village
          .map((d, i) => ({ d, i }))
          .sort((a, b) => a.d.y - b.d.y)
          .map(({ d, i }) => (
            <motion.div
              key={`${i}-${d.x}-${d.y}`}
              className={`yard-item ${d.kind.startsWith('hayvon_') ? 'animal' : ''}`}
              data-kind={d.kind}
              style={{ left: `${d.x}%`, top: `${d.y}%`, zIndex: Math.round(d.y) }}
              drag={placing === null}
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={(_, info) => {
                const p = toYard(info.point.x - window.scrollX, info.point.y - window.scrollY)
                onSave(
                  village.map((v, k) => (k === i ? { ...v, ...p } : v)),
                  inbox,
                )
                setTimeout(() => (dragged.current = false), 50)
              }}
              onClick={(e) => {
                if (placing !== null) return
                e.stopPropagation()
                if (dragged.current) return
                setPoked((p) => ({ i, n: (p?.n ?? 0) + 1 }))
                void objectSound(d.kind)
              }}
            >
              <motion.div
                key={poked?.i === i ? `poke-${poked.n}` : 'idle'}
                className="yard-inner"
                // Hayvonlar asta qimirlab turadi; bosilsa sakraydi
                animate={
                  poked?.i === i
                    ? { scale: [1, 1.18, 1], y: [0, -26, 0] }
                    : d.kind.startsWith('hayvon_')
                      ? { y: [0, -3, 0], rotate: [0, -2, 2, 0] }
                      : { scale: 1 }
                }
                transition={poked?.i === i ? { duration: 0.6 } : { repeat: Infinity, duration: 2.4 + (i % 4) * 0.4, delay: (i % 5) * 0.3 }}
              >
                <DecorArt kind={d.kind} />
              </motion.div>
            </motion.div>
          ))}

        <div className="yard-hero">
          <Hero profile={profile} mode="idle" />
        </div>
      </div>

      <div className="lp-head yard-head">
        <button className="lp-back" onClick={onBack} aria-label="Orqaga">
          <Icon name="back">
            <svg viewBox="0 0 40 40" className="art">
              <path d="M24 8L10 20L24 32" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Icon>
        </button>
        <div className="lp-title yard-title">🏡 Mening hovlim</div>
      </div>

      <AnimatePresence>
        {inbox.length > 0 && (
          <motion.div className="yard-inbox" initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}>
            <span className="yard-gift-icon">🎁</span>
            {inbox.map((k, i) => (
              <motion.button
                key={`${k}-${i}`}
                className={`yard-inbox-item ${placing === i ? 'on' : ''}`}
                data-kind={k}
                animate={placing === i ? { y: [0, -10, 0] } : { y: 0 }}
                transition={placing === i ? { repeat: Infinity, duration: 0.9 } : {}}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  sfx.pop()
                  setPlacing(placing === i ? null : i)
                }}
              >
                <DecorArt kind={k} />
              </motion.button>
            ))}
            {placing !== null && <span className="yard-hint">👆 Hovlining bir joyiga bos</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
