import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ALL_ANIMALS, AnimalArt, type AnimalId } from '../art/Animal'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { say, sayAnimal, sfx } from '../lib/audio'
import { pick, shuffle, wait } from '../lib/util'
import { levelRow } from '../lib/stations'
import type { GameProps } from '../types'

// 🐑 Ferma — eshitish va xotira (#8).
// "Kim" rejimi: g'aram ortidan tovush keladi, bola qaysi hayvonligini topadi.
// "Takrorla" rejimi: hayvonlar ketma-ket gapiradi, bola xuddi shu tartibda bosadi (ishchi xotira).

interface FarmCfg {
  mode: 'kim' | 'takrorla'
  /** kim: variantlar soni; takrorla: maydondagi hayvonlar soni */
  animals: number
  /** takrorla: ketma-ketlik uzunligi */
  length: number
}

// 0–4: "Kim gapiryapti?" (bitta ovoz, tanlov kengayadi).
// 5+: "Eshit va takrorla" — ketma-ketlik uzayadi, hayvonlar ko'payadi (ekranga 6 tagacha sig'adi).
// Endless band (10–14) hammasi "takrorla": bitta o'yin ichida rejim almashmasligi uchun.
const FARM_LEVELS: FarmCfg[] = [
  { mode: 'kim', animals: 2, length: 1 },
  { mode: 'kim', animals: 2, length: 1 },
  { mode: 'kim', animals: 3, length: 1 },
  { mode: 'kim', animals: 3, length: 1 },
  { mode: 'kim', animals: 4, length: 1 },
  { mode: 'takrorla', animals: 2, length: 2 },
  { mode: 'takrorla', animals: 3, length: 2 },
  { mode: 'takrorla', animals: 3, length: 3 },
  { mode: 'takrorla', animals: 4, length: 3 },
  { mode: 'takrorla', animals: 4, length: 4 },
  { mode: 'takrorla', animals: 5, length: 4 },
  { mode: 'takrorla', animals: 5, length: 5 },
  { mode: 'takrorla', animals: 6, length: 5 },
  { mode: 'takrorla', animals: 6, length: 6 },
  { mode: 'takrorla', animals: 6, length: 7 },
]

const farmCfg = (level: number) => levelRow(FARM_LEVELS, level)

const ROUNDS = 3

interface Round {
  animals: AnimalId[]
  /** kim: [javob]; takrorla: ketma-ketlik */
  seq: AnimalId[]
}

function makeRound(cfg: FarmCfg): Round {
  const animals = shuffle(ALL_ANIMALS).slice(0, cfg.animals)
  const length = cfg.mode === 'kim' ? 1 : cfg.length
  // Ketma-ket bir xil hayvon kelmasin: eslab qolish adolatli bo'lsin
  const seq: AnimalId[] = []
  for (let i = 0; i < length; i++) seq.push(pick(animals.filter((a) => a !== seq[i - 1])))
  return { animals, seq }
}

