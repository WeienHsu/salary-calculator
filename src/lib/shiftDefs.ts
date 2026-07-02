// 班型定義：來自班表檔「班型與工時(排班使用)」工作表
// start/end 為當日 00:00 起算的分鐘數；end 小於 start 代表跨夜到隔天

export interface ShiftDef {
  start: number
  end: number
  hours: number
}

/** 實際出勤班別（櫃檯排班） */
export const WORK_SHIFTS: Record<string, ShiftDef> = {
  '2AH': { start: 150, end: 630, hours: 8 },
  '2A': { start: 120, end: 900, hours: 8 },
  '2DH': { start: 150, end: 390, hours: 4 },
  '2EH': { start: 150, end: 570, hours: 7 },
  '3A': { start: 180, end: 660, hours: 8 },
  '3AH': { start: 210, end: 690, hours: 8 },
  '3B': { start: 180, end: 540, hours: 6 },
  '3BH': { start: 210, end: 570, hours: 6 },
  '3D': { start: 180, end: 420, hours: 4 },
  '3DH': { start: 210, end: 450, hours: 4 },
  '4A': { start: 240, end: 720, hours: 8 },
  '4AH': { start: 270, end: 750, hours: 8 },
  '4B': { start: 240, end: 600, hours: 6 },
  '4C': { start: 240, end: 540, hours: 5 },
  '4D': { start: 240, end: 480, hours: 4 },
  '5A': { start: 300, end: 780, hours: 8 },
  '5AH': { start: 330, end: 810, hours: 8 },
  '5DH': { start: 330, end: 570, hours: 4 },
  '6A': { start: 360, end: 840, hours: 8 },
  '6AH': { start: 390, end: 870, hours: 8 },
  '6D': { start: 360, end: 600, hours: 4 },
  '7A': { start: 420, end: 900, hours: 8 },
  '7AH': { start: 420, end: 930, hours: 8 },
  '8A': { start: 480, end: 960, hours: 8 },
  '8AH': { start: 510, end: 990, hours: 8 },
  '9A': { start: 540, end: 1020, hours: 8 },
  '9AH': { start: 570, end: 1050, hours: 8 },
  '9D': { start: 540, end: 780, hours: 4 },
  '9DH': { start: 570, end: 810, hours: 4 },
  '10A': { start: 600, end: 1080, hours: 8 },
  '10AH': { start: 630, end: 1110, hours: 8 },
  '10B': { start: 600, end: 960, hours: 6 },
  '10D': { start: 600, end: 840, hours: 4 },
  '11A': { start: 660, end: 1140, hours: 8 },
  '11AH': { start: 690, end: 1170, hours: 8 },
  '11B': { start: 660, end: 1020, hours: 6 },
  '11C': { start: 660, end: 960, hours: 5 },
  '11CH': { start: 690, end: 990, hours: 5 },
  '11D': { start: 660, end: 900, hours: 4 },
  '11DH': { start: 690, end: 930, hours: 4 },
  '12A': { start: 720, end: 1200, hours: 8 },
  '12AH': { start: 750, end: 1230, hours: 8 },
  '12B': { start: 720, end: 1080, hours: 6 },
  '12C': { start: 720, end: 1020, hours: 5 },
  '12D': { start: 720, end: 960, hours: 4 },
  '13A': { start: 780, end: 1260, hours: 8 },
  '13AH': { start: 810, end: 1290, hours: 8 },
  '13B': { start: 780, end: 1140, hours: 6 },
  '13C': { start: 780, end: 1140, hours: 6 },
  '13D': { start: 780, end: 1020, hours: 4 },
  '14A': { start: 840, end: 1320, hours: 8 },
  '14AH': { start: 870, end: 1350, hours: 8 },
  '14B': { start: 840, end: 1200, hours: 6 },
  '15A': { start: 900, end: 1380, hours: 8 },
  '15B': { start: 900, end: 1260, hours: 6 },
  '15D': { start: 900, end: 1140, hours: 4 },
  '16A': { start: 960, end: 0, hours: 8 },
  '16AH': { start: 990, end: 30, hours: 8 },
  '17A': { start: 1020, end: 60, hours: 8 },
  '17AH': { start: 1050, end: 90, hours: 8 },
  '17B': { start: 1020, end: 1380, hours: 6 },
  '17DH': { start: 1050, end: 1290, hours: 4 },
  '17F': { start: 1020, end: 180, hours: 10 },
  '18A': { start: 1080, end: 120, hours: 8 },
  '18AH': { start: 1110, end: 150, hours: 8 },
  '18D': { start: 1080, end: 1320, hours: 4 },
  '18EH': { start: 1110, end: 90, hours: 7 },
  '19A': { start: 1140, end: 180, hours: 8 },
  '19AH': { start: 1170, end: 210, hours: 8 },
  '19BH': { start: 1170, end: 90, hours: 6 },
  '20A': { start: 1200, end: 240, hours: 8 },
  '20AH': { start: 1230, end: 270, hours: 8 },
  '20B': { start: 1200, end: 120, hours: 6 },
  '20BH': { start: 1230, end: 150, hours: 6 },
  '20C': { start: 1200, end: 60, hours: 5 },
  '20CH': { start: 1230, end: 90, hours: 5 },
  '21A': { start: 1260, end: 300, hours: 8 },
  '21AH': { start: 1290, end: 330, hours: 8 },
  '21B': { start: 1260, end: 180, hours: 6 },
  '21BH': { start: 1290, end: 210, hours: 6 },
  '21CH': { start: 1290, end: 150, hours: 5 },
  '21D': { start: 1260, end: 60, hours: 4 },
  '21DH': { start: 1290, end: 90, hours: 4 },
  '22A': { start: 1320, end: 360, hours: 8 },
  '22AH': { start: 1350, end: 390, hours: 8 },
  '22BH': { start: 1350, end: 270, hours: 6 },
  '22D': { start: 1320, end: 120, hours: 4 },
  '22DH': { start: 1350, end: 150, hours: 4 },
  '23A': { start: 1380, end: 420, hours: 8 },
}

