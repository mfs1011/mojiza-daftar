import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { FruitArt, type FruitKind } from '../art/Fruit'
import { ALL_PEOPLE, BasketArt, CoinArt, PersonArt, StationIcon, type PersonId } from '../art/Scenery'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { useHowTo } from '../components/useHowTo'
import { hasVoice, say, sfx } from '../lib/audio'
import { MARKET_FRUITS } from '../lib/names'
import { pick, randInt, wait } from '../lib/util'
import { levelRow } from '../lib/stations'
import { addFruit, storeKinds, storeTotal } from '../lib/economy'
import type { FruitStore, GameProps } from '../types'
import { Icon } from '../art/Icon'

// 🛒 Bozor — sanash (#6).
// Mijoz "N ta meva" so'raydi. Bola qutidan olib, 10 lik ramkaga soladi.
// Past darajada son rasm bilan ko'rinadi va kerakli songa yetganda o'zi tugaydi;
// yuqori darajada faqat raqam ko'rinadi va bola 🤝 bilan o'zi tekshiradi.
// Meva ombordan sotiladi: mijozlar faqat bor mevani, bor sonidan oshirmay so'raydi.
// Ombor bo'sh bo'lsa — "Bog'ga borib meva terib kel!" va bog'ga eltadigan katta tugma.

interface MarketCfg {
  min: number
  max: number
  auto: boolean
  /** Necha xatodan keyin 10 lik ramkada rasmli yordam paydo bo'ladi (auto bo'lmasa) */
  hintAfter: number
}

const NEVER = 99
// 0–3: avtomatik (savatga solgan zahoti tekshiradi), 4+: bola o'zi "tayyor" deydi.
// Yuqorida son oralig'i kengayadi va rasmli yordam kechroq chiqadi.
const MARKET_LEVELS: MarketCfg[] = [
  { min: 1, max: 3, auto: true, hintAfter: 0 },
  { min: 1, max: 4, auto: true, hintAfter: 0 },
  { min: 1, max: 5, auto: true, hintAfter: 0 },
  { min: 2, max: 5, auto: true, hintAfter: 0 },
  { min: 1, max: 5, auto: false, hintAfter: 1 },
  { min: 2, max: 6, auto: false, hintAfter: 1 },
  { min: 2, max: 6, auto: false, hintAfter: 2 },
  { min: 3, max: 7, auto: false, hintAfter: 2 },
  { min: 3, max: 8, auto: false, hintAfter: 2 },
  { min: 4, max: 8, auto: false, hintAfter: 2 },
  { min: 4, max: 9, auto: false, hintAfter: 3 },
  { min: 5, max: 9, auto: false, hintAfter: 3 },
  { min: 5, max: 10, auto: false, hintAfter: 3 },
  { min: 6, max: 10, auto: false, hintAfter: 3 },
  { min: 6, max: 10, auto: false, hintAfter: NEVER },
]

const marketCfg = (level: number) => levelRow(MARKET_LEVELS, level)

const ROUNDS = 3

interface Customer {
  person: PersonId
  fruit: FruitKind
  want: number
}

function newCustomer(cfg: MarketCfg, prev?: Customer): Customer {
  return {
    person: pick(ALL_PEOPLE.filter((p) => p !== prev?.person)),
    fruit: pick(MARKET_FRUITS.filter((f) => f !== prev?.fruit)),
    want: randInt(cfg.min, cfg.max),
  }
}

/**
 * Uchala mijozni oldindan ombordan rejalashtiramiz (har biri o'z mevasini "band qiladi").
 * Darajaga yetadigan meva birinchi tanlanadi; yetmasa — bor sonicha so'raydi (bola bozordan quvilmasin).
 * Jami meva mijozlar sonidan kam bo'lsa — null (bog'ga yuboramiz).
 */
function planCustomers(cfg: MarketCfg, store?: FruitStore): Customer[] | null {
  const out: Customer[] = []
  if (!store) {
    for (let i = 0; i < ROUNDS; i++) out.push(newCustomer(cfg, out[i - 1]))
    return out
  }
  if (storeTotal(store) < ROUNDS) return null
  let left = { ...store }
  for (let i = 0; i < ROUNDS; i++) {
    const prev = out[i - 1]
    // Keyingi mijozlarga kamida bittadan qolsin
    const cap = (k: FruitKind) => Math.min(left[k] ?? 0, storeTotal(left) - (ROUNDS - i - 1))
    const kinds = storeKinds(left).filter((k) => cap(k) >= 1)
    const good = kinds.filter((k) => cap(k) >= cfg.min)
    const fresh = (l: FruitKind[]) => l.filter((k) => k !== prev?.fruit)
    const pool = [fresh(good), good, fresh(kinds), kinds].find((l) => l.length)!
    const fruit = pick(pool)
    const want = randInt(Math.min(cfg.min, cap(fruit)), Math.min(cfg.max, cap(fruit)))
    out.push({ person: pick(ALL_PEOPLE.filter((p) => p !== prev?.person)), fruit, want })
    left = addFruit(left, fruit, -want)
  }
  return out
}

