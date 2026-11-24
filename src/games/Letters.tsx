import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimalArt } from '../art/Animal'
import { FruitArt } from '../art/Fruit'
import { ThingArt, thingReady } from '../art/Thing'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { Hero } from '../components/Hero'
import { say, sayAnimal, sfx } from '../lib/audio'
import { EASY_LETTERS, initialOf, LETTERS, WORDS, type Word } from '../lib/letters'
import { TraceBoard } from '../components/TraceBoard'
import { pick, shuffle } from '../lib/util'
import { levelRow } from '../lib/stations'
import type { GameProps, Profile, TraceStat } from '../types'

// 🔤 Harflar uyi — harflar bilan tanishish (#5), faqat 5 yoshga.
// "Chiz" raundi: harfni barmoq bilan bo'r taxtaga chizish.
// "Top" raundi: rasmga qarab, so'z qaysi harfdan boshlanishini topish.

type LRound =
  | { type: 'chiz'; letter: string; word?: Word }
  | { type: 'top'; word: Word; options: string[] }

interface LettersCfg {
  /** Faqat oson harflar (O, U, T, N, A, M) */
  easy: boolean
  /** "Top" raundidagi variantlar soni (ekranga 4 tagacha sig'adi) */
  options: number
  /** 3-raund: so'z harfini chizish, o'z ismining bosh harfini chizish yoki yana bir "top" */
  third: 'word' | 'name' | 'top'
  /** Chizish qanchalik aniq bo'lishi kerak (harf yuzasining ulushi) */
  threshold: number
}

const L = (easy: boolean, options: number, third: LettersCfg['third'], threshold: number): LettersCfg => ({ easy, options, third, threshold })
const LETTERS_LEVELS: LettersCfg[] = [
  L(true, 2, 'word', 0.6),
  L(true, 2, 'word', 0.62),
  L(true, 3, 'word', 0.62),
  L(true, 3, 'name', 0.62),
  L(true, 3, 'name', 0.64),
  L(false, 3, 'word', 0.64),
  L(false, 3, 'name', 0.66),
  L(false, 3, 'top', 0.66),
  L(false, 4, 'name', 0.68),
  L(false, 4, 'top', 0.68),
  L(false, 4, 'word', 0.7),
  L(false, 4, 'top', 0.7),
  L(false, 4, 'name', 0.72),
  L(false, 4, 'top', 0.73),
  L(false, 4, 'word', 0.75),
]

function topRound(word: Word, n: number): LRound {
  const options = shuffle([word.letter, ...shuffle(LETTERS.filter((l) => l !== word.letter)).slice(0, n - 1)])
  return { type: 'top', word, options }
}

/** Rasmi tayyor so'zlar (yangi narsaning rasmi hali yaratilmagan bo'lsa — chiqmaydi) */
const readyWords = () => WORDS.filter((w) => w.pic.type !== 'thing' || thingReady(w.pic.id))

function lettersRounds(cfg: LettersCfg, name: string): LRound[] {
  const words = readyWords()
  const pool = cfg.easy ? words.filter((w) => EASY_LETTERS.includes(w.letter)) : words
  const w1 = pick(pool)
  const w2 = pick(words.filter((w) => w.letter !== w1.letter))
  const w3 = pick(pool.filter((w) => w.letter !== w1.letter && w.letter !== w2.letter))
  const third: LRound =
    cfg.third === 'name'
      ? { type: 'chiz', letter: initialOf(name) }
      : cfg.third === 'top'
        ? topRound(w3, cfg.options)
        : { type: 'chiz', letter: w3.letter, word: w3 }
  return [{ type: 'chiz', letter: w1.letter, word: w1 }, topRound(w2, cfg.options), third]
}

function WordPicture({ word, profile }: { word?: Word; profile: Profile }) {
  if (!word) return <Hero profile={profile} mode="idle" className="word-hero" />
  if (word.pic.type === 'thing') return <ThingArt id={word.pic.id} />
  return word.pic.type === 'fruit' ? <FruitArt kind={word.pic.id} /> : <AnimalArt id={word.pic.id} />
}

