import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { Anim } from '../lib/assets'

/** Tayyor (AI/rassom) rasm: SVG o'rnida xuddi shu o'lchamda ko'rinadi */
export function ArtImg({ src, className, alt = '', style }: { src: string; className?: string; alt?: string; style?: CSSProperties }) {
  return <img src={src} alt={alt} draggable={false} className={`art art-img ${className ?? ''}`} style={style} />
}

/** Rasm(lar) to'liq yuklangan va dekodlanganmi — yarim yuklangan rasm (tepadan pastga chiziq-chiziq) ko'rinmasin */
const ready = new Set<string>()
function useDecoded(url: string) {
  const [ok, setOk] = useState(() => ready.has(url))
  useEffect(() => {
    if (ready.has(url)) return setOk(true)
    let live = true
    const im = new Image()
    im.src = url
    im.decode()
      .catch(() => undefined)
      .then(() => {
        ready.add(url)
        if (live) setOk(true)
      })
    return () => {
      live = false
    }
  }, [url])
  return ok
}

/** Animatsiyalarni oldindan yuklash (bekat ochilishidan oldin) */
export function preloadSprites(urls: string[]) {
  for (const u of urls) {
    if (ready.has(u)) continue
    const im = new Image()
    im.src = u
    void im.decode().then(
      () => ready.add(u),
      () => undefined,
    )
  }
}

/**
 * Animatsiya (sprite sheet): kadrlar bir qatorda, CSS steps() bilan aylanadi.
 * Kadr nisbati HECH QACHON buzilmaydi: quti o'lchami o'lchanib, ichiga "contain" qilib joylanadi
 * (avval width:100% + max-height:100% bo'yi baland rasmlarni yassilab qo'yardi — quyon, jo'ja).
 */
export function ArtSprite({ anim, className, style }: { anim: Anim; className?: string; style?: CSSProperties }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const loaded = useDecoded(anim.url)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      // Bo'yi aniq bo'lmagan quti (h≈0) — eniga qarab
      if (!w) return setSize(null)
      const sw = h > 1 ? Math.min(w, h * anim.aspect) : w
      setSize({ w: sw, h: sw / anim.aspect })
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [anim.aspect])
  return (
    <div ref={box} className={`art sprite-box ${className ?? ''}`} style={style}>
      <div
        className="sprite"
        style={{
          // --a: kenglik/bo'y nisbati — "sig'dirish" (contain) qoidalari uchun
          ['--a' as string]: anim.aspect,
          aspectRatio: anim.aspect,
          ...(size ? { width: size.w, height: size.h, maxHeight: 'none', flexShrink: 0 } : null),
          visibility: loaded ? undefined : 'hidden',
          backgroundImage: `url("${anim.url}")`,
          backgroundSize: `${anim.frames * 100}% 100%`,
          animation: `sprite-play ${anim.frames / anim.fps}s steps(${anim.frames}, jump-none) infinite`,
        }}
      />
    </div>
  )
}
