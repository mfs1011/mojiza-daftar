import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { CountGroup, numberOptions, NumberChoices } from '../components/NumberBits'
import { say, sfx } from '../lib/audio'
import { ALL_FRUITS, type FruitKind } from '../lib/names'
import { levelRow } from '../lib/stations'
import { pick, randInt, shuffle } from '../lib/util'
import type { GameProps } from '../types'

// ➕ Hisob maktabi — raqamlardan keyingi bosqich: matematikaga kirish.
//   qosh   — ikki savatdagi mevalarni qo'shish (rasm bilan)
//   ayir   — bir nechtasi ketib qoladi, nechta qoldi (rasm bilan)
//   misol  — rasmsiz misol: 3 + 4 = ?, 7 − 2 = ?
//   tushgan — yetishmayotgan son: 2 + ? = 5
//   belgi  — solishtirish belgisi: 5 ? 3  →  >, <, =
// Yig'indi 3 dan boshlab 20 gacha o'sadi; rasmlar asta-sekin yo'qolib, belgilarga o'tiladi.

type RType = 'qosh' | 'ayir' | 'misol' | 'tushgan' | 'belgi'

interface MathCfg {
  /** Natija (yig'indi yoki kamayuvchi) chegarasi */
  max: number
  options: number
  rounds: RType[]
}

const C = (max: number, options: number, rounds: RType[]): MathCfg => ({ max, options, rounds })
const MATH_LEVELS: MathCfg[] = [
  C(3, 2, ['qosh', 'qosh', 'qosh']),
  C(4, 2, ['qosh', 'qosh', 'ayir']),
  C(5, 3, ['qosh', 'ayir', 'qosh']),
  C(5, 3, ['qosh', 'ayir', 'qosh', 'ayir']),
  C(6, 3, ['qosh', 'ayir', 'misol']),
  C(7, 3, ['qosh', 'ayir', 'misol', 'misol']),
  C(8, 4, ['qosh', 'misol', 'misol', 'belgi']),
  C(9, 4, ['ayir', 'misol', 'misol', 'belgi']),
  C(10, 4, ['misol', 'misol', 'tushgan', 'belgi']),
  C(10, 4, ['qosh', 'misol', 'tushgan', 'belgi']),
  C(12, 4, ['misol', 'tushgan', 'misol', 'belgi']),
  C(14, 4, ['misol', 'tushgan', 'misol', 'belgi']),
  C(16, 4, ['misol', 'tushgan', 'misol', 'tushgan']),
  C(18, 4, ['misol', 'tushgan', 'belgi', 'misol']),
  C(20, 4, ['misol', 'tushgan', 'misol', 'tushgan']),
]

type Round =
  | { type: 'qosh'; a: number; b: number; fruit: FruitKind; options: number[] }
  | { type: 'ayir'; a: number; b: number; fruit: FruitKind; options: number[] }
  | { type: 'misol'; a: number; b: number; op: '+' | '−'; options: number[] }
  | { type: 'tushgan'; a: number; b: number; options: number[] }
  | { type: 'belgi'; a: number; b: number }

function makeRound(type: RType, cfg: MathCfg): Round {
  const opts = (v: number) => numberOptions(v, cfg.options, cfg.max)
  // Daraja chegarasining yuqori yarmidan: oson misollar qayta-qayta tushmasin
  const sum = randInt(Math.max(2, Math.ceil(cfg.max / 2)), cfg.max)
  const a = randInt(1, sum - 1)
  const b = sum - a
  switch (type) {
    case 'qosh':
      return { type, a, b, fruit: pick(ALL_FRUITS), options: opts(sum) }
    case 'ayir': {
      // Kamayuvchi `sum`, ketadiganlari `k` (hech bo'lmasa bittasi qoladi)
      const k = randInt(1, sum - 1)
      return { type, a: sum, b: k, fruit: pick(ALL_FRUITS), options: opts(sum - k) }
    }
    case 'misol': {
      const op = Math.random() < 0.5 ? '+' : '−'
      return op === '+' ? { type, a, b, op, options: opts(sum) } : { type, a: sum, b: a, op, options: opts(sum - a) }
    }
    case 'tushgan':
      return { type, a, b: sum, options: opts(sum - a) }
    case 'belgi': {
      const x = randInt(0, cfg.max)
      // Teng bo'lish ehtimoli ~25%
      const y = Math.random() < 0.25 ? x : randInt(0, cfg.max)
      return { type, a: x, b: y }
    }
  }
}

