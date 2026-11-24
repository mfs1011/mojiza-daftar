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

**Jami: 46 ta yangi rasm.** Uslub bir xil chiqishi uchun har so'rovga oldingi rasmlardan birini (masalan `art/animal/sigir.png`) "STYLE reference" qilib biriktiring.

## 🐑 Hayvonlar

### - [ ] `animal__ot.png`  ·  1:1 (kvadrat)

```text
a brown horse with a dark mane and tail, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__ot.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): shakes its mane, swishes its tail, lifts one front hoof. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__tuya.png`  ·  1:1 (kvadrat)

```text
a light brown two-humped Bactrian camel, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__tuya.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): chews slowly, blinks with long lashes, sways its neck. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__quyon.png`  ·  1:1 (kvadrat)

```text
a fluffy grey-white bunny rabbit with long ears, sitting, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__quyon.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): twitches its nose, ears flop, small hop in place. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__tovuq.png`  ·  1:1 (kvadrat)

```text
a plump brown hen with a small red comb, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__tovuq.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): pecks the ground, bobs its head, fluffs its feathers. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__joja.png`  ·  1:1 (kvadrat)

```text
a tiny fluffy yellow baby chick, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__joja.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): hops in place, flaps tiny wings, opens its little beak. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__goz.png`  ·  1:1 (kvadrat)

```text
a white goose with an orange beak and orange feet, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__goz.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): stretches its neck, flaps its wings, waddles. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__baliq.png`  ·  1:1 (kvadrat)

```text
a bright orange fish with big fins, side view (not standing), full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__baliq.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): swims in place: tail and fins wave, bubbles rise. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__kapalak.png`  ·  1:1 (kvadrat)

```text
a colorful butterfly with big orange-blue wings, top view (not standing), full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__kapalak.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): flaps its wings slowly, antennae wiggle. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__ari.png`  ·  1:1 (kvadrat)

```text
a cute round honeybee with yellow-black stripes and small wings (not standing), full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__ari.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): buzzes in place, wings blur, bobs up and down. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__toshbaqa.png`  ·  1:1 (kvadrat)

```text
a small turtle with a brown patterned shell, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__toshbaqa.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): pokes its head out, blinks, slow step in place. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__ayiq.png`  ·  1:1 (kvadrat)

```text
a brown bear cub, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__ayiq.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): waves a paw, rocks side to side, blinks. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `animal__fil.png`  ·  1:1 (kvadrat)

```text
a small grey elephant calf with big ears, full body, standing on four legs (or two for birds), side view facing RIGHT, cute baby proportions, friendly smile. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `animal__fil.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): raises its trunk, flaps its big ears, sways. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

## 🧕 Odamlar (bozor mijozlari, kasblar)

### - [ ] `person__shifokor.png`  ·  1:1 (kvadrat)

```text
a kind Uzbek woman doctor in a white coat with a stethoscope, full body, front view, standing, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__shifokor.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__shifokor-happy.png`  ·  1:1 (kvadrat)

```text
a kind Uzbek woman doctor in a white coat with a stethoscope, full body, front view, standing, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__shifokor-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__oshpaz.png`  ·  1:1 (kvadrat)

```text
a cheerful Uzbek cook with a white chef hat and apron, holding a ladle, full body, front view, standing, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__oshpaz.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__oshpaz-happy.png`  ·  1:1 (kvadrat)

```text
a cheerful Uzbek cook with a white chef hat and apron, holding a ladle, full body, front view, standing, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__oshpaz-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__haydovchi.png`  ·  1:1 (kvadrat)

```text
a friendly Uzbek driver with a cap and blue uniform, full body, front view, standing, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__haydovchi.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__haydovchi-happy.png`  ·  1:1 (kvadrat)

```text
a friendly Uzbek driver with a cap and blue uniform, full body, front view, standing, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__haydovchi-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__dehqon.png`  ·  1:1 (kvadrat)

```text
a smiling Uzbek farmer with a doppi skullcap and a small hoe, full body, front view, standing, friendly calm smile, arms relaxed. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__dehqon.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): gentle idle: breathing, blinks, a small friendly sway and a slight nod. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

### - [ ] `person__dehqon-happy.png`  ·  1:1 (kvadrat)

