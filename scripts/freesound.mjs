#!/usr/bin/env node
// Freesound.org'dan toza (CC0) ovozlar topish va audio-inbox/ ga tayyorlash.
//
//   npm run sfx:fetch                 # hammasi (borlari o'tkazib yuboriladi)
//   npm run sfx:fetch -- --only sigir,quduq --force
//   keyin: npm run audio:import
//
// Har ovoz uchun: CC0 natijalar reyting bo'yicha → eng yaxshi 6 tasining HQ preview'i yuklanadi →
// har biri o'lchanadi (shovqin darajasi / SNR, davomiylik) → eng tozasidan asosiy tovush kesiladi
// (bosh-oxiri jimlikkacha, yumshoq so'nish bilan). Manba docs/AUDIO_CREDITS.md ga yoziladi.
// Kalit: .env.local → FREESOUND_API_KEY=... (freesound.org/apiv2/apply, "Client secret/Api key")
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ASSETS_DIR, ROOT } from './lib.mjs'

const INBOX = join(ROOT, 'audio-inbox')
const TMP = join(INBOX, '.freesound')
const CREDITS = join(ROOT, 'docs/AUDIO_CREDITS.md')
mkdirSync(TMP, { recursive: true })

function key() {
  if (process.env.FREESOUND_API_KEY) return process.env.FREESOUND_API_KEY
  const m = readFileSync(join(ROOT, '.env.local'), 'utf8').match(/^\s*FREESOUND_API_KEY\s*=\s*"?([^"\s]+)"?/m)
  if (!m) throw new Error('FREESOUND_API_KEY topilmadi (.env.local)')
  return m[1]
}
const KEY = key()

/**
 * Kerakli ovozlar. type → audio-import turi; out → fayl nomi; q → qidiruv; dur → [min,max] manba davomiyligi;
 * max → kesilgan tovushning eng uzun davomiyligi (s); n → nechta variant
 */
