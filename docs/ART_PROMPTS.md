# Rasm promptlari (ChatGPT / Gemini uchun)

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

**Jami: 159 ta rasm.**

## 🐦 Maskot — Popishak (ENG BIRINCHI shuni yarating)

### - [ ] `mascot__idle.png`  ·  1:1 (kvadrat)

```text
Popishak, an adorable cartoon hoopoe bird mascot: orange-peach body, fan-shaped orange crest with black tips, black-and-white striped wings, long thin curved dark beak, big shiny eyes, standing, side view facing right, friendly. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `mascot__idle.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: slow breathing, the crest feathers softly sway, blinks once, a small curious head tilt. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `mascot__happy.png`  ·  1:1 (kvadrat)

```text
Popishak the cartoon hoopoe bird mascot, jumping with joy, crest fully raised like a fan, wings open, eyes happily closed, beak open smiling, facing right. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `mascot__happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: jumps up joyfully twice, the crest fans fully open, wings flap happily. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `mascot__oops.png`  ·  1:1 (kvadrat)

```text
Popishak the cartoon hoopoe bird mascot, puzzled and confused, head tilted, crest lowered, one wing scratching head, facing right. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `mascot__oops.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: tilts head from side to side confused, the crest droops, scratches head with a wing. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `mascot__sleep.png`  ·  1:1 (kvadrat)

```text
Popishak the cartoon hoopoe bird mascot, sleeping peacefully while standing, eyes closed, crest lowered, cozy, facing right. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `mascot__sleep.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: sleeping: slow deep breathing, the crest gently bobs, a tiny sleepy head nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

## 🏞️ Fonlar (16:9, landshaft)

### - [ ] `bg__map.jpg`  ·  16:9 (landshaft)

```text
bird-eye cheerful Uzbek village valley: rolling green hills, snowy Chimgan mountains far away, blue-domed madrasa on the horizon, rows of tall poplar trees, a small winding irrigation canal (ariq), sunny morning sky with soft clouds, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__garden.jpg`  ·  16:9 (landshaft)

```text
sunny Uzbek fruit orchard: one big lush fruit tree on the left half, green grass, wooden fence, soft blue sky, peaceful, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__market.jpg`  ·  16:9 (landshaft)

```text
cozy Uzbek bazaar stall seen from the front: red-and-white striped awning on top, wooden counter at the bottom, warm sunlight, blurred colorful market behind, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__farm.jpg`  ·  16:9 (landshaft)

```text
Uzbek village farm yard: mud-brick barn with wooden door on the left, wooden fence across the middle, haystacks, green grass, sunny sky, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__workshop.jpg`  ·  16:9 (landshaft)

```text
traditional Uzbek pottery workshop interior: warm terracotta walls, wooden shelf with clay pots (ko'za), patterned tiles, soft window light, wooden floor, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__night.jpg`  ·  16:9 (landshaft)

```text
Uzbek village animal pen at night: wooden fence enclosure with straw floor, crescent moon and stars, deep blue sky, cozy warm lantern glow, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__letters.jpg`  ·  16:9 (landshaft)

```text
cozy children classroom in an Uzbek school: green chalkboard on the wall, carved wooden window, sunlight, wooden floor, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__studio.jpg`  ·  16:9 (landshaft)

```text
bright children art studio: easel, crayons and paint pots on shelves, colorful drawings pinned on the warm cream wall, wooden floor, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__stage.jpg`  ·  16:9 (landshaft)

```text
children puppet theater stage: red velvet curtains on both sides, golden valance on top, warm spotlight in the center, wooden stage floor, dark purple backdrop, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__profiles.jpg`  ·  16:9 (landshaft)

```text
welcoming Uzbek village at golden morning: blue dome and minaret far away, poplar trees, green meadow, soft sunrise sky, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__sleep.jpg`  ·  16:9 (landshaft)

```text
peaceful Uzbek village at night: starry deep blue sky, big crescent moon, dark hills, tiny warm window lights, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

## 🍎 Mevalar

### - [ ] `fruit__olma.png`  ·  1:1 (kvadrat)

```text
a shiny red apple with a green leaf, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `fruit__anor.png`  ·  1:1 (kvadrat)

