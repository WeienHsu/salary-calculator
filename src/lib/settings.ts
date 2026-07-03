import { SPECIAL_CODES } from './shiftDefs'

export const CATEGORIES = ['全職', '時薪', 'LNF', '督導'] as const
export type Category = (typeof CATEGORIES)[number]

export interface Settings {
  /** 各身分時薪（元/小時） */
  rates: Record<Category, number>
  /** 凌晨加成：時段內每滿 30 分鐘加給 */
  night: { start: number; end: number; per30min: number }
  /** 早班津貼：上班時刻落在 windowStart–windowEnd（可跨夜）給 windowAmount；其他時段給 otherAmount */
  early: {
    windowStart: number
    windowEnd: number
    windowAmount: number
    otherAmount: number
  }
  /** 特殊代碼（特休/公差/受訓等）是否照帳面工時計薪 */
  specialPaid: Record<string, boolean>
}

export function defaultSettings(): Settings {
  const specialPaid: Record<string, boolean> = {}
  for (const code of Object.keys(SPECIAL_CODES)) specialPaid[code] = true
  return {
    rates: { 全職: 225, 時薪: 225, LNF: 225, 督導: 225 },
    night: { start: 180, end: 300, per30min: 57 },
    early: { windowStart: 1260, windowEnd: 300, windowAmount: 450, otherAmount: 250 },
    specialPaid,
  }
}

const STORAGE_KEY = 'ctr-salary-settings-v1'

function merge(saved: Partial<Settings>): Settings {
  const d = defaultSettings()
  return {
    rates: { ...d.rates, ...(saved.rates ?? {}) },
    night: { ...d.night, ...(saved.night ?? {}) },
    early: { ...d.early, ...(saved.early ?? {}) },
    specialPaid: { ...d.specialPaid, ...(saved.specialPaid ?? {}) },
  }
}

export function loadSettings(): Settings {
  // 網址參數優先（「複製含設定的連結」產生的），其次 localStorage
  try {
    const s = new URLSearchParams(window.location.search).get('s')
    if (s) {
      const decoded = merge(JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))
      saveSettings(decoded)
      return decoded
    }
  } catch {
    /* 無效參數，改用 localStorage */
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return merge(JSON.parse(raw))
  } catch {
    /* localStorage 不可用或內容損毀 */
  }
  return defaultSettings()
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* 無痕模式等情況下寫入失敗，忽略 */
  }
}

export function settingsShareUrl(s: Settings): string {
  const encoded = btoa(JSON.stringify(s)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const url = new URL(window.location.href)
  url.search = `?s=${encoded}`
  return url.toString()
}
