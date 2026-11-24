import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { FruitArt, type FruitKind } from '../art/Fruit'
import { ALL_PEOPLE, CoinArt, PersonArt, type PersonId } from '../art/Scenery'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { useHowTo } from '../components/useHowTo'
import { hasVoice, say, sfx } from '../lib/audio'
import { MARKET_FRUITS } from '../lib/names'
import { pick, randInt } from '../lib/util'
import { levelRow } from '../lib/stations'
import type { GameProps } from '../types'
import { Icon } from '../art/Icon'

// 🛒 Bozor — sanash (#6).
// Mijoz "N ta meva" so'raydi. Bola qutidan olib, 10 lik ramkaga soladi.
// Past darajada son rasm bilan ko'rinadi va kerakli songa yetganda o'zi tugaydi;
// yuqori darajada faqat raqam ko'rinadi va bola 🤝 bilan o'zi tekshiradi.

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

/** Mijoz o'z ovozida gapiradi (voices/mijoz_<kim>_<gap>); fayl bo'lmasa — umumiy ko'rsatma */
function customerLine(person: PersonId, line: 'salom' | 'kam' | 'kop' | 'rahmat', fallback?: string): string[] {
  const key = `mijoz_${person}_${line}`
  return hasVoice(key) ? [key] : fallback ? [fallback] : []
}

/** Buyurtmani mijozning o'zi aytadi: "Menga beshta" + "olma bering!"; ovozi bo'lmasa — tarbiyachi */
function customerOrder(person: PersonId, want: number, fruit: FruitKind): string[] {
  const n = `mijoz_${person}_son_${want}`
  const f = `mijoz_${person}_meva_${fruit}`
  return hasVoice(n) && hasVoice(f) ? [n, f] : [`son_${want}`, `meva_${fruit}`]
}

export function Market({ profile, level, onComplete, onExit }: GameProps) {
  // Endless'da tasodifiy tanlanadi: bitta o'yin davomida o'zgarmasin
  const [cfg] = useState(() => marketCfg(level))
  const [round, setRound] = useState(0)
  const [customer, setCustomer] = useState(() => newCustomer(cfg))
  const [given, setGiven] = useState(0)
  const [tries, setTries] = useState(0)
  const [happy, setHappy] = useState(false)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const bagRef = useRef<HTMLDivElement>(null)
  const showPictures = cfg.auto || tries >= cfg.hintAfter
  const { want, fruit } = customer

  // "Qanday bajariladi?": kam bo'lsa — mevani bosadi, ko'p bo'lsa — savatdan qaytaradi, teng bo'lsa — "Berish"
  const howto = useHowTo(profile.id, 'bozor', () =>
    howto.tap(given < want ? '.crate-fruit' : given > want ? '.cell-fruit:last-of-type' : '.give-btn'),
  )
  useEffect(() => {
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
    void say(...customerLine(customer.person, 'rahmat', 'bozor_rahmat'))
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        setFinished(true)
        return
      }
      sfx.whoosh()
      setRound(round + 1)
      setCustomer(newCustomer(cfg, customer))
      setGiven(0)
      setTries(0)
      setHappy(false)
    }, 2300)
  }

  function give() {
    if (happy || finished) return
    if (given >= (cfg.auto ? want : 10)) return
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
    void say(...(given > want ? customerLine(customer.person, 'kop', 'bozor_kop') : customerLine(customer.person, 'kam', 'bozor_kam')))
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
          {Array.from({ length: 9 }, (_, i) => (
            <motion.button key={`${round}-${i}`} className="crate-fruit" whileTap={{ scale: 0.7 }} onClick={give}>
              <FruitArt kind={fruit} />
            </motion.button>
          ))}
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

      {!happy && !finished && howto.overlay}
      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current, coins: earned, tasks: ROUNDS })} />}
    </GameShell>
  )
}