const answerOf = (r: Round): number | string =>
  r.type === 'qosh'
    ? r.a + r.b
    : r.type === 'ayir'
      ? r.a - r.b
      : r.type === 'misol'
        ? r.op === '+'
          ? r.a + r.b
          : r.a - r.b
        : r.type === 'tushgan'
          ? r.b - r.a
          : r.a > r.b
            ? '>'
            : r.a < r.b
              ? '<'
              : '='

export function MathGame({ level, onComplete, onExit }: GameProps) {
  const rounds = useMemo(() => {
    const endless = level >= MATH_LEVELS.length
    const cfg = levelRow(MATH_LEVELS, level)
    return (endless ? shuffle(cfg.rounds) : cfg.rounds).map((t) => makeRound(t, endless ? levelRow(MATH_LEVELS, level) : cfg))
  }, [level])
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<number | string | null>(null)
  const [solved, setSolved] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const boardRef = useRef<HTMLDivElement>(null)
  const r = rounds[idx]
  const answer = answerOf(r)

  useEffect(() => {
    const intro: Record<RType, string> = {
      qosh: 'hisob_qosh',
      ayir: 'hisob_ayir',
      misol: 'hisob_misol',
      tushgan: 'hisob_tushgan',
      belgi: 'hisob_belgi',
    }
    // Ayirishda mevalar ketib bo'lgach savol beriladi
    const t = setTimeout(() => void say(intro[r.type]), r.type === 'ayir' ? 1600 : 300)
    return () => clearTimeout(t)
  }, [r])

  function pickAnswer(v: number | string) {
    if (solved) return
    if (v === answer) {
      sfx.success()
      react('happy', 1800)
      burstAt(boardRef.current)
      setSolved(true)
      void say(...(typeof answer === 'number' ? [`son_${answer}`] : []), 'barakalla')
      setTimeout(() => {
        if (idx + 1 >= rounds.length) setFinished(true)
        else {
          sfx.whoosh()
          setSolved(false)
          setIdx((i) => i + 1)
        }
      }, 1900)
    } else {
      mistakes.current++
      sfx.wrong()
      react('oops')
      setWrong(v)
      setTimeout(() => setWrong(null), 450)
      void say('yana')
    }
  }

  const q = <span className={`math-q ${solved ? 'solved' : ''}`}>{solved ? answer : '?'}</span>

  return (
    <GameShell className="math" mascot={mascot} round={idx} rounds={rounds.length} onExit={onExit} data={{ 'data-type': r.type, 'data-answer': answer }}>
      <div className="math-board" ref={boardRef} key={`m-${idx}`}>
        {r.type === 'qosh' && (
          <div className="math-pics">
            <CountGroup n={r.a} fruit={r.fruit} small />
            <span className="math-op">+</span>
            <CountGroup n={r.b} fruit={r.fruit} small />
            <span className="math-op">=</span>
            {q}
          </div>
        )}

        {r.type === 'ayir' && (
          <div className="math-pics">
            <CountGroup n={r.a} fruit={r.fruit} gone={r.b} />
            <span className="math-op">=</span>
            {q}
          </div>
        )}

        {(r.type === 'misol' || r.type === 'tushgan') && (
          <motion.div className="math-eq" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            {r.type === 'misol' ? (
              <>
                <span>{r.a}</span>
                <span className="math-op">{r.op}</span>
                <span>{r.b}</span>
                <span className="math-op">=</span>
                {q}
              </>
            ) : (
              <>
                <span>{r.a}</span>
                <span className="math-op">+</span>
                {q}
                <span className="math-op">=</span>
                <span>{r.b}</span>
              </>
            )}
          </motion.div>
        )}

        {r.type === 'belgi' && (
          <motion.div className="math-eq" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <span>{r.a}</span>
            {q}
            <span>{r.b}</span>
          </motion.div>
        )}
      </div>

      <NumberChoices
        options={r.type === 'belgi' ? ['>', '<', '='] : r.options}
        wrong={wrong}
        right={solved ? answer : null}
        onPick={pickAnswer}
      />

      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current })} />}
    </GameShell>
  )
}
