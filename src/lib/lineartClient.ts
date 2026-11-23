import type { Detail, LineArt } from './lineart'

const MAX_SIDE = 720

/** Fayl (kamera yoki galereya) → kichraytirilgan piksellar */
export async function loadImageData(file: Blob): Promise<ImageData> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  const w = Math.max(1, Math.round(bmp.width * scale))
  const h = Math.max(1, Math.round(bmp.height * scale))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bmp, 0, 0, w, h)
  bmp.close()
  return ctx.getImageData(0, 0, w, h)
}

let worker: Worker | null = null
let seq = 0
const pending = new Map<number, (a: LineArt) => void>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./lineart.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<{ id: number; art: LineArt }>) => {
      pending.get(e.data.id)?.(e.data.art)
      pending.delete(e.data.id)
    }
  }
  return worker
}

export function lineArtAsync(img: ImageData, detail: Detail): Promise<LineArt> {
  const id = ++seq
  return new Promise((resolve) => {
    pending.set(id, (art) => {
      // Vektor chiziqlardan piksel niqobi: bo'yashda chiziq ustiga bosilganini va
      // chizish qamrovini aniqlash uchun
      const c = document.createElement('canvas')
      c.width = art.w
      c.height = art.h
      const g = c.getContext('2d', { willReadFrequently: true })!
      drawPaths(g, art, { color: '#000', width: art.thickness })
      const d = g.getImageData(0, 0, art.w, art.h).data
      const lines = new Uint8Array(art.w * art.h)
      for (let i = 0; i < lines.length; i++) lines[i] = d[i * 4 + 3] > 60 ? 1 : 0
      resolve({ ...art, lines })
    })
    // Har bir ish uchun nusxa: asl piksellar keyingi variantlar uchun kerak
    const rgba = new Uint8ClampedArray(img.data)
    getWorker().postMessage({ id, rgba, w: img.width, h: img.height, detail }, [rgba.buffer])
  })
}

/**
 * Chiziqlarni canvasga vektor sifatida chizish.
 * scale: canvas o'lchami / rasm o'lchami (ekran aniqligida tiniq chizish uchun).
 * dash: uzuq chiziq (albomdagidek "ustidan chizib chiq" sahifasi).
 */
export function drawPaths(
  ctx: CanvasRenderingContext2D,
  art: LineArt,
  o: { color: string; width: number; scale?: number; dash?: boolean },
) {
  const k = o.scale ?? 1
  ctx.save()
  ctx.strokeStyle = o.color
  ctx.lineWidth = o.width * k
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (o.dash) ctx.setLineDash([o.width * k * 1.5, o.width * k * 1.7])
  for (const p of art.paths) {
    ctx.beginPath()
    ctx.moveTo(p[0] * k, p[1] * k)
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i] * k, p[i + 1] * k)
    ctx.stroke()
  }
  ctx.restore()
}
