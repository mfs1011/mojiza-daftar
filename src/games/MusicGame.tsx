import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DoiraKit } from '../art/Percussion'
import { Celebration } from '../components/Celebration'
import { GameShell, useMascot } from '../components/GameShell'
import { useHowTo } from '../components/useHowTo'
import { say, setMusic, sfx } from '../lib/audio'
import { isNewTask } from '../lib/howto'
import { INSTRUMENTS, isBlack, loadInstrument, noteColor, noteName, PAD_COLORS, playNote, whiteNotes, type InstrumentId } from '../lib/instruments'
import { getSettings } from '../lib/settings'
import { joinPhrases, SONGS, type SongNote } from '../lib/songs'
import { levelRow } from '../lib/stations'
import { wait } from '../lib/util'
import type { GameProps } from '../types'

// 🎵 Musiqa uyi — eshitish, xotira va ijodkorlik.
//   Takrorla: haqiqiy kuylarni (xalq va mumtoz bolalar kuylari) jumlama-jumla o'rganadi:
//             cholg'u jumlani ritmi bilan chaladi (klavishlar yonadi), bola takrorlaydi;
//             keyin jumlalar birlashtirilib butun kuy chalinadi. Daraja oshgan sari kuylar uzayadi.
//             Doirada — o'sha kuyning ritmi (bum/tak/qarsak) takrorlanadi.
//   Erkin:    xohlagancha chaladi; pianino va ksilofonda oktava qo'shish mumkin; kuyini yozib olib eshitadi.
// Ovozlar — haqiqiy cholg'u yozuvlari (lib/instruments, CC0).

interface MusicCfg {
  song: string
  inst: InstrumentId
  /** Har raund — kuyning qaysi jumlalari (birlashtirilgani — butun kuy qismi) */
  rounds: number[][]
  /** Bir zarb, ms */
  beat: number
}

const M = (song: string, inst: InstrumentId, rounds: number[][], beat: number): MusicCfg => ({ song, inst, rounds, beat })
const MUSIC_LEVELS: MusicCfg[] = [
  M('nonlar', 'ksilofon', [[0], [0, 2]], 620),
  M('nonlar', 'pianino', [[0], [1], [0, 1, 2]], 600),
  M('qozichoq', 'ksilofon', [[0], [1]], 600),
  M('yulduzcha', 'pianino', [[0], [1], [0, 1]], 580),
  M('jak', 'ksilofon', [[0], [1], [0, 1]], 560),
  M('ferma', 'dutor', [[0], [1], [0, 1]], 560),
  M('qozichoq', 'pianino', [[0], [1], [2], [3]], 540),
  M('yulduzcha', 'nay', [[2], [0, 1], [2, 3]], 560),
  M('qayiq', 'pianino', [[0], [1], [0, 1]], 520),
  M('shodlik', 'pianino', [[0], [1], [0, 1]], 520),
  M('koprik', 'ksilofon', [[0], [1], [2, 3]], 500),
  M('jak', 'pianino', [[2], [3], [0, 1, 2, 3]], 480),
  M('qongiroq', 'pianino', [[0, 1], [2], [3]], 480),
  M('alla', 'pianino', [[0], [1], [2], [3]], 520),
  M('tugilgan', 'pianino', [[0], [1], [2], [3]], 480),
]

/** Doirada kuyning ritmi: uzun zarb — "Bum", qisqa — "Tak", jumla oxiri — "Qarsak" */
function rhythmOf(notes: SongNote[]): number[] {
  return notes.map((n, i) => (i === notes.length - 1 ? 2 : n.beats >= 1.5 ? 0 : i > 0 && n.midi > notes[i - 1].midi ? 1 : n.beats < 1 ? 1 : 0))
}

/** Kuyni qamrab oladigan klaviatura oralig'i (Do dan Do gacha, kamida bir oktava) */
function rangeFor(keys: number[]): [number, number] {
  const lo = Math.min(...keys)
  const hi = Math.max(...keys)
  const from = lo - (((lo % 12) + 12) % 12)
  let to = hi % 12 === 0 ? hi : hi - (hi % 12) + 12
  if (to - from < 12) to = from + 12
  return [from, to]
}

interface Note {
  id: number
  pct: number
  color: string
  drift: number
}

const MELODIC_OCTAVES: Partial<Record<InstrumentId, [number, number]>> = { pianino: [1, 3], ksilofon: [1, 2] }

