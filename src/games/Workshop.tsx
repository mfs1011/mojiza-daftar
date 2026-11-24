import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_TILES, TileArt, type TileId } from '../art/Tile'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { say, sfx } from '../lib/audio'
import { pick, shuffle } from '../lib/util'
import { levelRow } from '../lib/stations'
import type { GameProps } from '../types'

// 🏺 Ustaxona — naqshni davom ettirish (#4).
// Taxtada o'zbek naqsh plitkalari qatori: A B A B ? — bola keyingisini tanlaydi.
// Har raund to'g'ri yechilsa, chap tomondagi ko'zaga shu naqsh bezak bo'lib tushadi.

interface WorkshopCfg {
  units: string[]
  options: number
  blanks: number
}

// Naqsh birligi (AB, AAB, ABC...), tanlov plitkalari soni va bo'sh joylar.
// Birlik 4 harfdan oshmaydi va bo'sh joylar 3 tagacha: taxta 11 katakka sig'adi.
const WORKSHOP_LEVELS: WorkshopCfg[] = [
  { units: ['AB'], options: 2, blanks: 1 },
  { units: ['AB'], options: 3, blanks: 1 },
  { units: ['AB', 'AAB'], options: 3, blanks: 1 },
  { units: ['AAB', 'ABB'], options: 3, blanks: 1 },
  { units: ['AAB', 'ABB', 'ABC'], options: 3, blanks: 1 },
  { units: ['ABC', 'ABB'], options: 4, blanks: 1 },
  { units: ['ABC', 'AABB'], options: 3, blanks: 2 },
  { units: ['ABC', 'AABB', 'ABB'], options: 4, blanks: 2 },
  { units: ['AABB', 'ABCC'], options: 4, blanks: 2 },
  { units: ['AABB', 'ABCC', 'ABAC'], options: 4, blanks: 2 },
  { units: ['ABCD', 'ABAC'], options: 4, blanks: 2 },
  { units: ['ABCD', 'AABB', 'ABCC'], options: 5, blanks: 2 },
  { units: ['ABCD', 'ABAC', 'AABC'], options: 5, blanks: 3 },
  { units: ['ABCD', 'AABC', 'ABCB'], options: 5, blanks: 3 },
  { units: ['ABCD', 'AABC', 'ABCB', 'ABBC'], options: 5, blanks: 3 },
]

const workshopCfg = (level: number) => levelRow(WORKSHOP_LEVELS, level)

const ROUNDS = 4

interface Round {
  seq: TileId[]
  /** Ko'rinadigan plitkalar soni; qolganlari bo'sh joy */
  shown: number
  options: TileId[]
}

function makeRound(cfg: WorkshopCfg): Round {
  const unit = pick(cfg.units)
  const letters = [...new Set(unit)]
  const tiles = shuffle(ALL_TILES)
  const map = Object.fromEntries(letters.map((l, i) => [l, tiles[i]])) as Record<string, TileId>
  const shown = Math.max(unit.length * 2, 4)
  const seq = Array.from({ length: shown + cfg.blanks }, (_, i) => map[unit[i % unit.length]])
  const used = letters.map((l) => map[l])
  const distractors = tiles.slice(letters.length)
  const options = shuffle([...used, ...distractors].slice(0, Math.max(cfg.options, used.length)))
  return { seq, shown, options }
}

export function Workshop({ level, onComplete, onExit }: GameProps) {
  const [roundIdx, setRoundIdx] = useState(0)
  const rounds = useMemo(() => Array.from({ length: ROUNDS }, () => makeRound(workshopCfg(level))), [level])
  const round = rounds[roundIdx]
  const [filled, setFilled] = useState(0)
  const [wrong, setWrong] = useState<TileId | null>(null)
  const [bands, setBands] = useState<TileId[][]>([])
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const blanks = round.seq.length - round.shown
  const expected = round.seq[round.shown + filled]

  useEffect(() => {
    if (roundIdx === 0) void say('ustaxona_intro')
  }, [roundIdx])

  function choose(t: TileId) {
    if (filled >= blanks) return
    if (t === expected) {
      sfx.pop()
      burstAt(slotRefs.current[round.shown + filled], ['#f6bd60', '#219ebc', '#fff'])
      const n = filled + 1
      setFilled(n)
      if (n === blanks) {
        react('happy', 1800)
        void say(pick(['barakalla', 'zor']))
        setBands((b) => [...b, round.seq.slice(0, 6)])
        setTimeout(() => {
          if (roundIdx + 1 >= ROUNDS) setFinished(true)
          else {
            sfx.whoosh()
            setFilled(0)
            setRoundIdx((i) => i + 1)
          }
        }, 1600)
      } else react('happy', 800)
    } else {
      mistakes.current++
      sfx.wrong()
      react('oops')
      setWrong(t)
      setTimeout(() => setWrong(null), 450)
      void say('yana')
    }
  }

  return (
    <GameShell
      className="workshop"
      mascot={mascot}
      round={roundIdx}
      rounds={ROUNDS}
      onExit={onExit}
      data={{ 'data-answer': expected ?? '' }}
    >
      <div className="workshop-shelf" />

      {/* Ko'za: har raunddan keyin yangi naqsh kamari qo'shiladi */}
      <div className="pot">
        <svg viewBox="0 0 100 120" className="art pot-body">
          <path
            d="M36 8H64V20C82 28 92 48 90 70C88 96 72 114 50 114C28 114 12 96 10 70C8 48 18 28 36 20Z"
            fill="#e07a5f"
            stroke="#3d2c1e"
            strokeWidth={2.4}
          />
          <ellipse cx={50} cy={9} rx={15} ry={4} fill="#b5563f" stroke="#3d2c1e" strokeWidth={2} />
        </svg>
        <div className="pot-bands">
          {bands.map((b, i) => (
            <motion.div key={i} className="pot-band" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ type: 'spring', stiffness: 120 }}>
              {b.map((t, j) => (
                <span key={j} className="pot-tile">
                  <TileArt id={t} />
                </span>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="pattern-board">
        {round.seq.map((t, i) => {
          const isBlank = i >= round.shown
          const isFilled = isBlank && i - round.shown < filled
          const isNext = isBlank && i - round.shown === filled
          return (
            <div
              key={`${roundIdx}-${i}`}
              ref={(el) => {
                slotRefs.current[i] = el
              }}
              className={`slot ${isBlank ? 'blank' : ''} ${isNext ? 'next' : ''}`}
            >
              {(!isBlank || isFilled) && (
                <motion.div
                  className="slot-tile"
                  initial={isBlank ? { scale: 0, y: 120 } : { scale: 0 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay: isBlank ? 0 : i * 0.06 }}
                >
                  <TileArt id={t} />
                </motion.div>
              )}
              {isNext && (
                <motion.span className="slot-q" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                  ?
                </motion.span>
              )}
            </div>
          )
        })}
      </div>

      <div className="tile-options">
        {round.options.map((t) => (
          <motion.button
            key={`${roundIdx}-${t}`}
            className="tile-option"
            data-id={t}
            onClick={() => choose(t)}
            whileTap={{ scale: 0.88 }}
            initial={{ y: 80, opacity: 0 }}
            animate={wrong === t ? { x: [0, -10, 10, -6, 6, 0], y: 0, opacity: 1 } : { x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <TileArt id={t} />
          </motion.button>
        ))}
      </div>

      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current, tasks: rounds.reduce((a, r) => a + r.seq.length - r.shown, 0) })} />}
    </GameShell>
  )
}