/** Mijoz o'z ovozida gapiradi (voices/mijoz_<kim>_<gap>); fayl bo'lmasa — umumiy ko'rsatma */
function customerLine(person: PersonId, line: 'salom' | 'kam' | 'kop' | 'rahmat', fallback?: string): string[] {
  const key = `mijoz_${person}_${line}`
  return hasVoice(key) ? [key] : fallback ? [fallback] : []
}

/** Buyurtmani mijozning o'zi aytadi: "Menga beshta" + "olma bering!"; ovozi bo'lmasa — tarbiyachi */
function customerOrder(person: PersonId, want: number, fruit: FruitKind): string[] {
  const n = `mijoz_${person}_son_${want}`
  const f = `mijoz_${person}_meva_${fruit}`
  // Buyurtmani bitta ovoz aytadi: mijozda ikkala qism ham bo'lsa — mijoz, aks holda tarbiyachi (yarmi-yarmi g'alati)
  return hasVoice(n) && hasVoice(f) ? [n, f] : [`son_${want}`, `meva_${fruit}`]
}

export function Market({ profile, level, onComplete, onExit, store, onGoto }: GameProps) {
  // Endless'da tasodifiy tanlanadi: bitta o'yin davomida o'zgarmasin
  const [cfg] = useState(() => marketCfg(level))
  const [plan] = useState(() => planCustomers(cfg, store))
  const [round, setRound] = useState(0)
  const empty = !plan
  // Ombor bo'sh bo'lsa ham hooklar tartibi o'zgarmasin: soxta mijoz (ko'rinmaydi)
  const customer = plan?.[round] ?? { person: ALL_PEOPLE[0], fruit: 'olma' as FruitKind, want: 1 }
  const [given, setGiven] = useState(0)
  const [tries, setTries] = useState(0)
  const [happy, setHappy] = useState(false)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  // O'yindan chiqib ketilsa, kechikkan "keyingi mijoz" ishlamasin
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  const bagRef = useRef<HTMLDivElement>(null)
  const showPictures = cfg.auto || tries >= cfg.hintAfter
  const { want, fruit } = customer
  // Qutida shu mijoz uchun nechta meva bor (ombor bo'lmasa — eski cheksiz quti)
  // Qutida — ombordagi shu mevaning HAMMASI (oldingi mijozlarga sotilganidan tashqari), so'ralgani emas:
  // bola nechta kerakligini o'zi sanab beradi. 9 tadan ko'p bo'lsa — qutida 9 ta rasm + son.
  const crateMax = store && plan
    ? (store[fruit] ?? 0) - plan.slice(0, round).filter((c) => c.fruit === fruit).reduce((a, c) => a + c.want, 0)
    : Infinity
  const left = crateMax - given
  const inCrate = Math.min(9, left)

  // "Qanday bajariladi?": kam bo'lsa — mevani bosadi, ko'p bo'lsa — savatdan qaytaradi, teng bo'lsa — "Berish"
  const howto = useHowTo(profile.id, 'bozor', () =>
    howto.tap(given < want ? '.crate-fruit' : given > want ? '.cell-fruit:last-of-type' : '.give-btn'),
  )
  useEffect(() => {
    if (empty) return void say('bozor_meva_yoq')
    void say(...howto.arm(cfg.auto ? 'oddiy' : 'sana'), ...(round === 0 ? ['bozor_intro'] : []), ...customerLine(customer.person, 'salom'), ...customerOrder(customer.person, want, fruit))
    // Har yangi mijoz kelganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  function complete() {
    howto.done()
    setHappy(true)
    sfx.coin()
    react('happy', 2000)
    burstAt(bagRef.current, ['#f6bd60', '#ffd166', '#fff'], 18)
    setEarned((e) => e + want)
    // Keyingi mijoz "Rahmat! Mana tanga." gapi TUGAGANDAN keyin keladi (kamida 2,3 s — tanga yomg'iri ko'rinsin)
    const thanks = say(...customerLine(customer.person, 'rahmat', 'bozor_rahmat'))
    void Promise.all([thanks, wait(2300)]).then(() => wait(400)).then(() => {
      if (!alive.current) return
      if (round + 1 >= ROUNDS) {
        setFinished(true)
        return
      }
      sfx.whoosh()
      setRound(round + 1)
      setGiven(0)
      setTries(0)
      setHappy(false)
    })
  }

  function give() {
    if (happy || finished) return
    if (given >= Math.min(cfg.auto ? want : 10, crateMax)) return
    const n = given + 1
    setGiven(n)
    sfx.pop()
    void say(`son_${n}`)
    if (cfg.auto && n === want) setTimeout(complete, 800)
  }

  function takeBack() {
    if (happy || given === 0) return
    setGiven(given - 1)
    sfx.tap()
  }

  function check() {
    if (happy) return
    if (given === want) return complete()
    mistakes.current++
    howto.miss()
    sfx.wrong()
    react('oops')
    setTries((t) => t + 1)
    // Mijoz farqni aniq aytadi ("Yana toʻrtta kerak!"); bunday ovoz bo'lmasa — umumiy "kam/ko'p"
    const diff = Math.abs(given - want)
    const exact = `mijoz_${customer.person}_${given > want ? 'kop' : 'kam'}_${diff}`
    void say(...(hasVoice(exact) ? [exact] : given > want ? customerLine(customer.person, 'kop', 'bozor_kop') : customerLine(customer.person, 'kam', 'bozor_kam')))
  }

  const cells = cfg.max <= 5 ? 5 : 10

  return (
    <GameShell className="market" mascot={mascot} round={round} rounds={ROUNDS} onExit={onExit} data={{ 'data-want': want }}>
      <div className="stall-roof" />
      <div className="stall-counter" />

      <div className="market-col customer-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={round}
            className="customer"
            initial={{ x: '-40vw', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-40vw', opacity: 0 }}
            transition={{ type: 'spring', damping: 18 }}
          >
            <motion.button
              className="bubble"
              whileTap={{ scale: 0.95 }}
              onClick={() => void say(...customerOrder(customer.person, want, fruit))}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="bubble-num">{want}</span>
              <span className={`bubble-fruits ${showPictures ? 'many' : ''}`}>
                {Array.from({ length: showPictures ? want : 1 }, (_, i) => (
                  <span key={i} className="bubble-fruit">
                    <FruitArt kind={fruit} />
                  </span>
                ))}
              </span>
            </motion.button>
            <motion.div
              className="person"
              animate={happy ? { y: [0, -24, 0, -12, 0] } : { y: [0, -3, 0] }}
              transition={happy ? { duration: 0.8 } : { repeat: Infinity, duration: 2.2 }}
            >
              <PersonArt id={customer.person} happy={happy} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="market-col bag" ref={bagRef}>
        <div className="tenframe" style={{ gridTemplateColumns: `repeat(5, 11vmin)` }}>
          {Array.from({ length: cells }, (_, i) => (
            <div key={i} className="cell">
              <AnimatePresence>
                {i < given && (
                  <motion.button
                    className="cell-fruit"
                    initial={{ scale: 0, y: -40 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0 }}
                    onClick={takeBack}
                  >
                    <FruitArt kind={fruit} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        {!cfg.auto && (
          <motion.button className="give-btn" whileTap={{ scale: 0.88 }} onClick={check} disabled={given === 0 || happy} aria-label="Berish">
            <Icon name="done"><svg viewBox="0 0 100 100" className="art">
              <path d="M22 52L42 72L80 30" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            </svg></Icon>
          </motion.button>
        )}
      </div>

      <div className="market-col">
        <div className="crate">
          {Array.from({ length: Math.max(0, inCrate) }, (_, i) => (
            <motion.button key={`${round}-${i}`} className="crate-fruit" whileTap={{ scale: 0.7 }} onClick={give}>
              <FruitArt kind={fruit} />
            </motion.button>
          ))}
          {Number.isFinite(left) && left > 9 && (
            <span className="crate-count" aria-label={`${left}`}>
              {left}
            </span>
          )}
        </div>
      </div>

      <div className="earned">
        <span className="hud-icon">
          <CoinArt />
        </span>
        <motion.span key={earned} initial={{ scale: 1.6 }} animate={{ scale: 1 }}>
          {earned}
        </motion.span>
      </div>

      {happy && (
        <div className="coins-rain">
          {Array.from({ length: Math.min(want, 6) }, (_, i) => (
            <motion.span
              key={i}
              className="coin-fly"
              initial={{ left: '18%', top: '55%', scale: 0 }}
              animate={{ left: '90%', top: '8%', scale: [0, 1.2, 0.8] }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: 'easeInOut' }}
            >
              <CoinArt />
            </motion.span>
          ))}
        </div>
      )}

      {!happy && !finished && !empty && howto.overlay}
      {finished && (
        <Celebration
          voice={['barakalla']}
          onDone={() => {
            // Sotilgan mevalar ombordan ayriladi (cheksiz qutida — hech narsa)
            const sold = store && plan ? plan.reduce<FruitStore>((s, c) => addFruit(s, c.fruit, c.want), {}) : undefined
            onComplete({ mistakes: mistakes.current, coins: earned, tasks: ROUNDS, sold })
          }}
        />
      )}
      {empty && (
        <div className="market-empty">
          <motion.button className="market-empty-basket" whileTap={{ scale: 0.92 }} onClick={() => void say('bozor_meva_yoq')} aria-label="Ombor bo'sh">
            <BasketArt />
          </motion.button>
          <motion.button
            className="market-empty-go"
            data-goto="bog"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sfx.tap()
              if (onGoto) onGoto('bog')
              else onExit()
            }}
            aria-label="Bog'ga borish"
          >
            <StationIcon id="bog" />
          </motion.button>
        </div>
      )}
    </GameShell>
  )
}
