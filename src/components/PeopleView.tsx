import { useMemo, useState } from 'react'
import type { Person, Schedule } from '../lib/parse'
import { calcMonth } from '../lib/pay'
import { CATEGORIES, type Settings } from '../lib/settings'

const TABS = ['全部', ...CATEGORIES] as const

export function PeopleView({
  schedule,
  settings,
  onSelect,
}: {
  schedule: Schedule
  settings: Settings
  onSelect: (p: Person) => void
}) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<(typeof TABS)[number]>('全部')

  const rows = useMemo(
    () =>
      schedule.people.map((p) => ({
        person: p,
        pay: calcMonth(p, schedule.weekdays, settings),
      })),
    [schedule, settings],
  )

  const q = query.trim().toLowerCase()
  const visible = rows.filter(
    ({ person }) =>
      (tab === '全部' || person.category === tab) &&
      (!q || person.name.toLowerCase().includes(q) || person.id.toLowerCase().includes(q)),
  )

  return (
    <>
      <div className="toolbar">
        <div className="summary">
          共 {schedule.people.length} 位員工
          {schedule.skippedNoName > 0 && ` · 已排除 ${schedule.skippedNoName} 位無姓名的員編`}
        </div>
        {schedule.unknownCodes.length > 0 && (
          <div className="warnchip">無法辨識的代碼（不計薪）：{schedule.unknownCodes.join('、')}</div>
        )}
      </div>
      <div className="toolbar">
        <input
          className="searchbox"
          placeholder="搜尋姓名或員編…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="card tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>姓名</th>
              <th>員編</th>
              <th>身分</th>
              <th className="num">上班天數</th>
              <th className="num">總工時</th>
              <th className="num">預估月薪</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ person, pay }) => (
              <tr key={`${person.id}-${person.name}`} className="row-click" onClick={() => onSelect(person)}>
                <td style={{ fontWeight: 600 }}>{person.name}</td>
                <td className="muted">{person.id}</td>
                <td>
                  <span className={`chip chip-${person.category}`}>{person.category}</span>
                </td>
                <td className="num">{pay.workDays}</td>
                <td className="num">{pay.hours} h</td>
                <td className="num pay">NT$ {pay.total.toLocaleString()}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="muted" style={{ textAlign: 'center' }}>
                  沒有符合的人員
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="footnote">點擊任一列查看逐日明細</div>
    </>
  )
}
