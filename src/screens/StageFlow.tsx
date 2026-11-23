import { useEffect, useState } from 'react'
import { Mascot } from '../art/Mascot'
import { getRig, saveRig } from '../lib/db'
import { analysisCanvas, autoLandmarks, blobKey, type Landmarks } from '../lib/landmarks'
import { RigSetup } from './RigSetup'
import { Stage } from './Stage'

// Sahnaga kirish: belgilar avval saqlangan bo'lsa — darhol sahna,
// aks holda avtomatik taxmin bilan belgilash ekrani (bir marta), keyin sahna.

interface Props {
  image: Blob
  onExit: () => void
}

export function StageFlow({ image, onExit }: Props) {
  const [phase, setPhase] = useState<'loading' | 'setup' | 'stage'>('loading')
  const [key, setKey] = useState('')
  const [auto, setAuto] = useState<Landmarks | null>(null)
  const [marks, setMarks] = useState<Landmarks | null>(null)

  useEffect(() => {
    let alive = true
    void (async () => {
      // Har qadam alohida himoyalangan: biror narsa ishlamasa ham sahna "yuklanmoqda"da qotib qolmasin
      const k = await blobKey(image).catch(() => '')
      const saved = k ? await getRig(k).catch(() => undefined) : undefined
      let a: Landmarks
      try {
        a = autoLandmarks(await analysisCanvas(image))
      } catch (e) {
        console.error('[stage] belgilarni topib bo\'lmadi', e)
        a = {
          eyeL: { x: 0.4, y: 0.3 }, eyeR: { x: 0.6, y: 0.3 }, mouth: { x: 0.5, y: 0.42 },
          handL: null, handR: null, footL: null, footR: null,
        }
      }
      if (!alive) return
      setKey(k)
      setAuto(a)
      setMarks(saved ?? a)
      setPhase(saved ? 'stage' : 'setup')
    })()
    return () => {
      alive = false
    }
  }, [image])

  if (phase === 'loading' || !marks || !auto)
    return (
      <div className="screen stage-screen">
        <div className="cb-loading-mascot stage-loading">
          <Mascot mood="talk" />
        </div>
      </div>
    )

  if (phase === 'setup')
    return (
      <RigSetup
        image={image}
        initial={marks}
        auto={auto}
        onExit={onExit}
        onDone={(m) => {
          if (key) void saveRig(key, m).catch(() => {})
          setMarks(m)
          setPhase('stage')
        }}
      />
    )

  return <Stage image={image} marks={marks} onExit={onExit} onEdit={() => setPhase('setup')} />
}
