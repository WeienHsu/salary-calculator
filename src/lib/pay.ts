import { OFF_CODES, SPECIAL_CODES, fmtTime, resolveShift } from './shiftDefs'
import type { Settings } from './settings'
import type { Person } from './parse'

export interface DayPay {
  day: number
  weekday: string
  code: string
  note: string
  /** work=實際出勤班別, special=特休/公差等帳面工時, off=休假, unknown=無法辨識 */
  kind: 'work' | 'special' | 'off' | 'unknown'
  timeText: string
  hours: number
  base: number
  night: number
  allowance: number
  total: number
  /** special 代碼但設定為不計薪時為 true */
  unpaid: boolean
  specialLabel?: string
}

export interface MonthPay {
  days: DayPay[]
  workDays: number
  hours: number
  base: number
  night: number
  nightHalfHours: number
  allowance: number
  allowT1Days: number
  allowT2Days: number
  total: number
}

function overlap(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0))
}

export function calcDay(
  day: number,
  weekday: string,
  code: string,
  note: string,
  rate: number,
  s: Settings,
): DayPay {
  const empty = {
    day,
    weekday,
    code,
    note,
    timeText: '—',
    hours: 0,
    base: 0,
    night: 0,
    allowance: 0,
    total: 0,
    unpaid: false,
  }
  if (OFF_CODES.has(code)) return { ...empty, kind: 'off' }

  const special = SPECIAL_CODES[code]
  if (special) {
    const paid = s.specialPaid[code] ?? false
    const base = paid ? special.hours * rate : 0
    return {
      ...empty,
      kind: 'special',
      hours: paid ? special.hours : 0,
      base,
      total: base,
      unpaid: !paid,
      specialLabel: special.label,
    }
  }

  const def = resolveShift(code)
  if (!def) return { ...empty, kind: 'unknown' }

  const start = def.start
  const end = def.end > start ? def.end : def.end + 1440
  const base = def.hours * rate

  // 凌晨加成：與加成時段的重疊分鐘（跨夜班要多檢查隔天的同一時段）
  let nightMin = 0
  for (const shiftBy of [0, 1440]) {
    nightMin += overlap(start, end, s.night.start + shiftBy, s.night.end + shiftBy)
  }
  const nightHalves = Math.floor(nightMin / 30)
  const night = nightHalves * s.night.per30min

  // 早班津貼：依上班時刻分段（晚間上班的跨夜班起始時刻不在界線內，自然不領）
  let allowance = 0
  if (start < s.early.tier1End) allowance = s.early.tier1Amount
  else if (start < s.early.tier2End) allowance = s.early.tier2Amount

  return {
    ...empty,
    kind: 'work',
    timeText: `${fmtTime(def.start)} – ${fmtTime(def.end)}`,
    hours: def.hours,
    base,
    night,
    allowance,
    total: base + night + allowance,
  }
}

export function calcMonth(person: Person, weekdays: string[], s: Settings): MonthPay {
  const rate = s.rates[person.category]
  const days: DayPay[] = []
  const sum: MonthPay = {
    days,
    workDays: 0,
    hours: 0,
    base: 0,
    night: 0,
    nightHalfHours: 0,
    allowance: 0,
    allowT1Days: 0,
    allowT2Days: 0,
    total: 0,
  }
  person.days.forEach((code, i) => {
    if (!code) return
    const d = calcDay(i + 1, weekdays[i] ?? '', code, person.notes[i] ?? '', rate, s)
    days.push(d)
    if (d.kind === 'work' || (d.kind === 'special' && !d.unpaid)) {
      sum.workDays += d.kind === 'work' ? 1 : 0
      sum.hours += d.hours
      sum.base += d.base
      sum.night += d.night
      sum.allowance += d.allowance
      sum.total += d.total
      if (d.allowance === s.early.tier1Amount && d.allowance > 0) sum.allowT1Days++
      else if (d.allowance === s.early.tier2Amount && d.allowance > 0) sum.allowT2Days++
    }
  })
  sum.nightHalfHours = s.night.per30min > 0 ? Math.round(sum.night / s.night.per30min) : 0
  return sum
}
