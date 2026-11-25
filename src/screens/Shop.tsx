import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../art/Icon'
import { CoinArt, DecorArt } from '../art/Scenery'
import { ThingArt, thingReady } from '../art/Thing'
import { burstAt } from '../components/Fx'
import { artUrl } from '../lib/assets'
import { say, sfx } from '../lib/audio'
import { SHOP_CATS, SHOP_ITEMS, shopItemVoice, type ShopCat, type ShopItem } from '../lib/economy'
import { wait } from '../lib/util'

// 🏪 Do'kon: bozorda topilgan tangaga hovli buyumlari, hayvonlar, o'yinchoqlar va kiyimlar.
//   • yuqorida 4 ta katta bo'lim tugmasi (rasm bilan), pastda narsalar va narxi (1–10 tanga)
//   • narsani bossa — "Uchta tanga kerak. Tangalarni bittalab sanab qo'y!"
//   • bola hamyonidan tangalarni bittalab peshtaxtaga suradi (yoki bosadi): har biri ovoz chiqarib sanaladi
//   • yetarli tanga qo'yilgach — xarid: hovli narsasi hovliga, o'yinchoq/kiyim sandiqqa
//   • tanga yetmasa — mehribon ovoz: "Tangang yetmaydi. Bozorda meva sotib, tanga topib kel!"

interface Props {
  coins: number
  /** Olingan o'yinchoq/kiyimlar: qayta sotilmaydi */
  owned: string[]
  onBuy: (item: ShopItem) => void
  onBack: () => void
}

/** Hamyonda ko'rinadigan tangalar soni (ko'pi — raqam bilan) */
const PURSE_MAX = 20

const visible = (it: ShopItem) => !it.thing || thingReady(it.thing)

/** Bo'lim tugmasining rasmi: bo'limdagi birinchi ko'rinadigan narsa (rasmlar ro'yxati yuklangach hisoblanadi) */
const catPic = (c: ShopCat) => SHOP_ITEMS.find((it) => it.cat === c && visible(it))!

export function ItemArt({ it }: { it: ShopItem }) {
  return it.thing ? <ThingArt id={it.thing} /> : <DecorArt kind={it.decor!} />
}