```text
a ripe red pomegranate with its little crown, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `fruit__gilos.png`  ·  1:1 (kvadrat)

```text
a pair of bright red cherries joined by stems with a leaf, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `fruit__qovun.png`  ·  1:1 (kvadrat)

```text
a golden Uzbek melon (qovun) with a netted skin, oval shape, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `fruit__behi.png`  ·  1:1 (kvadrat)

```text
a yellow fuzzy quince fruit with a leaf, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `fruit__tarvuz.png`  ·  1:1 (kvadrat)

```text
a round dark green striped watermelon, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `fruit__nok.png`  ·  1:1 (kvadrat)

```text
a light green pear with a leaf, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `fruit__uzum.png`  ·  1:1 (kvadrat)

```text
a bunch of purple grapes with a vine leaf, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `fruit__anjir.png`  ·  1:1 (kvadrat)

```text
a purple fig, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `fruit__orik.png`  ·  1:1 (kvadrat)

```text
an orange apricot with a leaf, one single fruit, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

## 🐑 Hayvonlar

### - [ ] `animal__sigir.png`  ·  1:1 (kvadrat)

```text
a white cow with black spots, pink nose, small horns, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__sigir.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: chews slowly, swishes its tail, blinks and flicks an ear. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__qoy.png`  ·  1:1 (kvadrat)

```text
a fluffy white sheep with a dark face, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__qoy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: bobs its fluffy head, wiggles its ears, blinks. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__echki.png`  ·  1:1 (kvadrat)

```text
a light brown goat with small curved horns and a little beard, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__echki.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: nods its head, the little beard sways, swishes its short tail. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__xoroz.png`  ·  1:1 (kvadrat)

```text
a colorful rooster with red comb and a big teal-green tail, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__xoroz.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: flaps its wings and crows proudly with the beak open, tail feathers bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__it.png`  ·  1:1 (kvadrat)

```text
a brown puppy with floppy ears, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__it.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: wags its tail fast, pants happily with tongue out, ears bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__mushuk.png`  ·  1:1 (kvadrat)

```text
an orange tabby kitten, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__mushuk.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: slowly swishes its tail, blinks slowly, ears twitch. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__ordak.png`  ·  1:1 (kvadrat)

```text
a yellow duck, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__ordak.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: waddles in place, flaps its small wings, bobs its head. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__eshak.png`  ·  1:1 (kvadrat)

```text
a grey donkey with long ears, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__eshak.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: wiggles its long ears, swishes its tail, nods. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__ot.png`  ·  1:1 (kvadrat)

```text
a brown horse with a dark mane and tail, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__ot.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: shakes its mane, swishes its tail, lifts one front hoof. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__tuya.png`  ·  1:1 (kvadrat)

```text
a light brown two-humped Bactrian camel, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__tuya.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: chews slowly, blinks with long lashes, sways its neck. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__quyon.png`  ·  1:1 (kvadrat)

```text
a fluffy grey-white bunny rabbit with long ears, sitting, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__quyon.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: twitches its nose, ears flop, small hop in place. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__tovuq.png`  ·  1:1 (kvadrat)

```text
a plump brown hen with a small red comb, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__tovuq.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: pecks the ground, bobs its head, fluffs its feathers. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__joja.png`  ·  1:1 (kvadrat)

```text
a tiny fluffy yellow baby chick, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__joja.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: hops in place, flaps tiny wings, opens its little beak. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__goz.png`  ·  1:1 (kvadrat)

```text
a white goose with an orange beak and orange feet, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__goz.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: stretches its neck, flaps its wings, waddles. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__baliq.png`  ·  1:1 (kvadrat)

```text
a bright orange fish with big fins, side view (not standing), full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__baliq.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: swims in place: tail and fins wave, bubbles rise. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__kapalak.png`  ·  1:1 (kvadrat)

```text
a colorful butterfly with big orange-blue wings, top view (not standing), full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__kapalak.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: flaps its wings slowly, antennae wiggle. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__ari.png`  ·  1:1 (kvadrat)

```text
a cute round honeybee with yellow-black stripes and small wings (not standing), full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__ari.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: buzzes in place, wings blur, bobs up and down. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__toshbaqa.png`  ·  1:1 (kvadrat)

```text
a small turtle with a brown patterned shell, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__toshbaqa.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: pokes its head out, blinks, slow step in place. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__ayiq.png`  ·  1:1 (kvadrat)

```text
a brown bear cub, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__ayiq.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: waves a paw, rocks side to side, blinks. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__fil.png`  ·  1:1 (kvadrat)

```text
a small grey elephant calf with big ears, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__fil.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: raises its trunk, flaps its big ears, sways. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__hakka.png`  ·  1:1 (kvadrat)

```text
a black-and-white magpie bird with a long tail, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__hakka.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: hops, tilts its head, flicks its long tail. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__ilon.png`  ·  1:1 (kvadrat)

```text
a friendly green-and-yellow cartoon snake coiled with its head raised (no legs), full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__ilon.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: sways its head side to side, flicks its tongue, blinks. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__jirafa.png`  ·  1:1 (kvadrat)

```text
a baby giraffe with a long neck and brown spots, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__jirafa.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: bends its long neck, blinks, twitches its ears. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__laylak.png`  ·  1:1 (kvadrat)

```text
a white stork with black wing tips, long red beak and long red legs, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__laylak.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: stands on one leg, flaps its wings, nods. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__zebra.png`  ·  1:1 (kvadrat)

```text
a baby zebra with black and white stripes, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__zebra.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: swishes its tail, nods, flicks its ears. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__chumoli.png`  ·  1:1 (kvadrat)

```text
a cute red-brown ant with six small legs and antennae, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__chumoli.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: wiggles its antennae, taps its legs, bobs. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__sher.png`  ·  1:1 (kvadrat)

```text
a friendly lion cub with a small fluffy golden mane, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__sher.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: shakes its little mane, yawns, swishes its tail. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