const WANT = [
  // Hayvonlar (ferma o'yini: bola ovozdan taniydi — toza, bitta hayvon, bolabop)
  { type: 'animal', out: 'sigir', must: /\b(cow|moo|calf|cattle)/i, q: 'cow moo', dur: [1, 8], max: 2.2, n: 2 },
  { type: 'animal', out: 'qoy', must: /\b(sheep|lamb|ewe)/i, not: /goat/i, q: 'sheep baa', dur: [0.5, 6], max: 1.6, n: 3 },
  { type: 'animal', out: 'echki', must: /\bgoat/i, not: /sheep|oveja|lamb|ewe/i, q: 'goat bleat', dur: [0.5, 6], max: 1.6, n: 2 },
  { type: 'animal', out: 'xoroz', must: /rooster|cockerel|crow|quiquiri|cock-a/i, q: 'rooster crow', dur: [1, 10], max: 2.6, n: 2 },
  { type: 'animal', out: 'it', must: /\b(dog|puppy|pup)\b/i, q: 'dog bark', dur: [0.3, 5], max: 1.2, n: 3 },
  { type: 'animal', out: 'mushuk', must: /\b(cat|kitten|kitty|meow)/i, q: 'cat meow', dur: [0.3, 5], max: 1.3, n: 3 },
  { type: 'animal', out: 'ordak', must: /\b(duck|mallard|quack)/i, q: 'duck quack', dur: [0.3, 6], max: 1.3, n: 2 },
  { type: 'animal', out: 'eshak', must: /\b(donkey|bray|burro)/i, q: 'donkey bray', dur: [1, 10], max: 2.5, n: 2 },
  // Yangi hayvonlar (soyalar o'yini va albom uchun)
  { type: 'animal', out: 'ot', must: /\b(horse|neigh|whinny|pony)/i, not: /hoof|gallop|carriage|trot/i, q: 'horse neigh', dur: [0.5, 8], max: 2.2, n: 2 },
  { type: 'animal', out: 'tuya', must: /\bcamel/i, q: 'camel grunt', dur: [0.5, 30], max: 2.5, n: 1 },
  { type: 'animal', out: 'tovuq', must: /\b(hen|chicken|cluck)/i, not: /rooster|crow|chick\b|frying|cook/i, q: 'chicken hen cluck', dur: [0.5, 10], max: 2, n: 2 },
  { type: 'animal', out: 'joja', must: /\b(chick|chicks|peep|cheep)/i, not: /rooster|frying/i, q: 'chicks chirping', dur: [0.5, 30], max: 1.6, n: 2 },
  { type: 'animal', out: 'goz', must: /\bgoose|geese|honk/i, not: /car|horn|traffic/i, q: 'goose honk', dur: [0.3, 8], max: 1.6, n: 2 },
  { type: 'animal', out: 'fil', must: /elephant/i, q: 'elephant trumpet', dur: [0.5, 10], max: 2.5, n: 1 },
  { type: 'animal', out: 'sher', must: /\blion/i, not: /sea lion/i, q: 'lion roar', dur: [0.5, 10], max: 2.5, n: 1 },
  { type: 'animal', out: 'ari', must: /\bbee|bees|bumble|buzz/i, not: /electric|razor|phone|fly\b|firecracker|cracker|fire/i, q: 'bumblebee buzzing', dur: [0.5, 10], max: 2, n: 1 },
  { type: 'animal', out: 'hakka', must: /magpie/i, q: 'magpie', dur: [0.3, 15], max: 1.8, n: 1 },
  // Ovoz chiqarmaydigan / kam ovozli hayvonlar — xarakterli tovush (bola eshitib taniydi)
  { type: 'animal', out: 'quyon', must: /rabbit|bunny|hare/i, not: /trap|gun|hunt/i, q: 'rabbit', dur: [0.3, 20], max: 1.5, n: 1 },
  { type: 'animal', out: 'baliq', must: /bubble|bubbles|blub/i, not: /pop|wrap|gum|machine/i, q: 'underwater bubbles', dur: [0.5, 15], max: 1.6, n: 1 },
  { type: 'animal', out: 'kapalak', must: /flutter|wing|flap/i, not: /bird|pigeon|dove|helicopter|flag|chicken|duck/i, q: 'soft wing flutter', dur: [0.2, 20], max: 1.2, n: 1, snr: 22 },
  { type: 'animal', out: 'toshbaqa', must: /turtle|tortoise/i, not: /breed|mating|mate|sex/i, q: 'turtle', dur: [0.3, 60], max: 1.8, n: 1, snr: 22 },
  { type: 'animal', out: 'ayiq', must: /bears?|grizzly/i, not: /trap|teddy|beer|bearing/i, q: 'bear', dur: [0.5, 60], max: 2, n: 1, snr: 22 },
  { type: 'animal', out: 'jirafa', must: /giraffe/i, q: 'giraffe', dur: [0.3, 120], max: 2, n: 1, snr: 18 },
  { type: 'animal', out: 'laylak', must: /stork/i, q: 'stork', dur: [0.3, 120], max: 2, n: 1, snr: 18 },
  { type: 'animal', out: 'zebra', must: /zebra/i, not: /bass|music|synth|crossing|beat|delay|deelay/i, q: 'zebra', dur: [0.3, 120], max: 2, n: 1, snr: 18 },
  { type: 'animal', out: 'chumoli', must: /footstep|scurry|crawl|patter|tiny|tap/i, not: /cockroach|spider|creepy|horror|shoe|heel|boot/i, q: 'tiny footsteps', dur: [0.2, 20], max: 1.2, n: 1, snr: 25 },
  { type: 'animal', out: 'ilon', must: /hiss|snake/i, not: /steam|cat|tire|tyre|air|gas/i, q: 'snake hiss', dur: [0.3, 15], max: 1.6, n: 1 },
  // Hovli narsalari (bosganda)
  { type: 'sfx', out: 'obj-terak', must: /leaf|leaves|rustl/i, not: /snap|break|crack/i, q: 'leaves rustle', dur: [0.5, 6], max: 1.2, n: 1 },
  { type: 'sfx', out: 'obj-olma_daraxt', q: 'tree branch shake leaves', dur: [0.5, 6], max: 1.2, n: 1 },
  { type: 'sfx', out: 'obj-anor_daraxt', q: 'bush leaves rustle', dur: [0.5, 6], max: 1.2, n: 1 },
  { type: 'sfx', out: 'obj-gul', q: 'magic sparkle chime', dur: [0.3, 4], max: 1.2, n: 1 },
  { type: 'sfx', out: 'obj-kungaboqar', q: 'bee buzz', dur: [0.5, 6], max: 1.3, n: 1 },
  { type: 'sfx', out: 'obj-uy', q: 'knock wooden door', dur: [0.3, 4], max: 1.2, n: 1 },
  { type: 'sfx', out: 'obj-sori', q: 'wood creak', dur: [0.3, 4], max: 1.0, n: 1 },
  { type: 'sfx', out: 'obj-tandir', q: 'fire crackle', dur: [1, 10], max: 1.4, n: 1 },
  { type: 'sfx', out: 'obj-quduq', must: /water|splash/i, not: /wd-40|oil|plastic/i, q: 'water splash bucket', dur: [0.3, 5], max: 1.4, n: 1 },
  { type: 'sfx', out: 'obj-koza', must: /ceramic|clay|pot|jar|clink|porcelain/i, q: 'ceramic clink', dur: [0.2, 4], max: 1.0, n: 1 },
  // O'yin effektlari (sintez o'rniga)
  { type: 'sfx', out: 'tap', q: 'soft click ui', dur: [0.05, 1], max: 0.25, n: 1 },
  { type: 'sfx', out: 'pop', must: /pop|bubble/i, not: /potion|cork|bottle/i, q: 'bubble pop', dur: [0.05, 1.5], max: 0.4, n: 1 },
  { type: 'sfx', out: 'wrong', must: /wrong|error|fail|boing|bonk|negative|incorrect/i, not: /buzzer|alarm|siren|horror/i, q: 'wrong answer cute', dur: [0.1, 2], max: 0.7, n: 1 },
  { type: 'sfx', out: 'coin', q: 'coin pickup', dur: [0.1, 2], max: 0.8, n: 1 },
  { type: 'sfx', out: 'success', q: 'success chime short', dur: [0.2, 3], max: 1.2, n: 1 },
  { type: 'sfx', out: 'magic', q: 'magic wand sparkle', dur: [0.3, 4], max: 1.5, n: 1 },
  { type: 'sfx', out: 'whoosh', must: /whoosh|swoosh|swish|woosh/i, q: 'whoosh', dur: [0.2, 2], max: 0.8, n: 1 },
  { type: 'sfx', out: 'rustle', must: /leaf|leaves|rustl|bush/i, q: 'leaves rustle', dur: [0.3, 4], max: 0.9, n: 1 },
  { type: 'sfx', out: 'thump', must: /thud|thump|drop|plop/i, q: 'soft thud', dur: [0.1, 2], max: 0.5, n: 1 },
  // Muhit ovozlari (bekat foni ostida juda past, uzluksiz)
  { type: 'ambience', out: 'bog', must: /bird|birds|garden|orchard|spring/i, not: /crow|seagull|traffic|road|city|rain/i, q: 'birds ambience garden', dur: [25, 120], max: 36, n: 1, keep: true },
  { type: 'ambience', out: 'ferma', must: /farm|countryside|barn|rural|village/i, not: /traffic|tractor|machine|engine|bell/i, q: 'farm ambience', dur: [25, 120], max: 36, n: 1, keep: true },
  { type: 'ambience', out: 'bozor', must: /market|bazaar|crowd|walla/i, not: /stadium|cheer|applause|protest/i, q: 'market crowd ambience', dur: [25, 120], max: 36, n: 1, keep: true },
  { type: 'ambience', out: 'ustaxona', must: /fire|fireplace|crackl/i, q: 'fireplace crackling', dur: [25, 120], max: 36, n: 1, keep: true },
  { type: 'ambience', out: 'qora', must: /cricket|night/i, not: /city|traffic|frog chorus loud|train|horn|car|road|siren/i, q: 'crickets night', dur: [25, 120], max: 36, n: 1, keep: true },
  { type: 'ambience', out: 'harflar', must: /clock|tick/i, not: /alarm|bomb/i, q: 'clock ticking', dur: [15, 120], max: 24, n: 1, keep: true },
  // Jingle'lar
  { type: 'music', out: 'jingle-win', must: /win|success|victory|fanfare|complete|achievement|level up/i, not: /fail|lose|game over/i, q: 'success fanfare', dur: [1, 6], max: 4, n: 1, keep: true },
  { type: 'music', out: 'jingle-start', must: /start|begin|ready|intro|level/i, not: /fail|lose|game over|engine|car|battle|war|fight|boss/i, q: 'cute game start', dur: [0.5, 4], max: 3, n: 1, keep: true },
  { type: 'music', out: 'jingle-sticker', q: 'reward chime collect', dur: [0.4, 3], max: 2.5, n: 1, keep: true },
]

