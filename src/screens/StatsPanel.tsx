import { useEffect, useMemo, useState } from 'react'
import { getPlays } from '../lib/db'
import { STATIONS, levelLabel } from '../lib/stations'
import type { PlayRecord, Profile, Progress, StationId } from '../types'

// 📊 Ota-ona statistikasi: har bir bola qanday o'ynayapti, qanchalik aniq va qayerda qiynalyapti.
// Aniqlik = to'g'ri javoblar / (to'g'ri javoblar + xatolar). Ma'lumot faqat shu qurilmada.

const DAY = 86_400_000
const stationName = (id: StationId) => STATIONS.find((s) => s.id === id)?.name ?? id

/** Bitta o'yinning aniqligi (0..1); topshiriqlar soni yo'q eski yozuvlar uchun — null */
function accuracy(p: PlayRecord): number | null {
  if (!p.completed || !p.tasks) return null
  return p.tasks / (p.tasks + p.mistakes)
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
const pct = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`)
const mins = (ms: number) => (ms < 60_000 ? `${Math.round(ms / 1000)} s` : `${Math.round(ms / 60_000)} daq`)
const dayKey = (ts: number) => new Date(ts).toLocaleDateString('sv-SE')
const dateTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Aniqlik rangi: yashil — yaxshi, sariq — o'rtacha, qizil — qiynalyapti */
const accColor = (x: number | null) => (x === null ? '#adb5bd' : x >= 0.85 ? '#2d6a4f' : x >= 0.65 ? '#e09f3e' : '#d62828')

export function StatsPanel({ profiles, progress }: { profiles: Profile[]; progress: Record<string, Progress> }) {
  const [who, setWho] = useState(profiles[0]?.id ?? '')
  const [plays, setPlays] = useState<PlayRecord[] | null>(null)

  useEffect(() => {
    if (!who) return
    let alive = true
    void getPlays(who).then((p) => alive && setPlays(p))
    return () => {
      alive = false
    }
  }, [who])

  const s = useMemo(() => (plays ? summarize(plays) : null), [plays])
  const pr = progress[who]

  return (
    <section className="stats">
      <h3>📊 Statistika</h3>
      <div className="p-choices">
        {profiles.map((p) => (
          <button
            key={p.id}
            className={`p-chip ${who === p.id ? 'on' : ''}`}
            onClick={() => {
              setPlays(null)
              setWho(p.id)
            }}
          >
            {p.avatar} {p.name || 'Ismsiz'}
          </button>
        ))}
      </div>

      {!s ? (
        <p className="p-note">Yuklanmoqda…</p>
      ) : s.total === 0 ? (
        <p className="p-note">Hali o'ynalmagan. Bola darajalarni o'ynagani sari bu yerda natijalar paydo bo'ladi.</p>
      ) : (
        <>
          <div className="st-cards">
            <Card label="Bugun" value={mins(Math.max(pr?.playedMs ?? 0, s.todayMs))} />
            <Card label="7 kunda" value={mins(s.weekMs)} />
            <Card label="O'yinlar" value={`${s.completed}`} sub={s.abandoned ? `${s.abandoned} tasi chala` : undefined} />
            <Card label="Aniqlik (7 kun)" value={pct(s.weekAcc)} color={accColor(s.weekAcc)} sub={trendText(s.weekAcc, s.prevWeekAcc)} />
            <Card label="Yulduzlar" value={`⭐ ${s.stars}`} />
          </div>

          <h4>So'nggi 14 kun</h4>
          <div className="st-days">
            {s.days.map((d) => (
              <div key={d.key} className="st-day" title={`${d.key}: ${mins(d.ms)}, aniqlik ${pct(d.acc)}`}>
                <div className="st-bar-wrap">
                  <div className="st-bar" style={{ height: `${Math.min(100, (d.ms / s.maxDayMs) * 100)}%`, background: accColor(d.acc) }} />
                </div>
                <span className="st-acc">{d.ms ? pct(d.acc) : ''}</span>
                <span className="st-date">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="p-note">Ustun balandligi — o'ynagan vaqti, rangi va raqami — o'sha kungi aniqlik.</p>

          <h4>Bekatlar bo'yicha</h4>
          <table className="st-table">
            <thead>
              <tr>
                <th>Bekat</th>
                <th>Daraja</th>
                <th>O'ynadi</th>
                <th>Aniqlik</th>
                <th>Aniqlik tarixi</th>
                <th>Oxirgi</th>
              </tr>
            </thead>
            <tbody>
              {s.stations.map((st) => (
                <tr key={st.id}>
                  <td>{stationName(st.id)}</td>
                  <td>{levelLabel(Math.max(0, (pr?.levels[st.id] ?? 1) - 1))}</td>
                  <td>{st.count}</td>
                  <td style={{ color: accColor(st.recentAcc), fontWeight: 700 }}>
                    {pct(st.recentAcc)} <small>{trendText(st.recentAcc, st.prevAcc)}</small>
                  </td>
                  <td>
                    <Spark values={st.history} />
                  </td>
                  <td>{dateTime(st.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-note">"Aniqlik" — oxirgi 5 ta o'yin; strelka — undan oldingi 5 tasiga nisbatan o'zgarish.</p>

          {s.glyphs.length > 0 && (
            <>
              <h4>Yozuv mashqlari</h4>
              <div className="st-glyphs">
                {s.glyphs.map((g) => (
                  <div key={g.glyph} className="st-glyph" style={{ borderColor: g.avgTries >= 2 ? '#d62828' : g.avgTries > 1.3 ? '#e09f3e' : '#2d6a4f' }}>
                    <b>{g.glyph}</b>
                    <span>
                      {g.count} marta · {g.avgTries.toFixed(1)} urinish · {Math.round(g.avgMs / 1000)} s
                    </span>
                  </div>
                ))}
              </div>
              {s.hard.length > 0 && (
                <p className="p-note">
                  Qiynalyapti: <b>{s.hard.join(', ')}</b> — o'rtacha 2 va undan ko'p urinishda yozilyapti. Qog'ozda ham birga mashq qiling.
                </p>
              )}
            </>
          )}

          <h4>So'nggi o'yinlar</h4>
          <table className="st-table">
            <tbody>
              {plays!.slice(0, 15).map((p) => (
                <tr key={p.id} className={p.completed ? '' : 'st-abandoned'}>
                  <td>{dateTime(p.ts)}</td>
                  <td>{stationName(p.station)}</td>
                  <td>{levelLabel(p.level)}</td>
                  <td>{p.completed ? '⭐'.repeat(p.stars) : 'chala qoldi'}</td>
                  <td style={{ color: accColor(accuracy(p)) }}>{pct(accuracy(p))}</td>
                  <td>{p.mistakes} xato</td>
                  <td>{mins(p.ms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}

function Card({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="st-card">
      <span>{label}</span>
      <b style={color ? { color } : undefined}>{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  )
}

function trendText(now: number | null, before: number | null) {
  if (now === null || before === null) return ''
  const d = Math.round((now - before) * 100)
  return d >= 3 ? `↑ ${d}%` : d <= -3 ? `↓ ${-d}%` : '→'
}

/** Aniqlikning o'zgarishi (eskidan yangiga), 0..100% */
function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="p-count">{values.length ? pct(values[0]) : '—'}</span>
  const w = 120
  const h = 28
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - v * h}`).join(' ')
  const last = values[values.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="st-spark">
      <line x1={0} y1={h * 0.15} x2={w} y2={h * 0.15} stroke="#2d6a4f33" strokeDasharray="3 3" />
      <polyline points={pts} fill="none" stroke={accColor(last)} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={w} cy={h - last * h} r={3} fill={accColor(last)} />
    </svg>
  )
}