## 🧕 Odamlar (bozor mijozlari, kasblar)

### - [ ] `person__bobo.png`  ·  1:1 (kvadrat)

```text
a kind Uzbek grandfather with white beard, black-and-white doppi skullcap, striped blue chapan robe, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__bobo.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__bobo-happy.png`  ·  1:1 (kvadrat)

```text
a kind Uzbek grandfather with white beard, black-and-white doppi skullcap, striped blue chapan robe, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__bobo-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__buvi.png`  ·  1:1 (kvadrat)

```text
a sweet Uzbek grandmother with a white headscarf and purple dress, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__buvi.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key blue background (#0000FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__buvi-happy.png`  ·  1:1 (kvadrat)

```text
a sweet Uzbek grandmother with a white headscarf and purple dress, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__buvi-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key blue background (#0000FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__aka.png`  ·  1:1 (kvadrat)

```text
a young Uzbek man with a doppi skullcap and white shirt with dark vest, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__aka.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__aka-happy.png`  ·  1:1 (kvadrat)

```text
a young Uzbek man with a doppi skullcap and white shirt with dark vest, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__aka-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__opa.png`  ·  1:1 (kvadrat)

```text
a young Uzbek woman with long braids in a colorful atlas ikat dress, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__opa.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__opa-happy.png`  ·  1:1 (kvadrat)

```text
a young Uzbek woman with long braids in a colorful atlas ikat dress, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__opa-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__bola.png`  ·  1:1 (kvadrat)

```text
a cheerful little Uzbek boy with a blue cap and green t-shirt, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__bola.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__bola-happy.png`  ·  1:1 (kvadrat)

```text
a cheerful little Uzbek boy with a blue cap and green t-shirt, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__bola-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__shifokor.png`  ·  1:1 (kvadrat)

```text
a kind Uzbek woman doctor in a white coat with a stethoscope, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__shifokor.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__shifokor-happy.png`  ·  1:1 (kvadrat)

```text
a kind Uzbek woman doctor in a white coat with a stethoscope, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__shifokor-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__oshpaz.png`  ·  1:1 (kvadrat)

```text
a cheerful Uzbek cook with a white chef hat and apron, holding a ladle, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__oshpaz.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__oshpaz-happy.png`  ·  1:1 (kvadrat)

```text
a cheerful Uzbek cook with a white chef hat and apron, holding a ladle, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__oshpaz-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__haydovchi.png`  ·  1:1 (kvadrat)

```text
a friendly Uzbek driver with a cap and blue uniform, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__haydovchi.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__haydovchi-happy.png`  ·  1:1 (kvadrat)

