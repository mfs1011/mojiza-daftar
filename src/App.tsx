import { App as CapApp } from '@capacitor/app'
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { DECOR_POOL, type DecorKind } from './art/Scenery'
import { FxLayer } from './components/Fx'
import { BoilFilter } from './components/Hero'
import { Farm } from './games/Farm'
import { Garden } from './games/Garden'
import { Letters } from './games/Letters'
import { LogicGame } from './games/LogicGame'
import { MathGame } from './games/MathGame'
import { MusicGame } from './games/MusicGame'
import { PoemsGame } from './games/PoemsGame'
import { ShapesGame } from './games/ShapesGame'
import { WritingGame } from './games/WritingGame'
import { Numbers } from './games/Numbers'
import { Market } from './games/Market'
import { Shadows } from './games/Shadows'
import { Workshop } from './games/Workshop'
import { applyMix, jingle, playAmbience, playMusic, preloadMusic, setAmbience, setMusic, stopVoice, type AmbienceId, type MusicId } from './lib/audio'
import { addPlay, getProfiles, getProgress, saveProgress } from './lib/db'
import { getSettings } from './lib/settings'
import { startLevel, starsFor } from './lib/stations'
import { shuffle } from './lib/util'
import { DrawStudio } from './screens/DrawStudio'
import { ParentPanel } from './screens/ParentPanel'
import { ProfileSelect } from './screens/ProfileSelect'
import { Sleep } from './screens/Sleep'
import { VillageMap } from './screens/VillageMap'
import type { GameProps, GameResult, GameStation, PlacedDecor, Profile, Progress, Screen, StationId } from './types'
import { LevelPath } from './screens/LevelPath'
import { Album } from './screens/Album'
import { Yard } from './screens/Yard'
import { nextSticker, YARD_GIFT_EVERY, type Sticker } from './lib/stickers'

const GAMES: Record<GameStation, ComponentType<GameProps>> = {
  bog: Garden,
  bozor: Market,
  ferma: Farm,
  ustaxona: Workshop,
  qora: Shadows,
  harflar: Letters,
  raqam: Numbers,
  hisob: MathGame,
  shakl: ShapesGame,
  mantiq: LogicGame,
  yozuv: WritingGame,
  sher: PoemsGame,
  musiqa: MusicGame,
}

