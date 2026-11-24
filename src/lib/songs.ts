// 🎶 Musiqa uyida o'rganiladigan haqiqiy kuylar — hammasi xalq/mualliflik huquqi tugagan (public domain) kuylar.
// Kuy jumlalarga bo'lingan: bola avval bitta jumlani, keyin keyingisini, oxirida birlashtirib chaladi.
// Yozuv: "E4 D4 C4:2" — nota (lotin harfi + oktava) va zarb soni (yo'q bo'lsa — 1).

export interface SongNote {
  midi: number
  beats: number
}
export interface Song {
  id: string
  /** Bolaga ko'rsatiladigan nom */
  name: string
  phrases: SongNote[][]
}

const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
function parse(s: string): SongNote[] {
  return s
    .trim()
    .split(/\s+/)
    .map((t) => {
      const m = /^([A-G])(#?)(\d)(?::([\d.]+))?$/.exec(t)
      if (!m) throw new Error(`Nota xato: ${t}`)
      return { midi: 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] ? 1 : 0), beats: m[4] ? Number(m[4]) : 1 }
    })
}
const song = (id: string, name: string, ...phrases: string[]): Song => ({ id, name, phrases: phrases.map(parse) })

export const SONGS: Record<string, Song> = Object.fromEntries(
  [
    // Hot Cross Buns
    song('nonlar', 'Issiq nonlar', 'E4 D4 C4:2', 'C4:.5 C4:.5 C4:.5 C4:.5 D4:.5 D4:.5 D4:.5 D4:.5', 'E4 D4 C4:2'),
    // Mary Had a Little Lamb
    song('qozichoq', "Qo'zichoq", 'E4 D4 C4 D4 E4 E4 E4:2', 'D4 D4 D4:2 E4 G4 G4:2', 'E4 D4 C4 D4 E4 E4 E4 E4', 'D4 D4 E4 D4 C4:4'),
    // Ah vous dirai-je, maman (Twinkle Twinkle)
    song(
      'yulduzcha',
      'Yulduzcha',
      'C4 C4 G4 G4 A4 A4 G4:2',
      'F4 F4 E4 E4 D4 D4 C4:2',
      'G4 G4 F4 F4 E4 E4 D4:2',
      'C4 C4 G4 G4 A4 A4 G4:2',
    ),
    // Frère Jacques
    song('jak', "Uyg'on, uyg'on!", 'C4 D4 E4 C4 C4 D4 E4 C4', 'E4 F4 G4:2 E4 F4 G4:2', 'G4:.5 A4:.5 G4:.5 F4:.5 E4 C4', 'C4 G3 C4:2 C4 G3 C4:2'),
    // Old MacDonald
    song('ferma', 'Bobomning fermasi', 'C5 C5 C5 G4 A4 A4 G4:2', 'E5 E5 D5 D5 C5:3'),
    // Row, Row, Row Your Boat
    song('qayiq', 'Qayiqcha', 'C4:1.5 C4:1.5 C4 D4:.5 E4:1.5', 'E4 D4:.5 E4 F4:.5 G4:3', 'C5:.5 C5:.5 G4:.5 G4:.5 E4:.5 E4:.5 C4:.5 C4:.5', 'G4 F4:.5 E4 D4:.5 C4:3'),
    // London Bridge
    song('koprik', "Ko'prik", 'G4:1.5 A4:.5 G4 F4 E4 F4 G4:2', 'D4 E4 F4:2 E4 F4 G4:2', 'G4:1.5 A4:.5 G4 F4 E4 F4 G4:2', 'D4:2 G4:2 E4 C4:3'),
    // Ode to Joy (Beethoven)
    song('shodlik', "Shodlik qo'shig'i", 'E4 E4 F4 G4 G4 F4 E4 D4', 'C4 C4 D4 E4 E4:1.5 D4:.5 D4:2', 'E4 E4 F4 G4 G4 F4 E4 D4', 'C4 C4 D4 E4 D4:1.5 C4:.5 C4:2'),
    // Jingle Bells (naqarot)
    song('qongiroq', "Qo'ng'iroqcha", 'E4 E4 E4:2', 'E4 G4 C4:1.5 D4:.5 E4:4', 'F4 F4 F4:1.5 F4:.5 F4 E4 E4 E4:.5 E4:.5', 'E4 D4 D4 E4 D4:2 G4:2'),
    // Brahms — Wiegenlied (alla)
    song('alla', 'Alla', 'E4:.5 E4:.5 G4:2 E4:.5 E4:.5 G4:2', 'E4:.5 G4:.5 C5 B4:1.5 A4:.5 A4 G4', 'D4:.5 E4:.5 F4 D4 D4:.5 E4:.5 F4:2', 'D4:.5 F4:.5 B4 A4 G4 B4 C5:2'),
    // Happy Birthday (2016 dan public domain)
    song('tugilgan', "Tug'ilgan kun", 'G4:.75 G4:.25 A4 G4 C5 B4:2', 'G4:.75 G4:.25 A4 G4 D5 C5:2', 'G4:.75 G4:.25 G5 E5 C5 B4 A4:2', 'F5:.75 F5:.25 E5 C5 D5 C5:2'),
  ].map((s) => [s.id, s]),
)

/** Raund: kuyning qaysi jumlalari birga chalinadi */
export function joinPhrases(s: Song, idx: number[]): SongNote[] {
  return idx.flatMap((i) => s.phrases[i])
}
