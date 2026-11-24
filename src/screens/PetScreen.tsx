import { lazy, Suspense, useEffect, useState } from 'react'
import { getHero } from '../lib/db'

// 🗣️ Gapiradigan do'stim: 3D qahramon bolaning gapini ingichka ovozda takrorlaydi, tegsa — reaksiya qiladi.
// Bolaning chizgan qahramoni uni "kiyintiradi" (rangi va ko'kragidagi nishon).
const ProStage = lazy(() => import('./ProStage').then((m) => ({ default: m.ProStage })))

export function PetScreen({ profileId, onExit }: { profileId: string; onExit: () => void }) {
  const [decal, setDecal] = useState<Blob | null | undefined>(undefined)
  useEffect(() => {
    void getHero(profileId).then((b) => setDecal(b ?? null))
  }, [profileId])
  if (decal === undefined) return <div className="screen" style={{ background: '#bde0fe' }} />
  return (
    <Suspense fallback={<div className="screen" style={{ background: '#bde0fe' }} />}>
      <ProStage decal={decal} onExit={onExit} />
    </Suspense>
  )
}
