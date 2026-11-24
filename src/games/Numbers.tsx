import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FruitArt } from '../art/Fruit'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { centerOf, HandHint, type HandPath } from '../components/HandHint'
import { CountGroup, FingerHands, numberOptions, NumberChoices } from '../components/NumberBits'
import { TraceBoard } from '../components/TraceBoard'
import { say, sfx } from '../lib/audio'
import { ALL_FRUITS, type FruitKind } from '../lib/names'
import { levelRow } from '../lib/stations'
import { isNewTask, markTaskSeen } from '../lib/howto'
import { pick, randInt, shuffle, wait } from '../lib/util'
import type { GameProps } from '../types'

// 🔢 Raqamlar uyi — sonlar bilan tanishish (maktabga tayyorlov).
//   sana      — narsalarni sanab, raqamini topish (10 lik ramkada)
//   top       — aytilgan raqamni topish (ovoz → belgi)
//   chiz      — raqamni barmoq bilan yozish
//   qator     — sonlar qatorida tushib qolganini topish
//   solishtir — qaysi likopchada ko'p (yuqorida: kam)
//   barmoq    — qo'llarda nechta barmoq ko'tarilgan (10 gacha)
// Son oralig'i 1–3 dan boshlanib, 20 gacha boradi.

type RType = 'sana' | 'top' | 'chiz' | 'qator' | 'solishtir' | 'barmoq'

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
  C(1, 4, 2, ['sana', 'barmoq', 'chiz']),
  C(1, 5, 3, ['sana', 'chiz', 'top']),
  C(1, 5, 3, ['sana', 'qator', 'chiz', 'solishtir']),
  C(1, 6, 3, ['barmoq', 'sana', 'chiz', 'solishtir']),
  C(1, 7, 3, ['sana', 'qator', 'chiz', 'solishtir']),
  C(2, 8, 4, ['top', 'qator', 'chiz', 'solishtir']),
  C(2, 9, 4, ['barmoq', 'qator', 'chiz', 'solishtir'], true),
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
  | { type: 'barmoq'; n: number; options: number[] }
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
    case 'barmoq': {
      // Ikki qo'lda 10 ta barmoq
      const k = Math.max(1, Math.min(10, n > 10 ? randInt(1, 10) : n))
      return { type, n: k, options: numberOptions(k, cfg.options, 10, 1) }
    }
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