export function MusicGame({ profile, level, onComplete, onExit }: GameProps) {
  const cfg = useMemo(() => levelRow(MUSIC_LEVELS, level), [level])
  const song = SONGS[cfg.song]
  const phrases = useMemo(() => cfg.rounds.map((r) => joinPhrases(song, r)), [cfg, song])
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
  const [octaves, setOctaves] = useState(1)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const token = useRef(0)
  const noteId = useRef(0)
  const rec = useRef<{ key: number; t: number }[]>([])
  const recStart = useRef(0)
  const isPads = inst === 'doira'
  const phrase = phrases[round]
  /** Bola takrorlashi kerak bo'lgan ketma-ketlik: nota (MIDI) yoki doira padi */
  const seq = useMemo(() => (isPads ? rhythmOf(phrase) : phrase.map((n) => n.midi)), [phrase, isPads])

  // Ko'rinadigan klavishlar
  const keys = useMemo(() => {
    if (isPads) return Array.from({ length: mode === 'erkin' ? 8 : 3 }, (_, i) => i)
    let from: number
    let to: number
    if (mode === 'takrorla') [from, to] = rangeFor(seq)
    else if (MELODIC_OCTAVES[inst]) {
      from = octaves === 3 ? 48 : 60
      to = from + 12 * octaves
    } else [from, to] = [60, 72]
    const all: number[] = []
    for (let m = from; m <= to; m++) if (inst === 'pianino' || !isBlack(m)) all.push(m)
    return all
  }, [isPads, mode, seq, inst, octaves])
  const whites = useMemo(() => (isPads ? keys : whiteNotes(keys[0], keys[keys.length - 1])), [keys, isPads])

  // Musiqa uyida fon musiqasi o'chadi: cholg'u aniq eshitilsin. Barcha cholg'ular oldindan yuklanadi
  useEffect(() => {
    setMusic(false)
    INSTRUMENTS.forEach((x) => void loadInstrument(x.id))
    return () => setMusic(getSettings().music)
  }, [])

  /** Jumlani ritmi bilan chalib ko'rsatish (klavishlar yonadi) */
  async function demo(intro: string[] = ['musiqa_tingla']) {
    const my = ++token.current
    setPhase('listen')
    setPos(0)
    await say(...intro)
    await wait(350)
    for (let i = 0; i < seq.length; i++) {
      if (my !== token.current) return
      const k = seq[i]
      const ms = phrase[i].beats * cfg.beat
      setLit(k)
      playNote(inst, k)
      spawn(k)
      await wait(ms * 0.8)
      setLit(null)
      await wait(ms * 0.2)
    }
    if (my !== token.current) return
    setPhase('input')
    void say('musiqa_sen')
  }

  // "Qanday bajariladi?": yordam — jumlani qayta chalib ko'rsatish (birinchi marta oldin tushuntiriladi)
  const howto = useHowTo(profile.id, 'musiqa', () => void demo())

  useEffect(() => {
    if (mode === 'takrorla') {
      const fresh = isNewTask(profile.id, 'musiqa_takrorla')
      howto.start('takrorla', [])
      // Birinchi raund — kuy nomi; bir nechta jumla birlashsa — "endi butun kuy"
      const intro = round === 0 ? [`musiqa_kuy_${song.id}`, 'musiqa_tingla'] : cfg.rounds[round].length > 1 ? ['musiqa_butun'] : ['musiqa_qism']
      if (!fresh) void demo(intro)
    } else {
      howto.done()
      token.current++
      setLit(null)
      void say('musiqa_erkin')
    }
    // Raund, rejim yoki cholg'u almashganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, mode, isPads])

  function spawn(key: number) {
    const id = ++noteId.current
    const idx = isPads ? key : whites.indexOf(isBlack(key) ? key - 1 : key) + (isBlack(key) ? 1 : 0.5)
    const pct = isPads ? 0 : (idx / whites.length) * 100
    const color = isPads ? PAD_COLORS[key] : noteColor(isBlack(key) ? key - 1 : key)
    setNotes((n) => [...n.slice(-14), { id, pct, color, drift: Math.random() * 60 - 30 }])
    setTimeout(() => setNotes((n) => n.filter((x) => x.id !== id)), 1300)
  }

  function press(k: number) {
    playNote(inst, k)
    spawn(k)
    setPressed(k)
    setTimeout(() => setPressed((p) => (p === k ? null : p)), 160)
    if (recording) rec.current.push({ key: k, t: performance.now() - recStart.current })
    if (mode !== 'takrorla' || phase !== 'input') return
    if (k === seq[pos]) {
      const next = pos + 1
      setPos(next)
      if (next === seq.length) {
        howto.done()
        setPhase('solved')
        react('happy', 1800)
        setTimeout(() => {
          sfx.success()
          void say('barakalla')
        }, 450)
        setTimeout(() => {
          if (round + 1 >= phrases.length) setFinished(true)
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

  const disabled = mode === 'takrorla' && phase !== 'input'
  const on = (k: number) => lit === k || pressed === k
  const down = (k: number) => (e: React.PointerEvent) => {
    e.preventDefault()
    if (!disabled) press(k)
  }
  const octRange = MELODIC_OCTAVES[inst]

  return (
    <GameShell
      className={`music inst-${inst}`}
      mascot={mascot}
      round={mode === 'takrorla' ? round : 0}
      rounds={mode === 'takrorla' ? phrases.length : 1}
      onExit={onExit}
      data={{ 'data-phase': phase, 'data-song': seq.join(','), 'data-mode': mode }}
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
              playNote(x.id, x.id === 'doira' ? 0 : 67)
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

      {mode === 'takrorla' ? (
        <div className="song-dots">
          <span className="song-name">🎵 {song.name}</span>
          {seq.map((k, i) => (
            <span
              key={i}
              className={`song-dot ${i < pos ? 'on' : ''}`}
              style={{ background: i < pos ? (isPads ? PAD_COLORS[k] : noteColor(k)) : undefined, width: `${Math.max(2.4, Math.min(5, 60 / seq.length))}vmin` }}
            />
          ))}
          <motion.button className="song-replay" whileTap={{ scale: 0.9 }} onClick={() => phase === 'input' && void demo()} aria-label="Yana tinglash">
            🔁
          </motion.button>
        </div>
      ) : (
        <div className="song-dots">
          {octRange && (
            <div className="oct-ctl">
              <motion.button whileTap={{ scale: 0.85 }} disabled={octaves <= octRange[0]} onClick={() => (sfx.tap(), setOctaves((o) => Math.max(octRange[0], o - 1)))} aria-label="Kamroq klavish">
                −
              </motion.button>
              <span>
                {octaves} <small>oktava</small>
              </span>
              <motion.button whileTap={{ scale: 0.85 }} disabled={octaves >= octRange[1]} onClick={() => (sfx.tap(), setOctaves((o) => Math.min(octRange[1], o + 1)))} aria-label="Ko'proq klavish">
                +
              </motion.button>
            </div>
          )}
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
            {recording ? "⏹️ To'xtat" : '⏺️ Yozib ol'}
          </motion.button>
          <motion.button className="rec-btn" whileTap={{ scale: 0.9 }} onClick={() => (setRecording(false), void playback())}>
            ▶️ Eshit
          </motion.button>
        </div>
      )}

      {/* Cholg'u */}
      <div className={`instrument ${disabled ? 'waiting' : ''}`} style={{ '--n': whites.length } as React.CSSProperties}>
        {isPads ? (
          <DoiraKit count={keys.length} lit={lit ?? pressed} disabled={disabled} onHit={press} />
        ) : inst === 'pianino' ? (
          <div className="piano">
            {whites.map((k) => (
              <button key={k} className={`key white ${on(k) ? 'lit' : ''}`} data-key={k} style={{ '--c': noteColor(k) } as React.CSSProperties} onPointerDown={down(k)}>
                <span className="key-name">{whites.length <= 15 || k % 12 === 0 ? noteName(k) : ''}</span>
                {k % 12 === 0 && whites.length > 8 && <span className="oct-mark">{k / 12 - 1}</span>}
              </button>
            ))}
            {keys
              .filter(isBlack)
              .map((k) => (
                <button
                  key={k}
                  className={`key black ${on(k) ? 'lit' : ''}`}
                  data-key={k}
                  style={{ left: `${((whites.indexOf(k - 1) + 1) / whites.length) * 100}%`, width: `${(0.62 / whites.length) * 100}%` }}
                  onPointerDown={down(k)}
                />
              ))}
          </div>
        ) : (
          whites.map((k, i) => (
            <motion.button
              key={`${inst}-${k}`}
              className={`key ${on(k) ? 'lit' : ''}`}
              data-key={k}
              style={{ '--c': noteColor(k), '--i': i, '--t': i / Math.max(1, whites.length - 1) } as React.CSSProperties}
              onPointerDown={down(k)}
              animate={on(k) ? { y: '0.8vmin', scale: 0.98 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 700, damping: 20 }}
            >
              {inst === 'dutor' && <span className={`string ${on(k) ? 'twang' : ''}`} />}
              {inst === 'nay' && <span className="hole" />}
              <span className="key-name">{noteName(k)}</span>
            </motion.button>
          ))
        )}

        {/* Uchib chiqayotgan notalar */}
        <AnimatePresence>
          {notes.map((n) => (
            <motion.span
              key={n.id}
              className="fly-note"
              style={{ left: isPads ? '30%' : `${n.pct}%`, color: n.color }}
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
      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current, tasks: phrases.reduce((a, s) => a + s.length, 0) })} />}
    </GameShell>
  )
}
