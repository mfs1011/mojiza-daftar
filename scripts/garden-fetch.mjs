#!/usr/bin/env node
// 3D bog' uchun realistik CC0 assetlar — Poly Haven (polyhaven.com, hammasi CC0).
//
//   node scripts/garden-fetch.mjs
//
// • Modellar (glTF 1k): olma, nok, anor, to'qilgan savat → public/assets/garden/<id>/
//   teksturalar telefon uchun kichraytiriladi (mevalar 512 px, savat 1024 px)
// • Teksturalar: o'tloq yer, daraxt po'stlog'i, barg fotosi → public/assets/garden/tex/
// • HDRI osmon: yorug'lik (1k .hdr) va fon (tonemapped JPG, 2048 px) → public/assets/garden/sky/
// Mualliflik docs/AUDIO_CREDITS.md emas, public/assets/garden/CREDITS.md ga yoziladi.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { ASSETS_DIR } from './lib.mjs'

const OUT = join(ASSETS_DIR, 'garden')
const UA = { 'User-Agent': 'mojiza-daftar-asset-fetch' }

const MODELS = [
  { id: 'food_apple_01', tex: 512 },
  { id: 'food_pears_asian_01', tex: 512 },
  { id: 'food_pomegranate_01', tex: 512 },
  { id: 'wicker_basket_01', tex: 1024 },
]
/** [polyhaven id, kerakli xaritalar, saqlanadigan nom] */
const TEXTURES = [
  ['leafy_grass', ['diff', 'nor_gl', 'arm'], 'grass'],
  ['bark_brown_02', ['diff', 'nor_gl'], 'bark'],
  ['weathered_brown_planks', ['diff', 'nor_gl'], 'wood'],
]
const LEAF = { model: 'tree_small_02', maps: ['leaves_diff', 'leaves_nor_gl'] }
const HDRI = 'kloofendal_48d_partly_cloudy_puresky'

async function json(url) {
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json()
}
async function save(url, file) {
  mkdirSync(dirname(file), { recursive: true })
  if (existsSync(file)) return
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  writeFileSync(file, Buffer.from(await r.arrayBuffer()))
}
/** JPG ni kichraytirish (macOS sips; bo'lmasa ffmpeg) */
function shrink(file, px) {
  const r = spawnSync('sips', ['-Z', String(px), file], { stdio: 'ignore' })
  if (r.status !== 0) spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-vf', `scale='min(${px},iw)':-2`, '-q:v', '3', file + '.tmp.jpg'])
}

const credits = []

for (const m of MODELS) {
  const files = await json(`https://api.polyhaven.com/files/${m.id}`)
  const g = files.gltf['1k'].gltf
  const dir = join(OUT, m.id)
  await save(g.url, join(dir, `${m.id}.gltf`))
  for (const [rel, v] of Object.entries(g.include)) {
    const f = join(dir, rel)
    await save(v.url, f)
    if (f.endsWith('.jpg')) shrink(f, m.tex)
  }
  credits.push(`| garden/${m.id}/ | [${m.id}](https://polyhaven.com/a/${m.id}) | CC0 |`)
  console.log(`✓ model ${m.id}`)
}

for (const [id, maps, name] of TEXTURES) {
  const files = await json(`https://api.polyhaven.com/files/${id}`)
  for (const map of maps) {
    const key = Object.keys(files).find((k) => k.toLowerCase().replace(/ /g, '_') === map) ?? (map === 'nor_gl' ? 'nor_gl' : map === 'diff' ? 'Diffuse' : map)
    const src = files[key]?.['1k']?.jpg ?? files[map]?.['1k']?.jpg
    if (!src) {
      console.log(`  · ${id}: ${map} topilmadi (${Object.keys(files).join(',')})`)
      continue
    }
    await save(src.url, join(OUT, 'tex', `${name}_${map}.jpg`))
  }
  credits.push(`| garden/tex/${name}_* | [${id}](https://polyhaven.com/a/${id}) | CC0 |`)
  console.log(`✓ tekstura ${id}`)
}

{
  const files = await json(`https://api.polyhaven.com/files/${LEAF.model}`)
  const inc = files.gltf['1k'].gltf.include
  for (const map of LEAF.maps) {
    const k = Object.keys(inc).find((x) => x.includes(`${LEAF.model}_${map}_1k`))
    await save(inc[k].url, join(OUT, 'tex', `leaf_${map.replace('leaves_', '')}.jpg`))
  }
  credits.push(`| garden/tex/leaf_* | [${LEAF.model}](https://polyhaven.com/a/${LEAF.model}) barg teksturasi | CC0 |`)
  console.log('✓ barg teksturasi')
}

{
  const files = await json(`https://api.polyhaven.com/files/${HDRI}`)
  await save(files.hdri['1k'].hdr.url, join(OUT, 'sky', 'sky_1k.hdr'))
  const bg = join(OUT, 'sky', 'sky_bg.jpg')
  if (!existsSync(bg)) {
    const raw = join(OUT, 'sky', '_tonemapped.jpg')
    await save(files.tonemapped.url, raw)
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', 'scale=2048:1024', '-q:v', '4', bg])
    spawnSync('rm', [raw])
  }
  credits.push(`| garden/sky/ | [${HDRI}](https://polyhaven.com/a/${HDRI}) | CC0 |`)
  console.log('✓ osmon (HDRI)')
}

writeFileSync(
  join(OUT, 'CREDITS.md'),
  "# Bog' (3D) assetlari\n\nHammasi [Poly Haven](https://polyhaven.com) — CC0 (jamoat mulki).\n\n| Fayl | Manba | Litsenziya |\n|---|---|---|\n" +
    credits.join('\n') +
    '\n',
)
