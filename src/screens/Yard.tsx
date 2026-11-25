import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { FruitArt } from '../art/Fruit'
import { Icon } from '../art/Icon'
import { DecorArt, type DecorKind } from '../art/Scenery'
import { ThingArt, thingReady } from '../art/Thing'
import { burst, burstAt } from '../components/Fx'
import { Hero } from '../components/Hero'
import { artUrl } from '../lib/assets'
import { objectSound, say, sayAnimal, sfx } from '../lib/audio'
import { storeKinds } from '../lib/economy'
import type { AnimalId, FruitKind } from '../lib/names'
import type { ThingId } from '../lib/things'
import type { FruitStore, PlacedDecor, Profile } from '../types'

/** Hovli daraxtidagi mevalar (fondagi eski daraxt kabi shaftoli va olxo'ri): [rasm, x%, y%] — daraxt rasmiga nisbatan */
const TREE_FRUITS: [string, number, number][] = [
  ['shaftoli', 24, 20], ['olxori', 42, 16], ['shaftoli', 62, 18], ['olxori', 76, 22],
  ['olxori', 14, 34], ['shaftoli', 34, 28], ['shaftoli', 54, 32], ['olxori', 70, 40],
  ['shaftoli', 84, 36], ['olxori', 26, 48], ['shaftoli', 46, 50], ['shaftoli', 16, 26],
]

// 🏡 Mening hovlim: bekat yo'llarida yutilgan sovg'alar shu yerga joylanadi (qishloq xaritasi toza qoladi).
//   • pastdagi qutidan sovg'ani tanlab, hovlining istalgan joyiga bosib qo'yadi
//   • qo'yilgan narsani sudrab joyini o'zgartiradi
//   • narsaga tegsa — o'z ovozini chiqaradi (hayvon — haqiqiy ovoz, quduq — suv, daraxt — barglar...)
//   • o'ngdagi savatchadan mevani hayvonga sudrab olib borsa (yoki mevani, keyin hayvonni bossa) — yeydi:
//     hayvon sakraydi, ovoz chiqaradi, ombordagi meva bittaga kamayadi
//   • yuqorida do'kondan olingan o'yinchoq/kiyimlar turadi (bossa — nomi)

interface Props {
  profile: Profile
  village: PlacedDecor[]
  inbox: DecorKind[]
  store: FruitStore
  owned: string[]
  onSave: (village: PlacedDecor[], inbox: DecorKind[]) => void
  /** Hayvonga meva yedirildi: ombordan bitta ayriladi */
  onFeed: (fruit: FruitKind) => void
  onBack: () => void
}

