// O'zbek dasturxonidagi mevalar, tekis vektor uslubda (viewBox 100x100).

import { ALL_FRUITS, COLOR_HEX, FRUIT_COLOR, FRUIT_NAMES, type ColorId, type FruitKind } from '../lib/names.ts'
import { ArtImg } from './ArtImg'
import { artUrl } from '../lib/assets'

export { ALL_FRUITS, COLOR_HEX, FRUIT_COLOR, FRUIT_NAMES }
export type { ColorId, FruitKind }

const Shine = ({ x, y, rx = 6, ry = 10, r = 20 }: { x: number; y: number; rx?: number; ry?: number; r?: number }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" opacity={0.5} transform={`rotate(${r} ${x} ${y})`} />
)

const Leaf = ({ d = 'M54 16 C64 4 80 6 82 13 C74 22 61 23 54 16Z' }: { d?: string }) => (
  <>
    <path d={d} fill="#52b788" />
    <path d={d} fill="none" stroke="#2d6a4f" strokeWidth={1.5} opacity={0.5} />
  </>
)

const SHAPES: Record<FruitKind, React.ReactNode> = {
  olma: (
    <>
      <path d="M50 28C30 15 8 30 13 56C18 82 36 93 50 86C64 93 82 82 87 56C92 30 70 15 50 28Z" fill="#e63946" />
      <path d="M50 86C64 93 82 82 87 56C89 45 86 38 80 32C84 56 72 80 50 86Z" fill="#b5172b" />
      <Shine x={31} y={46} />
      <path d="M50 30C50 22 52 14 56 8" stroke="#6b4226" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <Leaf />
    </>
  ),
  anor: (
    <>
      <path d="M38 30L40 14L45 22L50 9L55 22L60 14L62 30Z" fill="#9d1027" />
      <circle cx={50} cy={58} r={34} fill="#c8102e" />
      <path d="M50 92A34 34 0 0 0 84 58A34 34 0 0 0 75 35C82 62 70 86 50 92Z" fill="#8d0f22" />
      <Shine x={33} y={48} rx={6} ry={11} />
      <circle cx={42} cy={30} r={3} fill="#f9c74f" opacity={0.7} />
    </>
  ),
  gilos: (
    <>
      <path d="M34 50C38 34 46 20 58 12M66 54C64 38 62 24 58 12" stroke="#6b4226" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <Leaf d="M58 12C68 2 84 4 86 10C78 19 66 20 58 12Z" />
      <circle cx={32} cy={68} r={19} fill="#d00000" />
      <circle cx={68} cy={72} r={19} fill="#d00000" />
      <path d="M32 87A19 19 0 0 0 51 68C51 62 49 58 46 54C50 70 44 82 32 87Z" fill="#9d0208" />
      <path d="M68 91A19 19 0 0 0 87 72C87 66 85 62 82 58C86 74 80 86 68 91Z" fill="#9d0208" />
      <Shine x={25} y={62} rx={4} ry={7} />
      <Shine x={61} y={66} rx={4} ry={7} />
    </>
  ),
  qovun: (
    <>
      <ellipse cx={50} cy={56} rx={44} ry={31} fill="#f6c945" />
      <path d="M6 56A44 31 0 0 0 94 56C90 74 72 87 50 87C28 87 10 74 6 56Z" fill="#e0a800" opacity={0.55} />
      <g stroke="#c98f00" strokeWidth={1.6} fill="none" opacity={0.55}>
        <path d="M20 36Q50 60 80 36M14 52Q50 80 86 52M24 76Q50 56 76 76M34 28Q30 56 38 86M66 28Q70 56 62 86" />
      </g>
      <Shine x={30} y={42} rx={8} ry={5} r={-20} />
      <path d="M50 25C50 20 52 16 55 13" stroke="#6b4226" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  ),
  behi: (
    <>
      <path d="M50 20C38 20 34 32 30 40C16 50 16 80 34 88C42 92 58 92 66 88C84 80 84 50 70 40C66 32 62 20 50 20Z" fill="#f2c94c" />
      <path d="M66 88C84 80 84 50 70 40C76 58 74 80 56 91C60 91 63 90 66 88Z" fill="#d4a017" />
      <Shine x={36} y={52} />
      <path d="M50 22C50 16 51 12 53 8" stroke="#6b4226" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Leaf d="M52 12C60 2 76 4 78 10C70 18 58 19 52 12Z" />
    </>
  ),
  tarvuz: (
    <>
      <ellipse cx={50} cy={56} rx={44} ry={33} fill="#2d6a4f" />
      <g fill="none" stroke="#74c69d" strokeWidth={4.5} strokeLinejoin="round">
        <path d="M24 30L28 40L22 50L28 60L22 70L26 80" />
        <path d="M50 23L54 34L48 46L54 58L48 70L52 89" />
        <path d="M76 30L72 40L78 50L72 60L78 70L74 80" />
      </g>
      <Shine x={28} y={40} rx={7} ry={4} r={-25} />
      <path d="M50 24C50 19 52 15 55 12" stroke="#6b4226" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  ),
  nok: (
    <>
      <path d="M50 16C40 16 38 30 36 40C22 52 20 84 50 90C80 84 78 52 64 40C62 30 60 16 50 16Z" fill="#a7c957" />
      <path d="M50 90C80 84 78 52 64 40C70 58 70 80 50 90Z" fill="#6a994e" />
      <Shine x={38} y={58} />
      <path d="M50 18C50 12 51 8 54 4" stroke="#6b4226" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Leaf d="M53 9C61 0 76 2 78 8C70 15 59 16 53 9Z" />
    </>
  ),
  uzum: (
    <>
      <path d="M50 22C50 14 54 8 60 4" stroke="#6b4226" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Leaf d="M52 16C40 4 24 8 22 14C32 22 44 22 52 16Z" />
      {[
        [32, 32], [50, 30], [68, 32],
        [24, 48], [42, 47], [60, 47], [78, 48],
        [33, 63], [51, 63], [69, 63],
        [42, 78], [60, 78],
        [51, 92],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={10.5} fill="#7b2cbf" />
          <circle cx={x + 2} cy={y + 2} r={8} fill="#5a189a" opacity={0.6} />
          <circle cx={x - 3.5} cy={y - 3.5} r={2.8} fill="#fff" opacity={0.6} />
        </g>
      ))}
    </>
  ),
  anjir: (
    <>
      <path d="M50 12C44 26 18 46 20 68C22 86 40 93 50 93C60 93 78 86 80 68C82 46 56 26 50 12Z" fill="#6a4c93" />
      <path d="M50 93C60 93 78 86 80 68C81 56 74 46 66 38C74 58 70 82 50 93Z" fill="#4a3470" />
      <Shine x={35} y={60} />
      <path d="M50 14C50 9 52 6 55 3" stroke="#6b4226" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  ),
  orik: (
    <>
      <circle cx={50} cy={56} r={34} fill="#f8961e" />
      <path d="M50 90A34 34 0 0 0 84 56A34 34 0 0 0 76 34C82 60 70 84 50 90Z" fill="#e76f51" opacity={0.7} />
      <path d="M50 24C42 40 42 72 50 90" stroke="#e76f51" strokeWidth={2.5} fill="none" opacity={0.7} />
      <Shine x={34} y={46} />
      <Leaf d="M52 24C58 10 76 10 80 16C72 26 60 28 52 24Z" />
    </>
  ),
}

export function FruitArt({ kind, className }: { kind: FruitKind; className?: string }) {
  const img = artUrl(`fruit/${kind}`)
  if (img) return <ArtImg src={img} className={className} alt={FRUIT_NAMES[kind]} />
  return (
    <svg viewBox="0 0 100 100" className={`art ${className ?? ''}`} aria-label={FRUIT_NAMES[kind]}>
      {SHAPES[kind]}
    </svg>
  )
}
