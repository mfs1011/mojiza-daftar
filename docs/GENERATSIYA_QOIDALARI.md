# AI bilan yaratiladigan hamma narsa uchun yagona qoidalar

> **Maqsad:** o'yindagi rasm, animatsiya, ovoz va matnlar qachon va kim yaratganidan qat'i nazar **bir xil**
> ko'rinsin va eshitilsin. Yangi narsa yaratishdan oldin shu fayl o'qiladi; qoida o'zgarsa — avval shu yerda.
> Kod bilan bog'liq joylar: `scripts/art.config.mjs` (rasm promptlari), `scripts/gen-voices-inter.mjs` (ovozlar).

---

## 1. Rasmlar (personaj, hayvon, meva, sabzavot, buyum, tabiat)

### 1.1 Uslub (hammasi uchun bir xil)
- **Yumshoq 3D, plastilin/loydan yasalgan o'yinchoq** ko'rinishi: yumaloq, "semiz" shakllar, mat tekstura,
  yumshoq global yorug'lik, yengil soya (ambient occlusion). Premium bolalar mobil o'yini darajasi.
- **Iliq, to'yingan, lekin yumshoq ranglar.** Neon, qora-kulrang, realistik foto uslubi — yo'q.
- **Katta, ifodali ko'zlar va do'stona tabassum**:
  - hayvonlar va odamlar — doim;
  - mevalar, sabzavotlar, buyumlar, tabiat (quyosh, bulut…) — **ham yuzli** (ikki katta yaltiroq ko'z, kichik
    tabassum, yengil qizil yanoq). Bu eski rasmlardagi mevalar uslubi (olma, anor).
- **O'zbekona ruh — faqat mayda bezakda:** kiyimdagi atlas/ikat naqsh, hayvon bo'ynidagi rangli atlas
  bo'yinbog', idishdagi paxta gul naqshi, mevadagi nozik suzani naqsh.

### 1.2 Qat'iyan TAQIQLANADI
- Personaj yoki hayvon **tanasida, boshida, kiyimida** — eshik, deraza, gumbaz, minora, bino, o'yma panel.
  (Eski rasmlardagi asosiy kamchilik: hayvonlar yonbosh tomonida o'yma eshik, boshida ko'k gumbaz.)
- Matn, harf, raqam, logo, suv belgisi, ramka.
- Bir rasmda bir nechta obyekt (bitta rasm — bitta narsa).
- Fonga soya, yer, sahna.

### 1.3 Kompozitsiya
| Tur | Ko'rinish | Taglik |
|---|---|---|
| Hayvon | yon tomondan, **o'ngga** qaragan, butun tana, "chaqaloq" proportsiya | yo'q |
| Odam (kasb, mijoz) | old tomondan, tik turgan, qo'llari bo'sh | **kichik dumaloq o't taglik** oyog'i ostida |
| Meva/sabzavot/buyum/tabiat | old yoki 3/4 burchak, markazda | yo'q |
- Kvadrat 1:1, obyekt markazda, atrofida keng bo'sh joy, to'liq ko'rinadi.
- Odamlarda ikki holat: **oddiy** (xotirjam tabassum) va **xursand** (ko'z yumib kulgan, qo'llar biroz ko'tarilgan).

### 1.4 Fon (keyin avtomatik kesiladi)
- Bir tekis xroma fon: odatda **#00FF00 yashil**; obyektda yashil bo'lsa — **#FF00FF magenta**;
  yashil ham, pushti ham bo'lsa — **#0000FF ko'k**. Obyektning o'zida fon rangi bo'lmasin.
- `npm run art:import` fonni kesadi va o'lchamni moslaydi (`art-inbox/` → `public/assets/art/`).
- ⚠️ Fon rangi **faqat** `art:prompts` chiqargan promptdagidek bo'lsin (import xuddi shu rangni kutadi: `keyOf()`).
  Boshqa rang so'ralsa, fon kesilmaydi. Tuzatish: `ffmpeg … colorkey=<rang> … overlay` bilan fonni kerakli rangga
  almashtirib, qayta import qilish.

### 1.5 Ish tartibi (Gemini chat)
1. **Uslub namunasi** sifatida eski, tasdiqlangan rasmlardan biriktiriladi:
   - hayvon uchun — `art/animal/xoroz.png` (eshik/gumbazsiz) yoki `art/animal/ordak.png`;
   - meva/sabzavot/buyum uchun — `art/fruit/olma.png`, `art/fruit/anor.png`;
   - odam uchun — `art/person/opa.png`.
   Promptdan oldin: *"Use the attached image only as a STYLE reference (rendering, materials, face style, colors,
   lighting), not as content. Do not copy any doors, windows or domes."*
