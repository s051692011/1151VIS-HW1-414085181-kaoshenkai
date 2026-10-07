# 414085181 - 台灣 RTX 50 系列價格趨勢

靜態資料視覺化專案。前端使用 Vue 3、Vite、D3.js；資料僅讀取專案內的自行彙整月中位數 CSV。

## 本機執行（Windows 11）

### 1. 安裝 Node.js

到 <https://nodejs.org/> 下載並安裝 **LTS** 版。安裝後開啟 PowerShell，確認：

```powershell
node -v
npm -v
```

兩行都顯示版本號才可繼續。

### 2. 解壓與安裝相依套件

解壓本 ZIP 後，在專案根目錄空白處按右鍵，選擇「在終端機開啟」，執行：

```powershell
npm install
```

此步會建立 `node_modules/` 與 `package-lock.json`。兩者不用上傳 GitHub；`.gitignore` 已排除。

### 3. 開發模式

```powershell
npm run dev
```

終端機會顯示本機網址，通常是 `http://localhost:5173/`。以瀏覽器開啟即可；要停止時，在該終端機按 `Ctrl+C`。

### 4. 編譯（production build）

```powershell
npm run build
```

Vite 會建立 `dist/`。此資料夾是可部署的靜態成品；它包含 HTML、JS、CSS 與編譯後的 CSV 資產。

### 5. 本機預覽已編譯成品

先完成 build，再執行：

```powershell
npm run preview
```

開啟終端機顯示的網址，確認折線圖、8 張摘要卡、型號篩選按鈕與 hover tooltip 都正常。完成後按 `Ctrl+C` 停止。

## 專案結構

```text
src/
  App.vue                         主畫面、篩選、摘要卡、CSV 載入
  components/PriceLineChart.vue   D3 時間軸折線圖與 tooltip
  data/rtx50_tw_monthly_median.csv
  styles.css
vite.config.js                    base: './'，支援 GitHub Pages 相對路徑
```

## CSV 欄位

| 欄位 | 用途 |
|---|---|
| `month` | `YYYY-MM`，一個月一筆 |
| `model` | 型號名稱；必須與現有 8 款名稱一致 |
| `median_ntd` | 當月中位數，整數 NTD |
| `sample_count` | 本月實際納入中位數的可購買樣本數 |
| `source_set` | 本月使用的通路集合，以 `|` 分隔 |
| `notes` | 異常、促銷排除等備註 |

## 手動更新 CSV

1. 開啟 `src/data/rtx50_tw_monthly_median.csv`。
2. 每型號新增一列，例如 `2026-10,RTX 5080,46990,5,PChome|momo|欣亞|原價屋|Yahoo購物中心,各通路同月可下單新品的月中位數`。
3. 同一個月必須補齊 8 款型號；不要改欄位名稱。
4. 以 Excel 開啟時請使用 UTF-8 CSV；儲存時維持逗號分隔 UTF-8。
5. 執行 `npm run dev` 看新月份，然後執行 `npm run build && npm run preview` 驗證成品。

計算方式、納入/排除規則與來源清單在 [docs/data_method.md](docs/data_method.md)。

## GitHub：手動建立公開 repository（名稱 `414085181`）

本專案沒有替你建立 repository，也沒有執行部署。請完成本機驗證後再依下列步驟上傳。

1. 登入 GitHub，右上角 **+** → **New repository**。
2. **Repository name** 輸入 `414085181`。
3. Visibility 選 **Public**。
4. 勾選 **Add a README file** 可不勾；本 ZIP 已有 README。
5. **Add .gitignore** 下拉選 **HTML**。
6. License 選 **None**（或依你的授權需求選擇）。
7. 按 **Create repository**。
8. 在新 repository 首頁按 **Add file** → **Upload files**。
9. 將解壓後專案內的檔案與資料夾拖入；**不要上傳** `node_modules/`、`dist/`、`.vite/`。
10. 在下方輸入 commit message，例如 `Initial Vue D3 dashboard`，按 **Commit changes**。

若 GitHub 已由第 4 步自動建立 README，直接用上傳的 README 覆蓋即可；或第 4 步不要勾選 README，以避免第一次上傳出現合併提示。

## GitHub Pages：手動部署

完成 GitHub 上傳後，先在本機再次執行 `npm run build`。以下列兩種方式擇一。

### 方法 A：Actions（建議）

你需要自行建立一個 GitHub Actions workflow，讓 GitHub 以 Node.js 執行 `npm ci`、`npm run build`，再上傳 `dist/` 到 Pages。此 ZIP **沒有**預先放 Actions workflow，避免自行替你部署。

在 repository 的 **Settings** → **Pages**，Source 選 **GitHub Actions**。建立 workflow 後 push 到 `main`，Actions 成功時 Pages 會顯示網址。

### 方法 B：`gh-pages` branch

將本機 `dist/` 的內容發布到 `gh-pages` branch，再在 **Settings** → **Pages** 選 `gh-pages` / `/(root)`。不論使用哪種方式，`vite.config.js` 的 `base: './'` 可讓成品使用相對資產路徑。

## 驗證清單

- `npm install` 無錯誤
- `npm run dev` 可開啟頁面
- 8 個型號均可切換顯示
- 圖上 hover 會顯示月、NTD 價格與樣本數
- `npm run build` 成功，且 `dist/` 存在
- `npm run preview` 可讀到圖表與 CSV
