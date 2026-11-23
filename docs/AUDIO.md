# Ovozlar rejasi: musiqa, hayvonlar, effektlar, ko'rsatmalar

Rasmlar tayyor bo'ldi. Endi ilovaning "eshitiladigan" yarmini shu darajaga chiqaramiz. Bu hujjat:
nima bor, nima yomon, nima kerak, qayerdan olinadi, qanday qayta ishlanadi va kodda nima o'zgaradi.

**Ustuvorlik:**

| # | Ish | Nega |
|---|---|---|
| **P1** | Fon musiqasi | Hozir tasodifiy sintez notalar chalinadi. Ilovaning kayfiyatini eng ko'p belgilaydigan narsa |
| **P2** | Haqiqiy hayvon ovozlari | Hozir oscillator "taqlid"i. Ferma o'yini aynan shu ovozlarni tanishga qurilgan |
| P3 | O'yin va UI effektlari | Sintez "dit-dit"lar arzon eshitiladi |
| P4 | Muhit ovozlari (ambience) | Har bekatga jon kiradi: qushlar, bozor shovqini, tungi chigirtkalar |
| P5 | Ovozli ko'rsatmalar | ~100 ta kalitdan faqat 13 tasi tayyor. Bolalar o'qiy olmaydi, ko'rsatmasiz o'yin tushunarsiz |
| P6 | Miks, sozlamalar, hajm | Hamma qatlamlar bir-birini bosib ketmasligi, APK hajmi |

---

## 0. Hozirgi holat (audit)

Hamma tovush `src/lib/audio.ts` da. Fayl yo'q bo'lsa, sintezga qaytadi:

| Qatlam | Qayerdan keladi | Holat |
|---|---|---|
| Fon musiqasi | `public/assets/music/*` → bo'lmasa `scheduleStep()` sintezi | **`music/` bo'sh.** Doira + tasodifiy pentatonika eshitiladi, 30 soniyadan keyin bezdiradi |
| Hayvonlar | ota-ona yozuvi `tovush_<id>` → `sfx/animals/<id>` → `voices/tovush_<id>` → `synthAnimal()` | **`sfx/animals/` yo'q.** Sigir arra-to'lqin, eshak ikki nota: tanib bo'lmaydi |
| Effektlar (`sfx.*`) | `sfx/<nom>` → sintez | Fayllar yo'q, hammasi sintez (`tap`, `pop`, `wrong`, `coin`, `success`, `magic`, `whoosh`, `rustle`, `thump`) |
| Qahramon reaksiyalari (`voiceFx.*`) | ota-ona `reak_*` → `sfx/voice-*` → sintez | 12 tadan 8 tasi bor; `ouch`, `purr`, `boing`, `squeeze` yo'q |
| Ko'rsatmalar (`say()`) | ota-ona yozuvi → `voices/<kalit>` (Gemini TTS) | 13 ta fayl (`_test` bilan). Bog', bozor, ferma, harflar, sonlar, ranglar va boshqalar jim |

Musiqa bo'yicha kod kamchiliklari:

- `setMusic(on)` faqat yoqadi yoki o'chiradi. Ekranga qarab trek tanlash yo'q, hamma joyda bir xil chaladi
- `HTMLAudioElement` + `onended` bilan aylanadi: trek oxirida pauza qoladi, uzluksiz loop emas
- Treklar orasida silliq o'tish (crossfade) yo'q
- Ota-ona panelida faqat "musiqa yoq/o'chir" bor. Alohida balandlik sozlamalari yo'q

---

## P1. Fon musiqasi

### Konsepsiya

**O'zbekona, akustik, bolalarbop, so'zsiz.** Ilova o'zbek qishlog'ida o'tadi, musiqa ham shu
yerdan bo'lishi kerak: dutor, rubob, doira, nay, chang, qayroq. Ularga bolalar o'yinlarida ko'p
ishlatiladigan iliq cholg'ular qo'shiladi: ksilofon, marimba, pizzicato torlar, ukulele.

Qoidalar:
- **So'z yo'q.** Musiqa ovozli ko'rsatmalar ustidan gapirmasligi kerak
- **Yumshoq va takrorga chidamli.** Bola bitta ekranda 10 daqiqa o'tirishi mumkin. Keskin
  zarblar, baland melodiya, "reklama" energiyasi bo'lmasin
