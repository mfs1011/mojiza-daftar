import { useEffect, useMemo, useRef, useState } from 'react'
import { Celebration } from '../components/Celebration'
import { GameShell, useMascot } from '../components/GameShell'
import { TraceBoard } from '../components/TraceBoard'
import { say, sfx } from '../lib/audio'
import { levelRow } from '../lib/stations'
import { ALPHABET, letterVoice } from '../lib/letters'
import type { Glyph } from '../lib/trace'
import { pick, shuffle } from '../lib/util'
import type { GameProps } from '../types'

// ✏️ Yozuv maktabi — qo'lni yozuvga tayyorlash.
// Avval oddiy chiziqlar (tik, yotiq, qiya, zinapoya, to'lqin, yarim aylana, aylana, uycha),
// keyin raqamlar, keyin butun o'zbek alifbosi (O', G', Sh, Ch bilan). Har birini barmoq bilan chizadi.

export type StrokeId = 'tik' | 'yotiq' | 'qiya' | 'zinapoya' | 'tolqin' | 'yarim' | 'aylana' | 'uycha'

/** 0..100 kvadrat ichida; `start` — bola qayerdan boshlashi kerak (sariq nuqta) */
const STROKES: Record<StrokeId, Exclude<Glyph, string>> = {
  tik: { path: 'M50 10V90', start: [50, 10] },
  yotiq: { path: 'M10 50H90', start: [10, 50] },
  qiya: { path: 'M15 15L85 85', start: [15, 15] },
  zinapoya: { path: 'M8 72L28 28L50 72L72 28L92 72', start: [8, 72] },
  tolqin: { path: 'M8 50C18 18 34 18 50 50S82 82 92 50', start: [8, 50] },
  yarim: { path: 'M14 66A36 36 0 0 1 86 66', start: [14, 66] },
  aylana: { path: 'M50 14A36 36 0 1 0 50.01 14', start: [50, 14] },
  uycha: { path: 'M18 88V46L50 14L82 46V88Z', start: [18, 88] },
}

export const STROKE_ORDER: StrokeId[] = ['tik', 'yotiq', 'qiya', 'zinapoya', 'tolqin', 'yarim', 'aylana', 'uycha']

const EASY = ['O', 'U', 'T', 'N', 'A', 'M', 'I', 'L', 'E', 'H']
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

type Pool = 'chiziq' | 'chiziq2' | 'raqam' | 'oson' | 'harf' | 'murakkab'

interface WriteCfg {
  rounds: Pool[]
  threshold: number
}

const W = (rounds: Pool[], threshold: number): WriteCfg => ({ rounds, threshold })
const WRITE_LEVELS: WriteCfg[] = [
  W(['chiziq', 'chiziq', 'chiziq'], 0.55),
  W(['chiziq', 'chiziq', 'chiziq'], 0.58),
  W(['chiziq', 'chiziq2', 'chiziq'], 0.6),
  W(['chiziq2', 'chiziq2', 'chiziq'], 0.6),
  W(['chiziq2', 'chiziq2', 'chiziq2'], 0.62),
  W(['chiziq2', 'raqam', 'chiziq2'], 0.62),
  W(['raqam', 'raqam', 'chiziq2'], 0.62),
  W(['raqam', 'raqam', 'raqam'], 0.64),
  W(['oson', 'oson', 'oson'], 0.62),
  W(['oson', 'oson', 'raqam'], 0.64),
  W(['harf', 'oson', 'harf'], 0.64),
  W(['harf', 'harf', 'harf', 'raqam'], 0.66),
  W(['murakkab', 'harf', 'harf', 'murakkab'], 0.66),
  W(['harf', 'murakkab', 'harf', 'raqam'], 0.68),
  W(['murakkab', 'harf', 'murakkab', 'harf'], 0.7),
]

type Item = { kind: 'chiziq'; id: StrokeId } | { kind: 'belgi'; text: string; voice: string }

function itemsFor(pools: Pool[]): Item[] {
  const used = new Set<string>()
  const fresh = (list: string[]) => {
    const left = list.filter((x) => !used.has(x))
    const v = pick(left.length ? left : list)
    used.add(v)
    return v
  }
  return pools.map((p) => {
    if (p === 'chiziq') return { kind: 'chiziq', id: fresh(STROKE_ORDER.slice(0, 4)) as StrokeId }
    if (p === 'chiziq2') return { kind: 'chiziq', id: fresh(STROKE_ORDER.slice(3)) as StrokeId }
    if (p === 'raqam') {
      const d = fresh(DIGITS)
      return { kind: 'belgi', text: d, voice: `son_${d}` }
    }
    const list = p === 'oson' ? EASY : p === 'harf' ? ALPHABET.slice(0, 24) : ALPHABET.slice(24)
    const l = fresh(list)
    return { kind: 'belgi', text: l, voice: letterVoice(l) }
  })
}

export function WritingGame({ level, onComplete, onExit }: GameProps) {
  const cfg = useMemo(() => levelRow(WRITE_LEVELS, level), [level])
  const items = useMemo(() => itemsFor(level >= WRITE_LEVELS.length ? shuffle(cfg.rounds) : cfg.rounds), [cfg, level])
  const [idx, setIdx] = useState(0)
  const [finished, setFinished] = useState(false)
  const [mascot, react] = useMascot()
  const mistakes = useRef(0)
  const it = items[idx]

  useEffect(() => {
    if (it.kind === 'chiziq') void say('yozuv_chiz', `yozuv_${it.id}`)
    else void say('yozuv_harf', it.voice)
  }, [it])

  function done() {
    sfx.magic()
    react('happy', 1800)
    void say(...(it.kind === 'belgi' ? [it.voice] : []), 'barakalla')
    setTimeout(() => {
      if (idx + 1 >= items.length) setFinished(true)
      else {
        sfx.whoosh()
        setIdx((i) => i + 1)
      }
    }, 1900)
  }

  return (
    <GameShell className="writing" mascot={mascot} round={idx} rounds={items.length} onExit={onExit} data={{ 'data-kind': it.kind }}>
      <div className="write-board">
        <TraceBoard
          key={idx}
          glyph={it.kind === 'chiziq' ? STROKES[it.id] : it.text}
          threshold={cfg.threshold}
          onDone={done}
          onMistake={() => {
            mistakes.current++
            react('oops')
          }}
        />
      </div>
      {finished && <Celebration voice={['barakalla']} onDone={() => onComplete({ mistakes: mistakes.current })} />}
    </GameShell>
  )
}
