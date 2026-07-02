import { useMemo, useState } from 'react'
import type { Schedule, Person } from './lib/parse'
import { loadSettings, saveSettings, type Settings } from './lib/settings'
import { UploadView } from './components/UploadView'
import { PeopleView } from './components/PeopleView'
import { PersonView } from './components/PersonView'
import { SettingsView } from './components/SettingsView'

type View = 'people' | 'person' | 'settings'

export default function App() {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [view, setView] = useState<View>('people')
  const [selected, setSelected] = useState<Person | null>(null)
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  const updateSettings = (s: Settings) => {
    setSettings(s)
    saveSettings(s)
  }

  const header = useMemo(
    () => (
      <header className="topbar">
        <div className="brand">
          <div className="mark">C</div>
          <div className="wordmark">CTR 薪資試算</div>
          {schedule?.monthLabel && <div className="monthchip">{schedule.monthLabel}</div>}
        </div>
        <div className="topbar-right">
          {schedule && (
            <div className="filechip">
              <span>{schedule.fileName}</span>
              <button
                onClick={() => {
                  setSchedule(null)
                  setSelected(null)
                  setView('people')
                }}
              >
                更換
              </button>
            </div>
          )}
          {view === 'settings' ? (
            schedule && (
              <button className="btn-ghost" onClick={() => setView(selected ? 'person' : 'people')}>
                返回
              </button>
            )
          ) : (
            <button className="btn-ghost" onClick={() => setView('settings')}>
              設定
            </button>
          )}
        </div>
      </header>
    ),
    [schedule, view, selected],
  )

  return (
    <>
      {header}
      <main className="main">
        {view === 'settings' ? (
          <SettingsView settings={settings} onChange={updateSettings} />
        ) : !schedule ? (
          <UploadView onLoaded={setSchedule} />
        ) : view === 'person' && selected ? (
          <PersonView
            person={selected}
            schedule={schedule}
            settings={settings}
            onBack={() => {
              setSelected(null)
              setView('people')
            }}
          />
        ) : (
          <PeopleView
            schedule={schedule}
            settings={settings}
            onSelect={(p) => {
              setSelected(p)
              setView('person')
            }}
          />
        )}
      </main>
    </>
  )
}