- **Tonallik bir oilada.** Ekranlar almashganda quloqqa "sakrash" bo'lmasin (masalan, hammasi
  D/G/A atrofida)
- **Uzluksiz loop.** Oxiri boshiga ulanadi, sukut yoki "yakun akkordi" yo'q

### Treklar ro'yxati

| Fayl (`music/`) | Ekran | Kayfiyat | Temp | Cholg'ular | Uzunlik |
|---|---|---|---|---|---|
| `map` | Qishloq xaritasi, profil tanlash | Asosiy mavzu: quvnoq, ochiq, "sayohat boshlanadi" | 100–110 BPM | dutor, doira, ksilofon | 60–90 s |
| `bog` | Bog' | Quyoshli, yengil, qushlar bilan uyg'un | 95–105 | rubob, pizzicato, nay | 60–90 s |
| `bozor` | Bozor | Gavjum, ritmik, savdoga undovchi (lekin shovqinsiz) | 105–115 | doira, chang, marimba | 60–90 s |
| `ferma` | Ferma | Hazilkash, yumshoq "bounce" | 90–100 | ukulele, tuba/bas, qayroq | 60–90 s |
| `ustaxona` | Ustaxona (naqsh) | Diqqatni jamlovchi, takrorlanuvchi naqsh | 85–95 | chang, kalimba, yengil perkussiya | 60–90 s |
| `qora` | Kechki qo'ra | Kechqurun, osoyishta, sirli | 70–80 | nay, past dutor, yumshoq pad | 60–90 s |
| `harflar` | Harflar uyi | Sokin, fon sifatida deyarli sezilmaydi | 75–85 | piano/celesta, yengil torlar | 60–90 s |
| `rasm` | Rasm uyi, bo'yash, rig | Ijodiy, "sehrli" | 85–95 | celesta, music box, nay | 60–90 s |
| `uyqu` | Uyqu ekrani | **Alla**: sekin, past, oxirida so'nadi | 60–70 | music box, nay, yumshoq pad | 90–120 s, loop emas |

Qisqa jingle'lar (`music/jingle-*`, 2–4 s, loop emas):

| Fayl | Qachon |
|---|---|
| `jingle-win` | Bekat tugadi, yulduz berildi (`Celebration`) |
| `jingle-start` | Bekatga kirish |
| `jingle-sticker` | Sovg'a yoki stiker olindi |

Sahna (`Stage`, `ProStage`) hozirgidek **musiqasiz** qoladi: u yerda qahramonning ovozi eshitilishi kerak.

### Qayerdan olinadi (sifat bo'yicha)

1. **Buyurtma: o'zbek musiqachi yoki kompozitor.** Eng noyob natija: haqiqiy dutor va doira,
   ilovaning o'z "tovushi". 9 trek + 3 jingle uchun texnik topshiriq sifatida yuqoridagi jadval yetarli.
   Shartnomada ilovada cheksiz foydalanish huquqi yozilsin
2. **AI musiqa generatori.** Masalan Google Lyria (Gemini API / Vertex), Suno yoki Udio. Har bir
   trek uchun shu hujjatdagi jadvaldan prompt yoziladi. **Foydalanishdan oldin har birining tijoriy
   litsenziya shartlarini tekshiring.** Odatda faqat pullik tarif ilovada ishlatishga ruxsat beradi
3. **Tayyor royalty-free kutubxonalar:**
   - **Pixabay Music:** Pixabay Content License, ilovada bepul, muallifni ko'rsatish shart emas.
     Qidiruv: *uzbek*, *silk road*, *oriental kids*, *dutar*, *kids happy ukulele*, *lullaby music box*
   - **Kenney.nl:** jingle va qisqa loop'lar, CC0
   - **Incompetech** (Kevin MacLeod): CC BY, ilovada **muallifni ko'rsatish shart**

Tavsiya: asosiy mavzu (`map`) va `uyqu` uchun buyurtma yoki eng yaxshi variant. Qolganlari
avvaliga kutubxonadan, keyin asta-sekin almashtiriladi. Pipeline ikkalasini ham bir xil qabul qiladi.

