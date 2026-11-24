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
import { PoemsGame } from './games/PoemsGame'
import { ShapesGame } from './games/ShapesGame'
import { WritingGame } from './games/WritingGame'
import { Numbers } from './games/Numbers'
import { Market } from './games/Market'
import { Shadows } from './games/Shadows'
import { Workshop } from './games/Workshop'
import { applyMix, jingle, playAmbience, playMusic, preloadMusic, setAmbience, setMusic, stopVoice, type AmbienceId, type MusicId } from './lib/audio'
import { getProfiles, getProgress, saveProgress } from './lib/db'
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
}

/** Sovg'a variantlari: hali qishloqda yo'q narsalar birinchi navbatda taklif qilinadi */
function rewardOptions(progress: Progress): DecorKind[] {
  const owned = new Set(progress.village.map((d) => d.kind))
  const fresh = shuffle(DECOR_POOL.filter((k) => !owned.has(k)))
  return [...fresh, ...shuffle(DECOR_POOL)].filter((k, i, a) => a.indexOf(k) === i).slice(0, 3)
}

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' })
  const [reward, setReward] = useState<DecorKind[] | null>(null)
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
    screen.name === 'profiles' || screen.name === 'map'
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
      if (s === 'game') openPath(screenRef.current.name === 'game' ? screenRef.current.station : 'bog')
      else if (s === 'path' || s === 'studio') backToMap()
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

  async function finishStation(station: GameStation, level: number, r: GameResult) {
    if (!profile || !progress) return
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
    await saveProgress(next)
    setProgress(next)
    // Bekatdagi bugungi birinchi g'alaba — qishloqqa sovg'a (xaritaga qaytganda tanlanadi)
    if (firstToday) {
      setReward(rewardOptions(next))
      setArrivedFrom(station)
    }
    if (next.dayDone) setScreen({ name: 'map' })
    else openPath(station, level)
  }

  async function placeDecor(d: PlacedDecor) {
    if (!progress) return
    const next = { ...progress, village: [...progress.village, d] }
    jingle('sticker')
    await saveProgress(next)
    setProgress(next)
    setReward(null)
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
          reward={reward}
          arrivedFrom={arrivedFrom}
          onPlay={(s) => {
            setReward(null)
            if (s === 'rasm') setScreen({ name: 'studio' })
            else openPath(s)
          }}
          onPlace={(d) => void placeDecor(d)}
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
          onExit={() => openPath(station)}
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
