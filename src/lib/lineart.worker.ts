import { makeLineArt, type Detail } from './lineart'

// Og'ir hisob-kitob alohida thread'da: ekran qotmaydi, Popishak animatsiyasi to'xtamaydi.
interface Job {
  id: number
  rgba: Uint8ClampedArray
  w: number
  h: number
  detail: Detail
}

const scope = self as unknown as {
  onmessage: ((e: MessageEvent<Job>) => void) | null
  postMessage: (msg: unknown, transfer: Transferable[]) => void
}

scope.onmessage = (e) => {
  const { id, rgba, w, h, detail } = e.data
  const art = makeLineArt(rgba, w, h, detail)
  scope.postMessage({ id, art }, [art.labels.buffer, art.lines.buffer])
}
