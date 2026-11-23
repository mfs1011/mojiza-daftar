#!/usr/bin/env node
// Rasmlarni Gemini (Nano Banana) bilan yaratish.
//
//   npm run gen:art                 # hali yo'q rasmlarni yaratadi
//   npm run gen:art -- --only fruit # faqat yo'li "fruit" bilan boshlanganlar
//   npm run gen:art -- --force      # borlarini ham qayta yaratadi
//   GEN_IMAGE_MODEL=gemini-3-pro-image npm run gen:art   # boshqa model
//
// Uslub bir xil bo'lishi uchun birinchi yaratilgan maskot rasmi keyingi so'rovlarga "uslub namunasi"
// sifatida qo'shiladi. Fonsiz obyektlar yashil (#00FF00) fonda yaratilib, fon kesib olinadi.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ASSETS, fullPrompt } from './art.config.mjs'
import { decode, outPath, processAsset } from './image.mjs'
import { apiKey, ASSETS_DIR, gemini, inlineData, writeManifest } from './lib.mjs'

const MODEL = process.env.GEN_IMAGE_MODEL ?? 'gemini-3.1-flash-image-preview'
const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const force = args.includes('--force')
const key = apiKey()

let styleRef = null
const refPath = join(ASSETS_DIR, 'art', 'mascot/idle.png')
if (existsSync(refPath)) styleRef = readFileSync(refPath).toString('base64')

const todo = ASSETS.filter((a) => (!only || a.path.startsWith(only)) && (force || !existsSync(outPath(a))))
console.log(`Model: ${MODEL}. Yaratiladi: ${todo.length} ta rasm`)
let done = 0
const failed = []
for (const a of todo) {
  const parts = [{ text: fullPrompt(a) }]
  if (styleRef && a.path !== 'mascot/idle') {
    parts.unshift({ inlineData: { mimeType: 'image/png', data: styleRef } })
    parts[1].text = 'Use the attached image ONLY as a style reference (rendering, materials, colors, lighting), not as content. ' + parts[1].text
  }
  const body = {
    contents: [{ parts }],
    generationConfig: { responseModalities: ['IMAGE'], ...(a.aspect ? { imageConfig: { aspectRatio: a.aspect } } : {}) },
  }
  try {
    const data = inlineData(await gemini(MODEL, body, key))
    const img = processAsset(a, decode(Buffer.from(data.data, 'base64'), data.mimeType ?? 'image/png'))
    if (a.path === 'mascot/idle') styleRef = readFileSync(outPath(a)).toString('base64')
    done++
    console.log(`✓ ${a.path} (${img.width}×${img.height})`)
  } catch (e) {
    failed.push(a.path)
    console.error(`✗ ${a.path}: ${e.message}`)
  }
}
console.log(`\nTayyor: ${done}, xato: ${failed.length}${failed.length ? ' → ' + failed.join(', ') : ''}`)
console.log(`Manifest: ${writeManifest()} ta fayl`)
