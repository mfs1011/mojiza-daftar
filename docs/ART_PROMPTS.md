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

**Jami: 69 ta rasm.**

## 🐦 Maskot — Popishak (ENG BIRINCHI shuni yarating)

### - [ ] `mascot__idle.png`  ·  1:1 (kvadrat)

```text
Popishak, an adorable cartoon hoopoe bird mascot: orange-peach body, fan-shaped orange crest with black tips, black-and-white striped wings, long thin curved dark beak, big shiny eyes, standing, side view facing right, friendly. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `mascot__happy.png`  ·  1:1 (kvadrat)

```text
Popishak the cartoon hoopoe bird mascot, jumping with joy, crest fully raised like a fan, wings open, eyes happily closed, beak open smiling, facing right. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `mascot__oops.png`  ·  1:1 (kvadrat)

```text
Popishak the cartoon hoopoe bird mascot, puzzled and confused, head tilted, crest lowered, one wing scratching head, facing right. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `mascot__sleep.png`  ·  1:1 (kvadrat)

```text
Popishak the cartoon hoopoe bird mascot, sleeping peacefully while standing, eyes closed, crest lowered, cozy, facing right. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

## 🏞️ Fonlar (16:9, landshaft)

### - [ ] `bg__map.jpg`  ·  16:9 (landshaft)

```text
bird-eye cheerful Uzbek village valley: rolling green hills, snowy Chimgan mountains far away, blue-domed madrasa on the horizon, rows of tall poplar trees, a small winding irrigation canal (ariq), sunny morning sky with soft clouds, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__garden.jpg`  ·  16:9 (landshaft)

```text
sunny Uzbek fruit orchard: one big lush fruit tree on the left half, green grass, wooden fence, soft blue sky, peaceful, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__market.jpg`  ·  16:9 (landshaft)

```text
cozy Uzbek bazaar stall seen from the front: red-and-white striped awning on top, wooden counter at the bottom, warm sunlight, blurred colorful market behind, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__farm.jpg`  ·  16:9 (landshaft)

```text
Uzbek village farm yard: mud-brick barn with wooden door on the left, wooden fence across the middle, haystacks, green grass, sunny sky, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__workshop.jpg`  ·  16:9 (landshaft)

```text
traditional Uzbek pottery workshop interior: warm terracotta walls, wooden shelf with clay pots (ko'za), patterned tiles, soft window light, wooden floor, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__night.jpg`  ·  16:9 (landshaft)

```text
Uzbek village animal pen at night: wooden fence enclosure with straw floor, crescent moon and stars, deep blue sky, cozy warm lantern glow, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__letters.jpg`  ·  16:9 (landshaft)

```text
cozy children classroom in an Uzbek school: green chalkboard on the wall, carved wooden window, sunlight, wooden floor, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__studio.jpg`  ·  16:9 (landshaft)

```text
bright children art studio: easel, crayons and paint pots on shelves, colorful drawings pinned on the warm cream wall, wooden floor, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__stage.jpg`  ·  16:9 (landshaft)

```text
children puppet theater stage: red velvet curtains on both sides, golden valance on top, warm spotlight in the center, wooden stage floor, dark purple backdrop, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__profiles.jpg`  ·  16:9 (landshaft)

```text
welcoming Uzbek village at golden morning: blue dome and minaret far away, poplar trees, green meadow, soft sunrise sky, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `bg__sleep.jpg`  ·  16:9 (landshaft)

```text
peaceful Uzbek village at night: starry deep blue sky, big crescent moon, dark hills, tiny warm window lights, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

## 🍎 Mevalar

### - [ ] `fruit__olma.png`  ·  1:1 (kvadrat)

```text
a shiny red apple with a green leaf, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `fruit__anor.png`  ·  1:1 (kvadrat)

```text
a ripe red pomegranate with its little crown, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `fruit__gilos.png`  ·  1:1 (kvadrat)

```text
a pair of bright red cherries joined by stems with a leaf, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `fruit__qovun.png`  ·  1:1 (kvadrat)

```text
a golden Uzbek melon (qovun) with a netted skin, oval shape, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `fruit__behi.png`  ·  1:1 (kvadrat)

```text
a yellow fuzzy quince fruit with a leaf, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `fruit__tarvuz.png`  ·  1:1 (kvadrat)

```text
a round dark green striped watermelon, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `fruit__nok.png`  ·  1:1 (kvadrat)

```text
a light green pear with a leaf, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `fruit__uzum.png`  ·  1:1 (kvadrat)

```text
a bunch of purple grapes with a vine leaf, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `fruit__anjir.png`  ·  1:1 (kvadrat)

```text
a purple fig, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `fruit__orik.png`  ·  1:1 (kvadrat)

```text
an orange apricot with a leaf, one single fruit, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

## 🐑 Hayvonlar

### - [ ] `animal__sigir.png`  ·  1:1 (kvadrat)

```text
a white cow with black spots, pink nose, small horns, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `animal__qoy.png`  ·  1:1 (kvadrat)

```text
a fluffy white sheep with a dark face, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `animal__echki.png`  ·  1:1 (kvadrat)

```text
a light brown goat with small curved horns and a little beard, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `animal__xoroz.png`  ·  1:1 (kvadrat)

```text
a colorful rooster with red comb and a big teal-green tail, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `animal__it.png`  ·  1:1 (kvadrat)