/** Hayvon ovozlari: haqiqiy hayvon bo'lishi shart */
const ANIMAL_BAN = /rubber|toy|squeak|snare|drum|synth|imitat|impression|human|vocal|voice|cartoon|8.?bit|chiptune|remix|music|loop|beat|kick|plush|robot|game/i

/** Effektlar: odam ovozi, qo'rqinchli yoki musiqiy bo'lmasin */
const SFX_BAN = /scream|horror|scary|gun|explosion|voice|vocal|speech|music|song|loop/i

const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null
const force = args.includes('--force')

async function api(path, params) {
  const url = `https://freesound.org/apiv2/${path}?` + new URLSearchParams(params)
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { Authorization: `Token ${KEY}` } })
    if (r.ok) return r.json()
    if (r.status === 429) {
      await new Promise((x) => setTimeout(x, 3000 * (i + 1)))
      continue
    }
    throw new Error(`Freesound ${r.status}: ${(await r.text()).slice(0, 200)}`)
  }
}

/** 10 ms kadrlar energiyasi (dB) */
function frames(file) {
  const R = 16000
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(R), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 })
  const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4)
  const db = []
  for (let i = 0; i + 160 <= x.length; i += 160) {
    let e = 0
    for (let k = i; k < i + 160; k++) e += x[k] * x[k]
    db.push(10 * Math.log10(e / 160 + 1e-12))
  }
  return db
}