export function Farm({ level, onComplete, onExit }: GameProps) {
  // Rejim (kim/takrorla) butun o'yin uchun bitta; raundlar endless'da har xil bo'lishi mumkin
  const cfg = useMemo(() => farmCfg(level), [level])
  const [roundIdx, setRoundIdx] = useState(0)
  const rounds = useMemo(
    () => Array.from({ length: ROUNDS }, (_, i) => makeRound(i === 0 ? cfg : { ...farmCfg(level), mode: cfg.mode })),
    [level, cfg],
  )
  const round = rounds[roundIdx]
  const [phase, setPhase] = useState<'listen' | 'input' | 'solved' | 'finished'>('listen')
  const [lit, setLit] = useState<AnimalId | null>(null)
  const [progress, setProgress] = useState(0)
  const [wrong, setWrong] = useState<AnimalId | null>(null)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const alive = useRef(true)
  const cardRefs = useRef<Partial<Record<AnimalId, HTMLButtonElement | null>>>({})

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  async function playSequence(first: boolean) {
    setPhase('listen')
    setProgress(0)
    if (first && roundIdx === 0) await say(cfg.mode === 'kim' ? 'ferma_kim' : 'ferma_takrorla')
    else if (first && cfg.mode === 'kim') await say('ferma_kim')
    await wait(300)
    for (const a of round.seq) {
      if (!alive.current) return
      setLit(cfg.mode === 'kim' ? null : a)
      await sayAnimal(a, { steady: cfg.mode === 'takrorla' })
      setLit(null)
      await wait(250)
    }
    if (alive.current) setPhase('input')
  }

  useEffect(() => {
    void playSequence(true)
    // Har yangi raundda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx])

  function solved() {
    setPhase('solved')
    sfx.success()
    react('happy', 1800)
    const last = round.seq[round.seq.length - 1]
    burstAt(cardRefs.current[last])
    void (async () => {
      if (cfg.mode === 'kim') {
        await sayAnimal(last)
        await say(`hayvon_${last}`, 'barakalla')
      } else await say('barakalla')
      await wait(600)
      if (!alive.current) return
      if (roundIdx + 1 >= ROUNDS) setPhase('finished')
      else {
        sfx.whoosh()
        setRoundIdx((i) => i + 1)
      }
    })()
  }

  function tap(a: AnimalId) {
    if (phase !== 'input') return
    const expected = round.seq[progress]
    if (a === expected) {
      sfx.pop()
      setLit(a)
      setTimeout(() => setLit((x) => (x === a ? null : x)), 400)
      if (cfg.mode === 'takrorla') void sayAnimal(a, { steady: true })
      const next = progress + 1
      setProgress(next)
      if (next === round.seq.length) solved()
    } else {
      mistakes.current++
      sfx.wrong()
      react('oops')
      setWrong(a)
      setTimeout(() => setWrong(null), 500)
      // Bola noto'g'ri hayvon tovushini eshitib, farqni sezadi; keyin qayta eshitamiz
      void (async () => {
        setPhase('listen')
        await sayAnimal(a, { steady: cfg.mode === 'takrorla' })
        await wait(500)
        if (alive.current) await playSequence(false)
      })()
    }
  }

  const revealed = cfg.mode === 'kim' && phase !== 'listen' && phase !== 'input'

  return (
    <GameShell
      className="farm"
      mascot={mascot}
      round={roundIdx}
      rounds={ROUNDS}
      onExit={onExit}
      data={{ 'data-phase': phase, 'data-seq': round.seq.join(',') }}
    >
      <div className="farm-sun" />
      <div className="farm-barn" />
      <div className="farm-fence" />

      {cfg.mode === 'kim' && (
        <motion.button
          className="haystack"
          onClick={() => phase === 'input' && void sayAnimal(round.seq[0])}
          animate={phase === 'listen' ? { rotate: [0, -3, 3, -2, 0], scale: [1, 1.03, 1] } : { rotate: 0 }}
          transition={phase === 'listen' ? { repeat: Infinity, duration: 0.5 } : {}}
          aria-label="Yana eshitish"
        >
          {revealed && (
            <motion.div className="haystack-animal" initial={{ y: '60%', scale: 0.4 }} animate={{ y: '-38%', scale: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 10 }}>
              <AnimalArt id={round.seq[0]} />
            </motion.div>
          )}
          <svg viewBox="0 0 120 90" className="art">
            <g stroke="#3d2c1e" strokeWidth={2.4} strokeLinejoin="round">
              <path d="M8 88C4 50 30 10 60 10C90 10 116 50 112 88Z" fill="#e9c46a" />
              <path d="M24 40L30 60M46 24L50 48M70 22L68 46M92 38L86 60M40 70L44 86M78 68L74 86" fill="none" stroke="#c9a227" strokeWidth={3} />
            </g>
          </svg>
          {phase === 'input' && <span className="ear-hint">?</span>}
        </motion.button>
      )}

      <div className={`farm-animals ${cfg.mode}`} style={{ '--n': round.animals.length } as CSSProperties}>
        {round.animals.map((a) => (
          <motion.button
            key={`${roundIdx}-${a}`}
            ref={(el) => {
              cardRefs.current[a] = el
            }}
            className={`farm-animal ${lit === a ? 'lit' : ''}`}
            data-id={a}
            onClick={() => tap(a)}
            initial={{ y: 60, opacity: 0 }}
            animate={
              wrong === a
                ? { x: [0, -10, 10, -6, 6, 0], y: 0, opacity: 1 }
                : lit === a
                  ? { scale: 1.18, y: -14, opacity: 1 }
                  : { scale: 1, y: 0, opacity: 1 }
            }
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            whileTap={{ scale: 0.92 }}
          >
            <AnimalArt id={a} />
            {lit === a && cfg.mode === 'takrorla' && (
              <motion.span className="sound-waves" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} />
            )}
          </motion.button>
        ))}
      </div>

      {cfg.mode === 'takrorla' && (
        <div className="seq-dots">
          {round.seq.map((_, i) => (
            <span key={i} className={`seq-dot ${i < progress ? 'on' : ''}`} />
          ))}
        </div>
      )}

      {phase === 'finished' && <Celebration voice={[]} onDone={() => onComplete({ mistakes: mistakes.current })} />}
    </GameShell>
  )
}