```text
a brown puppy with floppy ears, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `animal__mushuk.png`  ·  1:1 (kvadrat)

```text
an orange tabby kitten, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `animal__ordak.png`  ·  1:1 (kvadrat)

```text
a yellow duck, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `animal__eshak.png`  ·  1:1 (kvadrat)

```text
a grey donkey with long ears, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

## 🧕 Bozor mijozlari

### - [ ] `person__bobo.png`  ·  1:1 (kvadrat)

```text
a kind Uzbek grandfather with white beard, black-and-white doppi skullcap, striped blue chapan robe, full body, front view, standing, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `person__bobo-happy.png`  ·  1:1 (kvadrat)

```text
a kind Uzbek grandfather with white beard, black-and-white doppi skullcap, striped blue chapan robe, full body, front view, standing, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `person__buvi.png`  ·  1:1 (kvadrat)

```text
a sweet Uzbek grandmother with a white headscarf and purple dress, full body, front view, standing, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `person__buvi-happy.png`  ·  1:1 (kvadrat)

```text
a sweet Uzbek grandmother with a white headscarf and purple dress, full body, front view, standing, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `person__aka.png`  ·  1:1 (kvadrat)

```text
a young Uzbek man with a doppi skullcap and white shirt with dark vest, full body, front view, standing, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `person__aka-happy.png`  ·  1:1 (kvadrat)

```text
a young Uzbek man with a doppi skullcap and white shirt with dark vest, full body, front view, standing, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `person__opa.png`  ·  1:1 (kvadrat)

```text
a young Uzbek woman with long braids in a colorful atlas ikat dress, full body, front view, standing, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `person__opa-happy.png`  ·  1:1 (kvadrat)

```text
a young Uzbek woman with long braids in a colorful atlas ikat dress, full body, front view, standing, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `person__bola.png`  ·  1:1 (kvadrat)

```text
a cheerful little Uzbek boy with a blue cap and green t-shirt, full body, front view, standing, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `person__bola-happy.png`  ·  1:1 (kvadrat)

```text
a cheerful little Uzbek boy with a blue cap and green t-shirt, full body, front view, standing, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

## 🗺️ Xarita bekatlari

### - [ ] `station__rasm.png`  ·  1:1 (kvadrat)

```text
a small wooden easel with a colorful child drawing and crayons, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__bog.png`  ·  1:1 (kvadrat)

```text
a small fruit tree full of red apples, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `station__bozor.png`  ·  1:1 (kvadrat)

```text
a tiny Uzbek market stall with striped red awning and fruit crates, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__ferma.png`  ·  1:1 (kvadrat)

```text
a tiny mud-brick barn with a wooden door and a haystack, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__ustaxona.png`  ·  1:1 (kvadrat)

```text
a decorated Uzbek clay pot (ko'za) with blue patterns, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__qora.png`  ·  1:1 (kvadrat)

```text
a small wooden animal pen with a crescent moon above it, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `station__harflar.png`  ·  1:1 (kvadrat)

```text
a tiny school house with a blue roof and a green chalkboard, game map icon. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

## 🌳 Qishloq bezaklari (sovg'alar)

### - [ ] `decor__terak.png`  ·  1:1 (kvadrat)

```text
a tall slim Uzbek poplar tree. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `decor__olma_daraxt.png`  ·  1:1 (kvadrat)

```text
a round apple tree with red apples. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `decor__anor_daraxt.png`  ·  1:1 (kvadrat)

```text
a pomegranate tree with red pomegranates. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `decor__gul.png`  ·  1:1 (kvadrat)

```text
a cheerful pink flower in a small clump of grass. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key blue background (#0000FF), no shadow on the background, no ground, no other objects, no pure saturated blue color on the object itself.
```

### - [ ] `decor__kungaboqar.png`  ·  1:1 (kvadrat)

```text
a tall sunflower. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `decor__uy.png`  ·  1:1 (kvadrat)

```text
a small white Uzbek village house with flat roof and carved wooden door. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `decor__sori.png`  ·  1:1 (kvadrat)

```text
an Uzbek so'ri (raised wooden platform for sitting) with a red carpet and pillows. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `decor__tandir.png`  ·  1:1 (kvadrat)

```text
an Uzbek clay tandir oven with a round bread next to it. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `decor__quduq.png`  ·  1:1 (kvadrat)

```text
a small stone water well with a wooden roof and bucket. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `decor__koza.png`  ·  1:1 (kvadrat)

```text
a terracotta Uzbek water jug (ko'za) with blue pattern band. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

## 🏺 Naqsh plitkalari

### - [ ] `tile__yulduz.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a golden eight-pointed Samarkand star on deep lapis blue, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__bodom.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a red paisley (bodom) motif on cream, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__gul.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a white six-petal flower on turquoise, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__olmos.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a dark teal diamond (rhombus) on warm orange, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__doira.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with purple concentric circles on light peach, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

### - [ ] `tile__barg.png`  ·  1:1 (kvadrat)

```text
a square ceramic tile with a green leaf on pale mint, flat front view, the tile fills the whole image edge to edge, glossy glaze. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame.
```

## 🧺 Boshqa

### - [ ] `ui__basket.png`  ·  1:1 (kvadrat)

```text
an empty woven wicker basket with a handle, front view. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `ui__coin.png`  ·  1:1 (kvadrat)

```text
a shiny golden coin, front view. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `ui__haystack.png`  ·  1:1 (kvadrat)

```text
a round golden haystack. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

