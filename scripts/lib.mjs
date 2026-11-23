// Skriptlar uchun umumiy yordamchilar: .env.local, Gemini so'rovi, manifest.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

export const ROOT = new URL('..', import.meta.url).pathname
export const ASSETS_DIR = join(ROOT, 'public/assets')

/** GEMINI_API_KEY: avval muhit o'zgaruvchisi, keyin .env.local (repoga kirmaydi) */
export function apiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  const f = join(ROOT, '.env.local')
  if (existsSync(f)) {
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\s*GEMINI_API_KEY\s*=\s*"?([^"\s]+)"?\s*$/)
      if (m) return m[1]
    }
  }
  console.error('GEMINI_API_KEY topilmadi. Loyiha ildizida .env.local fayliga yozing:\n  GEMINI_API_KEY=...')
  process.exit(1)
}

export async function gemini(model, body, key, tries = 4) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  for (let i = 1; ; i++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    })
    if (res.ok) return res.json()
    const text = await res.text()
    // Limit oshsa yoki server band bo'lsa — kutib, qayta urinamiz
    if ((res.status === 429 || res.status >= 500) && i < tries) {
      // Server aytgan kutish vaqti (retryDelay: "23s") bo'lsa — shunga amal qilamiz
      const wait = Number(/"retryDelay":\s*"(\d+)s"/.exec(text)?.[1] ?? 4 * i) * 1000
      await new Promise((r) => setTimeout(r, Math.min(wait + 1000, 70000)))
      continue
    }
    throw new Error(`${model}: HTTP ${res.status} ${text.slice(0, 300)}`)
  }
}

export function inlineData(json) {
  for (const c of json.candidates ?? []) for (const p of c.content?.parts ?? []) if (p.inlineData?.data) return p.inlineData
  throw new Error('Javobda rasm/ovoz yo\'q: ' + JSON.stringify(json).slice(0, 300))
}

/** public/assets ichidagi barcha fayllar ro'yxati: ilova qaysi asset borligini shundan biladi */
export function writeManifest() {
  const files = []
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n)
      if (statSync(p).isDirectory()) walk(p)
      else if (!n.startsWith('.') && !n.startsWith('_') && n !== 'manifest.json') files.push(relative(ASSETS_DIR, p))
    }
  }
  walk(ASSETS_DIR)
  files.sort()
  writeFileSync(join(ASSETS_DIR, 'manifest.json'), JSON.stringify({ files }, null, 1) + '\n')
  return files.length
}
