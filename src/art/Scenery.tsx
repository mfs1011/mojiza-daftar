import type { StationId } from '../types'
import { AnimalArt, type AnimalId } from './Animal'
import { FruitArt, type FruitKind } from './Fruit'
import { ArtImg, ArtSprite } from './ArtImg'
import { animOf, artUrl } from '../lib/assets'

const INK = '#3d2c1e'

// ---------------- Savat ----------------

export function BasketArt({ ribbon, className }: { ribbon?: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={`art ${className ?? ''}`}>
      <g stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
        <path d="M22 40C22 10 98 10 98 40" fill="none" stroke="#8d5524" strokeWidth={6} />
        <path d="M10 40H110L100 92H20Z" fill="#c68b59" />
        <g stroke="#8d5524" strokeWidth={2} opacity={0.7}>
          <path d="M14 54H106M16 68H104M18 82H102" />
          <path d="M34 40L36 92M52 40L53 92M68 40L67 92M86 40L84 92" />
        </g>
        {ribbon && <rect x={12} y={46} width={96} height={14} fill={ribbon} />}
        <rect x={6} y={34} width={108} height={10} rx={5} fill="#a0522d" />
      </g>
    </svg>
  )
}

// ---------------- Odamlar (bozor mijozlari) ----------------

export type PersonId = 'bobo' | 'buvi' | 'aka' | 'opa' | 'bola'
export const ALL_PEOPLE: PersonId[] = ['bobo', 'buvi', 'aka', 'opa', 'bola']

export function PersonArt({ id, happy, className }: { id: PersonId; happy?: boolean; className?: string }) {
  const key = `person/${id}${happy ? '-happy' : ''}`
  const anim = animOf(key) ?? (artUrl(key) ? null : animOf(`person/${id}`))
  if (anim) return <ArtSprite anim={anim} className={className} />
  const img = artUrl(key) ?? artUrl(`person/${id}`)
  if (img) return <ArtImg src={img} className={className} />
  const skin = id === 'bobo' || id === 'aka' ? '#e0ac69' : '#f1c27d'
  return (
    <svg viewBox="0 0 100 140" className={`art ${className ?? ''}`}>
      <g stroke={INK} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
        {/* tana / kiyim */}
        {id === 'bobo' && (
          <>
            <path d="M18 140C18 100 30 84 50 84C70 84 82 100 82 140Z" fill="#2a6f97" />
            <path d="M30 92V140M42 86V140M58 86V140M70 92V140" stroke="#61a5c2" strokeWidth={4} />
            <path d="M44 84L50 112L56 84" fill="#f8f9fa" />
          </>
        )}
        {id === 'buvi' && <path d="M18 140C18 100 30 84 50 84C70 84 82 100 82 140Z" fill="#7b2cbf" />}
        {id === 'aka' && (
          <>
            <path d="M18 140C18 100 30 84 50 84C70 84 82 100 82 140Z" fill="#f8f9fa" />
            <path d="M24 140C24 112 30 96 38 90L42 140ZM76 140C76 112 70 96 62 90L58 140Z" fill="#264653" />
          </>
        )}
        {id === 'opa' && (
          <>
            <path d="M18 140C18 100 30 84 50 84C70 84 82 100 82 140Z" fill="#ef476f" />
            <path d="M22 108L30 100L38 108L46 100L54 108L62 100L70 108L78 100M20 124L28 116L36 124L44 116L52 124L60 116L68 124L76 116L82 122" fill="none" stroke="#ffd166" strokeWidth={4} />
          </>
        )}
        {id === 'bola' && <path d="M24 140C24 106 34 90 50 90C66 90 76 106 76 140Z" fill="#06d6a0" />}

        {/* bosh */}
        {id === 'buvi' && <path d="M22 60C20 26 80 26 78 60C80 76 74 86 50 88C26 86 20 76 22 60Z" fill="#f8f9fa" />}
        <circle cx={50} cy={id === 'bola' ? 62 : 56} r={id === 'bola' ? 24 : 26} fill={skin} />

        {/* soch / bosh kiyim */}
        {(id === 'bobo' || id === 'aka') && (
          <>
            <path d="M26 44C26 28 74 28 74 44Z" fill="#212529" />
            <path d="M34 38L38 34L42 38M48 37L52 33L56 37M62 38L66 34L70 38" fill="none" stroke="#fff" strokeWidth={2.4} />
          </>
        )}
        {id === 'buvi' && <path d="M24 50C24 30 76 30 76 50C66 40 34 40 24 50Z" fill="#f8f9fa" />}
        {id === 'opa' && (
          <>
            <path d="M24 56C22 30 78 30 76 56C70 42 30 42 24 56Z" fill="#3d2c1e" />
            <path d="M26 58C22 74 20 92 24 108M74 58C78 74 80 92 76 108" fill="none" stroke="#3d2c1e" strokeWidth={6} />
          </>
        )}
        {id === 'bola' && (
          <>
            <path d="M26 56C26 34 74 34 74 56C66 46 34 46 26 56Z" fill="#8d5524" />
            <path d="M28 48C28 30 72 30 72 48Z" fill="#118ab2" />
            <path d="M68 46L86 48" stroke="#118ab2" strokeWidth={6} />
          </>
        )}

        {/* soqol */}
        {id === 'bobo' && <path d="M30 62C32 90 68 90 70 62C62 72 38 72 30 62Z" fill="#f8f9fa" />}
        {id === 'aka' && <path d="M38 70Q50 76 62 70" fill="none" stroke="#212529" strokeWidth={4} />}

        {/* yuz */}
        {happy ? (
          <>
            <path d="M36 54Q41 48 46 54M54 54Q59 48 64 54" fill="none" strokeWidth={3} />
            <path d="M40 66Q50 78 60 66Z" fill="#c1121f" />
          </>
        ) : (
          <>
            <circle cx={41} cy={54} r={3.2} fill={INK} />
            <circle cx={59} cy={54} r={3.2} fill={INK} />
            <path d="M43 66Q50 71 57 66" fill="none" strokeWidth={2.6} />
          </>
        )}
        <circle cx={34} cy={62} r={4} fill="#ff8fab" opacity={0.55} stroke="none" />
        <circle cx={66} cy={62} r={4} fill="#ff8fab" opacity={0.55} stroke="none" />
      </g>
    </svg>
  )
}

