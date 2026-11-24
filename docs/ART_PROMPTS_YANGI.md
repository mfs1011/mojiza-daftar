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

**Jami: 22 ta yangi rasm.** Uslub bir xil chiqishi uchun har so'rovga oldingi rasmlardan birini (masalan `art/animal/sigir.png`) "STYLE reference" qilib biriktiring.

## 🐑 Hayvonlar

### - [ ] `animal__hakka.png`  ·  1:1 (kvadrat)

```text
a black-and-white magpie bird with a long tail, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__hakka.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): hops, tilts its head, flicks its long tail. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__ilon.png`  ·  1:1 (kvadrat)

```text
a friendly green-and-yellow cartoon snake coiled with its head raised (no legs), full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__ilon.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): sways its head side to side, flicks its tongue, blinks. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__jirafa.png`  ·  1:1 (kvadrat)

```text
a baby giraffe with a long neck and brown spots, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__jirafa.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): bends its long neck, blinks, twitches its ears. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__laylak.png`  ·  1:1 (kvadrat)

```text
a white stork with black wing tips, long red beak and long red legs, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__laylak.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): stands on one leg, flaps its wings, nods. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__zebra.png`  ·  1:1 (kvadrat)

```text
a baby zebra with black and white stripes, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__zebra.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): swishes its tail, nods, flicks its ears. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__chumoli.png`  ·  1:1 (kvadrat)

```text
a cute red-brown ant with six small legs and antennae, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__chumoli.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): wiggles its antennae, taps its legs, bobs. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__sher.png`  ·  1:1 (kvadrat)

```text
a friendly lion cub with a small fluffy golden mane, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__sher.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): shakes its little mane, yawns, swishes its tail. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

## 🥕 Sabzavotlar

### - [ ] `veg__joxori.png`  ·  1:1 (kvadrat)

```text
a yellow corn cob with green husk leaves, one single fruit or vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `veg__limon.png`  ·  1:1 (kvadrat)

```text
a bright yellow lemon with a small green leaf, one single fruit or vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `veg__xurmo.png`  ·  1:1 (kvadrat)

```text
a ripe orange persimmon with a green four-leaf cap, one single fruit or vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

## 🏠 Buyumlar

### - [ ] `obj__fonar.png`  ·  1:1 (kvadrat)

```text
a small old-fashioned lantern with a warm glowing light, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__gilam.png`  ·  1:1 (kvadrat)

```text
a small rolled-out Uzbek carpet with red geometric pattern, seen from above at an angle, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__ip.png`  ·  1:1 (kvadrat)

```text
a round ball of red knitting yarn with a loose thread end, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__raketa.png`  ·  1:1 (kvadrat)

```text
a small red-and-white toy rocket, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__ruchka.png`  ·  1:1 (kvadrat)

```text
a blue ballpoint pen, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__uy.png`  ·  1:1 (kvadrat)

```text
a small cozy cartoon house with a red roof and a little chimney, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__uzuk.png`  ·  1:1 (kvadrat)

```text
a golden ring with a small red gem, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__vertolyot.png`  ·  1:1 (kvadrat)

```text
a small yellow toy helicopter, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__xalta.png`  ·  1:1 (kvadrat)

```text
a small embroidered cloth bag with a drawstring and suzani pattern, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__zina.png`  ·  1:1 (kvadrat)

```text
a small wooden ladder, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__gildirak.png`  ·  1:1 (kvadrat)

```text
a single black rubber wheel with a red hub, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__shar.png`  ·  1:1 (kvadrat)

```text
a shiny red balloon on a string, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

