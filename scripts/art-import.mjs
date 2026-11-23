#!/usr/bin/env node
// Qo'lda (ChatGPT, Gemini ilovasi, Midjourney...) yaratilgan rasmlarni o'yinga qo'shish.
//
//   1) Rasmlarni art-inbox/ papkasiga docs/ART_PROMPTS.md dagi nom bilan saqlang
//      (masalan: fruit__olma.png, bg__garden.jpg)
//   2) npm run art:import
//
// Yashil fon avtomatik kesiladi (shaffof PNG bo'lsa — shundayligicha), o'lcham moslanadi,
// fonlar JPEG'ga o'giriladi va public/assets/art/ ga yoziladi.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync } from 'node:fs'
import { extname, join } from 'node:path'
import { ASSETS, inboxName } from './art.config.mjs'
import { decode, processAnim, processAsset } from './image.mjs'
import { ROOT, writeManifest } from './lib.mjs'

const INBOX = join(ROOT, 'art-inbox')
const DONE = join(INBOX, 'done')
if (!existsSync(INBOX)) {
  mkdirSync(INBOX, { recursive: true })
  console.log(`art-inbox/ papkasi yaratildi. Rasmlarni shu yerga qo'ying va qayta ishga tushiring.`)
  process.exit(0)
}
mkdirSync(DONE, { recursive: true })

const byName = new Map(ASSETS.map((a) => [inboxName(a), a]))
let ok = 0
const unknown = []
for (const f of readdirSync(INBOX)) {
  const ext = extname(f).toLowerCase()
  if (ext === '.gif') {
    // Animatsiya → sprite sheet (statik rasm ham bo'lsa, o'yin animatsiyani afzal ko'radi)
    const a = byName.get(f.slice(0, -ext.length))
    if (!a) {
      unknown.push(f)
      continue
    }
    try {
      const r = processAnim(a, readFileSync(join(INBOX, f)))
      renameSync(join(INBOX, f), join(DONE, f))
      ok++
      console.log(`✓ ${f} → ${a.path} animatsiya (${r.frames} kadr, ${r.fps} fps, ${r.fw}×${r.fh})`)
    } catch (e) {
      console.error(`✗ ${f}: ${e.message}`)
    }
    continue
  }
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    if (ext === '.webp') console.error(`✗ ${f}: WebP qo'llanmaydi — PNG yoki JPG qilib saqlang`)
    continue
  }
  const a = byName.get(f.slice(0, -ext.length))
  if (!a) {
    unknown.push(f)
    continue
  }
  try {
    const img = processAsset(a, decode(readFileSync(join(INBOX, f)), ext === '.png' ? 'image/png' : 'image/jpeg'))
    renameSync(join(INBOX, f), join(DONE, f))
    ok++
    console.log(`✓ ${f} → ${a.path} (${img.width}×${img.height})`)
  } catch (e) {
    console.error(`✗ ${f}: ${e.message}`)
  }
}
if (unknown.length) console.log(`\nNomi tanilmadi (docs/ART_PROMPTS.md dagi nomni tekshiring): ${unknown.join(', ')}`)
const missing = ASSETS.filter((a) => !existsSync(join(ROOT, 'public/assets/art', a.path + (a.kind === 'background' ? '.jpg' : '.png'))))
console.log(`\nQo'shildi: ${ok}. Hali yo'q: ${missing.length} ta${missing.length ? ' → ' + missing.map(inboxName).join(', ') : ''}`)
console.log(`Manifest: ${writeManifest()} ta fayl`)
