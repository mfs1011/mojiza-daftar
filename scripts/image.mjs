// Rasmni qayta ishlash: dekodlash, yashil fonni kesish, kesib olish, kichraytirish, saqlash.
// gen-art (Gemini) va art-import (qo'lda yaratilgan rasmlar) ikkalasi ham shu funksiyalardan foydalanadi.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import jpeg from 'jpeg-js'
import { PNG } from 'pngjs'
import { keyOf } from './art.config.mjs'
import { ASSETS_DIR } from './lib.mjs'

export function decode(buf, mime) {
  if (mime.includes('jpeg') || mime.includes('jpg')) {
    const j = jpeg.decode(buf, { useTArray: true })
    return { width: j.width, height: j.height, data: j.data }
  }
  const p = PNG.sync.read(buf)
  return { width: p.width, height: p.height, data: p.data }
}

/** Xroma fonni olib tashlash (yashil / magenta / ko'k) + chetdagi rang "nuri"ni yo'qotish */
export function chromaKey(img, key = 'green') {
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]
    const g = d[i + 1]
    const b = d[i + 2]
    // Fon rangining boshqa kanallardan ustunligi
    const [excess, main] =
      key === 'green' ? [g - Math.max(r, b), g] : key === 'magenta' ? [Math.min(r, b) - g, Math.min(r, b)] : [b - Math.max(r, g), b]
    if (excess > 70 && main > 120) d[i + 3] = 0
    else if (excess > 25) {
      // Yarim shaffof chet: fon rangini neytrallaymiz
      d[i + 3] = Math.round(255 * Math.min(1, Math.max(0, (70 - excess) / 45)))
      if (key === 'green') d[i + 1] = Math.max(r, b)
      else if (key === 'magenta') {
        d[i] = Math.min(d[i], g + 20)
        d[i + 2] = Math.min(d[i + 2], g + 20)
      } else d[i + 2] = Math.max(r, g)
    }
  }
  return img
}

export function trim(img, pad = 8) {
  const { width: w, height: h, data: d } = img
  let x0 = w
  let y0 = h
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (d[(y * w + x) * 4 + 3] > 20) {
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
        y0 = Math.min(y0, y)
        y1 = Math.max(y1, y)
      }
  if (x1 < 0) return img
  x0 = Math.max(0, x0 - pad)
  y0 = Math.max(0, y0 - pad)
  x1 = Math.min(w - 1, x1 + pad)
  y1 = Math.min(h - 1, y1 + pad)
  const nw = x1 - x0 + 1
  const nh = y1 - y0 + 1
  const out = new Uint8Array(nw * nh * 4)
  for (let y = 0; y < nh; y++) out.set(d.subarray(((y + y0) * w + x0) * 4, ((y + y0) * w + x0 + nw) * 4), y * nw * 4)
  return { width: nw, height: nh, data: out }
}

/** Kichraytirish (o'rtacha qiymat bilan — sifatli) */
export function resize(img, maxSide) {
  const s = Math.min(1, maxSide / Math.max(img.width, img.height))
  if (s === 1) return img
  const w = Math.max(1, Math.round(img.width * s))
  const h = Math.max(1, Math.round(img.height * s))
  const out = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const sx0 = Math.floor(x / s)
      const sy0 = Math.floor(y / s)
      const sx1 = Math.min(img.width, Math.floor((x + 1) / s))
      const sy1 = Math.min(img.height, Math.floor((y + 1) / s))
      const acc = [0, 0, 0, 0]
      let n = 0
      for (let yy = sy0; yy < Math.max(sy0 + 1, sy1); yy++)
        for (let xx = sx0; xx < Math.max(sx0 + 1, sx1); xx++) {
          const i = (yy * img.width + xx) * 4
          const a = img.data[i + 3] / 255
          acc[0] += img.data[i] * a
          acc[1] += img.data[i + 1] * a
          acc[2] += img.data[i + 2] * a
          acc[3] += img.data[i + 3]
          n++
        }
      const o = (y * w + x) * 4
      const aa = acc[3] / n / 255 || 1
      out[o] = acc[0] / n / aa
      out[o + 1] = acc[1] / n / aa
      out[o + 2] = acc[2] / n / aa
      out[o + 3] = acc[3] / n
    }
  return { width: w, height: h, data: out }
}

export function save(path, img, asJpeg) {
  mkdirSync(dirname(path), { recursive: true })
  if (asJpeg) writeFileSync(path, jpeg.encode({ width: img.width, height: img.height, data: img.data }, 82).data)
  else {
    const p = new PNG({ width: img.width, height: img.height })
    p.data = Buffer.from(img.data)
    writeFileSync(path, PNG.sync.write(p, { colorType: 6 }))
  }
}

export const outPath = (a) => join(ASSETS_DIR, 'art', a.path + (a.kind === 'background' ? '.jpg' : '.png'))

/** Rasmda haqiqiy shaffof fon bormi (ChatGPT shaffof PNG bera oladi) */
export function hasAlpha(img) {
  let t = 0
  for (let i = 3; i < img.data.length; i += 16) if (img.data[i] < 20) t++
  return t > img.data.length / 16 / 50
}

/** Bitta rasmni asset sozlamasiga ko'ra tayyorlab, joyiga yozadi */
export function processAsset(a, img) {
  if (a.kind === 'object') img = trim(hasAlpha(img) ? img : chromaKey(img, keyOf(a)))
  img = resize(img, a.kind === 'background' ? a.width : a.size)
  save(outPath(a), img, a.kind === 'background')
  return img
}