export function Numbers({ profile, level, onComplete, onExit }: GameProps) {
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

  // ---------- "Qanday bajariladi?": tushuntirish va ko'rsatuvchi qo'l ----------
  const [hint, setHint] = useState<{ mode: 'tap' | 'trace'; path: HandPath } | null>(null)
  /** Sanab ko'rsatish: nechta meva yongan */
  const [lit, setLit] = useState(0)
  const guide = useRef<HandPath>([])
  const roundMiss = useRef(0)
  const demoToken = useRef(0)
  const lastAct = useRef(Date.now())

  const answerSelector = () =>
    r.type === 'solishtir'
      ? `.plate[data-side="${r.more === r.a > r.b ? 'a' : 'b'}"]`
      : `.num-card[data-value="${r.type === 'qator' ? r.seq[r.hole] : r.type === 'chiz' ? '' : r.n}"]`

  /** Qisqa buyruq */
  const instruction = (): string[] =>
    r.type === 'sana'
      ? ['raqam_sana']
      : r.type === 'barmoq'
        ? ['raqam_barmoq']
      : r.type === 'top'
        ? [`son_${r.n}`, 'raqam_top']
        : r.type === 'chiz'
          ? ['raqam_chiz', `son_${r.n}`]
          : r.type === 'qator'
            ? ['raqam_qator']
            : [r.more ? 'raqam_kop' : 'raqam_kam']

  /** Qo'l bilan ko'rsatish (sanashda — mevalarni birma-bir sanab beradi) */
  async function demo() {
    const my = ++demoToken.current
    lastAct.current = Date.now()
    setHint(null)
    if (r.type === 'chiz') return setHint({ mode: 'trace', path: guide.current })
    if (r.type === 'sana' || r.type === 'barmoq') {
      for (let k = 1; k <= r.n; k++) {
        if (my !== demoToken.current) return
        setLit(k)
        void say(`son_${k}`)
        await wait(750)
      }
    }
    if (my !== demoToken.current) return
    const p = centerOf(document.querySelector(answerSelector()))
    if (p) setHint({ mode: 'tap', path: [p] })
  }

  /** Batafsil tushuntirish + buyruq + ko'rsatish */
  async function explain() {
    const my = ++demoToken.current
    setHint(null)
    setLit(0)
    await say(`raqam_${r.type}_t`, ...instruction())
    if (my === demoToken.current) void demo()
  }

  // Har raund boshida: yangi topshiriq bo'lsa — tushuntiramiz, aks holda qisqa buyruq.
  // (StrictMode effektni ikki marta chaqirishi mumkin — bitta raund faqat bir marta tanishtiriladi)
  const introduced = useRef<Round | null>(null)
  useEffect(() => {
    if (introduced.current === r) return
    introduced.current = r
    roundMiss.current = 0
    lastAct.current = Date.now()
    demoToken.current++
    setHint(null)
    setLit(0)
    const task = `raqam_${r.type}`
    if (isNewTask(profile.id, task)) {
      markTaskSeen(profile.id, task)
      void explain()
    } else void say(...instruction())
  }, [r]) // eslint-disable-line react-hooks/exhaustive-deps

  // Bola uzoq vaqt hech narsa qilmasa — qo'l o'zi ko'rsatadi
  useEffect(() => {
    const touch = () => (lastAct.current = Date.now())
    window.addEventListener('pointerdown', touch)
    const id = window.setInterval(() => {
      if (!solved && !finished && !hint && Date.now() - lastAct.current > 9000) void demo()
    }, 1000)
    return () => {
      window.removeEventListener('pointerdown', touch)
      window.clearInterval(id)
    }
  })

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
    demoToken.current++
    setHint(null)
    sfx.success()
    react('happy', 1800)
    burstAt(boardRef.current)
    setSolved(true)
    void say(...spoken, 'barakalla')
    next()
  }

  function miss(v: number | string) {
    mistakes.current++
    // Ikkinchi xatodan keyin — qanday qilishni ko'rsatamiz
    if (++roundMiss.current === 2) setTimeout(() => void demo(), 900)
    sfx.wrong()
    react('oops')
    setWrong(v)
    setTimeout(() => setWrong(null), 450)
    void say('yana')
  }

  function pickNumber(v: number | string) {
    if (solved) return
    const answer = r.type === 'qator' ? r.seq[r.hole] : r.type === 'sana' || r.type === 'top' || r.type === 'barmoq' ? r.n : null
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
        {r.type === 'sana' && (
          <div className="count-with-hands">
            <CountGroup n={r.n} fruit={r.fruit} lit={lit} />
            {/* Sanab ko'rsatilganda barmoqlar ham bittadan ko'tariladi */}
            {lit > 0 && r.n <= 10 && <FingerHands n={lit} small />}
          </div>
        )}
        {r.type === 'barmoq' && (
          <div className="barmoq-wrap">
            <FingerHands n={r.n} />
            {lit > 0 && <span className="barmoq-count">{lit}</span>}
          </div>
        )}

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
            onGuide={(pts) => (guide.current = pts)}
            onMistake={() => {
              mistakes.current++
              react('oops')
              if (++roundMiss.current === 2) void demo()
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

      {(r.type === 'sana' || r.type === 'top' || r.type === 'barmoq' || r.type === 'qator') && (
        <NumberChoices
          options={r.options}
          wrong={wrong}
          right={solved ? (r.type === 'qator' ? r.seq[r.hole] : r.n) : null}
          onPick={pickNumber}
        />
      )}

      {/* "?" — tushuntirishni qayta ko'rish */}
      {!solved && (
        <motion.button className="help-btn" onClick={() => void explain()} whileTap={{ scale: 0.9 }} aria-label="Qanday bajariladi?">
          ?
        </motion.button>
      )}
      {hint && <HandHint key={`${idx}-${demoToken.current}`} mode={hint.mode} path={hint.path} onDone={() => setHint(null)} />}

      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current })} />}
    </GameShell>
  )
}
