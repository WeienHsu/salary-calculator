# CTR 薪資試算

自動解析所有人員的排班並試算每人的當月薪資。

- 檔案**只在瀏覽器內解析，不會上傳到任何伺服器**，班表中的姓名、員編等個資不會離開你的電腦
- 薪資參數（時薪、加成、津貼）可自行調整，會自動記住；也可用「複製含設定的連結」把設定帶到其他裝置或分享給同事
- 點選任一人員可查看逐日明細（班別、時間、工時、各項金額）

## 使用方式

1. 開啟網站，將班表 .xlsx 拖放到頁面（或點擊選擇檔案）
2. 在人員總覽搜尋姓名／員編，或用身分頁籤（全職／時薪／LNF／督導）篩選
3. 點擊人員查看逐日明細；點右上「設定」調整薪資參數，改完即時重算

## 計薪規則

以下為預設規則，金額與時間界線皆可在「設定」頁修改：

**班別代碼**：數字＝開始的「時」，`H`＝30 分開始；`A`＝8 小時、`B`＝6、`C`＝5、`D`＝4、`E`＝7。
例：`5AH`＝05:30–13:30（8 小時）、`23A`＝23:00–07:00（跨夜 8 小時）。

1. **基本薪資** ＝ 班別工時 × 時薪（預設 225 元/小時，可依身分個別設定）
2. **凌晨加成**：實際工作時間與 03:00–05:00 重疊，每滿 30 分鐘 +57 元。
   跨夜班尾端穿過此時段一樣計算（如 `23A` 涵蓋 2 小時 → +228 元）
3. **早班津貼**（每日一次，依上班時刻判定）：
   - 05:00 前上班（如 `3AH`、`4A`）→ +450 元
   - 05:00–05:59 上班（如 `5A`、`5AH`）→ +250 元
   - 其他時段（含晚上上班的跨夜班）→ 無津貼
4. **休假不計薪**：`例`（例假）、`休`（休息日）、`國補` 等為 0 元
5. **特殊代碼照帳面工時計薪**（只算基本薪資，無加成與津貼；可在設定中逐項關閉）：
   - `A` 全職特休（8h）、`PL` 時薪特休（4h）、`DT` 公差／公假（8h）、`OJT`／`TR` 訓練（8h）等
6. 跨夜班歸屬排班當日；備註列（特休、帶班、C1–C10、課程時間等）僅供對照，不影響計算
7. 無法辨識的代碼會在畫面上以警告顯示並以 0 元計，方便人工確認

> 本工具為排班薪資「試算」，實際發薪金額以公司薪資單為準。

## Local Development & Testing

The app must be served by a local server (the source is TypeScript, and browsers block module scripts loaded from `file://`).

Requires [Node.js](https://nodejs.org/) 18 or later.

```bash
npm install     # first time only
npm run dev     # start the dev server, then open http://localhost:5173
```

Drag a schedule .xlsx into the page to try it out. Press `Ctrl+C` in the terminal to stop.

Other useful commands:

```bash
npm test           # run the salary-calculation unit tests
npm run build      # production build (output in dist/)
npm run preview    # serve the production build locally to verify it
```

