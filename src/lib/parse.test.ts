import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { loadWorkbook, parseSheet } from './parse'

const scheduleRows: unknown[][] = [
  [null, null, '姓名', 1, 2, 3, '總'],
  [null, null, null, '三', '四', '五', '休'],
  [1, 179999, '王小明', '5A', '例', '23A', 1],
  [null, 'FT ', '全職', null, 'C1', null, null],
  [2, 279999, '陳大文', '3AH', '休', 'A', 1],
  [null, null, '時薪', null, null, '特休', null],
]

function toBuffer(wb: XLSX.WorkBook): ArrayBuffer {
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

function makeWorkbook(sheets: Record<string, unknown[][]>): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()
  for (const [name, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows as unknown[][]), name)
  }
  return wb
}

describe('loadWorkbook 工作表選擇', () => {
  it('名稱包含「班表」即可，不需要是第一頁、不需要完全同名', () => {
    const wb = makeWorkbook({ 說明: [['hi']], '2026-8月班表(正式)': scheduleRows })
    const result = loadWorkbook(toBuffer(wb), '2026-8月班表.xlsx')
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.schedule.sheetName).toBe('2026-8月班表(正式)')
      expect(result.schedule.people).toHaveLength(2)
      expect(result.schedule.people[0]).toMatchObject({
        name: '王小明',
        category: '全職',
        days: ['5A', '例', '23A'],
        notes: ['', 'C1', ''],
      })
      expect(result.schedule.people[1].category).toBe('時薪')
      expect(result.schedule.monthLabel).toBe('2026 年 8 月')
    }
  })

  it('找不到「班表」時回傳 choose，列出全部工作表讓使用者選', () => {
    const wb = makeWorkbook({ 資料: scheduleRows, 說明: [['hi']] })
    const result = loadWorkbook(toBuffer(wb), 'x.xlsx')
    expect(result.kind).toBe('choose')
    if (result.kind === 'choose') {
      expect(result.choice.sheetNames).toEqual(['資料', '說明'])
      expect(result.choice.hasCandidates).toBe(false)
      // 使用者選了正確的工作表後可正常解析
      const schedule = parseSheet(result.choice.workbook, '資料', 'x.xlsx')
      expect(schedule.people).toHaveLength(2)
    }
  })

  it('多個候選時回傳 choose，只列出候選', () => {
    const wb = makeWorkbook({ 班表A: scheduleRows, 班表B: scheduleRows })
    const result = loadWorkbook(toBuffer(wb), 'x.xlsx')
    expect(result.kind).toBe('choose')
    if (result.kind === 'choose') {
      expect(result.choice.sheetNames).toEqual(['班表A', '班表B'])
      expect(result.choice.hasCandidates).toBe(true)
    }
  })
})

describe('parseSheet 防呆', () => {
  it('大多數格子無法辨識（如 #REF! 的檢查表）→ 明確報錯', () => {
    const garbage: unknown[][] = [
      [null, null, '姓名', 1, 2, 3],
      [null, null, null, '三', '四', '五'],
      [1, 179999, '王小明', '#REF!', '#REF!', '#REF!', 1],
      [null, 'FT', '全職', null, null, null],
    ]
    const wb = makeWorkbook({ 檢查表: garbage })
    expect(() => parseSheet(wb, '檢查表', 'x.xlsx')).toThrow(/看起來不是班表/)
  })

  it('沒有日期列 → 明確報錯', () => {
    const wb = makeWorkbook({ 說明: [['這是說明頁'], ['沒有日期'], ['第三列']] })
    expect(() => parseSheet(wb, '說明', 'x.xlsx')).toThrow(/找不到日期欄位/)
  })

  it('少量無法辨識的代碼（新訓、課）不影響解析', () => {
    const rows: unknown[][] = [
      [null, null, '姓名', 1, 2, 3],
      [null, null, null, '三', '四', '五'],
      [1, 179999, '王小明', '5A', '新訓', '9A', 1],
      [null, 'FT', '全職', null, null, null],
    ]
    const wb = makeWorkbook({ 班表: rows })
    const schedule = parseSheet(wb, '班表', 'x.xlsx')
    expect(schedule.unknownCodes).toEqual(['新訓'])
    expect(schedule.people).toHaveLength(1)
  })
})
