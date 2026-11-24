import { motion } from 'framer-motion'
import { useState } from 'react'
import { Icon } from '../art/Icon'
import { StickerArt } from '../components/RewardReveal'
import { say, sfx } from '../lib/audio'
import { STICKER_PAGES, STICKERS } from '../lib/stickers'

// 📒 Stiker albomi: yig'ilgan stikerlar rangli, yig'ilmaganlari — soya (bola nimani yig'ishi kerakligini ko'radi).
// Stikerga bosilsa — nomi aytiladi.

export function Album({ owned, onBack }: { owned: string[]; onBack: () => void }) {
  const have = new Set(owned)
  const [page, setPage] = useState(0)
  const [poked, setPoked] = useState<string | null>(null)
  const { kind, title } = STICKER_PAGES[page]
  const list = STICKERS.filter((s) => s.page === kind)
  const got = STICKERS.filter((s) => have.has(s.id)).length

  return (
    <div className="screen album">
      <div className="lp-head">
        <button className="lp-back" onClick={onBack} aria-label="Orqaga">
          <Icon name="back">
            <svg viewBox="0 0 40 40" className="art">
              <path d="M24 8L10 20L24 32" fill="none" stroke="#3d2c1e" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Icon>
        </button>
        <div className="lp-title">📒 Albom</div>
        <div className="lp-total">
          {got} / {STICKERS.length}
        </div>
      </div>

      <div className="album-tabs">
        {STICKER_PAGES.map((p, i) => (
          <button
            key={p.kind}
            className={`album-tab ${i === page ? 'on' : ''}`}
            onClick={() => {
              sfx.tap()
              setPage(i)
            }}
          >
            {p.title}
            <small>
              {STICKERS.filter((s) => s.page === p.kind && have.has(s.id)).length}/{STICKERS.filter((s) => s.page === p.kind).length}
            </small>
          </button>
        ))}
      </div>

      <motion.div key={page} className="album-page" initial={{ rotateY: -25, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}>
        <h3 className="album-title">{title}</h3>
        <div className="album-grid">
          {list.map((s) => {
            const on = have.has(s.id)
            return (
              <motion.button
                key={s.id}
                className={`album-slot ${on ? 'got' : 'empty'}`}
                data-id={s.id}
                animate={poked === s.id ? { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] } : { scale: 1 }}
                onClick={() => {
                  if (!on) return void sfx.wrong()
                  setPoked(null)
                  requestAnimationFrame(() => setPoked(s.id))
                  sfx.pop()
                  void say(s.voice)
                }}
              >
                <span className="album-art">
                  <StickerArt s={s} />
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
