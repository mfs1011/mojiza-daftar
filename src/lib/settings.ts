export interface Settings {
  music: boolean
  ambience: boolean
  /** Balandliklar 0..1 */
  musicVol: number
  fxVol: number
  voiceVol: number
  /** Tungi rejim: hamma ovoz 50% */
  night: boolean
  /** Kunlik o'yin vaqti, daqiqa. 0 — cheklovsiz */
  dailyMinutes: number
}

const KEY = 'qishloq-settings'
const DEFAULTS: Settings = { music: true, ambience: true, musicVol: 1, fxVol: 1, voiceVol: 1, night: false, dailyMinutes: 15 }

export function getSettings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULTS
  }
}

export function saveSettings(s: Settings) {
  localStorage.setItem(KEY, JSON.stringify(s))
}
