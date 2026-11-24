import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Celebration } from '../components/Celebration'
import { GameShell, useMascot } from '../components/GameShell'
import { useHowTo } from '../components/useHowTo'
import { isNewTask } from '../lib/howto'
import { say, setMusic, sfx } from '../lib/audio'
import { getSettings } from '../lib/settings'
import { INSTRUMENTS, NOTE_COLORS, NOTE_NAMES, PAD_COLORS, PADS, playNote, type InstrumentId } from '../lib/instruments'
import { levelRow } from '../lib/stations'
import { pick, randInt, wait } from '../lib/util'
import type { GameProps } from '../types'

// 🎵 Musiqa uyi — eshitish, xotira va ijodkorlik.
//   Takrorla: cholg'u kuy chaladi (klavishlar yonadi), bola xuddi shunday takrorlaydi.
//             Daraja oshgan sari kuy uzayadi, notalar ko'payadi, tezlashadi, cholg'u almashadi.
//   Erkin:    xohlagancha chaladi; kuyini yozib olib, qayta eshitadi.

interface MusicCfg {
  inst: InstrumentId
  /** Nechta klavish ishlatiladi (2..8) */
  keys: number
  /** Kuy uzunligi */
  len: number
  /** Notalar orasidagi vaqt, ms */
  tempo: number
}

const M = (inst: InstrumentId, keys: number, len: number, tempo: number): MusicCfg => ({ inst, keys, len, tempo })
const MUSIC_LEVELS: MusicCfg[] = [
  M('pianino', 3, 2, 700),
  M('ksilofon', 3, 3, 680),
  M('doira', 3, 3, 650),
  M('dutor', 4, 3, 650),
  M('nay', 4, 3, 640),
  M('pianino', 5, 4, 620),
  M('ksilofon', 5, 4, 600),
  M('doira', 5, 4, 580),
  M('dutor', 6, 4, 560),
  M('nay', 6, 5, 540),
  M('pianino', 7, 5, 520),
  M('ksilofon', 8, 5, 500),
  M('doira', 8, 6, 480),
  M('dutor', 8, 6, 460),
  M('pianino', 8, 7, 440),
]
const ROUNDS = 3

/** Musiqiy kuy: asosan qo'shni notalarga yuradi (kuylashga oson), ba'zan sakraydi */
function melody(cfg: MusicCfg): number[] {
  const seq = [randInt(0, cfg.keys - 1)]
  while (seq.length < cfg.len) {
    const prev = seq[seq.length - 1]
    let n = prev + pick([-2, -1, -1, 1, 1, 2])
    n = Math.max(0, Math.min(cfg.keys - 1, n))
    if (n === prev) n = prev === 0 ? 1 : prev - 1
    seq.push(n)
  }
  return seq
}

interface Note {
  id: number
  key: number
  x: number
  drift: number
}

