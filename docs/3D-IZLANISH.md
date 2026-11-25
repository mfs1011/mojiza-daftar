# Bepul va sifatli 3D personaj yaratish — izlanish (ochiq vazifa)

> Qaror (2026-11-24): hozircha personaj va hayvonlar **2D rasm + GIF** bilan jonlantiriladi
> (uslub 100% saqlanadi). 3D — keyinroq, sifatli **va bepul** yo'l topilganda.

## Sinab ko'rilgan (ot rasmi, `public/models-test/`, sinov sahifasi `model-test.html`)
| Yo'l | Natija |
|---|---|
| TRELLIS (HF `trellis-community/TRELLIS`, bepul) | ✅ 37 s, teksturali GLB 1,3 MB. Shakli to'g'ri, lekin tekstura xiraroq — egasi qoniqmadi |
| Hunyuan3D-2.1 (HF `tencent/Hunyuan3D-2.1`) | ❌ anonim foydalanuvchiga 270 s GPU berilmaydi (HF PRO kerak) |
| Hunyuan3D-2 (HF `tencent/Hunyuan3D-2`) | ❌ teksturalash qismi buzilgan (`texgen_worker` xatosi) |
| Shader bilan harakat (dum, bosh) | ❌ skeletsiz — bosh irg'itish o'rniga tumshuq deformatsiyalandi |
| Mac M3 (24 GB) da lokal | ⚠️ TRELLIS/Hunyuan teksturasi/avto-skelet CUDA talab qiladi; Stable Fast 3D ishlaydi, sifati past |

## Keyingi sinovlar (bepul bo'lishi shart)
1. **Hunyuan3D rasmiy sayti** (3d.hunyuan.tencent.com) — eng yangi versiya, ro'yxatdan o'tganlarga kunlik bepul limit;
   egasi Chrome'da bir marta kiradi, qolganini Claude Chrome orqali bajaradi.
2. **Hugging Face bepul akkaunt tokeni** — anonimdan ko'proq ZeroGPU vaqti; Hunyuan3D-2.1 ga yetishini tekshirish.
3. **Bepul GPU daftarlari** (Google Colab / Kaggle T4) — TRELLIS, Hunyuan3D-2.1 va avtomatik skelet (UniRig)ni
   o'zimiz ishga tushirish; skript bir marta yoziladi, keyin barcha personajlar uchun takrorlanadi.
4. **Skelet va harakat:** to'rt oyoqli hayvonlar uchun avto-rig (UniRig / Blender Rigify), harakatlar — Blender'da
   bir marta yasalib, barcha hayvonlarga qayta ishlatiladi.

## Qabul mezoni
- 2D rasm bilan yonma-yon qo'yilganda uslub (plastilin, yuz, ranglar) farqi sezilmasin;
- haqiqiy skelet harakati (bosh, oyoq, dum) — deformatsiya emas;
- telefonda: bitta personaj ≤ 2 MB, 60 FPS.
