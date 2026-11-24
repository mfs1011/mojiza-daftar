// "Qanday bajariladi?" — har topshiriq turi bolaga birinchi marta batafsil tushuntiriladi.
// Qaysi turlar tushuntirilgani profil bo'yicha qurilmada saqlanadi.

const KEY = 'qishloq-howto'

function load(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

/** Bu bola bu topshiriqni hali ko'rmaganmi (birinchi marta tushuntirish kerakmi) */
export function isNewTask(profileId: string, task: string): boolean {
  return !(load()[profileId] ?? []).includes(task)
}

export function markTaskSeen(profileId: string, task: string) {
  const all = load()
  all[profileId] = [...new Set([...(all[profileId] ?? []), task])]
  localStorage.setItem(KEY, JSON.stringify(all))
}
