// O'zbek naqsh plitkalari (Ustaxona uchun). Har biri rangi VA shakli bilan farq qiladi,
// shunda 3 yoshli bola rangga, 5 yoshli bola shaklga qarab ajrata oladi.

export type TileId = 'yulduz' | 'bodom' | 'gul' | 'olmos' | 'doira' | 'barg'

export const ALL_TILES: TileId[] = ['yulduz', 'bodom', 'gul', 'olmos', 'doira', 'barg']

const R = ({ fill }: { fill: string }) => <rect x={3} y={3} width={94} height={94} rx={16} fill={fill} />

const SHAPES: Record<TileId, React.ReactNode> = {
  // 8 qirrali yulduz — Samarqand koshinlari
  yulduz: (
    <>
      <R fill="#1d4e89" />
      <rect x={28} y={28} width={44} height={44} fill="#f6bd60" />
      <rect x={28} y={28} width={44} height={44} fill="#f6bd60" transform="rotate(45 50 50)" />
      <circle cx={50} cy={50} r={9} fill="#1d4e89" />
    </>
  ),
  // Bodom (buta) — so'zana va atlasdagi naqsh
  bodom: (
    <>
      <R fill="#fdf0d5" />
      <path d="M50 18C72 22 80 44 74 62C68 80 44 86 32 74C22 64 28 48 42 48C50 48 54 40 50 30C48 24 44 20 50 18Z" fill="#c1121f" />
      <circle cx={46} cy={64} r={6} fill="#fdf0d5" />
    </>
  ),
  gul: (
    <>
      <R fill="#2a9d8f" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={50} cy={30} rx={10} ry={16} fill="#fff" transform={`rotate(${a} 50 50)`} />
      ))}
      <circle cx={50} cy={50} r={10} fill="#f6bd60" />
    </>
  ),
  olmos: (
    <>
      <R fill="#f4a261" />
      <path d="M50 14L84 50L50 86L16 50Z" fill="#264653" />
      <path d="M50 34L66 50L50 66L34 50Z" fill="#fff" />
    </>
  ),
  doira: (
    <>
      <R fill="#ffe8d6" />
      <circle cx={50} cy={50} r={32} fill="#6a4c93" />
      <circle cx={50} cy={50} r={21} fill="#ffe8d6" />
      <circle cx={50} cy={50} r={11} fill="#6a4c93" />
    </>
  ),
  barg: (
    <>
      <R fill="#e9f5db" />
      <path d="M22 78C22 44 46 22 80 20C80 54 58 78 22 78Z" fill="#40916c" />
      <path d="M24 76C40 60 56 44 76 24" stroke="#e9f5db" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  ),
}

export function TileArt({ id, className }: { id: TileId; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`art ${className ?? ''}`}>
      {SHAPES[id]}
    </svg>
  )
}
