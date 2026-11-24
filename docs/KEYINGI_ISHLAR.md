# Keyingi ishlar va joriy holat

> **Ishni davom ettirishdan oldin shu faylni o'qing.** Har ish tugagach — shu yerda belgilanadi.
> AI bilan yaratiladigan hamma narsa uchun qoidalar: [GENERATSIYA_QOIDALARI.md](GENERATSIYA_QOIDALARI.md).
> Uzoq muddatli reja: [RIVOJLANISH_REJASI.md](RIVOJLANISH_REJASI.md) (egasi izoh yozmoqda — ✍️ joylar).

Oxirgi yangilanish: 2026-11-24. Branch: `feat/audio-impl` (PR #6 → `dev`). Oxirgi APK: **v12** (`~/Downloads/mojiza-daftar-debug-v12.apk`).

---

## ⬜ Ochiq ishlar (ustuvorlik tartibida)

### 1. GIF animatsiyalar (yangi personajlar) — DAVOM ETADI
✅ ot (2026-11-24). Qolgani **26 ta** (ro'yxat: `/tmp/gif-list.json` yoki quyida):
tuya, quyon, tovuq, jo'ja, g'oz, baliq, kapalak, ari, toshbaqa, ayiq, fil, hakka, ilon, jirafa, laylak, zebra,
chumoli, sher; shifokor, oshpaz, haydovchi, dehqon (har biri oddiy + `-happy`).
- ⚠️ Gemini **bir vaqtda faqat bitta GIF** yaratadi (parallel so'rovlar "capacity error" bilan rad etiladi) va kunlik
  GIF limiti bor (2026-11-24 da ~2 ta GIF'dan keyin tugadi). Ketma-ket: bittasi tayyor → yuklab olinadi → keyingisi.
- Qanday: asl **yashil/magenta fonli** rasm (`~/Downloads/<nom>.png`; hakka uchun fonini yashilga almashtirilgani)
  buferga → yangi chat → Cmd+V → harakat prompti (`motionPrompt` yoki sahifadagi `__G.mp(harakat, fon)`) →
  "Скачать GIF" tugmasi → `Gemini_Generated_Gif_*.gif` → `art-inbox/<nom>.gif` → `npm run art:import`.

### 2. Yangi narsalarni boshqa o'yinlarga ulash
- [x] Bozor: shifokor, oshpaz, haydovchi, dehqon mijoz bo'ldi (egasi tanlagan ovozlar: Callirrhoe, Fenrir, Schedar, Rasalgethi).
- [ ] Xotira o'yini (Mantiq → juft kartalar): `LogicGame.tsx` dagi `fruits/animals` hovuziga `ALL_THINGS` (rasmi tayyorlari, `thingReady`).
- [ ] "Ortiqchasini top" (Mantiq): turkumlar (hayvon/sabzavot/buyum) bilan yangi topshiriqlar.
- [ ] Soyalar o'yini: yangi hayvonlar (ularning **haqiqiy ovozi** yo'q — Ferma/Soyalarga ulash uchun avval CC0 hayvon
      ovozlari kerak: `scripts/freesound.mjs` WANT ro'yxatiga qo'shish).

### 3. Iqtisod: olmacha va tangalar (RIVOJLANISH_REJASI.md, 4b-bo'lim)
Egasi qarori: do'konda **hammasi** sotilsin (kiyim, hayvon, o'yinchoq, cholg'u), keyinchalik boyitiladi.
- [ ] Bog'da terilgan mevalar → ombor → bozorda shu mevadan sotiladi.
- [ ] Do'kon ekrani: tangalarni bittalab sanab to'lash (sanash/ayirish mashqi).
- [ ] Mevani gaplashadigan do'st / hovlidagi hayvonlarga yedirish.

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
