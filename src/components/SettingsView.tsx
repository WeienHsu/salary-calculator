import { useState } from 'react'
import { SPECIAL_CODES, fmtTime } from '../lib/shiftDefs'
import {
  CATEGORIES,
  defaultSettings,
  settingsShareUrl,
  type Settings,
} from '../lib/settings'

function parseTime(v: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v)
  if (!m) return null
  const min = Number(m[1]) * 60 + Number(m[2])
  return min >= 0 && min < 1440 ? min : null
}

function NumInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      className="ipt"
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
    />
  )
}

function TimeInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(fmtTime(value))
  return (
    <input
      className="ipt ipt-time"
      type="time"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        const min = parseTime(e.target.value)
        if (min !== null) onChange(min)
      }}
    />
  )
}

export function SettingsView({
  settings,
  onChange,
}: {
  settings: Settings
  onChange: (s: Settings) => void
}) {
  const [copied, setCopied] = useState(false)
  const s = settings

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(settingsShareUrl(s))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('請手動複製連結：', settingsShareUrl(s))
    }
  }

  return (
    <>
      <div className="set-actions">
        <button className="btn-ghost" onClick={() => onChange(defaultSettings())}>
          還原預設
        </button>
        <button className="btn" onClick={() => void copyLink()}>
          {copied ? '已複製 ✓' : '複製含設定的連結'}
        </button>
      </div>
      <div className="setgrid">
        <div className="setcard">
          <div className="set-t">時薪（依身分）</div>
          <div className="set-d">每種身分可各自設定，預設 225 元/小時</div>
          {CATEGORIES.map((c) => (
            <div className="setrow" key={c}>
              <span>{c}</span>
              <span className="setrow-left">
                <NumInput value={s.rates[c]} onChange={(n) => onChange({ ...s, rates: { ...s.rates, [c]: n } })} />
                <span className="unit">元/hr</span>
              </span>
            </div>
          ))}
        </div>
        <div className="setcard">
          <div className="set-t">凌晨加成</div>
          <div className="set-d">工作時間落在此時段內，每滿 30 分鐘加給</div>
          <div className="setrow">
            <span>時段</span>
            <span className="setrow-left">
              <TimeInput value={s.night.start} onChange={(n) => onChange({ ...s, night: { ...s.night, start: n } })} />
              <span className="unit">–</span>
              <TimeInput value={s.night.end} onChange={(n) => onChange({ ...s, night: { ...s.night, end: n } })} />
            </span>
          </div>
          <div className="setrow">
            <span>金額</span>
            <span className="setrow-left">
              <NumInput value={s.night.per30min} onChange={(n) => onChange({ ...s, night: { ...s.night, per30min: n } })} />
              <span className="unit">元/30分</span>
            </span>
          </div>
        </div>
        <div className="setcard">
          <div className="set-t">早班津貼（每日一次）</div>
          <div className="set-d">依上班時刻判定，時段可跨夜；時段內外各給一種金額</div>
          <div className="setrow">
            <span>時段</span>
            <span className="setrow-left">
              <TimeInput value={s.early.windowStart} onChange={(n) => onChange({ ...s, early: { ...s.early, windowStart: n } })} />
              <span className="unit">–</span>
              <TimeInput value={s.early.windowEnd} onChange={(n) => onChange({ ...s, early: { ...s.early, windowEnd: n } })} />
            </span>
          </div>
          <div className="setrow">
            <span>時段內上班</span>
            <span className="setrow-left">
              <NumInput value={s.early.windowAmount} onChange={(n) => onChange({ ...s, early: { ...s.early, windowAmount: n } })} />
              <span className="unit">元</span>
            </span>
          </div>
          <div className="setrow">
            <span>其他時段上班</span>
            <span className="setrow-left">
              <NumInput value={s.early.otherAmount} onChange={(n) => onChange({ ...s, early: { ...s.early, otherAmount: n } })} />
              <span className="unit">元</span>
            </span>
          </div>
        </div>
        <div className="setcard">
          <div className="set-t">特殊代碼是否計薪</div>
          <div className="set-d">特休、公差、受訓等未實際出勤的代碼，照帳面工時 × 時薪計薪（無加成與津貼）</div>
          {Object.entries(SPECIAL_CODES).map(([code, def]) => (
            <div className="setrow" key={code}>
              <span>
                {code} · {def.label}（{def.hours} 小時）
              </span>
              <button
                className={`tgl${s.specialPaid[code] ? ' on' : ''}`}
                aria-label={`${code} 計薪開關`}
                onClick={() =>
                  onChange({ ...s, specialPaid: { ...s.specialPaid, [code]: !s.specialPaid[code] } })
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="footnote">
        設定會自動儲存在此瀏覽器；「複製含設定的連結」可在其他裝置或分享給同事時帶入相同設定。
      </div>
    </>
  )
}
