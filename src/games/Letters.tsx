import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimalArt } from '../art/Animal'
import { FruitArt } from '../art/Fruit'
import { Celebration } from '../components/Celebration'
import { burstAt } from '../components/Fx'
import { GameShell, useMascot } from '../components/GameShell'
import { Hero } from '../components/Hero'
import { say, sfx } from '../lib/audio'
import { EASY_LETTERS, initialOf, LETTERS, WORDS, type Word } from '../lib/letters'
import { drawLetter, makeMask, maskPoints, scoreTrace, type TraceMask } from '../lib/trace'
import { pick, shuffle } from '../lib/util'
import type { GameProps, Profile } from '../types'

// 🔤 Harflar uyi — harflar bilan tanishish (#5), faqat 5 yoshga.
// "Chiz" raundi: harfni barmoq bilan bo'r taxtaga chizish.
// "Top" raundi: rasmga qarab, so'z qaysi harfdan boshlanishini topish.

type LRound =
  | { type: 'chiz'; letter: string; word?: Word }
  | { type: 'top'; word: Word; options: string[] }

function lettersRounds(level: number, name: string): LRound[] {
  const pool = level <= 2 ? WORDS.filter((w) => EASY_LETTERS.includes(w.letter)) : WORDS
  const w1 = pick(pool)
  const w2 = pick(WORDS.filter((w) => w.letter !== w1.letter))
  const nOpt = level <= 1 ? 2 : level <= 3 ? 3 : 4
  const options = shuffle([w2.letter, ...shuffle(LETTERS.filter((l) => l !== w2.letter)).slice(0, nOpt - 1)])
  const third: LRound =
    level >= 2
      ? { type: 'chiz', letter: initialOf(name) }
      : (() => {
          const w3 = pick(pool.filter((w) => w.letter !== w1.letter))
          return { type: 'chiz' as const, letter: w3.letter, word: w3 }
        })()
  return [{ type: 'chiz', letter: w1.letter, word: w1 }, { type: 'top', word: w2, options }, third]
}

function WordPicture({ word, profile }: { word?: Word; profile: Profile }) {
  if (!word) return <Hero profile={profile} mode="idle" className="word-hero" />
  return word.pic.type === 'fruit' ? <FruitArt kind={word.pic.id} /> : <AnimalArt id={word.pic.id} />
}

// ---------------- Chizish raundi ----------------

function TraceBoard({ letter, level, onDone, onMistake }: { letter: string; level: number; onDone: () => void; onMistake: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<HTMLCanvasElement>(null)
  const userRef = useRef<HTMLCanvasElement | null>(null)
  const maskRef = useRef<TraceMask | null>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [done, setDone] = useState(false)
  const doneRef = useRef(false)
  const threshold = level >= 3 ? 0.7 : 0.62

  // Taxtani tayyorlash
  useEffect(() => {
    const wrap = wrapRef.current!
    const w = Math.round(wrap.clientWidth)
    const h = Math.round(wrap.clientHeight)
    const dpr = window.devicePixelRatio || 1
    for (const c of [guideRef.current!, drawRef.current!]) {
      c.width = w * dpr
      c.height = h * dpr
      c.style.width = `${w}px`
      c.style.height = `${h}px`
      c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const mask = makeMask(letter, w, h)
    maskRef.current = mask
    const user = document.createElement('canvas')
    user.width = w
    user.height = h
    userRef.current = user

    const g = guideRef.current!.getContext('2d')!
    // Avval punktir kontur, ustidan to'liq bo'yoq: shriftning ichki chiziqlari yopiladi,
    // faqat tashqi punktir ko'rinadi
    drawLetter(g, letter, mask.layout, { stroke: 'rgba(255,255,255,0.85)', dash: [12, 10], strokeWidth: 7 })
    drawLetter(g, letter, mask.layout, { fill: '#3f8565' })

    if (import.meta.env.DEV) {
      const r = wrap.getBoundingClientRect()
      ;(window as unknown as { __traceTargets?: [number, number][] }).__traceTargets = maskPoints(mask, r.left, r.top, 8)
    }
  }, [letter])

  function pos(e: React.PointerEvent) {
    const r = drawRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function line(a: { x: number; y: number }, b: { x: number; y: number }) {
    const lw = maskRef.current!.layout.lineWidth
    for (const [ctx, color] of [
      [drawRef.current!.getContext('2d')!, '#ffe066'],
      [userRef.current!.getContext('2d')!, '#000'],
    ] as const) {
      ctx.strokeStyle = color
      ctx.lineWidth = lw
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
  }

  function clear(countMistake: boolean) {
    const m = maskRef.current
    if (!m) return
    const d = drawRef.current!
    d.getContext('2d')!.clearRect(0, 0, d.width, d.height)
    userRef.current!.getContext('2d')!.clearRect(0, 0, m.w, m.h)
    if (countMistake) onMistake()
  }

  function evaluate() {
    const m = maskRef.current
    if (!m || doneRef.current) return
    const data = userRef.current!.getContext('2d')!.getImageData(0, 0, m.w, m.h).data
    const s = scoreTrace(m, data)
    if (s.coverage >= threshold && s.outside <= 0.45) {
      doneRef.current = true
      setDone(true)
      const g = guideRef.current!.getContext('2d')!
      drawLetter(g, letter, m.layout, { fill: '#ffd166' })
      burstAt(wrapRef.current, ['#ffd166', '#fff', '#06d6a0'], 22)
      onDone()
    } else if (s.outside > 0.6 && s.userCount > 200) {
      // Juda ko'p chetga chiqdi: tozalab, qaytadan
      sfx.wrong()
      setTimeout(() => clear(true), 500)
    }
  }

  return (
    <div className="chalkboard" ref={wrapRef}>
      <canvas ref={guideRef} className="trace-canvas" />
      <motion.canvas
        ref={drawRef}
        className="trace-canvas draw"
        animate={done ? { opacity: 0 } : { opacity: 1 }}
        onPointerDown={(e) => {
          if (doneRef.current) return
          e.currentTarget.setPointerCapture(e.pointerId)
          last.current = pos(e)
          line(last.current, last.current)
        }}
        onPointerMove={(e) => {
          if (!last.current) return
          const p = pos(e)
          line(last.current, p)
          last.current = p
        }}
        onPointerUp={() => {
          last.current = null
          evaluate()
        }}
        onPointerCancel={() => (last.current = null)}
      />
      {!done && (
        <button className="sponge" onClick={() => clear(true)} aria-label="Tozalash">
          <svg viewBox="0 0 100 70" className="art">
            <rect x={6} y={10} width={88} height={50} rx={12} fill="#ffd166" stroke="#3d2c1e" strokeWidth={3} />
            <circle cx={30} cy={30} r={5} fill="#e9b949" />
            <circle cx={60} cy={40} r={6} fill="#e9b949" />
            <circle cx={74} cy={24} r={4} fill="#e9b949" />
          </svg>
        </button>
      )}
    </div>
  )
}

// ---------------- O'yin ----------------

export function Letters({ profile, level, onComplete, onExit }: GameProps) {
  const rounds = useMemo(() => lettersRounds(level, profile.name), [level, profile.name])
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
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
        onClick={() => word && void say(word.voice)}
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
        <TraceBoard key={`board-${idx}`} letter={r.letter} level={level} onDone={traced} onMistake={() => (mistakes.current++, react('oops'))} />
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

      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current })} />}
    </GameShell>
  )
}
