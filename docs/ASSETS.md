# Asset'lar: rasmlar, ovozlar, effektlar, musiqa

Ilova barcha tashqi asset'larni `public/assets/` dan oladi va `public/assets/manifest.json` orqali
qaysi fayl borligini biladi. **Fayl bo'lmasa — ilova o'zining SVG rasmlari va sintez tovushlariga
qaytadi**, shuning uchun asset'larni asta-sekin qo'shsa ham hech narsa buzilmaydi.

Har qanday faylni qo'lda qo'shgandan keyin: `npm run assets:manifest`

## 1. Gemini kaliti

Loyiha ildizida `.env.local` (repoga kirmaydi — `.gitignore` da):

```
GEMINI_API_KEY=sizning_kalitingiz
```

Kalitni hech qachon kodga, commit'ga yoki chatga yozmang.

## 2. Ovozli ko'rsatmalar (Gemini TTS)

```bash
npm run gen:voices -- --test      # bitta namuna: public/assets/voices/_test.wav
afplay public/assets/voices/_test.wav
```

O'zbekcha talaffuz yaxshi bo'lsa:

```bash
npm run gen:voices                # 82 ta ko'rsatma → public/assets/voices/<kalit>.wav
```

Boshqa ovoz/model: `GEN_TTS_VOICE=Kore npm run gen:voices -- --test`
(ovozlar: Leda, Kore, Aoede, Puck, Zephyr va boshqalar).

> Gemini TTS o'zbek tilini rasman qo'llashi tasdiqlanmagan — shuning uchun avval `--test`.
> Ota-ona panelida yozilgan ovoz har doim ustun: bu fayllar faqat zaxira.

## 3. Rasmlar (Gemini "Nano Banana")

Ro'yxat va uslub: `scripts/art.config.mjs` (~70 ta: fonlar, maskot, mevalar, hayvonlar, mijozlar,
bekat ikonkalari, bezaklar, naqsh plitkalari).

```bash
npm run gen:art -- --only mascot  # avval maskot: uslubni ko'rib chiqing
npm run gen:art                   # qolganlari (maskot "uslub namunasi" sifatida ishlatiladi)
npm run gen:art -- --only fruit/olma --force   # bittasini qayta yaratish
GEN_IMAGE_MODEL=gemini-3-pro-image npm run gen:art   # sifatliroq model
```

- Fonsiz obyektlar yashil fonda yaratiladi, skript fonni kesib, PNG qiladi
- Fonlar 1600 px JPEG (APK hajmi uchun)
- Yoqmagan rasmni `--force` bilan qayta yarating yoki promptini `art.config.mjs` da o'zgartiring
- Har bir rasmda Google SynthID ko'rinmas suv belgisi bo'ladi (tasvirga ta'sir qilmaydi)

## 4. Effektlar (yozilgan tovushlar) — tasdiqlash uchun manbalar

Fayllarni shu nomlar bilan qo'ying (mp3, ogg yoki wav):

| Fayl | Qayerda |
|---|---|
| `sfx/tap`, `sfx/pop`, `sfx/wrong`, `sfx/coin`, `sfx/success`, `sfx/magic`, `sfx/whoosh`, `sfx/rustle`, `sfx/thump` | o'yinlar, tugmalar |
| `sfx/voice-bonk`, `voice-ouch`, `voice-giggle`, `voice-purr`, `voice-yay`, `voice-hmm`, `voice-woo`, `voice-yawn`, `voice-snore`, `voice-grr`, `voice-boing`, `voice-squeeze` | sahnadagi qahramon |
| `sfx/animals/sigir`, `qoy`, `echki`, `xoroz`, `it`, `mushuk`, `ordak`, `eshak` | Ferma (haqiqiy hayvon ovozlari) |

Tavsiya etilgan manbalar (litsenziyani har bir fayl sahifasida tekshiring):

- **Kenney.nl** — "Interface Sounds", "UI Audio", "Impact Sounds", "Casino Audio": **CC0**, ilovada
  bepul, muallifni ko'rsatish shart emas
- **Freesound.org** — filtr: *License → Creative Commons 0*; haqiqiy hayvon yozuvlari (bepul akkaunt kerak)
- **Mixkit** — "Farm"/"Animals" bo'limi; Mixkit litsenziyasi tijoriy ilovaga ruxsat beradi, lekin
  shartlarini o'qing

## 5. Fon musiqasi

`public/assets/music/` ga 1–3 ta trek (`*.mp3`, ~128 kbps, 1–2 MB). Ilova ularni navbat bilan chaladi,
ovozli ko'rsatma paytida pasaytiradi, sahnada o'chiradi.

Tavsiya: **Pixabay Music** (Pixabay Content License — ilovada bepul, muallif shart emas).
Qidiruv so'zlari: *kids happy*, *children playful ukulele*, *oriental kids*, *silk road*, *uzbek*, *dutar*.
Yengil, takrorlanuvchi (loop), so'zsiz, bolalarni charchatmaydigan kuylar tanlang.

Eng noyob variant — doira va dutor bilan buyurtma qilingan o'zbekona kuylar (har bekatga alohida).
