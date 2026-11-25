# Yangi rasmlar — faqat hali yaratilmaganlari

> Bu fayl avtomatik yasalgan: `npm run art:prompts`. Promptni o'zgartirish kerak bo'lsa —
> `scripts/art.config.mjs` ni tahrirlang va qayta yasang.

## Qanday ishlash kerak

1. **Bitta chatda ishlang** (ChatGPT yoki gemini.google.com) — uslub bir xil chiqadi.
2. **Avval maskotni** (`mascot__idle`) yarating. Yoqsa, keyingi har bir so'rovga shu rasmni
   biriktirib, promptdan oldin yozing:
   *"Use the attached image only as a STYLE reference (rendering, colors, lighting), not as content."*
3. Promptni **to'liq** nusxa ko'chiring (har birining oxirida uslub qismi bor — uni o'chirmang).
4. **O'lcham:** fonlar — 16:9 landshaft, qolganlari — kvadrat. Chat so'rasa, shuni tanlang.
5. **Fon:** obyektlar yashil (#00FF00) fonda so'raladi — skript uni o'zi kesadi.
   ChatGPT shaffof PNG bera olsa ("transparent background PNG"), u ham bo'ladi.
6. Rasmni **ko'rsatilgan nom bilan** `art-inbox/` papkasiga saqlang (PNG yoki JPG; WebP emas).
7. Bir nechtasini saqlagach: `npm run art:import` — fon kesiladi, o'lcham moslanadi, o'yinda darhol ko'rinadi.

Yoqmagan rasmni qayta yarating va o'sha nom bilan qayta saqlang — import uni almashtiradi.

**🎬 Animatsiya:** 🎬 belgisi bor rasmlarni harakatlantirish ham mumkin. Rasm tayyor bo'lgach, uni biriktirib
animatsiya promptini yuboring (Gemini GIF qilib beradi) va `.gif` nomi bilan `art-inbox/` ga saqlang.
O'yin animatsiyani rasmdan afzal ko'radi. Avval statik rasm, keyin animatsiya — shunday tartibda.

**Jami: 1 ta yangi rasm.** Uslub bir xil chiqishi uchun har so'rovga oldingi rasmlardan birini (masalan `art/animal/sigir.png`) "STYLE reference" qilib biriktiring.

## 🥕 Sabzavotlar

### - [ ] `veg__zamburug.png`  ·  1:1 (kvadrat)

```text
a cute brown-capped forest mushroom with a cream stem, one single fruit or vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