/** Hovli sovg'asi variantlari: hali hovlida yo'q narsalar birinchi navbatda taklif qilinadi */
function rewardOptions(progress: Progress): DecorKind[] {
  const owned = new Set([...progress.village.map((d) => d.kind), ...(progress.yardInbox ?? [])])
  const fresh = shuffle(DECOR_POOL.filter((k) => !owned.has(k)))
  return [...fresh, ...shuffle(DECOR_POOL)].filter((k, i, a) => a.indexOf(k) === i).slice(0, 3)
}

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' })
  /** Daraja o'tilgach ko'rsatiladigan mukofot: stiker va (har 5-darajada) hovli sovg'asi */
  const [reward, setReward] = useState<{ sticker: Sticker; gifts: DecorKind[] | null } | null>(null)
  const [arrivedFrom, setArrivedFrom] = useState<StationId | null>(null)

  useEffect(() => {
    void getProfiles().then(setProfiles)
    const s = getSettings()
    applyMix(s)
    setMusic(s.music)
    setAmbience(s.ambience)
    // Birinchi ekran tez ochilishi uchun faqat xarita musiqasi oldindan yuklanadi
    preloadMusic('map')
  }, [])

  // Har ekran o'z musiqasi va muhit ovozi bilan
  const musicId: MusicId | null =
    screen.name === 'profiles' || screen.name === 'map' || screen.name === 'album' || screen.name === 'yard'
      ? 'map'
      : screen.name === 'game' || screen.name === 'path'
        ? (screen.station as MusicId)
        : screen.name === 'studio'
          ? 'rasm'
          : screen.name === 'sleep'
            ? 'uyqu'
            : null
  const ambienceId: AmbienceId | null = screen.name === 'game' ? (screen.station as AmbienceId) : null
  useEffect(() => {
    playMusic(musicId)
    playAmbience(ambienceId)
    // Xaritada bo'lganda bekat treklarini oldindan yuklab qo'yamiz
    if (ambienceId) jingle('start')
    if (musicId === 'map') preloadMusic('bog', 'bozor', 'ferma', 'ustaxona', 'qora', 'harflar', 'rasm', 'uyqu')
  }, [musicId, ambienceId])

  const goHome = useCallback(() => {
    stopVoice()
    setProfile(null)
    setProgress(null)
    setReward(null)
    setScreen({ name: 'profiles' })
  }, [])

  const backToMap = useCallback(() => {
    stopVoice()
    setArrivedFrom(null)
    setScreen({ name: 'map' })
  }, [])

  const openPath = useCallback((station: GameStation, justDone?: number) => {
    stopVoice()
    setScreen({ name: 'path', station, justDone })
  }, [])

  // Android "orqaga" tugmasi: ilovadan chiqarib yubormasin, bir qadam orqaga qaytsin
  const screenRef = useRef(screen)
  useEffect(() => {
    screenRef.current = screen
  }, [screen])
  const progressRef = useRef(progress)
  useEffect(() => {
    progressRef.current = progress
  }, [progress])
  useEffect(() => {
    const sub = CapApp.addListener('backButton', () => {
      const s = screenRef.current.name
      const sc = screenRef.current
      if (sc.name === 'game') {
        recordRef.current(sc.station, sc.level, false)
        openPath(sc.station)
      }
      else if (s === 'path' || s === 'studio' || s === 'album' || s === 'yard') backToMap()
      else if (s === 'map' || s === 'sleep' || s === 'parent') goHome()
      else void CapApp.minimizeApp()
    })
    return () => void sub.then((h) => h.remove())
  }, [backToMap, goHome, openPath])

  // Kunlik o'yin vaqti: har 10 soniyada hisoblanadi (ota-ona paneli va profil tanlashdan tashqari).
  // Chegara tugasa, o'yin o'rtasida uzilmaydi: joriy daraja tugagach qahramon uxlaydi.
  const playing = !!profile && ['map', 'path', 'game', 'studio'].includes(screen.name)
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      const p = progressRef.current
      if (!p) return
      const limit = getSettings().dailyMinutes * 60_000
      const playedMs = (p.playedMs ?? 0) + 10_000
      const over = limit > 0 && playedMs >= limit && screenRef.current.name !== 'game'
      const next = { ...p, playedMs, dayDone: p.dayDone || over }
      void saveProgress(next)
      setProgress(next)
      // Vaqt tugadi: yo'l ekranidan xaritaga qaytamiz, u yerda qahramon uxlashga ketadi
      if (next.dayDone && screenRef.current.name === 'path') setScreen({ name: 'map' })
    }, 10_000)
    return () => window.clearInterval(id)
  }, [playing])

  async function choose(p: Profile) {
    const pr = await getProgress(p.id)
    setProfile(p)
    setProgress(pr)
    setReward(null)
    setArrivedFrom(null)
    setScreen(pr.dayDone ? { name: 'sleep' } : { name: 'map' })
  }

  // Statistika: o'yin qachon boshlangani
  const gameStart = useRef(0)
  const gameKey = screen.name === 'game' ? `${screen.station}-${screen.level}` : null
  useEffect(() => {
    if (gameKey) gameStart.current = Date.now()
  }, [gameKey])

  /** Bolaning o'yini tarixga yoziladi (ota-ona paneli → Statistika) */
  function recordPlay(station: GameStation, level: number, completed: boolean, r?: GameResult) {
    if (!profile) return
    const ms = Date.now() - gameStart.current
    // Bir necha soniyada chiqib ketgan bo'lsa (adashib bosgan) — yozmaymiz
    if (!completed && ms < 5000) return
    void addPlay({
      profileId: profile.id,
      ts: gameStart.current,
      station,
      level,
      completed,
      mistakes: r?.mistakes ?? 0,
      stars: completed && r ? starsFor(r.mistakes) : 0,
      ms,
      ...(r?.tasks ? { tasks: r.tasks } : {}),
      ...(r?.traces?.length ? { traces: r.traces } : {}),
    })
  }

  const recordRef = useRef(recordPlay)
  useEffect(() => {
    recordRef.current = recordPlay
  })

  async function finishStation(station: GameStation, level: number, r: GameResult) {
    if (!profile || !progress) return
    recordPlay(station, level, true, r)
    const unlocked = progress.levels[station] ?? startLevel(profile.age)
    const firstToday = !progress.stationsDone.includes(station)
    const stars = [...(progress.stars?.[station] ?? [])]
    stars[level] = Math.max(stars[level] ?? 0, starsFor(r.mistakes))
    const limit = getSettings().dailyMinutes * 60_000
    const next: Progress = {
      ...progress,
      coins: progress.coins + (r.coins ?? 0),
      fruits: progress.fruits + (r.fruits ?? 0),
      stationsDone: firstToday ? [...progress.stationsDone, station] : progress.stationsDone,
      dayDone: progress.dayDone || (limit > 0 && (progress.playedMs ?? 0) >= limit),
      // O'tilgan daraja keyingisini ochadi (o'tilganini qayta o'ynash ochiq darajani o'zgartirmaydi)
      levels: { ...progress.levels, [station]: Math.max(unlocked, level + 1) },
      stars: { ...progress.stars, [station]: stars },
    }
    // Mukofot: har darajada stiker; yangi daraja har 5-chisiga yetganda — hovliga sovg'a
    const sticker = nextSticker(progress.stickers ?? [])
    next.stickers = [...new Set([...(progress.stickers ?? []), sticker.id])]
    const newLevel = level + 1 > unlocked
    setReward({ sticker, gifts: newLevel && (level + 1) % YARD_GIFT_EVERY === 0 ? rewardOptions(next) : null })
    await saveProgress(next)
    setProgress(next)
    if (firstToday) setArrivedFrom(station)
    if (next.dayDone) setScreen({ name: 'map' })
    else openPath(station, level)
  }

  /** Mukofot oynasi yopildi: tanlangan hovli sovg'asi kutish qutisiga tushadi */
  async function rewardDone(gift?: DecorKind) {
    setReward(null)
    if (!gift || !progress) return
    const next = { ...progress, yardInbox: [...(progress.yardInbox ?? []), gift] }
    await saveProgress(next)
    setProgress(next)
  }

  /** Hovli: narsani joylash (kutish qutisidan) yoki joyini o'zgartirish */
  async function saveYard(village: PlacedDecor[], yardInbox: DecorKind[]) {
    if (!progress) return
    const next = { ...progress, village, yardInbox }
    await saveProgress(next)
    setProgress(next)
  }

  let view = null

  if (screen.name === 'profiles') {
    view = <ProfileSelect profiles={profiles} onChoose={(p) => void choose(p)} onParent={() => setScreen({ name: 'parent' })} />
  } else if (screen.name === 'parent') {
    view = (
      <ParentPanel
        profiles={profiles}
        onBack={() => {
          void getProfiles().then(setProfiles)
          setScreen({ name: 'profiles' })
        }}
      />
    )
  } else if (profile && progress) {
    if (screen.name === 'map') {
      view = (
        <VillageMap
          key={`map-${progress.stationsDone.length}-${arrivedFrom}`}
          profile={profile}
          progress={progress}
          arrivedFrom={arrivedFrom}
          onPlay={(s) => {
            if (s === 'rasm') setScreen({ name: 'studio' })
            else openPath(s)
          }}
          onAlbum={() => setScreen({ name: 'album' })}
          onYard={() => setScreen({ name: 'yard' })}
          onHome={goHome}
          onSleep={() => setScreen({ name: 'sleep' })}
        />
      )
    } else if (screen.name === 'studio') {
      view = (
        <DrawStudio
          profile={profile}
          onExit={backToMap}
          onDone={() => {
            setArrivedFrom('rasm')
            setScreen({ name: 'map' })
          }}
        />
      )
    } else if (screen.name === 'sleep') {
      view = <Sleep profile={profile} progress={progress} onHome={goHome} />
    } else if (screen.name === 'path') {
      const station = screen.station
      view = (
        <LevelPath
          key={`${station}-${screen.justDone ?? ''}`}
          profile={profile}
          station={station}
          unlocked={progress.levels[station] ?? startLevel(profile.age)}
          stars={progress.stars?.[station] ?? []}
          justDone={screen.justDone}
          onPlay={(level) => setScreen({ name: 'game', station, level })}
          onBack={backToMap}
          reward={reward}
          onRewardDone={(g) => void rewardDone(g)}
        />
      )
    } else if (screen.name === 'album') {
      view = <Album owned={progress.stickers ?? []} onBack={backToMap} />
    } else if (screen.name === 'yard') {
      view = (
        <Yard
          profile={profile}
          village={progress.village}
          inbox={progress.yardInbox ?? []}
          onSave={(v, inbox) => void saveYard(v, inbox)}
          onBack={backToMap}
        />
      )
    } else if (screen.name === 'game') {
      const Game = GAMES[screen.station]
      const { station, level } = screen
      view = (
        <Game
          key={`${station}-${level}`}
          profile={profile}
          level={level}
          onComplete={(r) => void finishStation(station, level, r)}
          onExit={() => {
            recordPlay(station, level, false)
            openPath(station)
          }}
        />
      )
    }
  }

  return (
    <>
      <BoilFilter />
      {view}
      <FxLayer />
      {screen.name !== 'parent' && (
        <div className="rotate-hint">
          <div>
            📱↻
            <br />
            Telefonni yotqizing
          </div>
        </div>
      )}
    </>
  )
}