/** 特殊代碼：非實際櫃檯出勤，但帳面有工時（特休、公差、受訓等），可在設定中切換是否計薪 */
export interface SpecialDef {
  hours: number
  label: string
}

export const SPECIAL_CODES: Record<string, SpecialDef> = {
  A: { hours: 8, label: '全職特休' },
  PL: { hours: 4, label: '時薪特休' },
  DT: { hours: 8, label: '公差／公假' },
  OJT: { hours: 8, label: '在職訓練' },
  TR: { hours: 8, label: '訓練' },
  RT: { hours: 8, label: 'RT' },
  SL: { hours: 4, label: 'SL' },
  PX: { hours: 4, label: '時薪特殊放送' },
}

/** 休假代碼：不上班、不計薪 */
export const OFF_CODES = new Set(['例', '休', '國', '國補', '指休', 'OD', 'PF'])

/**
 * 代碼規則備援：數字＝開始的「時」，H＝30 分開始，
 * A=8 小時、B=6、C=5、D=4、E=7。定義表沒有的代碼用此規則推算。
 */
const LETTER_HOURS: Record<string, number> = { A: 8, B: 6, C: 5, D: 4, E: 7 }

export function resolveShift(code: string): ShiftDef | null {
  const def = WORK_SHIFTS[code]
  if (def) return def
  const m = /^(\d{1,2})([ABCDE])(H?)$/.exec(code)
  if (!m) return null
  const hours = LETTER_HOURS[m[2]]
  const start = Number(m[1]) * 60 + (m[3] ? 30 : 0)
  if (start >= 1440) return null
  return { start, end: (start + hours * 60) % 1440, hours }
}

export function fmtTime(min: number): string {
  const m = ((min % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
