import * as XLSX from 'xlsx'
import { OFF_CODES, SPECIAL_CODES, resolveShift } from './shiftDefs'
import type { Category } from './settings'

export interface Person {
  id: string
  name: string
  category: Category
  /** 每日班別代碼（索引 0 = 該月 1 日），空字串代表該格為空 */
  days: string[]
  /** 每日備註（特休、帶班、C1 等，僅供顯示對照） */
  notes: string[]
}

export interface Schedule {
  fileName: string
  sheetName: string
  monthLabel: string
  daysInMonth: number
  weekdays: string[]
  people: Person[]
  skippedNoName: number
  unknownCodes: string[]
}

/** 需要使用者手動選擇工作表時的中間狀態 */
export interface SheetChoice {
  workbook: XLSX.WorkBook
  fileName: string
  sheetNames: string[]
  /** true = 有多個名稱含「班表」的候選；false = 完全找不到 */
  hasCandidates: boolean
}

export type LoadResult =
  | { kind: 'ok'; schedule: Schedule }
  | { kind: 'choose'; choice: SheetChoice }

const NOT_NAMES = new Set(['姓名', '全職', '時薪', '督導'])

function cellText(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

/**
 * 讀取活頁簿並自動尋找班表：名稱「包含」班表二字的工作表（位置不限）。
 * 恰好一個候選 → 直接解析；零個或多個 → 交給使用者選擇。
 */
export function loadWorkbook(data: ArrayBuffer, fileName: string): LoadResult {
  const wb = XLSX.read(data)
  const candidates = wb.SheetNames.filter((n) => n.trim().includes('班表'))
  if (candidates.length === 1) {
    return { kind: 'ok', schedule: parseSheet(wb, candidates[0], fileName) }
  }
  return {
    kind: 'choose',
    choice: {
      workbook: wb,
      fileName,
      sheetNames: candidates.length > 1 ? candidates : wb.SheetNames,
      hasCandidates: candidates.length > 1,
    },
  }
}

export function parseSheet(wb: XLSX.WorkBook, sheetName: string, fileName: string): Schedule {
  const rows: unknown[][] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1,
    defval: null,
  })
  if (rows.length < 3) throw new Error(`工作表「${sheetName}」內容不足，請確認選擇的工作表`)

  // 第 1 列從 D 欄（索引 3）起是日期 1..31，遇到非數字（統計欄）為止
  const dayCols: number[] = []
  for (let c = 3; c < (rows[0]?.length ?? 0); c++) {
    const v = rows[0][c]
    if (typeof v === 'number' && v >= 1 && v <= 31) dayCols.push(c)
    else if (dayCols.length > 0) break
  }
  if (dayCols.length === 0) {
    throw new Error(`工作表「${sheetName}」找不到日期欄位（第 1 列應有 1–31 的數字），看起來不是班表`)
  }
  const weekdays = dayCols.map((c) => cellText(rows[1]?.[c]))

  const people: Person[] = []
  const unknown = new Set<string>()
  let skippedNoName = 0
  let knownCells = 0
  let unknownCells = 0

  let r = 2
  while (r < rows.length) {
    const name = cellText(rows[r]?.[2])
    if (!name || NOT_NAMES.has(name)) {
      // 有員編但沒姓名的列（月中新進人員）：跳過並計數
      if (!name && cellText(rows[r]?.[1]) && cellText(rows[r + 1]?.[2]) === '時薪') {
        skippedNoName++
      }
      r++
      continue
    }
    const noteRow = rows[r + 1] ?? []
    const groupTag = cellText(noteRow[1]).toUpperCase() // FT / LNF / SPVR
    const typeTag = cellText(noteRow[2]) // 全職 / 時薪 / 督導
    const category: Category = groupTag.includes('LNF')
      ? 'LNF'
      : typeTag === '督導'
        ? '督導'
        : typeTag === '時薪'
          ? '時薪'
          : '全職'

    const days = dayCols.map((c) => cellText(rows[r][c]))
    const notes = dayCols.map((c) => cellText(noteRow[c]))
    for (const code of days) {
      if (!code) continue
      if (OFF_CODES.has(code) || SPECIAL_CODES[code] || resolveShift(code)) {
        knownCells++
      } else {
        unknownCells++
        unknown.add(code)
      }
    }
    people.push({ id: cellText(rows[r][1]), name, category, days, notes })
    r += 2
  }
  if (people.length === 0) {
    throw new Error(`工作表「${sheetName}」沒有解析到任何人員，請確認選擇的工作表`)
  }
  // 解析品質檢查：無法辨識的格子超過一半，多半是選錯工作表（例如公式錯誤的檢查表）
  if (unknownCells > knownCells) {
    throw new Error(
      `工作表「${sheetName}」的內容大多無法辨識為班別代碼，看起來不是班表，請改選其他工作表`,
    )
  }

  const m = /(\d{4})[^\d]*(\d{1,2})\s*月/.exec(fileName)
  const monthLabel = m ? `${m[1]} 年 ${Number(m[2])} 月` : ''

  return {
    fileName,
    sheetName,
    monthLabel,
    daysInMonth: dayCols.length,
    weekdays,
    people,
    skippedNoName,
    unknownCodes: [...unknown].sort(),
  }
}
