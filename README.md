###1151VIS-HW1-414085181-高聖凱

### 414085181 - RTX 50 系列價格趨勢
靜態資料視覺化專案。使用 Vue 3、Vite、D3.js；資料讀專案內的彙整月中位數 CSV。
###

###
```
npm install
```
###
```
npm run dev
```
終端機會顯示本機網址，通常是 `http://localhost:5173/`。以瀏覽器開啟即可；要停止時，在該終端機按 `Ctrl+C`。
###
```
npm run build
```
靜態成品；包含 HTML、JS、CSS 的 CSV 資產。
###
```
npm run preview
```
### 專案結構
```text
src/
  App.vue                         主畫面、篩選、摘要卡、CSV 載入
  components/PriceLineChart.vue   D3 時間軸折線圖與 tooltip
  data/rtx50_tw_monthly_median.csv
  styles.css
vite.config.js                    base: './'，支援 GitHub Pages 相對路徑
```
### CSV 欄位
| 欄位 | 用途 |
|---|---|
| `month` | `YYYY-MM`，一個月一筆 |
| `model` | 型號名稱；必須與現有 8 款名稱一致 |
| `median_ntd` | 當月中位數，整數 NTD |
| `sample_count` | 本月實際納入中位數的可購買樣本數 |
| `source_set` | 本月使用的通路集合，以 `|` 分隔 |
| `notes` | 異常、促銷排除等備註 |
### 手動更新 CSV
1. 開啟 `src/data/rtx50_tw_monthly_median.csv`。
2. 每型號新增一列，例如 `2026-10,RTX 5080,46990,5,PChome|momo|欣亞|原價屋|Yahoo購物中心,各通路同月可下單新品的月中位數`。
3. 同一個月必須補齊 8 款型號；不要改欄位名稱。
4. 以 Excel 開啟時請使用 UTF-8 CSV；儲存時維持逗號分隔 UTF-8。
5. 執行 `npm run dev` 看新月份，然後執行 `npm run build && npm run preview` 驗證成品。
計算方式、納入/排除規則與來源清單在 [docs/data_method.md](docs/data_method.md)。
###