export function MusicGame({ profile, level, onComplete, onExit }: GameProps) {
  const cfg = useMemo(() => levelRow(MUSIC_LEVELS, level), [level])
  const songs = useMemo(() => Array.from({ length: ROUNDS }, () => melody(cfg)), [cfg])
  const [inst, setInst] = useState<InstrumentId>(cfg.inst)
  const [mode, setMode] = useState<'takrorla' | 'erkin'>('takrorla')
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<'listen' | 'input' | 'solved'>('listen')
  const [pos, setPos] = useState(0)
  const [lit, setLit] = useState<number | null>(null)
  const [pressed, setPressed] = useState<number | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [finished, setFinished] = useState(false)
  const [recording, setRecording] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const token = useRef(0)
  const noteId = useRef(0)
  const rec = useRef<{ key: number; t: number }[]>([])
  const recStart = useRef(0)
  const song = songs[round]
  const keys = mode === 'erkin' ? 8 : cfg.keys

  // Musiqa uyida fon musiqasi o'chadi: cholg'u aniq eshitilsin
  useEffect(() => {
    setMusic(false)
    return () => setMusic(getSettings().music)
  }, [])

  /** Kuyni chalib ko'rsatish (klavishlar yonadi) */
  async function demo() {
    const my = ++token.current
    setPhase('listen')
    setPos(0)
    await say('musiqa_tingla')
    await wait(400)
    for (const k of song) {
      if (my !== token.current) return
      setLit(k)
      playNote(inst, k)
      spawn(k)
      await wait(cfg.tempo * 0.75)
      setLit(null)
      await wait(cfg.tempo * 0.25)
    }
    if (my !== token.current) return
    setPhase('input')
    void say('musiqa_sen')
  }

  // "Qanday bajariladi?": yordam — kuyni qayta chalib ko'rsatish (birinchi marta oldin tushuntiriladi)
  const howto = useHowTo(profile.id, 'musiqa', () => void demo())

  useEffect(() => {
    if (mode === 'takrorla') {
      const fresh = isNewTask(profile.id, 'musiqa_takrorla')
      howto.start('takrorla', [])
      if (!fresh) void demo()
    } else {
      howto.done()
      token.current++
      setLit(null)
      void say('musiqa_erkin')
    }
    // Raund yoki rejim almashganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, mode])

  function spawn(key: number) {
    const id = ++noteId.current
    setNotes((n) => [...n.slice(-14), { id, key, x: Math.random() * 40 - 20, drift: Math.random() * 60 - 30 }])
    setTimeout(() => setNotes((n) => n.filter((x) => x.id !== id)), 1300)
  }

  function press(k: number) {
    playNote(inst, k)
    spawn(k)
    setPressed(k)
    setTimeout(() => setPressed((p) => (p === k ? null : p)), 160)
    if (recording) rec.current.push({ key: k, t: performance.now() - recStart.current })
    if (mode !== 'takrorla' || phase !== 'input') return
    if (k === song[pos]) {
      const next = pos + 1
      setPos(next)
      if (next === song.length) {
        howto.done()
        setPhase('solved')
        react('happy', 1800)
        setTimeout(() => {
          sfx.success()
          void say('barakalla')
        }, 450)
        setTimeout(() => {
          if (round + 1 >= ROUNDS) setFinished(true)
          else setRound((r) => r + 1)
        }, 2200)
      }
    } else {
      mistakes.current++
      react('oops')
      setPhase('listen')
      howto.miss()
      // Qayta tinglaymiz
      setTimeout(() => void demo(), 900)
    }
  }

  async function playback() {
    const list = rec.current
    if (!list.length) return
    const my = ++token.current
    let prev = 0
    for (const n of list) {
      await wait(n.t - prev)
      if (my !== token.current) return
      prev = n.t
      setLit(n.key)
      playNote(inst, n.key)
      spawn(n.key)
      setTimeout(() => setLit((l) => (l === n.key ? null : l)), 200)
    }
  }

  const isPads = inst === 'doira'
  const disabled = mode === 'takrorla' && phase !== 'input'

  return (
    <GameShell
      className={`music inst-${inst}`}
      mascot={mascot}
      round={mode === 'takrorla' ? round : 0}
      rounds={mode === 'takrorla' ? ROUNDS : 1}
      onExit={onExit}
      data={{ 'data-phase': phase, 'data-song': song.join(','), 'data-mode': mode }}
    >
      {/* Cholg'u tanlash va rejim */}
      <div className="music-top">
        {INSTRUMENTS.map((x) => (
          <motion.button
            key={x.id}
            className={`inst-btn ${inst === x.id ? 'on' : ''}`}
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              setInst(x.id)
              playNote(x.id, 4)
              void say(`asbob_${x.id}`)
            }}
            aria-label={x.name}
          >
            <span>{x.icon}</span>
          </motion.button>
        ))}
        <motion.button
          className={`mode-btn ${mode === 'erkin' ? 'on' : ''}`}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            sfx.tap()
            setMode((m) => (m === 'takrorla' ? 'erkin' : 'takrorla'))
          }}
        >
          {mode === 'takrorla' ? '🎨 Erkin chal' : '🎧 Takrorla'}
        </motion.button>
      </div>

      {/* Takrorla: kuyning nechanchi notasidamiz */}
      {mode === 'takrorla' ? (
        <div className="song-dots">
          {song.map((k, i) => (
            <span key={i} className={`song-dot ${i < pos ? 'on' : ''}`} style={{ background: i < pos ? (isPads ? PAD_COLORS[k] : NOTE_COLORS[k]) : undefined }} />
          ))}
          <motion.button className="song-replay" whileTap={{ scale: 0.9 }} onClick={() => phase === 'input' && void demo()} aria-label="Yana tinglash">
            🔁
          </motion.button>
        </div>
      ) : (
        <div className="song-dots">
          <motion.button
            className={`rec-btn ${recording ? 'on' : ''}`}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sfx.tap()
              if (!recording) {
                rec.current = []
                recStart.current = performance.now()
              }
              setRecording(!recording)
            }}
          >
            {recording ? '⏹️ To\'xtat' : '⏺️ Yozib ol'}
          </motion.button>
          <motion.button className="rec-btn" whileTap={{ scale: 0.9 }} onClick={() => (setRecording(false), void playback())}>
            ▶️ Eshit
          </motion.button>
        </div>
      )}

      {/* Cholg'u */}
      <div className={`instrument ${isPads ? 'pads' : ''} ${disabled ? 'waiting' : ''}`}>
        {Array.from({ length: isPads ? Math.max(keys, 4) : keys }, (_, k) => {
          const color = isPads ? PAD_COLORS[k] : NOTE_COLORS[k]
          const on = lit === k || pressed === k
          return (
            <motion.button
              key={`${inst}-${k}`}
              className={`key ${on ? 'lit' : ''}`}
              data-key={k}
              style={{ '--c': color, '--i': k } as React.CSSProperties}
              onPointerDown={(e) => {
                e.preventDefault()
                if (!disabled) press(k)
              }}
              animate={on ? { y: '0.8vmin', scale: inst === 'doira' ? 0.92 : 0.98 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 700, damping: 20 }}
            >
              {inst === 'dutor' && <span className={`string ${on ? 'twang' : ''}`} />}
              {inst === 'nay' && <span className="hole" />}
              <span className="key-name">{isPads ? PADS[k] : NOTE_NAMES[k]}</span>
            </motion.button>
          )
        })}

        {/* Uchib chiqayotgan notalar */}
        <AnimatePresence>
          {notes.map((n) => (
            <motion.span
              key={n.id}
              className="fly-note"
              style={{ left: `calc(${((n.key + 0.5) / keys) * 100}% + ${n.x}px)`, color: isPads ? PAD_COLORS[n.key] : NOTE_COLORS[n.key] }}
              initial={{ y: 0, opacity: 1, scale: 0.6 }}
              animate={{ y: '-40vh', x: n.drift, opacity: 0, scale: 1.4, rotate: n.drift / 2 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {n.id % 3 ? '♪' : '♫'}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {mode === 'takrorla' && phase === 'input' && howto.overlay}
      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current, tasks: songs.reduce((a, s) => a + s.length, 0) })} />}
    </GameShell>
  )
}