### Texnik talablar

| Parametr | Qiymat |
|---|---|
| Format | AAC `.m4a`, 96 kbps, stereo, 44.1 kHz (Android WebView va iOS ikkalasida ishlaydi) |
| Balandlik | −18 LUFS integrated, true peak ≤ −1.5 dBTP (hammasi bir xil, ekran almashganda sakramaydi) |
| Loop | Boshi va oxiri sample darajasida ulanadi, kesilgan joyda "klik" yo'q |
| Hajm byudjeti | 9 trek × ~75 s × 96 kbps ≈ **8 MB** + jingle'lar < 0.3 MB |

### Kodda nima o'zgaradi (`src/lib/audio.ts`)

- [x] `setMusic(on)` o'rniga **`playMusic(id)`**: har ekran o'z trekini so'raydi (`useMusic('bozor')` hook)
- [x] Musiqa `AudioBufferSourceNode` (`loop = true`) orqali chalinadi: **uzluksiz loop**,
      HTMLAudio'dagi bo'shliq yo'qoladi. Kerak bo'lsa `loopStart/loopEnd`
- [x] Ekranlar orasida **1.2 s crossfade**. Bir xil trek bo'lsa, qayta boshlanmaydi
- [x] Ducking saqlanadi: ko'rsatma gapirganda musiqa −14 dB, so'ng 0.4 s ichida qaytadi
- [x] `jingle(id)`: musiqani qisqa pasaytirib, jingle chaladi
- [x] Trek fayli bo'lmasa, hozirgi sintezga emas, **jimlikka** qaytiladi. Sintez musiqa olib
      tashlanadi: tasodifiy kuy fayl yo'qligidan yomonroq
- [x] Uyqu ekranida musiqa oxirida so'nadi va qaytib yoqilmaydi
- [x] Treklar ekranga kirishdan oldin yuklanadi (preload). Birinchi ekran tez ochilishi uchun
      faqat `map` oldindan yuklanadi

---

## P2. Haqiqiy hayvon ovozlari

### Talablar

Ferma o'yinlari ("Kim gapiryapti?", "Eshit va takrorla") bola **haqiqiy** hayvonni ovozidan
tanishiga qurilgan. Shuning uchun:

- **Haqiqiy yozuv**, sintez yoki odam taqlidi emas
- **Bolabop variant:** iloji bo'lsa yosh hayvon (buzoq, qo'zi, uloq, kuchukcha, mushukcha).
  Ovozi yumshoqroq va qo'rqitmaydi
- **Toza:** fonda shamol, odam gapi, mashina, boshqa hayvon bo'lmasin
- **Qisqa:** o'yin ketma-ketlikda chaladi, uzun ovoz zerikarli
- Har hayvonga **2–3 variant**: bir xil ovoz qayta-qayta chalinganda sun'iy eshitiladi

| Hayvon | Nima kerak | Uzunlik | Izoh |
|---|---|---|---|
| `sigir` | Bitta yumshoq "mo'-o'" (buzoq yoki sigir) | 1.2–2.0 s | Past chastotalar telefon dinamigida yo'qoladi: o'rta tonlar aniq eshitilsin |
| `qoy` | Qo'zi ma'rashi "ma-a-a" | 0.8–1.5 s | Qo'chqor emas, qo'zi |
| `echki` | Uloq "me-e-e", titroq bilan | 0.8–1.5 s | Qo'ydan farqi aniq bo'lsin: yuqoriroq, titroqli |
| `xoroz` | To'liq "qu-qu-qu-quuu" | 1.8–2.5 s | Eng baland ovoz, balandligini pasaytirib normallashtirish |
| `it` | Kuchukcha, 2 marta "vov" | 0.6–1.2 s | Xirillash yoki tajovuz yo'q |
| `mushuk` | Mushukcha "miyov" | 0.6–1.2 s | |
| `ordak` | 2–3 marta "vak" | 0.6–1.2 s | |
| `eshak` | Qisqartirilgan "i-a, i-a" | 1.5–2.5 s | Asl hangrash 5+ s, qisqartiriladi |

