// Qishloq hayvonlari, yon tomondan, o'ngga qaragan (viewBox 120x100).
// Konturli multfilm uslubi. Soyalar o'yinida xuddi shu rasm qora qilib ishlatiladi,
// shuning uchun har birining siluyeti ajralib turishi muhim.

import { ALL_ANIMALS, ANIMAL_NAMES, ANIMAL_SOUNDS, type AnimalId } from '../lib/names.ts'
import { ArtImg } from './ArtImg'
import { artUrl } from '../lib/assets'

export { ALL_ANIMALS, ANIMAL_NAMES, ANIMAL_SOUNDS }
export type { AnimalId }

const INK = '#3d2c1e'
const Eye = ({ x, y, r = 3.4 }: { x: number; y: number; r?: number }) => (
  <>
    <circle cx={x} cy={y} r={r} fill={INK} stroke="none" />
    <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" stroke="none" />
  </>
)
const Leg = ({ x, y = 64, h = 26, w = 8, fill, hoof = INK }: { x: number; y?: number; h?: number; w?: number; fill: string; hoof?: string }) => (
  <>
    <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} />
    <rect x={x} y={y + h - 5} width={w} height={6} rx={2} fill={hoof} />
  </>
)

const SHAPES: Record<AnimalId, React.ReactNode> = {
  sigir: (
    <>
      <path d="M20 46C12 52 10 62 12 72" fill="none" strokeWidth={4} />
      <circle cx={12} cy={74} r={4} fill={INK} />
      <Leg x={28} fill="#fafafa" />
      <Leg x={42} fill="#fafafa" />
      <Leg x={72} fill="#fafafa" />
      <Leg x={84} fill="#fafafa" />
      <ellipse cx={58} cy={54} rx={40} ry={23} fill="#fafafa" />
      <ellipse cx={66} cy={77} rx={8} ry={5} fill="#ffb5c2" />
      <path d="M36 38C46 34 54 42 50 50C44 58 32 54 34 46Z" fill={INK} stroke="none" />
      <ellipse cx={74} cy={60} rx={8} ry={6} fill={INK} stroke="none" />
      <path d="M90 24C88 16 92 12 96 12M108 24C110 16 106 12 102 12" fill="none" stroke="#c9a66b" strokeWidth={4.5} />
      <ellipse cx={86} cy={32} rx={8} ry={4.5} fill="#fafafa" transform="rotate(-20 86 32)" />
      <ellipse cx={100} cy={38} rx={15} ry={17} fill="#fafafa" />
      <ellipse cx={104} cy={51} rx={13} ry={9} fill="#ffb5c2" />
      <circle cx={100} cy={51} r={1.6} fill={INK} stroke="none" />
      <circle cx={108} cy={51} r={1.6} fill={INK} stroke="none" />
      <Eye x={102} y={34} />
    </>
  ),
  qoy: (
    <>
      <Leg x={34} y={62} h={28} w={7} fill="#5c4033" />
      <Leg x={46} y={62} h={28} w={7} fill="#5c4033" />
      <Leg x={70} y={62} h={28} w={7} fill="#5c4033" />
      <Leg x={82} y={62} h={28} w={7} fill="#5c4033" />
      {[
        [30, 52, 13], [42, 40, 15], [58, 36, 16], [74, 40, 15], [86, 50, 13],
        [76, 62, 14], [58, 64, 15], [40, 62, 14], [58, 50, 16],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#f8f9fa" />
      ))}
      <ellipse cx={92} cy={34} rx={6} ry={3.5} fill="#5c4033" transform="rotate(-25 92 34)" />
      <ellipse cx={102} cy={44} rx={11} ry={14} fill="#5c4033" />
      <circle cx={98} cy={30} r={6} fill="#f8f9fa" />
      <circle cx={106} cy={31} r={5} fill="#f8f9fa" />
      <Eye x={105} y={41} r={3} />
      <path d="M104 52Q108 54 111 51" fill="none" stroke="#f8f9fa" strokeWidth={1.6} />
    </>
  ),
  echki: (
    <>
      <path d="M22 44L14 34" fill="none" strokeWidth={5} />
      <Leg x={30} y={60} h={30} w={7} fill="#d4a373" />
      <Leg x={42} y={60} h={30} w={7} fill="#d4a373" />
      <Leg x={70} y={60} h={30} w={7} fill="#d4a373" />
      <Leg x={82} y={60} h={30} w={7} fill="#d4a373" />
      <ellipse cx={56} cy={52} rx={36} ry={18} fill="#d4a373" />
      <path d="M46 40Q56 34 66 40" fill="none" stroke="#a47148" strokeWidth={3} />
      <path d="M86 46L92 30L104 26L114 40L108 50L96 54Z" fill="#d4a373" />
      <path d="M96 26C92 14 84 10 78 12M102 25C102 12 96 6 90 6" fill="none" stroke="#7f5539" strokeWidth={4.5} />
      <ellipse cx={90} cy={32} rx={9} ry={4} fill="#a47148" transform="rotate(25 90 32)" />
      <path d="M104 50L106 64L98 54Z" fill="#a47148" />
      <Eye x={104} y={35} r={3} />
    </>
  ),
  xoroz: (
    <>
      <path d="M44 50C30 30 20 14 32 6C30 22 40 34 50 44Z" fill="#264653" />
      <path d="M44 54C26 44 10 40 8 26C20 34 36 40 50 48Z" fill="#2a9d8f" />
      <path d="M46 58C30 58 14 62 8 52C22 52 36 52 50 54Z" fill="#e9c46a" />
      <path d="M60 78L56 94M70 78L74 94" fill="none" stroke="#f4a261" strokeWidth={4} />
      <path d="M50 94H62M68 94H80" fill="none" stroke="#f4a261" strokeWidth={3} />
      <ellipse cx={64} cy={60} rx={22} ry={20} fill="#e76f51" />
      <path d="M52 58Q64 72 78 62Q72 52 60 52Z" fill="#c4553a" />
      <path d="M74 50C72 36 76 26 84 22L94 30C92 40 88 50 82 54Z" fill="#e76f51" />
      <path d="M80 18C80 10 86 8 88 14C90 6 96 6 96 14C100 10 104 14 100 20L90 24Z" fill="#d00000" />
      <path d="M94 28L106 32L94 36Z" fill="#f6bd60" />
      <path d="M92 36C96 40 96 46 92 48C88 46 88 40 92 36Z" fill="#d00000" />
      <Eye x={88} y={28} r={2.8} />
    </>
  ),
  it: (
    <>
      <path d="M24 46C16 40 14 30 20 24" fill="none" strokeWidth={5} />
      <Leg x={30} y={58} h={30} w={9} fill="#c68b59" hoof="#8d5524" />
      <Leg x={44} y={58} h={30} w={9} fill="#c68b59" hoof="#8d5524" />
      <Leg x={70} y={58} h={30} w={9} fill="#c68b59" hoof="#8d5524" />
      <Leg x={82} y={58} h={30} w={9} fill="#c68b59" hoof="#8d5524" />
      <ellipse cx={56} cy={52} rx={34} ry={17} fill="#c68b59" />
      <ellipse cx={62} cy={60} rx={18} ry={8} fill="#e6b98a" stroke="none" />
      <circle cx={92} cy={36} r={16} fill="#c68b59" />
      <ellipse cx={106} cy={42} rx={10} ry={7.5} fill="#e6b98a" />
      <ellipse cx={113} cy={39} rx={4} ry={3.2} fill={INK} />
      <path d="M84 24C74 26 72 44 80 50C86 46 88 34 86 26Z" fill="#8d5524" />
      <path d="M104 48Q106 52 110 50" fill="none" strokeWidth={1.8} />
      <Eye x={96} y={32} />
    </>
  ),
  mushuk: (
    <>
      <path d="M26 52C12 46 10 28 18 14C20 22 20 34 30 44" fill="#f4a261" />
      <Leg x={32} y={58} h={30} w={7} fill="#f4a261" hoof="#e76f51" />
      <Leg x={44} y={58} h={30} w={7} fill="#f4a261" hoof="#e76f51" />
      <Leg x={70} y={58} h={30} w={7} fill="#f4a261" hoof="#e76f51" />
      <Leg x={80} y={58} h={30} w={7} fill="#f4a261" hoof="#e76f51" />
      <ellipse cx={56} cy={52} rx={32} ry={15} fill="#f4a261" />
      <path d="M44 40L48 52M56 38L58 52M68 40L66 52" fill="none" stroke="#e76f51" strokeWidth={3.5} />
      <path d="M84 30L86 12L96 24Z" fill="#f4a261" />
      <path d="M100 24L110 12L110 32Z" fill="#f4a261" />
      <circle cx={98} cy={36} r={15} fill="#f4a261" />
      <path d="M88 26L87 18L92 23Z" fill="#ffb5c2" stroke="none" />
      <path d="M104 25L108 18L108 28Z" fill="#ffb5c2" stroke="none" />
      <path d="M108 42L120 40M108 45L120 47" fill="none" strokeWidth={1.4} />
      <circle cx={109} cy={40} r={2} fill="#e76f51" />
      <Eye x={102} y={33} r={3} />
    </>
  ),
  ordak: (
    <>
      <path d="M50 88L46 96H56ZM70 88L66 96H76Z" fill="#f77f00" />
      <path d="M18 56C14 46 20 40 28 44C40 38 70 38 86 52C90 72 74 86 50 86C30 86 18 74 18 56Z" fill="#ffd166" />
      <path d="M34 58C46 52 62 54 70 62C60 72 44 72 34 58Z" fill="#f4b400" />
      <circle cx={88} cy={36} r={15} fill="#ffd166" />
      <path d="M100 38C108 36 116 38 118 42C114 46 106 46 100 44Z" fill="#f77f00" />
      <Eye x={92} y={32} r={3} />
    </>
  ),
  eshak: (
    <>
      <path d="M20 44C14 54 14 64 16 72" fill="none" strokeWidth={3.5} />
      <path d="M12 70L16 80L20 70Z" fill={INK} />
      <Leg x={28} y={60} h={30} w={8} fill="#adb5bd" />
      <Leg x={40} y={60} h={30} w={8} fill="#adb5bd" />
      <Leg x={70} y={60} h={30} w={8} fill="#adb5bd" />
      <Leg x={82} y={60} h={30} w={8} fill="#adb5bd" />
      <ellipse cx={56} cy={52} rx={36} ry={18} fill="#adb5bd" />
      <ellipse cx={58} cy={62} rx={20} ry={7} fill="#dee2e6" stroke="none" />
      <path d="M82 46L88 28L100 24L104 30L98 50Z" fill="#adb5bd" />
      <path d="M84 40L90 26L94 28L88 42Z" fill={INK} stroke="none" />
      <ellipse cx={92} cy={10} rx={4.5} ry={13} fill="#adb5bd" transform="rotate(-15 92 10)" />
      <ellipse cx={102} cy={11} rx={4.5} ry={13} fill="#adb5bd" transform="rotate(12 102 11)" />
      <ellipse cx={100} cy={34} rx={11} ry={13} fill="#adb5bd" />
      <ellipse cx={108} cy={44} rx={9} ry={8} fill="#dee2e6" />
      <circle cx={111} cy={43} r={1.6} fill={INK} stroke="none" />
      <Eye x={102} y={30} r={3} />
    </>
  ),
}

interface Props {
  id: AnimalId
  className?: string
  /** Soyalar o'yini uchun: qora siluyet */
  shadow?: boolean
  flip?: boolean
}

export function AnimalArt({ id, className, shadow, flip }: Props) {
  const img = artUrl(`animal/${id}`)
  if (img)
    return (
      <ArtImg
        src={img}
        alt={ANIMAL_NAMES[id]}
        className={`${shadow ? 'silhouette-art' : ''} ${className ?? ''}`}
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      />
    )
  return (
    <svg
      viewBox="0 0 120 100"
      className={`art ${shadow ? 'silhouette-art' : ''} ${className ?? ''}`}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-label={ANIMAL_NAMES[id]}
    >
      <g stroke={INK} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
        {SHAPES[id]}
      </g>
    </svg>
  )
}
