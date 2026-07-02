import { useMemo } from 'react'
import type { Person, Schedule } from '../lib/parse'
import { calcMonth, type DayPay } from '../lib/pay'
import { fmtTime } from '../lib/shiftDefs'
import type { Settings } from '../lib/settings'

function codeChipClass(d: DayPay): string {
  if (d.kind === 'work') return 'chip chip-全職'
  if (d.kind === 'special') return 'chip chip-special'
  if (d.kind === 'unknown') return 'chip chip-unknown'
  return 'chip chip-off'
}

export function PersonView({
  person,
  schedule,
  settings,
  onBack,
}: {
  person: Person
  schedule: Schedule
  settings: Settings
  onBack: () => void
}) {
  const pay = useMemo(() => calcMonth(person, schedule.weekdays, settings), [person, schedule, settings])
  const monthNum = /(\d+) 月/.exec(schedule.monthLabel)?.[1] ?? ''
  const rate = settings.rates[person.category]

  const allowParts: string[] = []
  if (pay.allowT1Days > 0) allowParts.push(`${settings.early.tier1Amount} 元 × ${pay.allowT1Days} 天`)
  if (pay.allowT2Days > 0) allowParts.push(`${settings.early.tier2Amount} 元 × ${pay.allowT2Days} 天`)

  return (
    <>
      <button className="backlink" onClick={onBack}>
        ← 返回人員總覽
      </button>
      <div className="person-head">
        <div>
          <div className="person-name">{person.name}</div>
          <div className="person-meta">
            <span className={`chip chip-${person.category}`}>{person.category}</span>
            <span>
              員編 {person.id} · 上班 {pay.workDays} 天 · {pay.hours} 小時
            </span>
          </div>
        </div>
        <div className="totalcard">
          <div className="label">{monthNum ? `${monthNum} 月預估薪資` : '本月預估薪資'}</div>
          <div className="value">NT$ {pay.total.toLocaleString()}</div>
        </div>
      </div>
      <div className="stats">
        <div className="stat">
          <div className="t">基本薪資</div>
          <div className="v">{pay.base.toLocaleString()}</div>
          <div className="s">
            {pay.hours} 小時 × {rate} 元
          </div>
        </div>
        <div className="stat">
          <div className="t">
            凌晨加成 {fmtTime(settings.night.start)}–{fmtTime(settings.night.end)}
          </div>
          <div className="v">{pay.night.toLocaleString()}</div>
          <div className="s">
            {pay.nightHalfHours} 個半小時 × {settings.night.per30min} 元
          </div>
        </div>
        <div className="stat">
          <div className="t">早班津貼</div>
          <div className="v">{pay.allowance.toLocaleString()}</div>
          <div className="s">{allowParts.length > 0 ? allowParts.join(' ＋ ') : '本月無早班'}</div>
        </div>
      </div>
      <div className="card tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>日期</th>
              <th>班別</th>
              <th>備註</th>
              <th>時間</th>
              <th className="num">工時</th>
              <th className="num">基本</th>
              <th className="num">凌晨加成</th>
              <th className="num">津貼</th>
              <th className="num">小計</th>
            </tr>
          </thead>
          <tbody>
            {pay.days.map((d) => {
              const paid = d.kind === 'work' || (d.kind === 'special' && !d.unpaid)
              return (
                <tr key={d.day} className={paid ? '' : 'row-off'}>
                  <td>
                    {monthNum && `${monthNum}/`}
                    {String(d.day).padStart(2, '0')}
                    {d.weekday && `（${d.weekday}）`}
                  </td>
                  <td>
                    <span className={codeChipClass(d)}>{d.code}</span>
                    {d.specialLabel && <span className="muted" style={{ marginLeft: 6, fontSize: 12 }}>{d.specialLabel}</span>}
                    {d.kind === 'unknown' && <span className="muted" style={{ marginLeft: 6, fontSize: 12 }}>無法辨識</span>}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{d.note}</td>
                  <td className="muted">{d.timeText}</td>
                  <td className="num">{paid && d.hours > 0 ? d.hours : '—'}</td>
                  <td className="num">{paid && d.base > 0 ? d.base.toLocaleString() : '—'}</td>
                  <td className="num">{d.night > 0 ? d.night : '—'}</td>
                  <td className="num">{d.allowance > 0 ? d.allowance : '—'}</td>
                  <td className="num pay">{d.total.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="footnote">
        例、休等休假日不計薪；特休（A／PL）、公差（DT）等特殊代碼照帳面工時計薪，可在設定中關閉。備註欄僅供對照，不影響計算。
      </div>
    </>
  )
}