Fayllar: `public/assets/sfx/animals/<id>.m4a`, variantlar `<id>-2.m4a`, `<id>-3.m4a`.
Format: mono, 44.1 kHz, AAC 96 kbps, −16 LUFS (musiqadan biroz baland), boshi va oxirida 10 ms fade.

### Qayerdan olinadi

1. **O'zimiz yozamiz:** qishloq yoki fermada telefon va shamoldan himoya qopqog'i bilan. Eng haqiqiy,
   litsenziya muammosi yo'q. Har hayvondan 1–2 daqiqa yozib, eng toza bo'laklarini kesamiz
2. **Freesound.org:** filtr *License → Creative Commons 0*. Haqiqiy dala yozuvlari ko'p
3. **Pixabay Sound Effects:** Pixabay Content License, ilovada bepul
4. **Sonniss "GDC Game Audio Bundle":** professional royalty-free to'plamlar, tijoriy ilovaga ruxsat
   beriladi (shartlarini tekshiring)

Har fayl manbasi `docs/AUDIO_CREDITS.md` ga yoziladi (pastda qarang).

### Kodda nima o'zgaradi

- [x] `sayAnimal(id)` variantlardan tasodifiy tanlaydi. **"Eshit va takrorla"** o'yinida esa doim
      bitta asosiy variant chalinadi (xotira o'yini barqaror tovush talab qiladi)
- [x] **Tartib o'zgaradi:** haqiqiy yozuv → ota-ona taqlidi → TTS. Ferma o'yini haqiqiy hayvonni
      tanitishi kerak. Ota-onaning "mo'-o'" taqlidi yoqimli, lekin o'yinning maqsadini buzadi.
      Ota-ona panelida bu bo'lim "Hayvon taqlidingiz (ixtiyoriy)" deb qayta nomlanadi
- [ ] `synthAnimal()` olib tashlanadi (8 ta fayl kafolatlangach)
- [ ] Animatsiyali hayvon ovoz chiqarganda bir marta sakraydi yoki og'iz ochadi (sprite allaqachon bor)

---

## P3. O'yin va UI effektlari

Hozirgi 9 ta sintez effekt yozilgan fayllarga almashtiriladi. Kenney.nl (CC0) to'plamlari yetarli:
*Interface Sounds*, *UI Audio*, *Impact Sounds*, *Casino Audio*.

| Fayl (`sfx/`) | Hozir ishlatilishi | Tovush |
|---|---|---|
| `tap` | Hamma tugmalar | Yumshoq, qisqa "tik", yog'ochsimon |
| `pop` | Obyekt olindi yoki qo'yildi | Pufak "pop" |
| `wrong` | Xato javob | **Qo'rqitmaydigan** "hm-m" (buzzer emas!) |
| `coin` | Bozorda tanga | Tanga jiringlashi |
| `success` | To'g'ri javob | Qisqa ko'tariluvchi arpejjio |
| `magic` | Sehr, rasm tirildi | Yaltiroq "shiiing" |
| `whoosh` | Sahna almashinuvi | Yumshoq havo |
| `rustle` | Daraxt silkitildi | Barglar shitirlashi |
| `thump` | Meva yerga tushdi | Yumshoq "tup" |

Qo'shilishi kerak bo'lgan yangi effektlar:

| Fayl | Qayerda | Nega |
|---|---|---|
| `drop-basket` | Bog': meva savatga tushdi | Hozir `pop`. Savat ovozi saralashni tushunishga yordam beradi |
| `brush-loop` | Rasm uyi: barmoq chizayotganda (loop) | Chizish hissi. Barmoq to'xtasa ovoz ham to'xtaydi |
| `bucket` | Bo'yash: rang quyildi | "Shalop" |
| `eraser` | O'chirg'ich | |
| `tile-click` | Ustaxona: plitka joyiga tushdi | Sopol "chiq" |
| `chalk` | Harflar uyi: harf chizilmoqda (loop) | Bo'r ovozi |
| `star` | Yulduz berildi | `success` dan farqli mukofot ovozi |
| `door` | Bekatga kirish | Yog'och eshik (o'yma eshik bekat ikonkalarida bor) |
| `gate` | Qo'ra: hayvon qo'raga kirdi | |