export function Shop({ coins, owned, onBuy, onBack }: Props) {
  const cats = SHOP_CATS.filter((c) => SHOP_ITEMS.some((it) => it.cat === c && visible(it)))
  const [cat, setCat] = useState<ShopCat>(cats[0])
  const [paying, setPaying] = useState<ShopItem | null>(null)
  const [shake, setShake] = useState<string | null>(null)
  const have = new Set(owned)
  const bg = artUrl('bg/market')

  useEffect(() => {
    void say('dokon_intro')
  }, [])

  function choose(it: ShopItem) {
    if (it.thing && have.has(it.thing)) {
      sfx.pop()
      return void say(shopItemVoice(it))
    }
    if (coins < it.price) {
      sfx.wrong()
      setShake(null)
      requestAnimationFrame(() => setShake(it.id))
      return void say(shopItemVoice(it), `dokon_kerak_${it.price}`, 'dokon_yetmaydi')
    }
    sfx.tap()
    setPaying(it)
    void say(shopItemVoice(it), `dokon_kerak_${it.price}`, 'dokon_qoy')
  }

  return (
    <div className="screen shop" style={bg ? { backgroundImage: `url("${bg}")` } : undefined}>
      <div className="lp-head shop-head">
        <button className="lp-back" onClick={onBack} aria-label="Orqaga">
          <Icon name="back">
            <svg viewBox="0 0 40 40" className="art">
              <path d="M24 8L10 20L24 32" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Icon>
        </button>
        <div className="shop-tabs">
          {cats.map((c) => (
            <motion.button
              key={c}
              className={`shop-tab ${c === cat ? 'on' : ''}`}
              data-cat={c}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sfx.tap()
                setCat(c)
                void say(`dokon_${c}`)
              }}
              aria-label={c}
            >
              <ItemArt it={catPic(c)} />
            </motion.button>
          ))}
        </div>
        <div className="shop-purse-total">
          <span className="hud-icon">
            <CoinArt />
          </span>
          {coins}
        </div>
      </div>

      <motion.div key={cat} className="shop-grid" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {SHOP_ITEMS.filter((it) => it.cat === cat && visible(it)).map((it) => {
          const got = !!it.thing && have.has(it.thing)
          const poor = !got && coins < it.price
          return (
            <motion.button
              key={it.id}
              className={`shop-item ${got ? 'got' : ''} ${poor ? 'poor' : ''}`}
              data-id={it.id}
              animate={shake === it.id ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => choose(it)}
            >
              <span className="shop-art">
                <ItemArt it={it} />
              </span>
              {got ? (
                <span className="shop-price got">✓</span>
              ) : (
                <span className="shop-price">
                  <span className="hud-icon">
                    <CoinArt />
                  </span>
                  {it.price}
                </span>
              )}
            </motion.button>
          )
        })}
      </motion.div>

      <AnimatePresence>
        {paying && (
          <Pay
            key={paying.id}
            item={paying}
            coins={coins}
            onPaid={() => onBuy(paying)}
            onClose={() => setPaying(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/** To'lash: hamyondan tangalarni bittalab peshtaxtaga qo'yish (har biri sanaladi) */
function Pay({ item, coins, onPaid, onClose }: { item: ShopItem; coins: number; onPaid: () => void; onClose: () => void }) {
  // Ochilgandagi hamyon: xariddan keyin App tangani kamaytiradi, bu yerda esa hisob shu bilan davom etadi
  const [start] = useState(coins)
  const [placed, setPlaced] = useState(0)
  const [done, setDone] = useState(false)
  const counterRef = useRef<HTMLDivElement>(null)
  const dragged = useRef(false)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  function put() {
    if (done || placed >= item.price) return
    const n = placed + 1
    setPlaced(n)
    sfx.coin()
    if (n < item.price) return void say(`son_${n}`)
    setDone(true)
    onPaid()
    sfx.success()
    burstAt(counterRef.current, ['#ffd166', '#f6bd60', '#06d6a0', '#ef476f'], 24)
    const left = start - item.price
    void say(`son_${n}`, 'dokon_rahmat', item.thing ? 'dokon_sandiq' : 'dokon_hovliga', 'dokon_qoldi', `son_${left}`)
      .then(() => wait(500))
      .then(() => alive.current && onClose())
  }

  function dropCoin(info: PanInfo) {
    setTimeout(() => (dragged.current = false), 50)
    const r = counterRef.current?.getBoundingClientRect()
    const { x, y } = info.point
    if (r && x >= r.left - 30 && x <= r.right + 30 && y >= r.top - 40 && y <= r.bottom + 40) put()
  }

  const inPurse = start - placed
  return (
    <motion.div className="shop-pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button className="shop-close" onClick={() => (sfx.tap(), onClose())} aria-label="Yopish">
        ✕
      </button>
      <motion.button
        className="shop-pay-item"
        initial={{ scale: 0.4 }}
        animate={done ? { scale: [1, 1.25, 1.1], rotate: [0, -8, 8, 0] } : { scale: 1 }}
        onClick={() => void say(shopItemVoice(item), `dokon_kerak_${item.price}`)}
      >
        <ItemArt it={item} />
      </motion.button>

      <div className="shop-counter" ref={counterRef} data-placed={placed} data-price={item.price}>
        {Array.from({ length: item.price }, (_, i) => (
          <div key={i} className={`shop-slot ${i < placed ? 'full' : ''}`}>
            <AnimatePresence>
              {i < placed && (
                <motion.span className="shop-coin" initial={{ scale: 0, y: 60 }} animate={{ scale: 1, y: 0 }}>
                  <CoinArt />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="shop-purse">
        <span className="shop-purse-bag">👛</span>
        <div className="shop-purse-coins">
          {Array.from({ length: Math.min(inPurse, PURSE_MAX) }, (_, i) => (
            <motion.button
              key={`${placed}-${i}`}
              className="shop-coin purse"
              drag={!done}
              dragSnapToOrigin
              dragMomentum={false}
              dragElastic={1}
              whileDrag={{ scale: 1.3, zIndex: 50 }}
              whileTap={{ scale: 0.85 }}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={(_, info) => dropCoin(info)}
              onClick={() => !dragged.current && put()}
            >
              <CoinArt />
            </motion.button>
          ))}
        </div>
        <span className="shop-purse-n">{inPurse}</span>
      </div>
    </motion.div>
  )
}
