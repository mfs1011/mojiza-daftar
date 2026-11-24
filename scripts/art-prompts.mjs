#!/usr/bin/env node
// docs/ART_PROMPTS.md ni art.config.mjs dan yasaydi (promptlar bitta joyda — nusxalar farq qilib ketmaydi).
//   npm run art:prompts
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ASSETS, fullPrompt, inboxName, motionPrompt } from './art.config.mjs'
import { ROOT } from './lib.mjs'

const GROUPS = [
  ['mascot/', '🐦 Maskot — Popishak (ENG BIRINCHI shuni yarating)'],
  ['bg/', '🏞️ Fonlar (16:9, landshaft)'],
  ['fruit/', '🍎 Mevalar'],
  ['animal/', '🐑 Hayvonlar'],
  ['person/', '🧕 Odamlar (bozor mijozlari, kasblar)'],
  ['veg/', '🥕 Sabzavotlar'],
  ['obj/', '🏠 Buyumlar'],
  ['nature/', '☀️ Tabiat'],
  ['station/', '🗺️ Xarita bekatlari'],
  ['decor/', "🌳 Qishloq bezaklari (sovg'alar)"],
  ['tile/', '🏺 Naqsh plitkalari'],
  ['icon/', '🔘 Tugma ikonkalari'],
  ['ui/', '🧺 Boshqa'],
]

const ext = (a) => (a.kind === 'background' ? 'jpg' : 'png')
const ratio = (a) => (a.kind === 'background' ? '16:9 (landshaft)' : '1:1 (kvadrat)')

let md = `# Rasm promptlari (ChatGPT / Gemini uchun)

> Bu fayl avtomatik yasalgan: \`npm run art:prompts\`. Promptni o'zgartirish kerak bo'lsa —
> \`scripts/art.config.mjs\` ni tahrirlang va qayta yasang.

## Qanday ishlash kerak

1. **Bitta chatda ishlang** (ChatGPT yoki gemini.google.com) — uslub bir xil chiqadi.
2. **Avval maskotni** (\`mascot__idle\`) yarating. Yoqsa, keyingi har bir so'rovga shu rasmni
   biriktirib, promptdan oldin yozing:
   *"Use the attached image only as a STYLE reference (rendering, colors, lighting), not as content."*
3. Promptni **to'liq** nusxa ko'chiring (har birining oxirida uslub qismi bor — uni o'chirmang).
4. **O'lcham:** fonlar — 16:9 landshaft, qolganlari — kvadrat. Chat so'rasa, shuni tanlang.
5. **Fon:** obyektlar yashil (#00FF00) fonda so'raladi — skript uni o'zi kesadi.
   ChatGPT shaffof PNG bera olsa ("transparent background PNG"), u ham bo'ladi.
6. Rasmni **ko'rsatilgan nom bilan** \`art-inbox/\` papkasiga saqlang (PNG yoki JPG; WebP emas).
7. Bir nechtasini saqlagach: \`npm run art:import\` — fon kesiladi, o'lcham moslanadi, o'yinda darhol ko'rinadi.

Yoqmagan rasmni qayta yarating va o'sha nom bilan qayta saqlang — import uni almashtiradi.

**🎬 Animatsiya:** 🎬 belgisi bor rasmlarni harakatlantirish ham mumkin. Rasm tayyor bo'lgach, uni biriktirib
animatsiya promptini yuboring (Gemini GIF qilib beradi) va \`.gif\` nomi bilan \`art-inbox/\` ga saqlang.
O'yin animatsiyani rasmdan afzal ko'radi. Avval statik rasm, keyin animatsiya — shunday tartibda.

**Jami: ${ASSETS.length} ta rasm.**

`

/** Rasmi allaqachon bormi (oddiy yoki animatsiya: <nom>.png / <nom>@….png) */
function hasArt(a) {
  const dir = join(ROOT, 'public/assets/art', a.path.split('/').slice(0, -1).join('/'))
  const base = a.path.split('/').pop()
  if (!existsSync(dir)) return false
  return readdirSync(dir).some((f) => f === `${base}.png` || f === `${base}.jpg` || f.startsWith(`${base}@`))
}

function section(list) {
  let out = ''
  for (const [prefix, title] of GROUPS) {
    const items = list.filter((a) => a.path.startsWith(prefix))
    if (!items.length) continue
    out += `## ${title}\n\n`
    for (const a of items) {
      out += `### - [ ] \`${inboxName(a)}.${ext(a)}\`  ·  ${ratio(a)}\n\n\`\`\`text\n${fullPrompt(a)}\n\`\`\`\n\n`
      if (a.motion)
        out += `🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → \`${inboxName(a)}.gif\` nomi bilan saqlang\n\n\`\`\`text\n${motionPrompt(a)}\n\`\`\`\n\n`
    }
  }
  return out
}

md += section(ASSETS)
writeFileSync(join(ROOT, 'docs/ART_PROMPTS.md'), md)
console.log(`docs/ART_PROMPTS.md: ${ASSETS.length} ta prompt`)

// Faqat hali rasmi yo'qlari — yangi rasmlar shu fayldan ketma-ket yaratiladi
const missing = ASSETS.filter((a) => !hasArt(a))
const intro = md.slice(0, md.indexOf('**Jami:')).replace('# Rasm promptlari (ChatGPT / Gemini uchun)', '# Yangi rasmlar — faqat hali yaratilmaganlari')
writeFileSync(
  join(ROOT, 'docs/ART_PROMPTS_YANGI.md'),
  intro +
    `**Jami: ${missing.length} ta yangi rasm.** Uslub bir xil chiqishi uchun har so'rovga oldingi rasmlardan birini (masalan \`art/animal/sigir.png\`) "STYLE reference" qilib biriktiring.\n\n` +
    section(missing),
)
console.log(`docs/ART_PROMPTS_YANGI.md: ${missing.length} ta yangi`)
