// Tashqi asset'lar (AI rasmlar, yozilgan ovozlar, musiqa) — public/assets/manifest.json orqali.
// Fayl bo'lsa u ishlatiladi, bo'lmasa ilova o'zining SVG rasmlari va sintez tovushlariga qaytadi.
// Shuning uchun asset'lar asta-sekin qo'shilsa ham ilova hech qachon buzilmaydi.

let files = new Set<string>()
const BASE = `${import.meta.env.BASE_URL}assets/`

/** Fon rasmi bor ekranlar (CSS o'zgaruvchilari va <html> klasslari orqali) */
const BACKGROUNDS = ['map', 'garden', 'market', 'farm', 'workshop', 'night', 'letters', 'studio', 'stage', 'profiles', 'sleep']

export async function loadAssets() {
  try {
    const res = await fetch(`${BASE}manifest.json`, { cache: 'no-store' })
    if (res.ok) files = new Set(((await res.json()) as { files: string[] }).files)
  } catch {
    files = new Set()
  }
  const root = document.documentElement
  for (const id of BACKGROUNDS) {
    const u = artUrl(`bg/${id}`)
    if (!u) continue
    root.style.setProperty(`--bg-${id}`, `url("${u}") center / cover no-repeat`)
    root.classList.add(`has-bg-${id}`)
  }
}

export const asset = (path: string): string | null => (files.has(path) ? BASE + path : null)

export const artUrl = (path: string): string | null => asset(`art/${path}.png`) ?? asset(`art/${path}.jpg`) ?? asset(`art/${path}.webp`)

/** Bir nechta format: birinchi topilgani */
export const audioUrl = (path: string): string | null =>
  asset(`${path}.m4a`) ?? asset(`${path}.mp3`) ?? asset(`${path}.ogg`) ?? asset(`${path}.wav`)

export const musicTracks = (): string[] => [...files].filter((f) => f.startsWith('music/')).map((f) => BASE + f)