2. Prompt — **faqat** `npm run art:prompts` chiqargan to'liq matn (`docs/ART_PROMPTS_YANGI.md`); qisqartirilmaydi.
3. **Bitta chatda ko'pi bilan ~7 rasm**, keyin yangi chat va namuna qayta biriktiriladi (uzun chatda Gemini rasm
   o'rniga matn qaytara boshlaydi).
4. Har 5–10 rasmdan keyin **kontakt varaq** (hammasi yonma-yon, kulrang fonda) bilan eski rasmlarga solishtiriladi.
   Uslubdan chiqqani qayta yaratiladi.

### 1.6 Eski rasmni tuzatish (eshik/gumbazni olib tashlash) — saboqlar (2026-11-25)
- Promptga albatta: *"keep every natural body part exactly: horns, ears, tail, udder, hooves, mane, beard…;
  if a dome sits between the horns, the horns stay"* — aks holda Gemini gumbaz bilan **shoxni ham** o'chiradi
  (sigir, echki).
- "No trace remains: no outline, no arch shape, no smooth patch…" — aks holda eshik o'rnida **iz** qoladi (qovun).
- Odamlar: "keep the small round grass base" + "clothing stripes continue where the plaque was" + "same face,
  age, proportions". Buyumlar: "do NOT add ground, grass, base" (aks holda tandir tagiga o't qo'shiladi).
- Katta gumbaz (quduq tomi) — oddiy yog'och tomga almashtiriladi. Mayda qoldiq qolsa, Gemini'da qayta so'rash
  boshqa joyni buzadi — o'sha piksellarni lokal (numpy) fon rangiga bo'yash afzal.
- Solishtirish varag'ida **proportsiyani saqlab** (`scale=-1:H`) qo'yiladi — kvadratga cho'zilsa, noto'g'ri
  "ozg'in bo'lib qolgan" xulosasi chiqadi.
- Tuzatilgan rasmning eski GIF varag'i (`<nom>@…png`) o'chiriladi va GIF yangi rasmdan qayta yaratiladi.

## 2. Animatsiya (GIF)
- Faqat tayyor va tasdiqlangan rasmdan: rasm biriktiriladi + `motionPrompt` (art.config.mjs).
- 2–3 soniyalik **uzluksiz halqa**: oxirgi kadr birinchisiga teng; kamera qimirlamaydi, zoom yo'q.
- Personaj dizayni, rangi, o'lchami, joyi o'zgarmaydi; fon (xroma) har kadrda bir xil.
- Harakat — yumshoq va xarakterga mos (hayvon: dum, quloq, bosh; odam: nafas, ko'z qisish, yengil chayqalish).
- Fayl nomi rasm bilan bir xil, `.gif`: `animal__ot.gif` → `art-inbox/`.
- ⚠️ Gemini GIF'ni **16:9 (640×360)** chiqaradi: kvadrat rasm berilsa, tepasi/pasti kesiladi (tuya boshi, quyon qulog'i).
  Shuning uchun manba avval **1280×720 xroma fonga, personaj balandligi ~70%** qilib joylanadi (`/tmp/gifsrc.sh <nom>`
  yoki ffmpeg `scale=500:500` + `overlay` markazga) va promptda "do NOT zoom in or crop, whole character visible" deyiladi.
