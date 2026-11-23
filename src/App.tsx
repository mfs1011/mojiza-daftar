import { App as CapApp } from '@capacitor/app'
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { DECOR_POOL, type DecorKind } from './art/Scenery'
import { FxLayer } from './components/Fx'
import { BoilFilter } from './components/Hero'
import { Farm } from './games/Farm'
import { Garden } from './games/Garden'
import { Letters } from './games/Letters'
import { Market } from './games/Market'
import { Shadows } from './games/Shadows'
import { Workshop } from './games/Workshop'
import { setMusic, stopVoice } from './lib/audio'
import { getProfiles, getProgress, saveProgress } from './lib/db'
import { getSettings } from './lib/settings'
import { dailyFor, nextLevel, startLevel } from './lib/stations'
import { shuffle } from './lib/util'
import { DrawStudio } from './screens/DrawStudio'
import { ParentPanel } from './screens/ParentPanel'
import { ProfileSelect } from './screens/ProfileSelect'
import { Sleep } from './screens/Sleep'
import { VillageMap } from './screens/VillageMap'
import type { GameProps, GameResult, PlacedDecor, Profile, Progress, Screen, StationId } from './types'

type GameStation = Exclude<StationId, 'rasm'>

const GAMES: Record<GameStation, ComponentType<GameProps>> = {
  bog: Garden,
  bozor: Market,
  ferma: Farm,
  ustaxona: Workshop,
  qora: Shadows,
  harflar: Letters,
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
  }, [])

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

  // Android "orqaga" tugmasi: ilovadan chiqarib yubormasin, bir qadam orqaga qaytsin
  const screenRef = useRef(screen)
  useEffect(() => {
    screenRef.current = screen
  }, [screen])
  useEffect(() => {
    const sub = CapApp.addListener('backButton', () => {
      const s = screenRef.current.name
      if (s === 'game' || s === 'studio') backToMap()
      else if (s === 'map' || s === 'sleep' || s === 'parent') goHome()
      else void CapApp.minimizeApp()
    })
    return () => void sub.then((h) => h.remove())
  }, [backToMap, goHome])

  async function choose(p: Profile) {
    setMusic(getSettings().music)
    const pr = await getProgress(p.id)
    setProfile(p)
    setProgress(pr)
    setReward(null)
    setArrivedFrom(null)
    setScreen(pr.dayDone ? { name: 'sleep' } : { name: 'map' })
  }

  async function finishStation(station: GameStation, r: GameResult) {
    if (!profile || !progress) return
    const level = progress.levels[station] ?? startLevel(profile.age)
    const stationsDone = progress.stationsDone.includes(station) ? progress.stationsDone : [...progress.stationsDone, station]
    const next: Progress = {
      ...progress,
      coins: progress.coins + (r.coins ?? 0),
      fruits: progress.fruits + (r.fruits ?? 0),
      stationsDone,
      dayDone: dailyFor(profile.age).every((s) => stationsDone.includes(s.id)),
      levels: { ...progress.levels, [station]: nextLevel(level, r.mistakes) },
    }
    await saveProgress(next)
    setProgress(next)
    setReward(rewardOptions(next))
    setArrivedFrom(station)
    setScreen({ name: 'map' })
  }

  async function placeDecor(d: PlacedDecor) {
    if (!progress) return
    const next = { ...progress, village: [...progress.village, d] }
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
            setScreen(s === 'rasm' ? { name: 'studio' } : { name: 'game', station: s })
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
    } else if (screen.name === 'game') {
      const Game = GAMES[screen.station]
      const station = screen.station
      view = (
        <Game
          key={station}
          profile={profile}
          level={progress.levels[station] ?? startLevel(profile.age)}
          onComplete={(r) => void finishStation(station, r)}
          onExit={backToMap}
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