```text
a smiling Uzbek farmer with a doppi skullcap and a small hoe, full body, front view, standing, very happy laughing with eyes closed, arms slightly raised. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

🎬 **Animatsiya (ixtiyoriy):** tayyor rasmni biriktirib, shu promptni yuboring → `person__dehqon-happy.gif` nomi bilan saqlang

```text
Animate the attached image as a short seamless looping GIF (2-3 seconds): laughs happily and claps hands twice, a small joyful bounce. Keep exactly the same character, design, colors, size and position. The camera does not move, no zoom, no cuts. Keep the solid flat pure chroma-key green background (#00FF00) completely unchanged in every frame. The character always stays fully inside the frame. The last frame must match the first frame for a perfect loop.
```

## 🥕 Sabzavotlar

### - [ ] `veg__sabzi.png`  ·  1:1 (kvadrat)

```text
an orange carrot with green leafy top, one single vegetable, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `veg__piyoz.png`  ·  1:1 (kvadrat)

```text
a golden-brown onion with a little sprout, one single vegetable, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `veg__kartoshka.png`  ·  1:1 (kvadrat)

```text
a light brown potato, one single vegetable, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `veg__pomidor.png`  ·  1:1 (kvadrat)

```text
a shiny round red tomato with a small green stem, one single vegetable, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `veg__bodring.png`  ·  1:1 (kvadrat)

```text
a fresh green cucumber with small bumps, one single vegetable, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `veg__karam.png`  ·  1:1 (kvadrat)

```text
a round light green cabbage head, one single vegetable, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `veg__qalampir.png`  ·  1:1 (kvadrat)

```text
a bright red bell pepper with a green stem, one single vegetable, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

### - [ ] `veg__oshqovoq.png`  ·  1:1 (kvadrat)

```text
a round orange pumpkin with a curly stem, one single vegetable, cute glossy toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

## 🏠 Buyumlar

### - [ ] `obj__choynak.png`  ·  1:1 (kvadrat)

```text
a traditional Uzbek white porcelain teapot with blue cotton-boll (paxta) pattern, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__piyola.png`  ·  1:1 (kvadrat)

```text
a traditional Uzbek tea bowl (piyola) with blue cotton-boll pattern, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__non.png`  ·  1:1 (kvadrat)

```text
a round Uzbek flatbread (non) with a stamped pattern in the middle, golden crust, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__doppi.png`  ·  1:1 (kvadrat)

```text
a black-and-white Uzbek doppi skullcap with pepper-pod embroidery, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__qoshiq.png`  ·  1:1 (kvadrat)

```text
a wooden spoon, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__soat.png`  ·  1:1 (kvadrat)

```text
a red round alarm clock with two bells on top, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__kitob.png`  ·  1:1 (kvadrat)

```text
an open colorful children picture book, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__qalam.png`  ·  1:1 (kvadrat)

```text
a yellow pencil with a pink eraser, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__koptok.png`  ·  1:1 (kvadrat)

```text
a colorful striped rubber ball, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__mashina.png`  ·  1:1 (kvadrat)

```text
a small red toy car, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__velosiped.png`  ·  1:1 (kvadrat)

```text
a small blue children bicycle, side view, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `obj__soyabon.png`  ·  1:1 (kvadrat)

```text
an open colorful umbrella, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

## ☀️ Tabiat

### - [ ] `nature__quyosh.png`  ·  1:1 (kvadrat)

```text
a smiling bright yellow sun with soft rays, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__oy.png`  ·  1:1 (kvadrat)

```text
a smiling pale yellow crescent moon, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__yulduz.png`  ·  1:1 (kvadrat)

```text
a smiling golden five-pointed star, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__bulut.png`  ·  1:1 (kvadrat)

```text
a fluffy white cloud with a gentle smile, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__yomgir.png`  ·  1:1 (kvadrat)

```text
a small grey rain cloud with falling blue raindrops, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key green background (#00FF00), no shadow on the background, no ground, no other objects, no green color on the object itself.
```

### - [ ] `nature__gul.png`  ·  1:1 (kvadrat)

```text
a red tulip flower with two leaves, one single object, cute toy-like look. Soft 3D children's cartoon illustration in the style of a premium mobile kids game, rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion, clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face, Uzbek cultural flavor where relevant (blue tiled domes, carved wooden doors, atlas ikat patterns, suzani motifs, tandir, so'ri, poplar trees), no text, no letters, no logos, no watermark, no border, no frame. a single object, centered, fully visible with generous empty margin around it, isolated on a perfectly flat solid pure chroma-key magenta background (#FF00FF), no shadow on the background, no ground, no other objects, no magenta or hot pink color on the object itself.
```