Hamma effektlar: mono, AAC 96 kbps yoki OGG, −14…−12 LUFS (qisqa effektlar), true peak ≤ −1 dBTP.

---

## P4. Muhit ovozlari (ambience)

Har bekatda musiqa ostida juda past (−30 LUFS atrofida) uzluksiz loop chaladi. Uni "eshitmaysiz",
lekin o'chirilsa ekran bo'sh qoladi.

| Fayl (`ambience/`) | Bekat | Tarkib |
|---|---|---|
| `bog` | Bog' | Qushlar chug'ur-chug'uri, yengil shamol |
| `bozor` | Bozor | Uzoqdan olomon g'o'ng'irlashi. **Tushunarli gap bo'lmasin**: ko'rsatmalar bilan aralashadi |
| `ferma` | Ferma | Uzoqdagi hayvonlar, pashsha, shamol. O'yindagi 8 hayvon ovozi **bo'lmasin**: o'yinni buzadi |
| `ustaxona` | Ustaxona | Kulolchilik charxi, olov chirsillashi |
| `qora` | Kechki qo'ra | Chigirtkalar, boyo'g'li |
| `harflar` | Harflar uyi | Deyarli jimlik, soat chiqillashi |

60–120 s loop, stereo, AAC 64 kbps. Ota-ona panelida alohida o'chirish mumkin.

---

## P5. Ovozli ko'rsatmalar

`src/lib/voices.ts` da ~100 ta kalit bor (ismlar, umumiy, bekatlar, ranglar, mevalar, sonlar,
hayvon nomlari, harflar). Tayyori 12 ta.

