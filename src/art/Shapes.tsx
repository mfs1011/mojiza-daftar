// Shakl va bo'yoq rasmlari (ma'lumotlar: lib/shapes.ts).
import { PAINT_HEX, SHAPE_PATH, type PaintId, type ShapeId } from '../lib/shapes'

export * from '../lib/shapes'

export function ShapeArt({ shape, color, outline, className }: { shape: ShapeId; color?: PaintId; outline?: boolean; className?: string }) {
  return (
    <svg viewBox="-4 -4 108 108" className={`art ${className ?? ''}`}>
      {outline ? (
        <path d={SHAPE_PATH[shape]} fill="#00000022" stroke="#3d2c1e" strokeWidth={4} strokeDasharray="8 6" strokeLinejoin="round" />
      ) : (
        <path d={SHAPE_PATH[shape]} fill={PAINT_HEX[color ?? 'qizil']} stroke="#3d2c1e" strokeWidth={4} strokeLinejoin="round" />
      )}
    </svg>
  )
}

/** Bo'yoq dog'i (rang topish uchun) */
export function PaintBlob({ color }: { color: PaintId }) {
  return (
    <svg viewBox="0 0 100 100" className="art">
      <path
        d="M50 8C66 8 70 20 80 24C92 30 94 46 88 58C84 68 92 78 82 88C72 96 60 88 50 92C38 96 26 94 18 84C10 74 14 64 10 54C6 42 10 28 22 22C32 16 36 8 50 8Z"
        fill={PAINT_HEX[color]}
        stroke="#3d2c1e"
        strokeWidth={4}
      />
      <ellipse cx={36} cy={34} rx={10} ry={6} fill="#ffffff66" />
    </svg>
  )
}
