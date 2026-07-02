import { useRef, useState } from 'react'
import { loadWorkbook, parseSheet, type Schedule, type SheetChoice } from '../lib/parse'

export function UploadView({ onLoaded }: { onLoaded: (s: Schedule) => void }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [choice, setChoice] = useState<SheetChoice | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    setChoice(null)
    try {
      const data = await file.arrayBuffer()
      const result = loadWorkbook(data, file.name)
      if (result.kind === 'ok') onLoaded(result.schedule)
      else setChoice(result.choice)
    } catch (e) {
      setError(`無法解析檔案：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const pickSheet = (sheetName: string) => {
    if (!choice) return
    setError('')
    try {
      onLoaded(parseSheet(choice.workbook, sheetName, choice.fileName))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <>
      {error && <div className="error-box">{error}</div>}
      {choice && (
        <div className="setcard">
          <div className="set-t">
            {choice.hasCandidates
              ? '有多個工作表名稱包含「班表」，請選擇要使用的工作表：'
              : '找不到名稱包含「班表」的工作表，請選擇班表所在的工作表：'}
          </div>
          <div className="set-d">{choice.fileName}</div>
          <div className="sheetpick">
            {choice.sheetNames.map((name) => (
              <button key={name} className="btn-ghost" onClick={() => pickSheet(name)}>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div
        className={`dropzone${dragging ? ' dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void handleFile(e.dataTransfer.files[0])
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#BC5B21" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          <path d="M12 15V4" />
          <path d="M7 9l5-5 5 5" />
        </svg>
        <h2>將班表 Excel 拖放到這裡</h2>
        <p>或點擊選擇檔案 · 支援 .xlsx</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
      <div className="privacy">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="4" y="11" width="16" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        <span>檔案只在你的瀏覽器內解析，不會上傳到任何伺服器 · 薪資設定會自動記住</span>
      </div>
    </>
  )
}