export function Yard({ profile, village, inbox, store, owned, onSave, onFeed, onBack }: Props) {
  const groundRef = useRef<HTMLDivElement>(null)
  const [placing, setPlacing] = useState<number | null>(null)
  const [poked, setPoked] = useState<{ i: number; n: number } | null>(null)
  const dragged = useRef(false)
  /** Yedirish uchun bosib tanlangan meva (sudrash o'rniga: meva → hayvon) */
  const [feeding, setFeeding] = useState<FruitKind | null>(null)
  const [toyPoke, setToyPoke] = useState<string | null>(null)
  const fruits = storeKinds(store)
  const toys = owned.filter((t): t is ThingId => thingReady(t as ThingId))
  const bg = artUrl('bg/garden')
  const treeImg = artUrl('bog/daraxt')
  const [treeShake, setTreeShake] = useState(0)

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

  /** Hayvon mevani yeydi: sakraydi, yuraklar, o'z ovozi */
  function feed(i: number, fruit: FruitKind) {
    const d = village[i]
    if (!d?.kind.startsWith('hayvon_') || !(store[fruit] ?? 0)) return
    sfx.pop()
    setPoked((p) => ({ i, n: (p?.n ?? 0) + 1 }))
    burstAt(document.querySelector(`.yard-item[data-idx="${i}"]`), ['#ef476f', '#ff8fab', '#ffd166'], 18)
    onFeed(fruit)
    setFeeding(null)
    void sayAnimal(d.kind.slice(7) as AnimalId)
  }

  /** Sudralgan meva qaysi hayvon ustiga tushdi */
  function dropFruit(fruit: FruitKind, info: PanInfo) {
    const x = info.point.x - window.scrollX
    const y = info.point.y - window.scrollY
    const hit = document
      .elementsFromPoint(x, y)
      .map((el) => el.closest<HTMLElement>('.yard-item.animal'))
      .find((el) => el)
    if (hit) feed(Number(hit.dataset.idx), fruit)
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
      {/* Fondagi yuzli daraxt (bog/daraxt) — fon rasmida daraxt yo'q; tebranib turadi, bosilsa silkinadi */}
      {treeImg && (
        <motion.button
          type="button"
          className="yard-tree"
          aria-label="Daraxt"
          key={`tree-${treeShake}`}
          animate={treeShake ? { rotate: [0, -4, 4, -3, 3, 0] } : {}}
          transition={{ duration: 0.6 }}
          onClick={() => {
            sfx.rustle()
            setTreeShake((n) => n + 1)
          }}
        >
          <span className="tree-sway">
            <img src={treeImg} alt="" draggable={false} />
            {TREE_FRUITS.map(([kind, x, y], i) => {
              const src = artUrl(`bog/${kind}`)
              return src ? <img key={i} src={src} alt="" draggable={false} className="tree-fruit" style={{ left: `${x}%`, top: `${y}%` }} /> : null
            })}
          </span>
        </motion.button>
      )}
      <div className="yard-ground" ref={groundRef} onClick={place}>
        {village
          .map((d, i) => ({ d, i }))
          .sort((a, b) => a.d.y - b.d.y)
          .map(({ d, i }) => (
            <motion.div
              key={`${i}-${d.x}-${d.y}`}
              className={`yard-item ${d.kind.startsWith('hayvon_') ? 'animal' : ''}`}
              data-kind={d.kind}
              data-idx={i}
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
                if (feeding && d.kind.startsWith('hayvon_')) return feed(i, feeding)
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
        {toys.length > 0 && (
          <div className="yard-toys">
            {toys.map((t) => (
              <motion.button
                key={t}
                className="yard-toy"
                data-thing={t}
                animate={toyPoke === t ? { y: [0, -14, 0], rotate: [0, -10, 10, 0] } : { y: 0 }}
                onClick={() => {
                  sfx.pop()
                  setToyPoke(null)
                  requestAnimationFrame(() => setToyPoke(t))
                  void say(`nom_${t}`)
                }}
              >
                <ThingArt id={t} />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Ombordan meva: hayvonga yedirish (hovlida hayvon bo'lsagina) */}
      {fruits.length > 0 && village.some((d) => d.kind.startsWith('hayvon_')) && (
        <div className="yard-fruits">
          {fruits.map((k) => (
            <motion.div
              key={`${k}-${store[k]}`}
              className={`yard-fruit ${feeding === k ? 'on' : ''}`}
              data-kind={k}
              drag
              dragSnapToOrigin
              dragMomentum={false}
              dragElastic={1}
              whileDrag={{ scale: 1.3, zIndex: 200 }}
              animate={feeding === k ? { y: [0, -8, 0] } : { y: 0 }}
              transition={feeding === k ? { repeat: Infinity, duration: 0.9 } : {}}
              onDragStart={() => {
                dragged.current = true
                sfx.tap()
              }}
              onDragEnd={(_, info) => {
                dropFruit(k, info)
                setTimeout(() => (dragged.current = false), 50)
              }}
              onClick={() => {
                if (dragged.current) return
                sfx.tap()
                setFeeding(feeding === k ? null : k)
                if (feeding !== k) void say('hovli_yedir')
              }}
            >
              <FruitArt kind={k} />
              <span className="store-n">{store[k]}</span>
            </motion.div>
          ))}
        </div>
      )}

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