export function CoinArt({ className }: { className?: string }) {
  const img = artUrl('ui/coin')
  if (img) return <ArtImg src={img} className={className} />
  return (
    <svg viewBox="0 0 100 100" className={`art ${className ?? ''}`}>
      <circle cx={50} cy={50} r={44} fill="#f6bd60" stroke="#c98f00" strokeWidth={5} />
      <circle cx={50} cy={50} r={30} fill="none" stroke="#c98f00" strokeWidth={3} opacity={0.6} />
      <path d="M38 36L50 30L62 36L62 64L50 70L38 64Z" fill="#c98f00" opacity={0.5} />
      <ellipse cx={34} cy={30} rx={8} ry={5} fill="#fff" opacity={0.5} transform="rotate(-30 34 30)" />
    </svg>
  )
}

// ---------------- Daraxtlar ----------------

export function FruitTreeArt({ fruit, className }: { fruit?: FruitKind; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`art ${className ?? ''}`}>
      <g stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
        <path d="M44 96L46 60L40 50M54 96L52 60L60 48" fill="#8d5524" />
        <rect x={43} y={58} width={13} height={38} rx={4} fill="#8d5524" />
        <circle cx={30} cy={42} r={20} fill="#52b788" />
        <circle cx={70} cy={42} r={20} fill="#52b788" />
        <circle cx={50} cy={28} r={24} fill="#52b788" />
        <circle cx={50} cy={50} r={18} fill="#52b788" stroke="none" />
      </g>
      {fruit &&
        [
          [30, 40],
          [52, 22],
          [70, 44],
          [46, 46],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x - 8} ${y - 8}) scale(0.16)`}>
            <FruitArt kind={fruit} />
          </g>
        ))}
    </svg>
  )
}

export function PoplarArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 120" className={`art ${className ?? ''}`}>
      <rect x={17} y={90} width={6} height={30} fill="#8d5524" />
      <ellipse cx={20} cy={52} rx={15} ry={48} fill="#40916c" />
      <path d="M20 6C30 30 32 70 26 98C34 70 34 30 20 6Z" fill="#2d6a4f" />
    </svg>
  )
}

// ---------------- Binolar ----------------

export function HouseArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`art ${className ?? ''}`}>
      <g stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
        <rect x={10} y={36} width={80} height={58} rx={3} fill="#fefae0" />
        <rect x={6} y={28} width={88} height={10} rx={3} fill="#a0522d" />
        <path d="M40 94V64C40 56 60 56 60 64V94Z" fill="#8d5524" />
        <path d="M50 58V94" />
        <rect x={16} y={50} width={16} height={16} rx={2} fill="#8ecae6" />
        <rect x={68} y={50} width={16} height={16} rx={2} fill="#8ecae6" />
        <path d="M24 50V66M16 58H32M76 50V66M68 58H84" strokeWidth={2} />
      </g>
    </svg>
  )
}

export function DomeArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 100" className={`art ${className ?? ''}`}>
      <g stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
        <rect x={6} y={30} width={14} height={66} fill="#e9d8a6" />
        <path d="M4 30H22L13 18Z" fill="#219ebc" />
        <rect x={120} y={30} width={14} height={66} fill="#e9d8a6" />
        <path d="M118 30H136L127 18Z" fill="#219ebc" />
        <path d="M38 50C38 14 102 14 102 50Z" fill="#219ebc" />
        <path d="M52 22C58 34 60 44 60 50M88 22C82 34 80 44 80 50M70 16V50" fill="none" stroke="#8ecae6" strokeWidth={2} />
        <rect x={28} y={48} width={84} height={48} fill="#e9d8a6" />
        <path d="M56 96V70C56 58 84 58 84 70V96Z" fill="#1d3557" />
        <path d="M28 56H112" stroke="#219ebc" strokeWidth={5} />
      </g>
    </svg>
  )
}

// ---------------- Xarita bekatlari ----------------

const STATION_ICONS: Record<StationId, React.ReactNode> = {
  rasm: (
    <>
      <path d="M30 94L44 30M70 94L56 30M50 30V94" fill="none" stroke="#8d5524" strokeWidth={5} />
      <rect x={20} y={14} width={60} height={50} rx={4} fill="#fff" />
      <path d="M30 50C36 30 44 54 50 36C56 22 62 50 70 30" fill="none" stroke="#ef476f" strokeWidth={4} />
      <circle cx={36} cy={28} r={6} fill="#ffd166" />
    </>
  ),
  bog: (
    <>
      <rect x={44} y={58} width={12} height={36} rx={3} fill="#8d5524" />
      <circle cx={32} cy={44} r={20} fill="#52b788" />
      <circle cx={68} cy={44} r={20} fill="#52b788" />
      <circle cx={50} cy={30} r={24} fill="#52b788" />
      <circle cx={34} cy={42} r={6} fill="#e63946" />
      <circle cx={56} cy={24} r={6} fill="#e63946" />
      <circle cx={70} cy={48} r={6} fill="#e63946" />
    </>
  ),
  bozor: (
    <>
      <rect x={14} y={52} width={72} height={40} fill="#c68b59" />
      <path d="M8 40H92L86 54H14Z" fill="#fff" />
      <path d="M8 40H22L20 54H14ZM36 40H50V54H38ZM64 40H78L80 54H66Z" fill="#e63946" />
      <path d="M8 40L18 22H82L92 40Z" fill="#e63946" />
      <circle cx={30} cy={60} r={7} fill="#f6c945" />
      <circle cx={48} cy={60} r={7} fill="#e63946" />
      <circle cx={66} cy={60} r={7} fill="#52b788" />
    </>
  ),
  ferma: (
    <>
      <path d="M10 92V44L50 18L90 44V92Z" fill="#d4a373" />
      <path d="M36 92V60H64V92Z" fill="#8d5524" />
      <path d="M36 60L64 92M64 60L36 92" fill="none" />
      <path d="M4 46L50 14L96 46" fill="none" stroke="#8d5524" strokeWidth={6} />
    </>
  ),
  ustaxona: (
    <>
      <path d="M36 14H64V22C80 28 88 44 86 62C84 82 70 94 50 94C30 94 16 82 14 62C12 44 20 28 36 22Z" fill="#e07a5f" />
      <path d="M16 52H84M16 64H84" fill="none" stroke="#1d4e89" strokeWidth={5} />
      <path d="M24 58L30 52L36 58L42 52L48 58L54 52L60 58L66 52L72 58L78 52" fill="none" stroke="#f6bd60" strokeWidth={3} />
    </>
  ),
  qora: (
    <>
      <circle cx={74} cy={24} r={14} fill="#ffd166" />
      <circle cx={80} cy={20} r={12} fill="#1d3557" stroke="none" />
      <path d="M8 60H92M8 78H92" fill="none" stroke="#8d5524" strokeWidth={6} />
      {[12, 30, 48, 66, 84].map((x) => (
        <rect key={x} x={x} y={46} width={8} height={46} rx={2} fill="#a0522d" />
      ))}
    </>
  ),
  harflar: (
    <>
      <rect x={14} y={30} width={72} height={62} rx={4} fill="#fefae0" />
      <path d="M8 34L50 8L92 34Z" fill="#219ebc" />
      <rect x={28} y={42} width={44} height={34} rx={3} fill="#2d6a4f" />
      <text x={50} y={70} textAnchor="middle" fontSize={30} fontWeight={900} fill="#fff" stroke="none" fontFamily="system-ui">
        A
      </text>
    </>
  ),
  raqam: (
    <>
      <rect x={10} y={26} width={80} height={56} rx={6} fill="#3d5a80" />
      <rect x={16} y={32} width={68} height={44} rx={3} fill="#98c1d9" />
      <text x={50} y={66} textAnchor="middle" fontSize={30} fontWeight={900} fill="#fff" stroke="none" fontFamily="system-ui">
        123
      </text>
      <path d="M30 82L24 94M70 82L76 94" fill="none" strokeWidth={4} />
    </>
  ),
  hisob: (
    <>
      <rect x={12} y={12} width={76} height={76} rx={14} fill="#f4a261" />
      <path d="M32 26V50M20 38H44" fill="none" stroke="#fff" strokeWidth={8} />
      <path d="M58 38H82" fill="none" stroke="#fff" strokeWidth={8} />
      <path d="M22 70H44M22 80H44" fill="none" stroke="#fff" strokeWidth={6} />
      <circle cx={70} cy={64} r={6} fill="#fff" />
      <circle cx={70} cy={80} r={6} fill="#fff" />
    </>
  ),
  shakl: (
    <>
      <circle cx={34} cy={36} r={22} fill="#e63946" />
      <path d="M66 14L90 56H42Z" fill="#ffd166" />
      <rect x={22} y={60} width={30} height={30} rx={3} fill="#3a86ff" />
      <path d="M72 62L86 76L72 90L58 76Z" fill="#52b788" />
    </>
  ),
  mantiq: (
    <>
      <path d="M50 10C30 10 20 26 22 40C24 50 32 54 34 64H66C68 54 76 50 78 40C80 26 70 10 50 10Z" fill="#ffd166" />
      <path d="M36 70H64M38 79H62M42 88H58" fill="none" strokeWidth={5} />
      <path d="M42 46L50 36L58 46M50 36V60" fill="none" stroke="#f77f00" strokeWidth={4} />
    </>
  ),
  yozuv: (
    <>
      <rect x={14} y={14} width={72} height={72} rx={6} fill="#fff" />
      <path d="M24 34H76M24 50H76M24 66H60" fill="none" stroke="#83c5be" strokeWidth={3} />
      <path d="M70 84L88 28L96 31L80 88Z" fill="#ffd166" />
      <path d="M70 84L80 88L72 96Z" fill="#3d2c1e" />
    </>
  ),
  sher: (
    <>
      <path d="M50 22C38 14 22 14 8 20V82C22 76 38 76 50 84Z" fill="#fefae0" />
      <path d="M50 22C62 14 78 14 92 20V82C78 76 62 76 50 84Z" fill="#fff" />
      <path d="M68 40V60M68 40L80 36V56" fill="none" stroke="#e76f51" strokeWidth={4} />
      <circle cx={64} cy={60} r={5} fill="#e76f51" />
      <circle cx={76} cy={56} r={5} fill="#e76f51" />
      <path d="M18 40H40M18 52H40M18 64H36" fill="none" stroke="#adb5bd" strokeWidth={3} />
    </>
  ),
}

export function StationIcon({ id, className }: { id: StationId; className?: string }) {
  const img = artUrl(`station/${id}`)
  if (img) return <ArtImg src={img} className={className} />
  return (
    <svg viewBox="0 0 100 100" className={`art ${className ?? ''}`}>
      <g stroke={INK} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">
        {STATION_ICONS[id]}
      </g>
    </svg>
  )
}

// ---------------- Qishloq bezaklari (mukofotlar) ----------------

export type DecorKind =
  | 'terak'
  | 'olma_daraxt'
  | 'anor_daraxt'
  | 'gul'
  | 'kungaboqar'
  | 'uy'
  | 'sori'
  | 'tandir'
  | 'quduq'
  | 'koza'
  | `hayvon_${AnimalId}`

export const DECOR_POOL: DecorKind[] = [
  'terak', 'olma_daraxt', 'anor_daraxt', 'gul', 'kungaboqar', 'uy', 'sori', 'tandir', 'quduq', 'koza',
  'hayvon_sigir', 'hayvon_qoy', 'hayvon_echki', 'hayvon_xoroz', 'hayvon_it', 'hayvon_mushuk', 'hayvon_ordak', 'hayvon_eshak',
]

const DECOR: Partial<Record<DecorKind, React.ReactNode>> = {
  gul: (
    <>
      <path d="M50 96V50M50 74C40 64 30 66 28 72C36 78 44 78 50 74Z" fill="#52b788" stroke="#2d6a4f" strokeWidth={3} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={50} cy={30} rx={9} ry={14} fill="#ef476f" transform={`rotate(${a} 50 42)`} />
      ))}
      <circle cx={50} cy={42} r={8} fill="#ffd166" />
    </>
  ),
  kungaboqar: (
    <>
      <path d="M50 98V52" stroke="#2d6a4f" strokeWidth={5} />
      <path d="M50 78C38 70 28 74 26 80C36 84 44 84 50 78Z" fill="#52b788" />
      {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => (
        <ellipse key={a} cx={50} cy={16} rx={6} ry={12} fill="#ffc43d" transform={`rotate(${a} 50 36)`} />
      ))}
      <circle cx={50} cy={36} r={13} fill="#6b4226" />
    </>
  ),
  sori: (
    <>
      <rect x={10} y={46} width={80} height={12} fill="#a0522d" />
      <path d="M14 58V90M86 58V90M50 58V90" stroke="#8d5524" strokeWidth={6} />
      <path d="M12 46V24H88V46" fill="none" stroke="#8d5524" strokeWidth={4} />
      <rect x={16} y={36} width={68} height={10} fill="#c1121f" />
      <path d="M20 41H80" stroke="#ffd166" strokeWidth={2} strokeDasharray="4 4" />
      <ellipse cx={50} cy={40} rx={10} ry={4} fill="#f8f9fa" />
    </>
  ),
  tandir: (
    <>
      <path d="M18 94C14 60 26 30 50 30C74 30 86 60 82 94Z" fill="#d4a373" />
      <ellipse cx={50} cy={34} rx={16} ry={6} fill="#6b4226" />
      <path d="M26 70H74M22 84H78" stroke="#a47148" strokeWidth={3} />
      <circle cx={70} cy={20} r={8} fill="#e9d8a6" />
      <circle cx={70} cy={20} r={3} fill="#c68b59" />
    </>
  ),
  quduq: (
    <>
      <path d="M20 26H80M24 26V60M76 26V60" fill="none" stroke="#8d5524" strokeWidth={6} />
      <path d="M16 26L50 8L84 26Z" fill="#a0522d" />
      <path d="M50 26V44" />
      <rect x={42} y={44} width={16} height={12} fill="#adb5bd" />
      <rect x={16} y={60} width={68} height={34} rx={4} fill="#adb5bd" />
      <path d="M16 72H84M16 84H84M40 60V72M60 72V84M34 84V94M66 84V94" stroke="#6c757d" strokeWidth={2} />
    </>
  ),
  koza: (
    <>
      <path d="M38 14H62V22C78 28 86 44 84 62C82 82 68 94 50 94C32 94 18 82 16 62C14 44 22 28 38 22Z" fill="#e07a5f" />
      <path d="M18 54H82" stroke="#1d4e89" strokeWidth={6} />
      <path d="M62 30C80 30 88 44 80 54" fill="none" stroke="#e07a5f" strokeWidth={6} />
    </>
  ),
}

export function DecorArt({ kind, className }: { kind: DecorKind; className?: string }) {
  const img = kind.startsWith('hayvon_') ? null : artUrl(`decor/${kind}`)
  if (img) return <ArtImg src={img} className={className} />
  if (kind.startsWith('hayvon_')) return <AnimalArt id={kind.slice(7) as AnimalId} className={className} />
  if (kind === 'terak') return <PoplarArt className={className} />
  if (kind === 'olma_daraxt') return <FruitTreeArt fruit="olma" className={className} />
  if (kind === 'anor_daraxt') return <FruitTreeArt fruit="anor" className={className} />
  if (kind === 'uy') return <HouseArt className={className} />
  return (
    <svg viewBox="0 0 100 100" className={`art ${className ?? ''}`}>
      <g stroke={INK} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
        {DECOR[kind]}
      </g>
    </svg>
  )
}