- Bir vaqtda faqat **bitta** GIF; tayyor bo'lgach sahifa yangilanmaydi — chat qayta ochilib "Скачать GIF" bosiladi.

## 3. Ovozlar
- **Usul:** Gemini TTS, **Interactions API** (`scripts/gen-voices-inter.mjs`). Uslub `speech_metadata` maydonida —
  ovoz chiqarib o'qilmaydi. Asosiy model `gemini-3.8-flash-tts`, zaxira `…-lite-tts`. (3.1 uslubni qo'llamaydi;
  eski `generateContent` usuli ishlatilmaydi.)
- **Ovozlar (o'zgartirilmaydi):** tarbiyachi/hikoyachi — **Sulafat**; bobo — **Charon**; buvi — **Kore**;
  aka — **Orus**; opa — **Leda**; bola — **Puck**.
- **Uslub matni:** "native Uzbek speaker from Tashkent, natural Uzbek intonation and word stress, no English,
  Russian or Turkish accent" + rol (mehribon tarbiyachi / mijoz xarakteri).
- **Imlo:** matnda `oʻ`, `gʻ` (U+02BB) ishlatiladi — oddiy apostrof pauza deb o'qiladi.
- **Harf nomlari:** bolalar qolipi — undosh + "e" (Be, De, Fe, He, Ke, Le, Me, Ne, Qe…), unlilar o'z tovushida.
  Gap ichida o'qitiladi ("Bu «Be» harfi.") va aligner faqat nomni kesib oladi — yolg'iz bo'g'in inglizcha o'qiladi.
- **Guruhlab yaratish:** bir xil ovoz/uslubdagi ~20 jumla bitta so'rovda; **MMS aligner** (lokal) bilan kesiladi;
  har bo'lak uzunligi matnga solishtiriladi. Tekshiruvdan o'tmagani qayta so'raladi.
- **Kesish va tovush:** `scripts/audio-import.mjs` — −16 LUFS, chetlardagi shovqin/chirsillash olib tashlanadi.
- Yaratilgandan keyin kamida bir nechtasi **tinglanadi** (yig'ma fayl `~/Downloads/ovoz-solishtirish/`).

## 4. Matnlar (ko'rsatma, topishmoq, mijoz gaplari)
- 3–5 yoshli bola tushunadigan qisqa gaplar; bitta ko'rsatma — bitta harakat.
- **"kim" — faqat odamga; hayvon va narsaga — "nima" / "qaysi hayvon".**
- Topishmoq: 4 qator, oddiy qofiya, javobni topishga yetadigan 2–3 aniq belgi; javob so'zi matnda aytilmaydi.
- Sonlar: "-ta" qo'shimchasi bilan (beshta, oltita); farqni aniq aytish ("Yana toʻrtta kerak!").
- Har yangi gap uchun ovoz kaliti `src/lib/voices.ts` ga qo'shiladi va shu qoidalar bo'yicha yaratiladi.

## 5. Musiqa va tovush effektlari
- Faqat **CC0** manbalar (Freesound, Poly Haven, VSCO-2 CE); muallif `docs/AUDIO_CREDITS.md` ga yoziladi.
- Balandlik: musiqa −18, hayvon −16, effekt −13, muhit −30 LUFS (`audio-import.mjs`).

## 6. Tekshiruv ro'yxati (har yangi to'plamdan keyin)
- [ ] Kontakt varaqda eski rasmlar bilan uslub bir xilmi (yuz, tekstura, ranglar, taglik)?
- [ ] Eshik/deraza/gumbaz kabi ortiqcha element yo'qmi?
- [ ] Fon toza kesildimi (kulrang fonda chetlar)?
- [ ] Ovozlar: uzunlik tekshiruvi o'tdimi, bir nechtasi tinglandimi?
- [ ] O'yinda skrinshot bilan ko'rildimi (albom, topishmoq)?