function summarize(plays: PlayRecord[]) {
  const now = Date.now()
  const done = plays.filter((p) => p.completed)
  const accOf = (list: PlayRecord[]) => avg(list.map(accuracy).filter((x): x is number => x !== null))
  const inRange = (from: number, to: number) => plays.filter((p) => p.ts >= from && p.ts < to)

  // Kunlar (14): vaqt va aniqlik
  const days = Array.from({ length: 14 }, (_, i) => {
    const t = now - (13 - i) * DAY
    const key = dayKey(t)
    const list = plays.filter((p) => dayKey(p.ts) === key)
    const d = new Date(t)
    return { key, label: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`, ms: list.reduce((a, p) => a + p.ms, 0), acc: accOf(list) }
  })

  // Bekatlar: oxirgi 5 ta va undan oldingi 5 ta o'yin aniqligi, tarix (eskidan yangiga, 20 tagacha)
  const ids = [...new Set(plays.map((p) => p.station))]
  const stations = ids
    .map((id) => {
      const list = done.filter((p) => p.station === id)
      const accs = list.map(accuracy).filter((x): x is number => x !== null)
      return {
        id,
        count: list.length,
        last: plays.find((p) => p.station === id)!.ts,
        recentAcc: avg(accs.slice(0, 5)),
        prevAcc: avg(accs.slice(5, 10)),
        history: accs.slice(0, 20).reverse(),
      }
    })
    .sort((a, b) => b.last - a.last)

  // Yozuv: har bir belgi bo'yicha o'rtacha urinish va vaqt
  const g = new Map<string, { count: number; tries: number; ms: number }>()
  for (const p of done) for (const t of p.traces ?? []) {
    const e = g.get(t.glyph) ?? { count: 0, tries: 0, ms: 0 }
    e.count++
    e.tries += t.tries
    e.ms += t.ms
    g.set(t.glyph, e)
  }
  const glyphs = [...g.entries()]
    .map(([glyph, e]) => ({ glyph, count: e.count, avgTries: e.tries / e.count, avgMs: e.ms / e.count }))
    .sort((a, b) => b.avgTries - a.avgTries || b.count - a.count)

  const todayKey = dayKey(now)
  return {
    total: plays.length,
    completed: done.length,
    abandoned: plays.length - done.length,
    stars: done.reduce((a, p) => a + p.stars, 0),
    todayMs: plays.filter((p) => dayKey(p.ts) === todayKey).reduce((a, p) => a + p.ms, 0),
    weekMs: inRange(now - 7 * DAY, now + 1).reduce((a, p) => a + p.ms, 0),
    weekAcc: accOf(inRange(now - 7 * DAY, now + 1)),
    prevWeekAcc: accOf(inRange(now - 14 * DAY, now - 7 * DAY)),
    days,
    maxDayMs: Math.max(60_000, ...days.map((d) => d.ms)),
    stations,
    glyphs,
    hard: glyphs.filter((x) => x.avgTries >= 2 && x.count >= 2).map((x) => x.glyph),
  }
}