```text
a friendly Uzbek driver with a cap and blue uniform, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__haydovchi-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__dehqon.png`  ·  1:1 (kvadrat)

```text
a smiling Uzbek farmer with a doppi skullcap and a small hoe, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__dehqon.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__dehqon-happy.png`  ·  1:1 (kvadrat)

```text
a smiling Uzbek farmer with a doppi skullcap and a small hoe, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__dehqon-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key magenta background (#FF00FF) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

## 🥕 Sabzavotlar

### - [ ] `veg__sabzi.png`  ·  1:1 (kvadrat)

```text
an orange carrot with green leafy top, one single vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `veg__piyoz.png`  ·  1:1 (kvadrat)

```text
a golden-brown onion with a little sprout, one single vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `veg__kartoshka.png`  ·  1:1 (kvadrat)

```text
a light brown potato, one single vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `veg__pomidor.png`  ·  1:1 (kvadrat)

```text
a shiny round red tomato with a small green stem, one single vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `veg__bodring.png`  ·  1:1 (kvadrat)

```text
a fresh green cucumber with small bumps, one single vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `veg__karam.png`  ·  1:1 (kvadrat)

```text
a round light green cabbage head, one single vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `veg__qalampir.png`  ·  1:1 (kvadrat)

```text
a bright red bell pepper with a green stem, one single vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `veg__oshqovoq.png`  ·  1:1 (kvadrat)

```text
a round orange pumpkin with a curly stem, one single vegetable, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

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

### - [ ] `obj__choynak.png`  ·  1:1 (kvadrat)

```text
a traditional Uzbek white porcelain teapot with blue cotton-boll (paxta) pattern, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__piyola.png`  ·  1:1 (kvadrat)

```text
a traditional Uzbek tea bowl (piyola) with blue cotton-boll pattern, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__non.png`  ·  1:1 (kvadrat)

```text
a round Uzbek flatbread (non) with a stamped pattern in the middle, golden crust, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__doppi.png`  ·  1:1 (kvadrat)

```text
a black-and-white Uzbek doppi skullcap with pepper-pod embroidery, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__qoshiq.png`  ·  1:1 (kvadrat)

```text
a wooden spoon, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__soat.png`  ·  1:1 (kvadrat)

```text
a red round alarm clock with two bells on top, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__kitob.png`  ·  1:1 (kvadrat)

```text
an open colorful children picture book, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__qalam.png`  ·  1:1 (kvadrat)

```text
a yellow pencil with a pink eraser, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__koptok.png`  ·  1:1 (kvadrat)

```text
a colorful striped rubber ball, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__mashina.png`  ·  1:1 (kvadrat)

```text
a small red toy car, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__velosiped.png`  ·  1:1 (kvadrat)

```text
a small blue children bicycle, side view, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__soyabon.png`  ·  1:1 (kvadrat)

```text
an open colorful umbrella, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

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

## ☀️ Tabiat

### - [ ] `nature__quyosh.png`  ·  1:1 (kvadrat)

```text
a smiling bright yellow sun with soft rays, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__oy.png`  ·  1:1 (kvadrat)

```text
a smiling pale yellow crescent moon, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__yulduz.png`  ·  1:1 (kvadrat)

```text
a smiling golden five-pointed star, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__bulut.png`  ·  1:1 (kvadrat)

```text
a fluffy white cloud with a gentle smile, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__yomgir.png`  ·  1:1 (kvadrat)

```text
a small grey rain cloud with falling blue raindrops, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__gul.png`  ·  1:1 (kvadrat)

```text
a red tulip flower with two leaves, one single object, with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

## 🗺️ Xarita bekatlari

### - [ ] `station__rasm.png`  ·  1:1 (kvadrat)

```text
a small wooden easel with a colorful child drawing and crayons, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__bog.png`  ·  1:1 (kvadrat)

```text
a small fruit tree full of red apples, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `station__bozor.png`  ·  1:1 (kvadrat)

```text
a tiny Uzbek market stall with striped red awning and fruit crates, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__ferma.png`  ·  1:1 (kvadrat)

```text
a tiny mud-brick barn with a wooden door and a haystack, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__ustaxona.png`  ·  1:1 (kvadrat)

```text
a decorated Uzbek clay pot (ko'za) with blue patterns, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__qora.png`  ·  1:1 (kvadrat)