/** Sifat: SNR (cho'qqi − eng jim 10%), asosiy hodisaning chegaralari */
function analyse(file, max) {
  const db = frames(file)
  if (db.length < 5) return null
  const sorted = [...db].sort((a, b) => a - b)
  const floor = sorted[Math.floor(sorted.length * 0.1)]
  const peak = sorted[sorted.length - 1]
  const thr = Math.max(floor + 12, peak - 32)
  // Eng baland kadr atrofidagi uzluksiz hodisa (orasidagi 80 ms gacha sukut — bitta hodisa)
  const top = db.indexOf(peak)
  let a = top
  let b = top
  const on = (i) => db[i] > thr
  while (a > 0 && (on(a - 1) || (a > 8 && [...Array(8)].some((_, k) => on(a - 1 - k))))) a--
  while (b < db.length - 1 && (on(b + 1) || [...Array(8)].some((_, k) => on(b + 1 + k)))) b++
  let start = Math.max(0, a - 3) / 100
  let end = Math.min(db.length, b + 8) / 100
  if (end - start > max) end = start + max
  return { snr: peak - floor, start, end, len: end - start }
}

const rows = []
/** Almashtirilgan fayllar: eski manba qatori jurnaldan olib tashlanadi */
const replaced = new Set()

for (const w of WANT) {
  if (only && !only.includes(w.out)) continue
  const existing = join(ASSETS_DIR, w.type === 'animal' ? 'sfx/animals' : w.type === 'music' ? 'music' : w.type === 'ambience' ? 'ambience' : 'sfx', `${w.out}.m4a`)
  if (!force && existsSync(existing) && w.type !== 'animal') {
    console.log(`· ${w.out}: bor, o'tkazildi`)
    continue
  }
  const res = await api('search/text/', {
    query: w.q,
    filter: `license:"Creative Commons 0" duration:[${w.dur[0]} TO ${w.dur[1]}]`,
    fields: 'id,name,username,duration,avg_rating,num_ratings,previews,url,tags,description',
    sort: 'rating_desc',
    page_size: '30',
  })
  const cand = []
  // Nomi/teglari mos kelishi shart; o'yinchoq, sintez, odam taqlidi va h.k. — yo'q
  const text = (r) => `${r.name} ${(r.tags ?? []).join(' ')}`
  const ok = (r) =>
    // Majburiy so'z — faqat NOMDA (teglar ko'pincha tasodifiy so'zlarga to'la)
    (!w.must || w.must.test(r.name)) && !(w.not && w.not.test(text(r))) && !(w.type === 'animal' && ANIMAL_BAN.test(text(r))) && !(w.type === 'sfx' && SFX_BAN.test(text(r)))
  for (const r of res.results.filter(ok).slice(0, 8)) {
    const f = join(TMP, `${r.id}.mp3`)
    if (!existsSync(f)) {
      const b = await fetch(r.previews['preview-hq-mp3'])
      if (!b.ok) continue
      writeFileSync(f, Buffer.from(await b.arrayBuffer()))
    }
    // Muhit: hodisa emas, uzluksiz bo'lak (boshidagi 2 s — kirish, tashlanadi)
    const a =
      w.type === 'ambience'
        ? { snr: 99, start: Math.min(2, r.duration * 0.1), len: Math.min(w.max, r.duration - 3), end: 0 }
        : analyse(f, w.max)
    if (!a || a.len < 0.08) continue
    // Ball: tozalik (SNR) asosiy, reyting yordamchi
    cand.push({ r, f, a, score: a.snr + (r.avg_rating ?? 3) * 3 + Math.min(r.num_ratings ?? 0, 30) * 0.2 })
  }
  cand.sort((x, y) => y.score - x.score)
  const pickd = []
  for (const c of cand) {
    if (c.a.snr < (w.snr ?? 35)) continue // shovqinli — olmaymiz
    if (pickd.some((p) => p.r.username === c.r.username) && cand.length > w.n * 2) continue
    pickd.push(c)
    if (pickd.length >= w.n) break
  }
  if (!pickd.length) {
    console.log(`✗ ${w.out}: toza (SNR ≥ ${w.snr ?? 35}) yozuv topilmadi — ${cand.map((c) => Math.round(c.a.snr)).join(', ')}`)
    continue
  }
  pickd.forEach((c, i) => {
    const name = i === 0 ? w.out : `${w.out}-${i + 1}`
    const fade = Math.min(0.15, c.a.len * 0.25)
    const out = join(INBOX, `${w.type}__${name}.wav`)
    const af = w.keep
      ? `afade=t=out:st=${(c.a.len - fade).toFixed(3)}:d=${fade.toFixed(3)}`
      : `highpass=f=60,afade=t=in:d=0.01,afade=t=out:st=${(c.a.len - fade).toFixed(3)}:d=${fade.toFixed(3)}`
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(c.a.start), '-t', c.a.len.toFixed(3), '-i', c.f, '-af', af, out])
    const rel = `${w.type === 'animal' ? 'sfx/animals' : w.type === 'music' ? 'music' : w.type === 'ambience' ? 'ambience' : 'sfx'}/${name}.m4a`
    console.log(`✓ ${name.padEnd(16)} SNR ${Math.round(c.a.snr)} dB, ${c.a.len.toFixed(2)} s ← #${c.r.id} "${c.r.name.slice(0, 40)}" (${c.r.username})`)
    replaced.add(rel)
    rows.push(`| \`${rel}\` | [${c.r.name.replace(/\|/g, '/')}](${c.r.url}) | ${c.r.username} | CC0 | ${new Date().toISOString().slice(0, 10)} |`)
  })
}

if (rows.length) {
  const s = readFileSync(CREDITS, 'utf8')
    .split('\n')
    .filter((l) => ![...replaced].some((rel) => l.startsWith('| `' + rel + '`')))
    .join('\n')
  const anchor = '\n\nHayvon ovozlari Wikimedia'
  writeFileSync(CREDITS, s.includes(anchor) ? s.replace(anchor, '\n' + rows.join('\n') + anchor) : s + '\n' + rows.join('\n') + '\n')
  console.log(`\nAUDIO_CREDITS.md: ${rows.length} ta yozuv qo'shildi`)
}
console.log('\nKeyin: npm run audio:import')
