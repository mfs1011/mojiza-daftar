# Mo'jiza Daftar

3 va 5 yoshli bolalar uchun Android o'yin-ilova: chizasan, bo'yaysan — rasming tiriladi.

Bola o'z qahramonini chizadi (yoki istalgan narsani suratga oladi), keyin u bilan qishloq bo'ylab
sayohat qiladi: har bir bekat — zehnni o'stiruvchi bitta o'yin. Barcha ko'rsatmalar ota-onaning
yozib olingan ovozida beriladi, chunki bolalar hali o'qiy olmaydi. Internet kerak emas, hamma
ma'lumot faqat qurilmada saqlanadi.

## Imkoniyatlar

**🎨 Rasm uyi**
- Ekranda chizish yoki qog'ozdagi rasmni suratga olish → rasm "tiriladi" va xaritada yuradigan qahramonga aylanadi
- **📒 Bo'yash daftari:** istalgan surat (kamera yoki galereya) → bolalar albomidagidek uzuq chiziqli sahifa.
  Bola avval chiziqlar ustidan yurib chizadi, keyin 🪣 yoki 🖌️ bilan bo'yaydi. Tayyor rasmlar albomga tushadi
- **🎭 Sahna:** chizilgan yoki bo'yalgan rasm 3D multfilm qahramoniga aylanadi:
  - bolaning gapini ingichka ovozda takrorlaydi, og'zi gapga qarab ochiladi
  - boshiga ursa "voy", oyog'iga ursa yig'laydi, qornini silasa qitig'i keladi, boshini silasa huzur qiladi,
    siltasa boshi aylanadi, bosib tursa siqiladi, 3 marta ursa jahli chiqib teskari o'giriladi,
    tegmasa uxlab qoladi
  - bola o'zi ko'z va og'iz chizgan bo'lsa, aynan ular harakatlanadi

**Qishloq bekatlari** (qiyinlik bolaning natijasiga qarab o'zi moslashadi)

| Bekat | Ko'nikma |
|---|---|
| 🍎 Bog' | Saralash: rang, kattalik, meva turi |
| 🛒 Bozor | Sanash, 10 lik ramka |
| 🐑 Ferma | Eshitish va ishchi xotira |
| 🏺 Ustaxona | O'zbek naqshlarini davom ettirish |
| 🌙 Kechki qo'ra | Soya topish, fazoviy tasavvur |
| 🔤 Harflar uyi (5 yosh) | Harf chizish, bosh harfni topish |

Har bekatdan keyin bola sovg'a tanlab, uni qishloqqa o'zi joylashtiradi. Kun 12–15 daqiqada
tugaydi va qahramon uxlaydi — ekran vaqti uchun janjalsiz.

## Ishga tushirish

```bash
npm install
npm run dev          # http://localhost:5173 (landshaft holatda ko'ring)
```

Ota-ona paneli: bosh ekrandagi ⚙️ ni 2 soniya bosib turing. Avval ovozlarni yozib oling.

## Android

```bash
npm run android:open     # build + sync + Android Studio → ▶ Run
npm run android:apk      # debug APK: android/app/build/outputs/apk/debug/app-debug.apk
```

To'liq qo'llanma (JDK, SDK, telefonda sinash, imzolash, Play Market): [docs/ANDROID_BUILD.md](docs/ANDROID_BUILD.md)

## Rasmlar, ovozlar, musiqa

AI rasmlar va ovozlarni Gemini bilan yaratish, effekt va musiqa manbalari: [docs/ASSETS.md](docs/ASSETS.md)

## Tuzilma

```
src/
  art/         SVG rasmlar: mevalar, hayvonlar, Popishak maskoti, naqshlar, manzara
  games/       Garden, Market, Farm, Workshop, Shadows, Letters
  screens/     ProfileSelect, VillageMap, DrawStudio, ColoringBook, Stage, Sleep, ParentPanel
  components/  GameShell, Hero, Celebration, Fx, HoldButton
  lib/
    lineart.ts      surat → bo'yash sahifasi (Lab + Kuwahara + k-means + vektor chiziqlar), Web Worker'da
    inflate.ts      2D chizma → 3D "puflangan" model (distance transform)
    faceRig.ts      bolaning chizgan ko'z/og'zini topish va emotsiyalar bilan qayta chizish
    voiceEcho.ts    "gapimni takrorla": ovozni aniqlash va ingichka ovozda qaytarish
    audio.ts        effektlar, fon musiqasi (doira), hayvon tovushlari, ota-ona ovozlari
    db.ts           IndexedDB: profillar, natijalar, ovozlar, qahramonlar, albom
```

Dev rejimda barcha rasmlarni ko'rish: `http://localhost:5173/#gallery`
