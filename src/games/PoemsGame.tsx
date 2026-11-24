import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimalArt } from '../art/Animal'
import { FruitArt } from '../art/Fruit'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { say, sayAnimal, sfx } from '../lib/audio'
import { ALL_ANIMALS, ALL_FRUITS } from '../lib/names'
import { RIDDLES, type Riddle, type RiddleAnswer } from '../lib/poems'
import { levelRow } from '../lib/stations'
import { shuffle } from '../lib/util'
import type { GameProps } from '../types'

// 📖 She'rlar va topishmoqlar — tinglab tushunish, nutq va xotira.
// Bola she'r-topishmoqni tinglaydi va kim (nima) haqida ekanini rasmlardan topadi.
// Qiyinlik: variantlar ko'payadi (2 → 6) va keyinroq hammasi bir toifadan bo'ladi
// (faqat hayvonlar yoki faqat mevalar) — she'rni diqqat bilan tinglash kerak bo'ladi.

interface PoemCfg {
  count: number
  options: number
  /** Chalg'ituvchilar javob bilan bir toifadan (hayvon/meva) */
  same: boolean
}

const P = (count: number, options: number, same: boolean): PoemCfg => ({ count, options, same })
const POEM_LEVELS: PoemCfg[] = [
  P(2, 2, false),
  P(2, 2, false),
  P(2, 3, false),
  P(3, 3, false),
  P(3, 3, true),
  P(3, 4, false),
  P(3, 4, true),
  P(3, 4, true),
  P(3, 5, false),
  P(3, 5, true),
  P(3, 5, true),
  P(4, 5, true),
  P(4, 6, false),
  P(4, 6, true),
  P(4, 6, true),
]

const keyOf = (a: RiddleAnswer) => `${a.k}-${a.id}`

function options(r: Riddle, cfg: PoemCfg): RiddleAnswer[] {
  const animals = ALL_ANIMALS.map((id) => ({ k: 'animal', id }) as RiddleAnswer)
  const fruits = ALL_FRUITS.map((id) => ({ k: 'fruit', id }) as RiddleAnswer)
  const pool = (cfg.same ? (r.answer.k === 'animal' ? animals : fruits) : [...animals, ...fruits]).filter((a) => keyOf(a) !== keyOf(r.answer))
  return shuffle([r.answer, ...shuffle(pool).slice(0, cfg.options - 1)])
}

function Pic({ a }: { a: RiddleAnswer }) {
  return a.k === 'animal' ? <AnimalArt id={a.id} /> : <FruitArt kind={a.id} />
}

export function PoemsGame({ level, onComplete, onExit }: GameProps) {
  const cfg = useMemo(() => levelRow(POEM_LEVELS, level), [level])
  // Darajalar bo'ylab topishmoqlar navbatma-navbat almashadi (bir xil she'r ketma-ket kelmasin)
  const rounds = useMemo(() => {
    const start = (level * 3) % RIDDLES.length
    const list = [...RIDDLES.slice(start), ...RIDDLES.slice(0, start)].slice(0, cfg.count)
    return list.map((r) => ({ riddle: r, options: options(r, cfg) }))
  }, [level, cfg])
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [listening, setListening] = useState(true)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const boardRef = useRef<HTMLDivElement>(null)
  const { riddle, options: opts } = rounds[idx]

  function listen() {
    setListening(true)
    void say(`sher_${riddle.id}`, 'sher_top').then(() => setListening(false))
  }
  useEffect(listen, [idx]) // eslint-disable-line react-hooks/exhaustive-deps

  function choose(a: RiddleAnswer) {
    if (solved) return
    if (keyOf(a) === keyOf(riddle.answer)) {
      sfx.success()
      react('happy', 2000)
      burstAt(boardRef.current)
      setSolved(true)
      void (async () => {
        // Hayvon bo'lsa — o'z ovozi bilan "javob beradi"
        if (a.k === 'animal') await sayAnimal(a.id)
        await say(a.k === 'animal' ? `hayvon_${a.id}` : `meva_${a.id}`, 'barakalla')
      })()
      setTimeout(() => {
        if (idx + 1 >= rounds.length) setFinished(true)
        else {
          sfx.whoosh()
          setSolved(false)
          setIdx((i) => i + 1)
        }
      }, 3200)
    } else {
      mistakes.current++
      sfx.wrong()
      react('oops')
      setWrong(keyOf(a))
      setTimeout(() => setWrong(null), 450)
      void say('yana')
    }
  }

  return (
    <GameShell className="poems" mascot={mascot} round={idx} rounds={rounds.length} onExit={onExit} data={{ 'data-answer': keyOf(riddle.answer) }}>
      <div className="poem-board" ref={boardRef} key={`p-${idx}`}>
        <motion.button className={`poem-book ${listening ? 'reading' : ''}`} onClick={listen} whileTap={{ scale: 0.95 }} aria-label="Yana tinglash">
          <svg viewBox="0 0 120 90" className="art">
            <path d="M60 14C46 6 24 6 8 12V82C24 76 46 76 60 84Z" fill="#fefae0" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
            <path d="M60 14C74 6 96 6 112 12V82C96 76 74 76 60 84Z" fill="#fff" stroke="#3d2c1e" strokeWidth={3} strokeLinejoin="round" />
            <path d="M18 28C30 24 42 24 52 28M18 40C30 36 42 36 52 40M18 52C30 48 42 48 52 52M68 28C78 24 90 24 102 28M68 40C78 36 90 36 102 40" fill="none" stroke="#adb5bd" strokeWidth={3} strokeLinecap="round" />
            <path d="M84 52L84 68M84 52L96 48V64" fill="none" stroke="#e76f51" strokeWidth={3} strokeLinecap="round" />
            <circle cx={80} cy={68} r={4} fill="#e76f51" />
            <circle cx={92} cy={64} r={4} fill="#e76f51" />
          </svg>
          {solved && (
            <motion.span className="poem-answer" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Pic a={riddle.answer} />
            </motion.span>
          )}
        </motion.button>
      </div>

      <div className="poem-choices">
        {opts.map((a) => (
          <motion.button
            key={`${idx}-${keyOf(a)}`}
            className={`poem-opt ${solved && keyOf(a) === keyOf(riddle.answer) ? 'right' : ''}`}
            data-key={keyOf(a)}
            onClick={() => choose(a)}
            initial={{ scale: 0 }}
            animate={wrong === keyOf(a) ? { x: [0, -10, 10, -6, 6, 0], scale: 1 } : { scale: 1, x: 0 }}
            whileTap={{ scale: 0.9 }}
          >
            <Pic a={a} />
          </motion.button>
        ))}
      </div>

      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current, tasks: rounds.length })} />}
    </GameShell>
  )
}
