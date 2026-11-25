import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { FruitArt } from '../art/Fruit'
import { BasketArt } from '../art/Scenery'
import { say, sfx } from '../lib/audio'
import { storeKinds } from '../lib/economy'
import type { FruitStore } from '../types'

// 🧺 Ombor: bog'da terilgan mevalar — rasmi va soni. Mevaga bossa: "Olma... Besh!"

export function StoreView({ store, onClose }: { store: FruitStore; onClose: () => void }) {
  const kinds = storeKinds(store)

  useEffect(() => {
    void say(kinds.length ? 'ombor_intro' : 'bozor_meva_yoq')
    // Faqat ochilganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div className="store-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className="store-panel" initial={{ scale: 0.6, y: 60 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
        <button className="shop-close" onClick={() => (sfx.tap(), onClose())} aria-label="Yopish">
          ✕
        </button>
        <div className="store-basket">
          <BasketArt />
        </div>
        <div className="store-grid" style={{ gridTemplateColumns: `repeat(${Math.min(5, Math.max(1, kinds.length))}, 15vmin)` }}>
          {kinds.map((k, i) => (
            <motion.button
              key={k}
              className="store-fruit"
              data-kind={k}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                sfx.pop()
                void say(`meva_${k}`, `son_${store[k]}`)
              }}
            >
              <FruitArt kind={k} />
              <span className="store-n">{store[k]}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
