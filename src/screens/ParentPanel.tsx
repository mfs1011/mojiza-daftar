import { useEffect, useRef, useState } from 'react'
import { invalidateHero } from '../components/Hero'
import { audioUrl } from '../lib/assets'
import { applyMix, forgetVoice, hasVoice, say, setAmbience, setMusic, stopVoice } from '../lib/audio'
import { deleteHero, deleteVoice, getProgress, saveProfile, saveProgress, saveVoice, voiceKeys } from '../lib/db'
import { getSettings, saveSettings, type Settings } from '../lib/settings'
import { dailyFor, levelLabel, startLevel } from '../lib/stations'
import { voicePrompts } from '../lib/voices'
import { StatsPanel } from './StatsPanel'
import type { Age, Profile, Progress, StationId } from '../types'

const AVATARS = ['👧', '👶', '🧒', '👸', '🧚', '🦄', '🐱', '🐰']
const COLORS = ['#ff8fab', '#7fb3ff', '#ffc43d', '#52b788', '#b388eb', '#ff9f68']

interface Props {
  profiles: Profile[]
  onBack: () => void
}

export function ParentPanel({ profiles, onBack }: Props) {
  const [list, setList] = useState(profiles)
  const [progress, setProgress] = useState<Record<string, Progress>>({})
  const [recorded, setRecorded] = useState<Set<string>>(new Set())
  const [recording, setRecording] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [settings, setSettingsState] = useState(getSettings)
  const [tab, setTab] = useState<'sozlama' | 'stat' | 'qizlar' | 'ovoz'>('sozlama')
  const flashTimer = useRef<number | undefined>(undefined)
  /** Qisqa tasdiq xabari ("✓ Saqlandi") — o'zgarish qabul qilinganini bildiradi */
  function flash(text: string) {
    setMessage(text)
    window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setMessage(null), 2200)
  }

  function changeSettings(patch: Partial<Settings>, toast = true) {
    const s = { ...settings, ...patch }
    setSettingsState(s)
    saveSettings(s)
    setMusic(s.music)
    setAmbience(s.ambience)
    applyMix(s)
    if (toast) flash('✓ Saqlandi')
  }
  const recRef = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    void voiceKeys().then((k) => setRecorded(new Set(k)))
    void Promise.all(profiles.map((p) => getProgress(p.id))).then((all) =>
      setProgress(Object.fromEntries(all.map((p) => [p.profileId, p]))),
    )
    return () => {
      recRef.current?.stop()
      stopVoice()
    }
  }, [profiles])

  const prompts = voicePrompts(list)
  const groups = [...new Set(prompts.map((p) => p.group))]
  const doneCount = prompts.filter((p) => recorded.has(p.key)).length

  function update(p: Profile) {
    setList((l) => l.map((x) => (x.id === p.id ? p : x)))
    void saveProfile(p)
  }

  async function patchProgress(id: string, patch: (p: Progress) => Progress) {
    const next = patch(progress[id] ?? (await getProgress(id)))
    await saveProgress(next)
    setProgress((all) => ({ ...all, [id]: next }))
  }

  function setLevel(p: Profile, station: StationId, delta: number) {
    void patchProgress(p.id, (pr) => {
      const cur = pr.levels[station] ?? startLevel(p.age)
      return { ...pr, levels: { ...pr.levels, [station]: Math.max(0, cur + delta) } }
    })
  }

  async function toggleRecord(key: string) {
    if (recording) {
      recRef.current?.stop()
      return
    }
    try {
      stopVoice()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      const rec = new MediaRecorder(stream)
      const chunks: Blob[] = []
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data)
      }
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        recRef.current = null
        setRecording(null)
        if (!chunks.length) return
        await saveVoice(key, new Blob(chunks, { type: rec.mimeType }))
        forgetVoice(key)
        setRecorded((s) => new Set(s).add(key))
        void say(key)
        flash('✓ Ovozingiz saqlandi')
      }
      rec.start()
      recRef.current = rec
      setRecording(key)
      setMessage(null)
    } catch {
      setMessage('Mikrofonga ruxsat berilmadi. Telefon sozlamalaridan ruxsat bering.')
    }
  }

  async function removeVoice(key: string) {
    await deleteVoice(key)
    forgetVoice(key)
    setRecorded((s) => {
      const n = new Set(s)
      n.delete(key)
      return n
    })
  }

  const TABS = [
    { id: 'sozlama', label: '⚙️ Sozlamalar' },
    { id: 'stat', label: '📊 Statistika' },
    { id: 'qizlar', label: '👧 Qizlar' },
    { id: 'ovoz', label: '🎙️ Ovozlar' },
  ] as const
  /** Ilovaning o'z ovozi bormi: ko'rsatma (voices/), qahramon reaksiyasi (sfx/voice-*) yoki haqiqiy hayvon yozuvi */
  const appHas = (key: string) =>
    hasVoice(key) ||
    (key.startsWith('reak_') && !!audioUrl(`sfx/voice-${key.slice(5)}`)) ||
    (key.startsWith('tovush_') && !!audioUrl(`sfx/animals/${key.slice(7)}`))
  const voiceState = (key: string) => (recorded.has(key) ? 'mine' : appHas(key) ? 'app' : 'none')
  const missingCount = prompts.filter((p) => voiceState(p.key) === 'none').length

  return (
    <div className="parent">
      <header className="parent-head">
        <button className="p-btn" onClick={onBack}>
          ← O'yinga qaytish
        </button>
        <h2>Ota-ona paneli</h2>
      </header>
      <nav className="p-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`p-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {message && (
        <p className="p-msg" key={message}>
          {message}
        </p>
      )}

      {tab === 'sozlama' && (
        <section>
          <div className="p-card">
            <h4>⏱️ Kunlik o'yin vaqti</h4>
            <p className="p-help">Vaqt tugasa, bola boshlagan darajani tugatadi, keyin qahramon uxlaydi va o'yin ertagacha yopiladi. Janjalsiz to'xtatish uchun.</p>
            <div className="p-choices">
              {[10, 15, 20, 30, 0].map((m) => (
                <button key={m} className={`p-chip ${settings.dailyMinutes === m ? 'on' : ''}`} onClick={() => changeSettings({ dailyMinutes: m })}>
                  {m ? `${m} daqiqa` : 'Cheklovsiz'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-card">
            <h4>🔊 Ovozlar</h4>
            {(
              [
                ['music', 'Fon musiqasi', "Har ekranda yumshoq musiqa. Sahna va Musiqa uyida o'zi o'chadi."],
                ['ambience', 'Muhit ovozlari', "Bekatlarda past ovozda qushlar, bozor g'ala-g'ovuri va hokazo."],
                ['night', 'Tungi rejim', "Kechqurun o'ynaganda hamma ovozlar yarim balandlikda."],
              ] as const
            ).map(([k, label, help]) => (
              <label key={k} className="p-switch">
                <span className="p-switch-text">
                  <b>{label}</b>
                  <small>{help}</small>
                </span>
                <input type="checkbox" checked={settings[k]} onChange={(e) => changeSettings({ [k]: e.target.checked })} />
                <span className="p-switch-ui" aria-hidden />
              </label>
            ))}
          </div>

          <div className="p-card">
            <h4>🎚️ Balandlik</h4>
            <p className="p-help">Ko'rsatmalar eng aniq eshitilishi kerak: musiqa va effektlarni pastroq qilsangiz, bola gapni yaxshiroq tushunadi.</p>
            {(
              [
                ['musicVol', '🎵 Musiqa'],
                ['fxVol', '✨ Effektlar va muhit'],
                ['voiceVol', "🗣️ Ko'rsatmalar"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="p-slider">
                <span>{label}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(settings[k] * 100)}
                  onChange={(e) => changeSettings({ [k]: Number(e.target.value) / 100 }, false)}
                  onPointerUp={() => flash('✓ Saqlandi')}
                />
                <b>{Math.round(settings[k] * 100)}%</b>
              </label>
            ))}
          </div>
        </section>
      )}

      {tab === 'stat' && <StatsPanel profiles={list} progress={progress} />}

      {tab === 'qizlar' && (
        <section>
          {list.map((p) => {
            const pr = progress[p.id]
            return (
              <div key={p.id} className="p-card p-profile">
                <label className="p-field">
                  <span>Ismi</span>
                  <input className="p-input" value={p.name} onChange={(e) => update({ ...p, name: e.target.value })} placeholder="Ism" />
                  <small>Ilova bolani shu ism bilan chaqiradi (ovozini "Ovozlar → Ismlar"da yozib olasiz).</small>
                </label>
                <div className="p-field">
                  <span>Yoshi</span>
                  <div className="p-choices">
                    {([3, 5] as Age[]).map((a) => (
                      <button key={a} className={`p-chip ${p.age === a ? 'on' : ''}`} onClick={() => update({ ...p, age: a })}>
                        {a} yosh
                      </button>
                    ))}
                  </div>
                  <small>Yosh boshlang'ich darajani belgilaydi. "Harflar uyi" 5 yoshdan ochiladi.</small>
                </div>
                <div className="p-field">
                  <span>Belgisi</span>
                  <div className="p-choices">
                    {AVATARS.map((a) => (
                      <button key={a} className={`p-chip emoji ${p.avatar === a ? 'on' : ''}`} onClick={() => update({ ...p, avatar: a })}>
                        {a}
                      </button>
                    ))}
                  </div>
                  <div className="p-choices">
                    {COLORS.map((c) => (
                      <button key={c} className={`p-swatch ${p.color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => update({ ...p, color: c })} aria-label="Rang" />
                    ))}
                  </div>
                  <small>Bola o'z qahramonini chizmaguncha profil tanlash ekranida shu belgi va rang turadi.</small>
                </div>

                <details className="p-levels">
                  <summary>🗺️ Bekatlardagi ochiq daraja</summary>
                  <p className="p-help">Bola darajani o'tgan sari keyingisi o'zi ochiladi. Juda qiyin yoki oson bo'lsa — shu yerda o'zgartiring.</p>
                  {dailyFor(p.age).map((s) => (
                    <div key={s.id} className="p-level-row">
                      <span>{s.name}</span>
                      <button className="p-icon" onClick={() => setLevel(p, s.id, -1)} aria-label="Pasaytirish">
                        −
                      </button>
                      <b>{levelLabel(pr?.levels[s.id] ?? startLevel(p.age))}</b>
                      <button className="p-icon" onClick={() => setLevel(p, s.id, +1)} aria-label="Oshirish">
                        +
                      </button>
                    </div>
                  ))}
                </details>

                <div className="p-actions">
                  <button
                    className="p-btn"
                    onClick={() =>
                      void patchProgress(p.id, (x) => ({ ...x, stationsDone: [], dayDone: false, playedMs: 0 })).then(() =>
                        flash(`✓ ${p.name}: bugungi vaqt qayta boshlandi`),
                      )
                    }
                  >
                    🔄 Bugungi vaqtni qayta boshlash
                  </button>
                  <button
                    className="p-btn danger"
                    onClick={() => {
                      if (!window.confirm(`${p.name} chizgan qahramon o'chiriladi va keyingi safar yangisini chizadi. Davom etasizmi?`)) return
                      void deleteHero(p.id).then(() => {
                        invalidateHero(p.id)
                        flash(`✓ ${p.name}: keyingi safar yangi qahramon chizadi`)
                      })
                    }}
                  >
                    🎨 Qahramonni qayta chizdirish
                  </button>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {tab === 'ovoz' && (
        <section>
          <div className="p-card">
            <h4>🎙️ Ovozli ko'rsatmalar</h4>
            <p className="p-help">
              Bolalar hali o'qiy olmaydi — har bir ko'rsatma ovozda beriladi. Ilovaning o'z ovozi bor, lekin sizning ovozingiz bola uchun eng
              yaqin: 🎙️ ni bosing, matnni o'qing, ⏹️ bilan to'xtating. Yozganingiz har doim ilova ovozidan ustun turadi.
            </p>
            <div className="p-legend">
              <span className="p-badge mine">🎙️ sizning ovozingiz: {doneCount}</span>
              <span className="p-badge app">🤖 ilova ovozi: {prompts.filter((p) => voiceState(p.key) === 'app').length}</span>
              <span className="p-badge none">○ ovozsiz: {missingCount}</span>
            </div>
          </div>
          {groups.map((g) => {
            const items = prompts.filter((p) => p.group === g)
            const n = items.filter((p) => recorded.has(p.key)).length
            return (
              <details key={g} className="p-group" open={g === 'Ismlar'}>
                <summary>
                  {g}{' '}
                  <span className="p-count">
                    {n}/{items.length} yozilgan
                  </span>
                </summary>
                {items.map((p) => {
                  const isRec = recording === p.key
                  const st = voiceState(p.key)
                  return (
                    <div key={p.key} className={`p-voice ${isRec ? 'rec' : ''}`}>
                      <span className={`p-badge ${st}`}>{st === 'mine' ? '🎙️ siz' : st === 'app' ? '🤖 ilova' : "○ yo'q"}</span>
                      <span className="p-text">{p.text}</span>
                      <button className={`p-icon ${isRec ? 'recording' : ''}`} disabled={!!recording && !isRec} onClick={() => void toggleRecord(p.key)} aria-label={isRec ? "To'xtatish" : 'Yozib olish'}>
                        {isRec ? '⏹️' : '🎙️'}
                      </button>
                      <button className="p-icon" disabled={st === 'none' || !!recording} onClick={() => void say(p.key)} aria-label="Eshitish">
                        ▶️
                      </button>
                      <button
                        className="p-icon"
                        disabled={st !== 'mine' || !!recording}
                        onClick={() => void removeVoice(p.key).then(() => flash("✓ Yozuv o'chirildi — ilova ovozi ishlatiladi"))}
                        aria-label="O'chirish"
                      >
                        🗑️
                      </button>
                    </div>
                  )
                })}
              </details>
            )
          })}
        </section>
      )}
    </div>
  )
}
