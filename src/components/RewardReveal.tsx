import { ThingArt } from '../art/Thing'
import type { ThingId } from '../lib/things'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AnimalArt } from '../art/Animal'
import { FruitArt } from '../art/Fruit'
import { DecorArt, PersonArt, type DecorKind, type PersonId } from '../art/Scenery'
import { ShapeArt, type ShapeId } from '../art/Shapes'
import { jingle, say, sfx } from '../lib/audio'
import type { AnimalId, FruitKind } from '../lib/names'
import type { Sticker } from '../lib/stickers'
import { burstAt } from './Fx'

/** Stiker rasmi (albom va mukofot oynasi uchun) */
export function StickerArt({ s }: { s: Sticker }) {
  if (s.kind === 'animal') return <AnimalArt id={s.ref as AnimalId} />
  if (s.kind === 'fruit') return <FruitArt kind={s.ref as FruitKind} />
  if (s.kind === 'person') return <PersonArt id={s.ref as PersonId} />
  if (s.kind === 'thing') return <ThingArt id={s.ref as ThingId} />
  return <ShapeArt shape={s.ref as ShapeId} color="sariq" />
}

/**
 * Daraja o'tilgach: avval yangi stiker (karta aylanib ochiladi), keyin — har 5-darajada — hovli uchun
 * uchta sovg'adan birini tanlash. Tanlangan sovg'a hovlining "kutish qutisi"ga tushadi.
 */
export function RewardReveal({ sticker, gifts, onDone }: { sticker: Sticker; gifts: DecorKind[] | null; onDone: (gift?: DecorKind) => void }) {
  const [stage, setStage] = useState<'card' | 'open' | 'gift'>('card')

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStage('open')
      sfx.magic()
      jingle('sticker')
      burstAt(document.querySelector('.reward-card'), ['#ffd166', '#ef476f', '#06d6a0', '#fff'], 26)
      void say('albom_yangi', sticker.voice)
    }, 700)
    return () => clearTimeout(t1)
  }, [sticker])

  function next() {
    if (stage !== 'open') return
    if (gifts) {
      setStage('gift')
      void say('hovli_sovga')
    } else onDone()
  }

  return (
    <motion.div className="reward-veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={next}>
      {stage !== 'gift' ? (
        <motion.div
          className="reward-card"
          initial={{ scale: 0.3, rotateY: 180 }}
          animate={stage === 'open' ? { scale: 1, rotateY: 0 } : { scale: 0.8, rotateY: 180 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14 }}
        >
          {stage === 'open' ? (
            <>
              <div className="reward-sticker">
                <StickerArt s={sticker} />
              </div>
              <motion.span className="reward-tap" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                👆
              </motion.span>
            </>
          ) : (
            <span className="reward-back">?</span>
          )}
        </motion.div>
      ) : (
        <div className="reward-gifts">
          {gifts!.map((g, i) => (
            <motion.button
              key={g}
              className="reward-gift"
              data-kind={g}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: i * 0.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                sfx.pop()
                onDone(g)
              }}
            >
              <DecorArt kind={g} />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
