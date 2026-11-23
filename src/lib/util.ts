export function today(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export const randInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1))

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
