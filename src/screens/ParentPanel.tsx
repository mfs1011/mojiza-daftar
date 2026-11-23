import { useEffect, useRef, useState } from 'react'
import { invalidateHero } from '../components/Hero'
import { forgetVoice, say, setMusic, stopVoice } from '../lib/audio'
import { deleteHero, deleteVoice, getProgress, saveProfile, saveProgress, saveVoice, voiceKeys } from '../lib/db'
import { getSettings, saveSettings } from '../lib/settings'
import { dailyFor, MAX_LEVEL, startLevel } from '../lib/stations'
import { voicePrompts } from '../lib/voices'
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
      return { ...pr, levels: { ...pr.levels, [station]: Math.max(0, Math.min(MAX_LEVEL, cur + delta)) } }
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

  return (
    <div className="parent">
      <header className="parent-head">
        <button className="p-btn" onClick={onBack}>
          ← Orqaga
        </button>
        <h2>Ota-ona paneli</h2>
      </header>

      {message && <p className="p-msg">{message}</p>}

      <section>
        <h3>Sozlamalar</h3>
        <label className="p-toggle">
          <input
            type="checkbox"
            checked={settings.music}
            onChange={(e) => {
              const s = { ...settings, music: e.target.checked }
              setSettingsState(s)
              saveSettings(s)
              setMusic(s.music)
            }}
          />
          Fon musiqasi (doira va kuy)
        </label>
      </section>

      <section>
        <h3>Qizlar</h3>
        {list.map((p) => {
          const pr = progress[p.id]
          return (
            <div key={p.id} className="p-profile">
              <input className="p-input" value={p.name} onChange={(e) => update({ ...p, name: e.target.value })} placeholder="Ism" />
              <div className="p-choices">
                {([3, 5] as Age[]).map((a) => (
                  <button key={a} className={`p-chip ${p.age === a ? 'on' : ''}`} onClick={() => update({ ...p, age: a })}>
                    {a} yosh
                  </button>
                ))}
              </div>
              <div className="p-choices">
                <span className="p-label">Qahramon chizilmaguncha:</span>
                {AVATARS.map((a) => (
                  <button key={a} className={`p-chip emoji ${p.avatar === a ? 'on' : ''}`} onClick={() => update({ ...p, avatar: a })}>
                    {a}
                  </button>
                ))}
              </div>
              <div className="p-choices">
                {COLORS.map((c) => (
                  <button key={c} className={`p-swatch ${p.color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => update({ ...p, color: c })} />
                ))}
              </div>

              <details className="p-levels">
                <summary>Qiyinlik darajalari (o'zi moslashadi, kerak bo'lsa qo'lda o'zgartiring)</summary>
                {dailyFor(p.age).map((s) => (
                  <div key={s.id} className="p-level-row">
                    <span>{s.name}</span>
                    <button className="p-icon" onClick={() => setLevel(p, s.id, -1)}>
                      −
                    </button>
                    <b>{(pr?.levels[s.id] ?? startLevel(p.age)) + 1}</b>
                    <button className="p-icon" onClick={() => setLevel(p, s.id, +1)}>
                      +
                    </button>
                  </div>
                ))}
              </details>

              <div className="p-choices">
                <button
                  className="p-btn"
                  onClick={() =>
                    void patchProgress(p.id, (x) => ({ ...x, stationsDone: [], dayDone: false })).then(() =>
                      setMessage(`${p.name}: bugungi kun qayta ochildi`),
                    )
                  }
                >
                  🔄 Bugungi kunni qayta ochish
                </button>
                <button
                  className="p-btn"
                  onClick={() =>
                    void deleteHero(p.id).then(() => {
                      invalidateHero(p.id)
                      setMessage(`${p.name}: qahramon o'chirildi, keyingi safar yangisini chizadi`)
                    })
                  }
                >
                  🎨 Qahramonni qayta chizdirish
                </button>
              </div>
            </div>
          )
        })}
      </section>

      <section>
        <h3>
          Ovozlar{' '}
          <span className="p-count">
            {doneCount}/{prompts.length} yozildi
          </span>
        </h3>
        <p className="p-note">
          Bolalar hali o'qiy olmaydi, shuning uchun barcha ko'rsatmalar sizning ovozingizda beriladi. 🎙️ ni bosing, matnni
          o'qing, ⏹️ bilan to'xtating. Avval "Umumiy" va "Sonlar"dan boshlang.
        </p>
        {groups.map((g) => {
          const items = prompts.filter((p) => p.group === g)
          const n = items.filter((p) => recorded.has(p.key)).length
          return (
            <details key={g} className="p-group" open={g === 'Ismlar' || g === 'Umumiy'}>
              <summary>
                {g}{' '}
                <span className="p-count">
                  {n}/{items.length}
                </span>
              </summary>
              {items.map((p) => {
                const isRec = recording === p.key
                const has = recorded.has(p.key)
                return (
                  <div key={p.key} className={`p-voice ${isRec ? 'rec' : ''}`}>
                    <span className="p-status">{has ? '✅' : '⚪'}</span>
                    <span className="p-text">{p.text}</span>
                    <button className="p-icon" disabled={!!recording && !isRec} onClick={() => void toggleRecord(p.key)}>
                      {isRec ? '⏹️' : '🎙️'}
                    </button>
                    <button className="p-icon" disabled={!has || !!recording} onClick={() => void say(p.key)}>
                      ▶️
                    </button>
                    <button className="p-icon" disabled={!has || !!recording} onClick={() => void removeVoice(p.key)}>
                      🗑️
                    </button>
                  </div>
                )
              })}
            </details>
          )
        })}
      </section>
    </div>
  )
}