Variantlar (yaxshisidan boshlab):
1. **Professional o'zbek diktor**, iliq ayol yoki erkak ovozi, bolalar bilan ishlagan tajribasi
   bo'lsin. Matnlar ro'yxati `voicePrompts()` dan avtomatik chiqariladi (skript qo'shamiz).
   Bitta sessiyada 1–2 soatda yoziladi
2. **Gemini TTS** (`npm run gen:voices`): avval `--test` bilan o'zbekcha talaffuzni tekshirish.
   Bitta xato urg'u bola uchun noto'g'ri o'rnak bo'ladi, shuning uchun **har bir fayl tinglanadi**
3. **Ota-ona yozuvi** (ParentPanel'da bor): har doim ustun turadi

Qo'shimcha ishlar:
- [ ] `voices:missing` skripti: qaysi kalitlarga fayl yo'qligini chiqaradi
- [ ] Ko'rsatmalar ham bir xil balandlikka keltiriladi (−16 LUFS)
- [ ] Qahramon reaksiyalari: yetishmayotgan `voice-ouch`, `voice-purr`, `voice-boing`, `voice-squeeze`

---

## P6. Miks, sozlamalar, hajm

### Balandlik darajalari

Ovozli ko'rsatma eng aniq eshitilishi kerak, qolganlari uning ostida:

| Qatlam | Daraja | Gapirilganda |
|---|---|---|
| Ko'rsatma | 0 dB (asos, −16 LUFS) | |
| Hayvon ovozi | 0 dB | |
| Effektlar | −4 dB | |
| Musiqa | −10 dB | −24 dB (duck) |
| Ambience | −16 dB | −24 dB |

### Ota-ona paneli

- [x] Uchta slayder: **Musiqa**, **Effektlar va muhit**, **Ko'rsatmalar**. Saqlanadi (`settings`)
- [x] "Tungi rejim" (uyqu ekranidan keyin): hammasi 50%

### Texnik

- [ ] Birinchi tegishda `AudioContext` ochiladi (mobil brauzer talabi; hozir `ac()` buni qiladi)
- [ ] Ilova orqa fonga o'tsa jimlik (bor). Qaytganda musiqa silliq ko'tariladi
- [ ] Android: boshqa ilova ovoz chalsa (qo'ng'iroq), musiqa to'xtaydi

### Hajm byudjeti

| Qatlam | Taxminan |
|---|---|
| Musiqa (9 trek + 3 jingle) | 8 MB |
| Ambience (6 loop) | 4 MB |
| Hayvonlar (8 × 3 variant) | 0.6 MB |
| Effektlar (~18) | 0.4 MB |
| Ko'rsatmalar (~100, mono 64 kbps) | 3 MB |
| **Jami** | **≈ 16 MB** |

Hozirgi `voices/*.wav` va `sfx/voice-*.wav` siqilmagan WAV. AAC'ga o'tkazilsa 8–10 barobar kichrayadi.

---

## Pipeline: `audio-inbox/` → `npm run audio:import`

Rasmlardagi `art-inbox` kabi: fayl istalgan formatda tashlanadi, skript qolganini qiladi.

```
audio-inbox/
  music__map.mp3           → public/assets/music/map.m4a
  animal__sigir.wav        → public/assets/sfx/animals/sigir.m4a
  animal__sigir-2.wav      → public/assets/sfx/animals/sigir-2.m4a
  sfx__tap.ogg             → public/assets/sfx/tap.m4a
  ambience__bog.wav        → public/assets/ambience/bog.m4a
  voice__bozor_intro.wav   → public/assets/voices/bozor_intro.m4a
```

Skript (`scripts/audio-import.mjs`, ffmpeg orqali; ffmpeg o'rnatilgan):
1. Boshidagi va oxiridagi sukutni kesadi (musiqa va ambience'dan tashqari)
2. Turiga qarab balandlikni normallashtiradi (`loudnorm`: musiqa −18, ovozlar −16, effektlar −14, ambience −30 LUFS)
3. 10 ms fade-in/fade-out qo'shadi (loop fayllarda emas)
4. Mono yoki stereo va bitreyt jadval bo'yicha. AAC `.m4a` ga o'tkazadi
5. Faylni joyiga qo'yadi, asl nusxani `audio-inbox/done/` ga ko'chiradi, `manifest.json` ni yangilaydi
6. `docs/AUDIO_CREDITS.md` da yozuvi yo'q fayllar uchun ogohlantiradi

`audio-inbox/` repoga kirmaydi (`.gitignore`).

### Litsenziya jurnali: `docs/AUDIO_CREDITS.md`

Har bir tashqi fayl uchun bitta qator: fayl, manba URL, muallif, litsenziya, sana.
CC BY bo'lsa, ilovaning "Haqida" oynasida muallif ko'rsatiladi. Do'konga chiqarishdan oldin
bu jurnal to'liq bo'lishi shart.

---

## Ish tartibi

1. [x] `scripts/audio-import.mjs` + `.gitignore` + `AUDIO_CREDITS.md` shabloni
2. [x] **P1:** `playMusic(id)`, uzluksiz loop, crossfade, sintez musiqani olib tashlash
3. [ ] **P1:** 9 trek + 3 jingle topiladi yoki yaratiladi, import, ekranlarga ulanadi
4. [ ] **P2:** 8 hayvon × 2–3 variant topiladi, import, `sayAnimal` variantlar va tartib
5. [ ] **P3:** effektlar almashtiriladi, yangi effektlar ulanadi
6. [ ] **P4:** ambience qatlami va fayllar
7. [ ] **P5:** yetishmayotgan ko'rsatmalar (diktor yoki tekshirilgan TTS)
8. [ ] **P6:** slayderlar, darajalar, WAV → AAC, hajmni tekshirish
9. [ ] Telefonda (Android) **dinamik va quloqchinda** tinglab chiqish

## Qabul mezonlari

- Har ekranda o'z musiqasi, loop chokida klik yoki pauza yo'q, ekran almashganda sakrash yo'q
- 10 daqiqa bitta ekranda o'tirganda musiqa bezdirmaydi (5 yoshli bola va ota-ona bilan sinab ko'rish)
- 8 hayvonning har birini bola ovozidan tanib oladi. Sintez ovoz qolmagan
- Ko'rsatma gapirganda musiqa va muhit aniq pasayadi, gap to'liq tushuniladi
- Telefon dinamigida sigir va eshak ham eshitiladi (past chastota yo'qolmagan)
- Barcha tashqi fayllar `AUDIO_CREDITS.md` da, litsenziyalari ilovada foydalanishga ruxsat beradi
- Audio jami ≤ 16 MB
