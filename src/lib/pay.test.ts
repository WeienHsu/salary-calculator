import { describe, expect, it } from 'vitest'
import { calcDay } from './pay'
import { defaultSettings } from './settings'
import { resolveShift } from './shiftDefs'

const s = defaultSettings()
const day = (code: string, paid = true) => {
  const st = structuredClone(s)
  if (!paid) for (const k of Object.keys(st.specialPaid)) st.specialPaid[k] = false
  return calcDay(1, '三', code, '', 225, st)
}

describe('calcDay 實際出勤班別', () => {
  it('5A 05:00–13:00：無凌晨加成、05:00 整點上班已在時段外領 250', () => {
    const d = day('5A')
    expect(d).toMatchObject({ kind: 'work', hours: 8, base: 1800, night: 0, allowance: 250, total: 2050 })
  })
  it('3AH 03:30–11:30：凌晨 90 分＝3 個半小時×57、450 津貼', () => {
    const d = day('3AH')
    expect(d).toMatchObject({ night: 171, allowance: 450, total: 1800 + 171 + 450 })
  })
  it('4A 04:00–12:00：凌晨 60 分＝2×57、450 津貼', () => {
    expect(day('4A')).toMatchObject({ night: 114, allowance: 450 })
  })
  it('23A 23:00–07:00 跨夜：凌晨 2 小時＝4×57、450 津貼', () => {
    expect(day('23A')).toMatchObject({ night: 228, allowance: 450, total: 2478 })
  })
  it('21AH 21:30–05:30 跨夜：完整涵蓋凌晨時段＝228、450 津貼', () => {
    expect(day('21AH')).toMatchObject({ night: 228, allowance: 450 })
  })
  it('19A 19:00–03:00 跨夜：結束於 03:00 恰好不重疊、21:00 前上班領 250', () => {
    expect(day('19A')).toMatchObject({ night: 0, allowance: 250, total: 2050 })
  })
  it('21B 6 小時班 21:00–03:00：base 1350、21:00 整點上班領 450', () => {
    expect(day('21B')).toMatchObject({ hours: 6, base: 1350, night: 0, allowance: 450 })
  })
  it('13A 13:00–21:00 午班：其他時段領 250', () => {
    expect(day('13A')).toMatchObject({ night: 0, allowance: 250, total: 2050 })
  })
})

describe('calcDay 特殊代碼與休假', () => {
  it('A 全職特休：預設照帳面 8 小時計薪，無加成與津貼', () => {
    expect(day('A')).toMatchObject({ kind: 'special', hours: 8, base: 1800, night: 0, allowance: 0, total: 1800 })
  })
  it('PL 時薪特休：4 小時', () => {
    expect(day('PL')).toMatchObject({ kind: 'special', total: 900 })
  })
  it('DT 公差：8 小時', () => {
    expect(day('DT')).toMatchObject({ kind: 'special', total: 1800 })
  })
  it('特殊代碼關閉計薪時為 0', () => {
    expect(day('A', false)).toMatchObject({ kind: 'special', total: 0, unpaid: true })
  })
  it('例／休／國補：off、0 元', () => {
    expect(day('例')).toMatchObject({ kind: 'off', total: 0 })
    expect(day('休')).toMatchObject({ kind: 'off', total: 0 })
    expect(day('國補')).toMatchObject({ kind: 'off', total: 0 })
  })
  it('無法辨識的代碼標記為 unknown', () => {
    expect(day('新訓')).toMatchObject({ kind: 'unknown', total: 0 })
  })
})

describe('resolveShift 備援規則', () => {
  it('定義表沒有的代碼可由規則推算（如 6B = 06:00 起 6 小時）', () => {
    expect(resolveShift('6B')).toEqual({ start: 360, end: 720, hours: 6 })
  })
  it('19AH 用定義表：19:30–03:30 / 8 小時', () => {
    expect(resolveShift('19AH')).toEqual({ start: 1170, end: 210, hours: 8 })
  })
})