```text
a small wooden animal pen with a crescent moon above it, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__harflar.png`  ·  1:1 (kvadrat)

```text
a tiny school house with a blue roof and a green chalkboard, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

## 🌳 Qishloq bezaklari (sovg'alar)

### - [ ] `decor__terak.png`  ·  1:1 (kvadrat)

```text
a tall slim Uzbek poplar tree. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `decor__olma_daraxt.png`  ·  1:1 (kvadrat)

```text
a round apple tree with red apples. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `decor__anor_daraxt.png`  ·  1:1 (kvadrat)

```text
a pomegranate tree with red pomegranates. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `decor__gul.png`  ·  1:1 (kvadrat)

```text
a cheerful pink flower in a small clump of grass. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `decor__kungaboqar.png`  ·  1:1 (kvadrat)

```text
a tall sunflower. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `decor__uy.png`  ·  1:1 (kvadrat)

```text
a small white Uzbek village house with flat roof and carved wooden door. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `decor__sori.png`  ·  1:1 (kvadrat)

```text
an Uzbek so'ri (raised wooden platform for sitting) with a red carpet and pillows. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `decor__tandir.png`  ·  1:1 (kvadrat)

```text
an Uzbek clay tandir oven with a round bread next to it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `decor__quduq.png`  ·  1:1 (kvadrat)

```text
a small stone water well with a wooden roof and bucket. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `decor__koza.png`  ·  1:1 (kvadrat)

```text
a terracotta Uzbek water jug (ko'za) with blue pattern band. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

## 🏺 Naqsh plitkalari

### - [ ] `tile__yulduz.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a golden eight-pointed Samarkand star on deep lapis blue, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__bodom.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a red paisley (bodom) motif on cream, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__gul.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a white six-petal flower on turquoise, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__olmos.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a dark teal diamond (rhombus) on warm orange, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__doira.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with purple concentric circles on light peach, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__barg.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a green leaf on pale mint, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame.
```

## 🔘 Tugma ikonkalari

### - [ ] `icon__back.png`  ·  1:1 (kvadrat)

```text
a chunky left-pointing arrow, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__home.png`  ·  1:1 (kvadrat)

```text
a small cute house, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__eraser.png`  ·  1:1 (kvadrat)

```text
a pink rubber eraser, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__undo.png`  ·  1:1 (kvadrat)

```text
a curved arrow turning back to the left, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__camera.png`  ·  1:1 (kvadrat)

```text
a cute blue photo camera, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__gallery.png`  ·  1:1 (kvadrat)

```text
a framed picture with a green hill and a yellow sun, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `icon__album.png`  ·  1:1 (kvadrat)

```text
a red photo album book, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__stage.png`  ·  1:1 (kvadrat)

```text
a little theater stage with red curtains, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__magic.png`  ·  1:1 (kvadrat)

```text
a sparkling golden star, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__done.png`  ·  1:1 (kvadrat)

```text
a bold green check mark, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `icon__music.png`  ·  1:1 (kvadrat)

```text
a purple music note, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__bones.png`  ·  1:1 (kvadrat)

```text
a friendly white cartoon bone, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__bucket.png`  ·  1:1 (kvadrat)

```text
a paint bucket pouring colorful paint, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__brush.png`  ·  1:1 (kvadrat)

```text
a paint brush with a colorful tip, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__skip.png`  ·  1:1 (kvadrat)

```text
a double forward arrow (fast forward), glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__reset.png`  ·  1:1 (kvadrat)

```text
a circular refresh arrow, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__hero.png`  ·  1:1 (kvadrat)

```text
a small happy child figure silhouette in blue and yellow, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__sponge.png`  ·  1:1 (kvadrat)

```text
a yellow kitchen sponge, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `icon__robot.png`  ·  1:1 (kvadrat)

```text
a cute friendly little blue robot head with antenna, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

## 🧺 Boshqa

### - [ ] `ui__basket.png`  ·  1:1 (kvadrat)

```text
an empty woven wicker basket with a handle, front view. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `ui__coin.png`  ·  1:1 (kvadrat)

```text
a shiny golden coin, front view. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `ui__haystack.png`  ·  1:1 (kvadrat)

```text
a round golden haystack. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes, absolutely NO doors, windows, domes, towers or building parts on any character, animal or object, no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

