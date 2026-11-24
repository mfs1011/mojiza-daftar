import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { say } from '../lib/audio'
import { isNewTask, markTaskSeen } from '../lib/howto'
import { centerOf, HandHint, type HandPath } from './HandHint'

// "Qanday bajariladi?" — barcha o'yinlar uchun umumiy yordamchi:
//   • yangi topshiriq turi birinchi marta chiqqanda — batafsil ovozli tushuntirish + ko'rsatuvchi qo'l
//   • "?" tugmasi — istalgan payt qayta tushuntirish
//   • 2 xatodan keyin yoki 9 soniya harakatsizlikdan keyin — qo'l o'zi ko'rsatadi
//
// O'yin faqat "qanday ko'rsatish"ni beradi (demo funksiyasi): qaysi elementni bosish, qayerga sudrash.

export interface HowTo {
  /** Raund boshlanganda chaqiriladi: yangi bo'lsa tushuntiradi, aks holda qisqa buyruqni aytadi */
  start: (task: string, instruction: string[]) => void
  /** Xato bo'ldi — ikkinchisidan keyin ko'rsatadi */
  miss: () => void
  /** Raund yechildi — qo'l yo'qoladi, kuzatish to'xtaydi */
  done: () => void
  /** Elementni bosib ko'rsatish */
  tap: (selector: string) => void
  /** Bir nuqtadan ikkinchisiga sudrab ko'rsatish (yoki chiziq bo'ylab) */
  drag: (path: HandPath) => void
  /** "?" tugmasi va ko'rsatuvchi qo'l */
  overlay: React.ReactNode
}

export function useHowTo(profileId: string, prefix: string, demo: () => void): HowTo {
  const [hint, setHint] = useState<{ mode: 'tap' | 'trace'; path: HandPath; n: number } | null>(null)
  const [active, setActive] = useState(true)
  const token = useRef(0)
  const misses = useRef(0)
  const lastAct = useRef(Date.now())
  const task = useRef('')
  const startedAt = useRef(0)
  const instr = useRef<string[]>([])
  const demoRef = useRef(demo)
  useEffect(() => {
    demoRef.current = demo
  })

  function runDemo() {
    lastAct.current = Date.now()
    setHint(null)
    demoRef.current()
  }

  async function explain() {
    const my = ++token.current
    setHint(null)
    await say(`${prefix}_${task.current}_t`, ...instr.current)
    if (my === token.current) runDemo()
  }

  // Uzoq harakatsizlik — qo'l o'zi ko'rsatadi
  useEffect(() => {
    if (!active) return
    const touch = () => (lastAct.current = Date.now())
    window.addEventListener('pointerdown', touch)
    const id = window.setInterval(() => {
      if (!hint && Date.now() - lastAct.current > 9000) runDemo()
    }, 1000)
    return () => {
      window.removeEventListener('pointerdown', touch)
      window.clearInterval(id)
    }
  })

  const api: HowTo = {
    start(t, instruction) {
      // StrictMode effektni ketma-ket ikki marta chaqiradi: ikkinchisi birinchi tushuntirishni bekor qilmasin
      if (task.current === t && Date.now() - startedAt.current < 400) return
      startedAt.current = Date.now()
      task.current = t
      instr.current = instruction
      misses.current = 0
      lastAct.current = Date.now()
      token.current++
      setHint(null)
      setActive(true)
      const key = `${prefix}_${t}`
      if (isNewTask(profileId, key)) {
        markTaskSeen(profileId, key)
        void explain()
      } else void say(...instruction)
    },
    miss() {
      if (++misses.current === 2) setTimeout(runDemo, 900)
    },
    done() {
      token.current++
      setHint(null)
      setActive(false)
    },
    tap(selector) {
      const p = centerOf(document.querySelector(selector))
      if (p) setHint({ mode: 'tap', path: [p], n: Date.now() })
    },
    drag(path) {
      if (path.length) setHint({ mode: 'trace', path, n: Date.now() })
    },
    overlay: (
      <>
        {active && (
          <motion.button className="help-btn" onClick={() => void explain()} whileTap={{ scale: 0.9 }} aria-label="Qanday bajariladi?">
            ?
          </motion.button>
        )}
        {hint && <HandHint key={hint.n} mode={hint.mode} path={hint.path} onDone={() => setHint(null)} />}
      </>
    ),
  }
  return api
}

/** Ikki element markazi orasidagi yo'l (sudrab ko'rsatish uchun) */
export function pathBetween(fromSel: string, toSel: string, steps = 14): HandPath {
  const a = centerOf(document.querySelector(fromSel))
  const b = centerOf(document.querySelector(toSel))
  if (!a || !b) return []
  return Array.from({ length: steps }, (_, i) => ({ x: a.x + ((b.x - a.x) * i) / (steps - 1), y: a.y + ((b.y - a.y) * i) / (steps - 1) }))
}
