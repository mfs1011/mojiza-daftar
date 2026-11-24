import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FruitArt } from '../art/Fruit'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { CountGroup, numberOptions, NumberChoices } from '../components/NumberBits'
import { TraceBoard } from '../components/TraceBoard'
import { say, sfx } from '../lib/audio'
import { ALL_FRUITS, type FruitKind } from '../lib/names'
import { levelRow } from '../lib/stations'
import { pick, randInt, shuffle } from '../lib/util'
import type { GameProps } from '../types'

// 🔢 Raqamlar uyi — sonlar bilan tanishish (maktabga tayyorlov).
//   sana      — narsalarni sanab, raqamini topish (10 lik ramkada)
//   top       — aytilgan raqamni topish (ovoz → belgi)
//   chiz      — raqamni barmoq bilan yozish
//   qator     — sonlar qatorida tushib qolganini topish
//   solishtir — qaysi likopchada ko'p (yuqorida: kam)
// Son oralig'i 1–3 dan boshlanib, 20 gacha boradi.

type RType = 'sana' | 'top' | 'chiz' | 'qator' | 'solishtir'

interface NumCfg {
  min: number
  max: number
  /** Javob variantlari soni */
  options: number
  rounds: RType[]
  /** "Qaysi birida kam?" so'rovi ham chiqadimi */
  fewer: boolean
}

const C = (min: number, max: number, options: number, rounds: RType[], fewer = false): NumCfg => ({ min, max, options, rounds, fewer })
const NUM_LEVELS: NumCfg[] = [
  C(1, 3, 2, ['sana', 'top', 'sana']),
  C(1, 4, 2, ['sana', 'top', 'chiz']),
  C(1, 5, 3, ['sana', 'chiz', 'top']),
  C(1, 5, 3, ['sana', 'qator', 'chiz', 'solishtir']),
  C(1, 6, 3, ['top', 'sana', 'chiz', 'solishtir']),
  C(1, 7, 3, ['sana', 'qator', 'chiz', 'solishtir']),
  C(2, 8, 4, ['top', 'qator', 'chiz', 'solishtir']),
  C(2, 9, 4, ['sana', 'qator', 'chiz', 'solishtir'], true),
  C(1, 10, 4, ['sana', 'qator', 'chiz', 'solishtir'], true),
  C(0, 10, 4, ['top', 'qator', 'chiz', 'solishtir'], true),
  C(5, 12, 4, ['sana', 'qator', 'chiz', 'solishtir'], true),
  C(6, 14, 4, ['top', 'qator', 'chiz', 'sana'], true),
  C(8, 16, 4, ['sana', 'qator', 'chiz', 'solishtir'], true),
  C(10, 18, 4, ['top', 'qator', 'chiz', 'solishtir'], true),
  C(10, 20, 4, ['sana', 'qator', 'chiz', 'solishtir'], true),
]

type Round =
  | { type: 'sana'; n: number; fruit: FruitKind; options: number[] }
  | { type: 'top'; n: number; options: number[] }
  | { type: 'chiz'; n: number }
  | { type: 'qator'; seq: number[]; hole: number; options: number[] }
  | { type: 'solishtir'; a: number; b: number; fruit: FruitKind; more: boolean }

function makeRound(type: RType, cfg: NumCfg): Round {
  const n = randInt(cfg.min, cfg.max)
  const opts = (v: number) => numberOptions(v, cfg.options, cfg.max, cfg.min)
  switch (type) {
    case 'sana':
      return { type, n: Math.max(1, n), fruit: pick(ALL_FRUITS), options: opts(Math.max(1, n)) }
    case 'top':
      return { type, n, options: opts(n) }
    case 'chiz':
      return { type, n }
    case 'qator': {
      const len = 5
      const start = randInt(cfg.min, Math.max(cfg.min, cfg.max - len + 1))
      const seq = Array.from({ length: len }, (_, i) => start + i)
      const hole = randInt(1, len - 1)
      return { type, seq, hole, options: opts(seq[hole]) }
    }
    case 'solishtir': {
      const lo = Math.max(1, cfg.min)
      let a = randInt(lo, cfg.max)
      let b = randInt(lo, cfg.max)
      // Farq kichik darajalarda katta (ko'z bilan ko'rinadi), yuqorida 1 gacha tushadi
      while (a === b) b = randInt(lo, cfg.max)
      if (Math.random() < 0.5) [a, b] = [b, a]
      return { type, a, b, fruit: pick(ALL_FRUITS), more: !cfg.fewer || Math.random() < 0.5 }
    }
  }
}