// ---------------- Chizish raundi ----------------

// ---------------- O'yin ----------------

export function Letters({ profile, level, onComplete, onExit }: GameProps) {
  const cfg = useMemo(() => levelRow(LETTERS_LEVELS, level), [level])
  const rounds = useMemo(() => lettersRounds(cfg, profile.name), [cfg, profile.name])
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const traces = useRef<TraceStat[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const r = rounds[idx]

  useEffect(() => {
    if (r.type === 'chiz') void say('harf_chiz', `harf_${r.letter}`, ...(r.word ? [r.word.voice] : []))
    else void say('harf_top', r.word.voice)
  }, [r])

  function next() {
    setTimeout(() => {
      if (idx + 1 >= rounds.length) setFinished(true)
      else {
        sfx.whoosh()
        setSolved(false)
        setIdx((i) => i + 1)
      }
    }, 2200)
  }

  function traced() {
    if (r.type !== 'chiz') return
    sfx.magic()
    react('happy', 2000)
    setSolved(true)
    void say(`harf_${r.letter}`, ...(r.word ? [r.word.voice] : []), 'barakalla')
    next()
  }

  function choose(l: string) {
    if (r.type !== 'top' || solved) return
    if (l === r.word.letter) {
      sfx.success()
      react('happy', 2000)
      burstAt(cardRef.current)
      setSolved(true)
      void say(`harf_${l}`, r.word.voice)
      next()
    } else {
      mistakes.current++
      sfx.wrong()
      react('oops')
      setWrong(l)
      setTimeout(() => setWrong(null), 450)
      void say('yana')
    }
  }

  const word = r.type === 'chiz' ? r.word : r.word

  return (
    <GameShell
      className="letters"
      mascot={mascot}
      round={idx}
      rounds={rounds.length}
      onExit={onExit}
      data={{ 'data-type': r.type, 'data-answer': r.type === 'top' ? r.word.letter : r.letter }}
    >
      <motion.div
        key={`card-${idx}`}
        ref={cardRef}
        className="word-card"
        initial={{ x: -80, opacity: 0, rotate: -6 }}
        animate={{ x: 0, opacity: 1, rotate: -3 }}
        onClick={() => {
          if (!word) return
          // Hayvon bo'lsa — avval o'z ovozi, keyin nomi
          if (word.pic.type === 'animal') void sayAnimal(word.pic.id).then(() => say(word.voice))
          else void say(word.voice)
        }}
      >
        <div className="word-pic">
          <WordPicture word={word} profile={profile} />
        </div>
        <div className="word-name">
          {word ? (
            <>
              <b className={r.type === 'top' && !solved ? 'hidden-letter' : ''}>{word.name[0]}</b>
              {word.name.slice(1)}
            </>
          ) : (
            profile.name
          )}
        </div>
      </motion.div>

      {r.type === 'chiz' ? (
        <TraceBoard key={`board-${idx}`} glyph={r.letter} threshold={cfg.threshold} onDone={(st) => (traces.current.push({ glyph: r.letter, ...st }), traced())} onMistake={() => (mistakes.current++, react('oops'))} />
      ) : (
        <div className="letter-options">
          {r.options.map((l) => (
            <motion.button
              key={`${idx}-${l}`}
              className={`letter-option ${solved && l === r.word.letter ? 'right' : ''}`}
              data-correct={l === r.word.letter ? '1' : '0'}
              onClick={() => choose(l)}
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0 }}
              animate={wrong === l ? { x: [0, -10, 10, -6, 6, 0], scale: 1 } : { scale: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {l}
            </motion.button>
          ))}
        </div>
      )}

      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current, tasks: rounds.length, traces: traces.current })} />}
    </GameShell>
  )
}
