// Geometrik shakllar va bo'yoq ranglari: ma'lumotlar (JSX'siz — ovoz generatori Node'da ham o'qiydi).
// Hamma shakl 100×100 ichida bitta SVG yo'li: rasm uchun ham, teshik (kontur) uchun ham ishlatiladi.

export type ShapeId = 'doira' | 'kvadrat' | 'uchburchak' | 'tortburchak' | 'yulduz' | 'yurak' | 'romb' | 'oval'

export const SHAPE_PATH: Record<ShapeId, string> = {
  doira: 'M50 10A40 40 0 1 1 49.99 10Z',
  kvadrat: 'M14 14H86V86H14Z',
  uchburchak: 'M50 10L91 86H9Z',
  tortburchak: 'M5 28H95V72H5Z',
  yulduz: 'M50 5L61.5 37H95L67.5 57L78 91L50 70.5L22 91L32.5 57L5 37H38.5Z',
  yurak: 'M50 88C22 68 6 50 12 30C18 10 42 10 50 28C58 10 82 10 88 30C94 50 78 68 50 88Z',
  romb: 'M50 5L88 50L50 95L12 50Z',
  oval: 'M5 50A45 29 0 1 0 95 50A45 29 0 1 0 5 50Z',
}

export const SHAPE_NAMES: Record<ShapeId, string> = {
  doira: 'Doira',
  kvadrat: 'Kvadrat',
  uchburchak: 'Uchburchak',
  tortburchak: "To'g'ri to'rtburchak",
  yulduz: 'Yulduz',
  yurak: 'Yurak',
  romb: 'Romb',
  oval: 'Oval',
}

/** O'rganish tartibi: oddiydan murakkabga */
export const SHAPE_ORDER: ShapeId[] = ['doira', 'kvadrat', 'uchburchak', 'tortburchak', 'yulduz', 'yurak', 'romb', 'oval']

export type PaintId = 'qizil' | 'sariq' | 'kok' | 'yashil' | 'toqsariq' | 'binafsha' | 'pushti' | 'jigarrang' | 'qora' | 'oq'

export const PAINT_HEX: Record<PaintId, string> = {
  qizil: '#e63946',
  sariq: '#ffd166',
  kok: '#3a86ff',
  yashil: '#52b788',
  toqsariq: '#f77f00',
  binafsha: '#8e5bd6',
  pushti: '#ff8fab',
  jigarrang: '#8d5524',
  qora: '#2b2d42',
  oq: '#ffffff',
}

export const PAINT_NAMES: Record<PaintId, string> = {
  qizil: 'Qizil',
  sariq: 'Sariq',
  kok: "Ko'k",
  yashil: 'Yashil',
  toqsariq: "To'q sariq",
  binafsha: 'Binafsha',
  pushti: 'Pushti',
  jigarrang: 'Jigarrang',
  qora: 'Qora',
  oq: 'Oq',
}

/** O'rganish tartibi: asosiy ranglar avval */
export const PAINT_ORDER: PaintId[] = ['qizil', 'sariq', 'kok', 'yashil', 'toqsariq', 'binafsha', 'pushti', 'jigarrang', 'qora', 'oq']

/** Ranglarni aralashtirish: [a, b] → natija */
export const MIXES: [PaintId, PaintId, PaintId][] = [
  ['sariq', 'kok', 'yashil'],
  ['qizil', 'sariq', 'toqsariq'],
  ['qizil', 'kok', 'binafsha'],
  ['qizil', 'oq', 'pushti'],
]