export function Numbers({ level, onComplete, onExit }: GameProps) {
  const rounds = useMemo(() => {
    const cfg = levelRow(NUM_LEVELS, level)
    // Endless'da raund turlari ham aralashadi
    const types = level >= NUM_LEVELS.length ? shuffle(cfg.rounds) : cfg.rounds
    return types.map((t) => makeRound(t, level >= NUM_LEVELS.length ? levelRow(NUM_LEVELS, level) : cfg))
  }, [level])
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<number | string | null>(null)
  const [solved, setSolved] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const boardRef = useRef<HTMLDivElement>(null)
  const r = rounds[idx]

  // Ko'rsatma
  useEffect(() => {
    if (r.type === 'sana') void say('raqam_sana')
    else if (r.type === 'top') void say(`son_${r.n}`, 'raqam_top')
    else if (r.type === 'chiz') void say('raqam_chiz', `son_${r.n}`)
    else if (r.type === 'qator') void say('raqam_qator')
    else void say(r.more ? 'raqam_kop' : 'raqam_kam')
  }, [r])

  function next() {
    setTimeout(() => {
      if (idx + 1 >= rounds.length) setFinished(true)
      else {
        sfx.whoosh()
        setSolved(false)
        setIdx((i) => i + 1)
      }
    }, 1800)
  }

  function win(spoken: string[]) {
    sfx.success()
    react('happy', 1800)
    burstAt(boardRef.current)
    setSolved(true)
    void say(...spoken, 'barakalla')
    next()
  }

  function miss(v: number | string) {
    mistakes.current++
    sfx.wrong()
    react('oops')
    setWrong(v)
    setTimeout(() => setWrong(null), 450)
    void say('yana')
  }

  function pickNumber(v: number | string) {
    if (solved) return
    const answer = r.type === 'qator' ? r.seq[r.hole] : r.type === 'sana' || r.type === 'top' ? r.n : null
    if (v === answer) win([`son_${answer}`])
    else miss(v)
  }

  function pickSide(side: 'a' | 'b') {
    if (r.type !== 'solishtir' || solved) return
    const bigger = r.a > r.b ? 'a' : 'b'
    const ok = r.more ? side === bigger : side !== bigger
    if (ok) win([`son_${side === 'a' ? r.a : r.b}`])
    else miss(side)
  }

  return (
    <GameShell className="numbers" mascot={mascot} round={idx} rounds={rounds.length} onExit={onExit} data={{ 'data-type': r.type, 'data-answer': r.type === 'qator' ? r.seq[r.hole] : r.type === 'solishtir' ? (r.more === r.a > r.b ? 'a' : 'b') : r.n }}>
      <div className="num-board" ref={boardRef} key={`b-${idx}`}>
        {r.type === 'sana' && <CountGroup n={r.n} fruit={r.fruit} />}

        {r.type === 'top' && (
          <motion.button className="num-ear" onClick={() => void say(`son_${r.n}`, 'raqam_top')} whileTap={{ scale: 0.9 }} aria-label="Yana eshitish">
            <svg viewBox="0 0 100 100" className="art">
              <path d="M20 40H36L56 22V78L36 60H20Z" fill="#ffd166" stroke="#3d2c1e" strokeWidth={5} strokeLinejoin="round" />
              <path d="M68 34C76 42 76 58 68 66M78 24C92 38 92 62 78 76" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" />
            </svg>
          </motion.button>
        )}

        {r.type === 'chiz' && (
          <TraceBoard
            glyph={String(r.n)}
            threshold={0.62}
            onDone={() => win([`son_${r.n}`])}
            onMistake={() => {
              mistakes.current++
              react('oops')
            }}
          />
        )}

        {r.type === 'qator' && (
          <div className="num-row">
            {r.seq.map((v, i) => (
              <div key={i} className={`num-tile ${i === r.hole ? (solved ? 'filled' : 'hole') : ''}`}>
                {i === r.hole && !solved ? '?' : v}
              </div>
            ))}
          </div>
        )}

        {r.type === 'solishtir' && (
          <div className="plates">
            {(['a', 'b'] as const).map((side) => (
              <motion.button
                key={side}
                className={`plate ${solved && (r.more ? (r[side] > r[side === 'a' ? 'b' : 'a']) : (r[side] < r[side === 'a' ? 'b' : 'a'])) ? 'right' : ''}`}
                data-side={side}
                onClick={() => pickSide(side)}
                animate={wrong === side ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="plate-items">
                  {Array.from({ length: r[side] }, (_, i) => (
                    <span key={i} className="plate-item">
                      <FruitArt kind={r.fruit} />
                    </span>
                  ))}
                </div>
                {solved && <span className="plate-num">{r[side]}</span>}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {(r.type === 'sana' || r.type === 'top' || r.type === 'qator') && (
        <NumberChoices
          options={r.options}
          wrong={wrong}
          right={solved ? (r.type === 'qator' ? r.seq[r.hole] : r.n) : null}
          onPick={pickNumber}
        />
      )}

      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current })} />}
    </GameShell>
  )
}
