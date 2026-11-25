# Keyingi ishlar va joriy holat

> **Ishni davom ettirishdan oldin shu faylni o'qing.** Har ish tugagach — shu yerda belgilanadi.
> AI bilan yaratiladigan hamma narsa uchun qoidalar: [GENERATSIYA_QOIDALARI.md](GENERATSIYA_QOIDALARI.md).
> Uzoq muddatli reja: [RIVOJLANISH_REJASI.md](RIVOJLANISH_REJASI.md) (egasi izoh yozmoqda — ✍️ joylar).

Oxirgi yangilanish: 2026-11-25. Branch: `feat/audio-impl` (PR #6 → `dev`). Oxirgi APK: **v15** (`~/Downloads/mojiza-daftar-debug-v15.apk`).

---

## ⬜ Ochiq ishlar (ustuvorlik tartibida)

### 1. GIF animatsiyalar — ✅ TUGADI (2026-11-25)
✅ Hammasi: 18 yangi hayvon, bog' daraxti, tozalangan 7 ferma hayvoni, bobo/aka (×2), 4 kasb (×2). 16:9 manba — kesilmagan.
- ⚠️ Gemini **bir vaqtda faqat bitta GIF** yaratadi (parallel so'rovlar "capacity error" bilan rad etiladi) va kunlik
  GIF limiti bor (2026-11-24 da ~2 ta GIF'dan keyin tugadi). Ketma-ket: bittasi tayyor → yuklab olinadi → keyingisi.
- Qanday: asl **yashil/magenta fonli** rasm (`~/Downloads/<nom>.png`; hakka uchun fonini yashilga almashtirilgani)
  buferga → yangi chat → Cmd+V → harakat prompti (`motionPrompt` yoki sahifadagi `__G.mp(harakat, fon)`) →
  "Скачать GIF" tugmasi → `Gemini_Generated_Gif_*.gif` → `art-inbox/<nom>.gif` → `npm run art:import`.

### 1b. ESKI rasmlarni qoida bo'yicha qayta yaratish (eshik/deraza/gumbazni olib tashlash)
Eski hayvon, meva va odam rasmlarining ko'pida tanasida o'yma eshik, boshida ko'k gumbaz bor (masalan nok, uzum,
sigir, it, mushuk, o'rdak, bobo). Egasi: "eshik deraza kabi narsalar juda ko'payib ortiqcha bo'lib ketgan".
- [x] 2026-11-25: 8 meva (gilos, qovun, behi, tarvuz, nok, uzum, anjir, o'rik), 7 hayvon (sigir, qo'y, echki, it,
      mushuk, o'rdak, eshak), bobo/aka × 2 holat, 7 hovli bezagi (anor/olma daraxti, gul, ko'za, kungaboqar, quduq,
      tandir) — eskisi bilan solishtirilib import qilindi. Xo'roz, olma, anor, opa, buvi, bola, maskot — avvaldan toza.
      Saboqlar → `GENERATSIYA_QOIDALARI.md` 1.6. Eski fayllar: `~/Downloads/rasmlar-eski-uslubsiz/izli/`.
- [x] Ularning GIF'lari qayta (2026-11-25).

### 1c. Bog' daraxti — hovli fonidagidek (egasi so'radi, 2026-11-25)
Hovli fonidagi daraxt (`art/bg/` hovli foni): yuzli, plastilin tanali, shaftoli/olxo'ri mevali. Bog'da xuddi shunday:
- [x] 2026-11-25: `bog/daraxt` (mevasiz, yuzli, hovli fonidagi daraxtdan namuna olib), `bog/shaftoli`, `bog/olxori`
      (yuzsiz, shoxga qo'yish uchun), daraxt GIF'i. Bog' foni (`bg/garden.jpg`) daraxtsiz qayta chizildi (eskisi:
      `~/Downloads/rasmlar-eski-uslubsiz/bg__garden-daraxtli.jpg`).
- [x] 2D bog' endi asosiy: daraxt doim yengil tebranadi (CSS), bosilsa silkinadi, mevalar yerga tushadi.
      3D bog' — ota-ona panelida "3D bog'" tanlovi (standart o'chiq).
- [ ] Shaftoli/olxo'ri hozircha o'yin mevalari (FruitKind) emas — bog'ga qo'shilsa nom, ovoz, bozor ham kerak.
- Hovli bezaklari (quduq, ko'za, so'ri, gul, daraxtcha…) ham 1b ro'yxatiga kiradi (eshik/gumbaz olib tashlanadi).

### 1d. Kichik tuzatishlar (2026-11-25)
- [ ] Quyon GIF qayta (ichki kvadrat qulog'ini qirqadi) — manba tozalangan rasmdan (`/tmp/gifsrc/animal__quyon2.png`).
- [ ] `veg/zamburug` rasmi ("Z" harfi uchun; nom, topishmoq, ovoz tayyor) — Gemini.
- [x] "Zina" → "Narvon" (rasm narvon edi): nom, topishmoq, ovozlar.

### 2. Yangi narsalarni boshqa o'yinlarga ulash
- [x] Bozor: shifokor, oshpaz, haydovchi, dehqon mijoz bo'ldi (egasi tanlagan ovozlar: Callirrhoe, Fenrir, Schedar, Rasalgethi).
- [x] Xotira o'yini: yangi narsalar hovuzda; yuqori darajada bir turkumdan.
- [x] "Ortiqchasini top": turkum darajasi hayvon/meva/sabzavot/buyum/tabiat bilan.
- [x] Soyalar o'yini (2026-11-25): 2-darajadan yangi hayvonlar (ot, tuya, quyon, tovuq, jo'ja, g'oz, toshbaqa, ayiq,
      fil, jirafa, zebra, sher) — 1 ta, 6-darajadan 2 ta. CC0 ovozlar: ot, tuya, tovuq, jo'ja, g'oz, fil, sher, ari, hakka
      (tinglash: `~/Downloads/ovoz-solishtirish/yangi-hayvon-ovozlari.m4a`); ayiq/quyon va b. — faqat nomi aytiladi.
- [ ] Ferma o'yiniga ham yangi hayvonlar (ovozi borlari) — keyinroq.

### 3. Iqtisod: olmacha va tangalar (RIVOJLANISH_REJASI.md, 4b-bo'lim)
Egasi qarori: do'konda **hammasi** sotilsin (kiyim, hayvon, o'yinchoq, cholg'u), keyinchalik boyitiladi.
- [x] 2026-11-25: **ombor** (bog'da terilgan meva turi bo'yicha; boshlang'ich 4 olma, 3 anor, 3 nok), **bozor** faqat
      ombordagi mevadan sotadi (kam bo'lsa — "Bog'ga borib meva terib kel!" + bog' tugmasi), **do'kon** (hayvon, hovli
      buyumi, o'yinchoq, kiyim; narx 1–10; tangalar bittalab sanalib qo'yiladi), **hovlida hayvonlarga meva yedirish**.
      Kod: `src/lib/economy.ts`, `src/screens/Shop.tsx`, `src/components/StoreView.tsx`. 24 ta yangi ovoz.
- [ ] Do'ppi/kiyimni qahramon va gaplashadigan do'stga kiydirish; do'stga meva yedirish.
- [ ] Cholg'ular hozir bepul — do'konga qo'yish uchun avval qulflash kerak (egasi qarori).
- [ ] Hovliga yangi hayvonlarni (things.ts) ham sotish — hovli turi kengaytiriladi.

### 3b. Valyuta (tanga) nima uchun kerak — reja (2026-11-25, egasi bilan muhokama uchun)
**Maqsad (maktabgacha bola uchun):** tanga — "mehnat → natija → tanlov → g'amxo'rlik" zanjirining ko'rinadigan qismi.
Har sarflash — sanash va solishtirish mashqi ("3 tanga kerak, sende 5 ta — yetadimi? nechta qoladi?").
Qoidalar: narx faqat 1–10 (bola sanay oladigan son); tanga doim bittalab sanab to'lanadi; "sandiq/omad qutisi",
taymer, "tezroq ol" bosimi — YO'Q; hamma xarid darhol ko'rinadigan, o'ynasa bo'ladigan narsa bo'lsin.
Bolalarga **robotcha** (Ijod → 3D qahramon) eng yoqdi → valyutani avvalo unga bog'laymiz:
- [ ] **Robotcha uchun do'kon bo'limi:** shlyapa, do'ppi, ko'zoynak, bo'yoq rangi, ryukzak — sotib olingach robot kiyib,
      quvonib raqsga tushadi. (3D modelga aksessuar biriktirish; rasm/model kerak.)
- [ ] **Robotcha yangi harakat "o'rganadi":** tanga bilan yangi raqs/hazil harakati ochiladi (modelda tayyor kliplar bor).
- [ ] **Robotcha — butun o'yin bo'ylab do'st:** uy ekranida turadi, bekatdan qaytganda kutib oladi, xaridni maqtaydi.
- [ ] **Robot bilan o'quv o'yinlari:** "Robotga yo'l ko'rsat" (oldinga/burilish strelkalari — dasturlashga ilk qadam,
      4–5 yosh), "Robot nima his qilyapti?" (his-tuyg'ular), ovoz bilan buyruq ("sakra!", "raqs tush!").
**Hayvonga meva bergandan keyin nima bo'ladi:**
- [ ] Hayvon kuniga bir marta och bo'ladi (ustida kichik "och" belgisi). To'ydirilsa — xursand, va **mahsulot beradi**:
      tovuq → tuxum, sigir/echki → sut, qo'y → jun. Mahsulot omborga tushadi va bozorda sotiladi (yangi mijoz buyurtmalari).
      Sabab-oqibat va g'amxo'rlikni o'rgatadi; bir kunda cheksiz takrorlab bo'lmaydi.
**Cholg'ular:**
- [ ] Musiqa uyida 3 ta cholg'u bepul qoladi; qolganlari (doira, rubob, nay, …) do'konda 5–10 tanga — sotib olingach
      Musiqa uyida paydo bo'ladi.
**Ota-ona paneli:** xaridlar tarixi va "bugun nechta tanga topdi/sarfladi" ko'rinadi.

### 4. RIVOJLANISH_REJASI.md bo'yicha
- [ ] Egasi ✍️ joylarga yozib "yozdim" deganda — har izohga 💬 javob, keyin kelishilgan tartibda ish.
- [ ] O'quv dasturi (harf/son tartibi, egallash, takrorlash) — egasining qaroriga bog'liq ("Alifbe" tartibi).

### 5. 3D (keyinroq) — [3D-IZLANISH.md](3D-IZLANISH.md)
- [ ] Bepul va sifatli 3D yo'li: Hunyuan3D rasmiy sayti (egasi Chrome'da kiradi) / HF token / Colab.

### 6. Kichik ishlar
- [ ] `model-test.html` va `public/models-test/` — 3D sinov fayllari; 3D yo'li tanlangach o'chiriladi yoki ishlatiladi.
- [ ] `~/Downloads/rasmlar-eski-uslubsiz/` — uslubdan chiqqan birinchi urinish rasmlari (o'yinda ishlatilmaydi).

---

## ✅ Bajarilgan (2026-11-24)
- Barcha ovozlar (≈410) Interactions API + Gemini 3.8 TTS bilan qayta yaratildi; ovozlar: Sulafat (tarbiyachi),
  Charon/Kore/Orus/Leda/Puck (mijozlar). MMS aligner bilan guruhlab yaratish.
- Harf nomlari bolalar qolipida (Be, Me, Ne, Ke…), o'zbekcha gap ichidan kesilgan.
- Bozor: mijoz farqni aytadi; gap kesilishi tuzatildi; bitta ovoz bilan buyurtma.
- Ferma va Raqamlar uyida ovoz bo'linishi; chala chizilgan harf endi qabul qilinmaydi; "kim/nima".
- 68 ta yangi rasm eski uslubda (hayvonlar, sabzavotlar, buyumlar, tabiat, kasblar, alifbo narsalari).
- 64 ta yangi topishmoq + nomlar; albomda 7 sahifa; harflar uyi — 28 harfning hammasida ≥2 so'z.
- Yagona qoidalar (`GENERATSIYA_QOIDALARI.md`), 3D sinov (TRELLIS — rad etildi).

## 🛠 Qanday davom ettirish (texnik eslatma)
- Dev server: `npm run dev -- --host` → http://localhost:5173/
- Ovoz: `node scripts/gen-voices-inter.mjs [--plan|--only k1,k2]` → `node scripts/audio-import.mjs`
  (aligner: `~/.cache/mojiza-align/venv`; kalitlar `.env.local`, 10 ta).
- Rasm: `npm run art:prompts` → `docs/ART_PROMPTS_YANGI.md`; Gemini (Claude in Chrome bilan avtomatik, har chatda ≤4 rasm,
  namuna rasm biriktiriladi) → `~/Downloads/<nom>.png` → `art-inbox/` → `npm run art:import`.
- APK: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ANDROID_HOME=~/Library/Android/sdk npm run android:apk`
  → `~/Downloads/mojiza-daftar-debug-vN.apk`; keyin `git checkout android/capacitor.settings.gradle`.
- Sinov: puppeteer skriptlari `/tmp/mojiza-pw/` (smoke.mjs — 39 bekat×daraja).
