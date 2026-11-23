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
      const k = await blobKey(image)
      const saved = await getRig(k)
      const a = autoLandmarks(await analysisCanvas(image))
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
          void saveRig(key, m)
          setMarks(m)
          setPhase('stage')
        }}
      />
    )

  return <Stage image={image} marks={marks} onExit={onExit} onEdit={() => setPhase('setup')} />
}
