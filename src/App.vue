<script setup>
import { computed, onMounted, ref } from 'vue'
import * as d3 from 'd3'
import PriceLineChart from './components/PriceLineChart.vue'
import csvUrl from './data/rtx50_tw_monthly_median.csv?url'

const allModels = [
  'RTX 5090', 'RTX 5080', 'RTX 5070 Ti', 'RTX 5070',
  'RTX 5060 Ti 16GB', 'RTX 5060 Ti 8GB', 'RTX 5060', 'RTX 5050',
]
const colors = {
  'RTX 5090': '#ef4444', 'RTX 5080': '#f97316', 'RTX 5070 Ti': '#eab308', 'RTX 5070': '#84cc16',
  'RTX 5060 Ti 16GB': '#22c55e', 'RTX 5060 Ti 8GB': '#14b8a6', 'RTX 5060': '#3b82f6', 'RTX 5050': '#8b5cf6',
}

const data = ref([])
const selected = ref([...allModels])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const text = await fetch(csvUrl).then((r) => {
      if (!r.ok) throw new Error(`CSV 載入失敗 (${r.status})`)
      return r.text()
    })
    data.value = d3.csvParse(text, (row) => ({ ...row, median_ntd: Number(row.median_ntd) }))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const shownData = computed(() => data.value.filter((row) => selected.value.includes(row.model)))
const latestRows = computed(() => allModels.map((model) => {
  const rows = data.value.filter((row) => row.model === model)
  const first = rows[0]
  const last = rows.at(-1)
  return last && { model, latest: last.median_ntd, delta: last.median_ntd - first.median_ntd, color: colors[model] }
}).filter(Boolean))

function toggle(model) {
  selected.value = selected.value.includes(model)
    ? selected.value.filter((item) => item !== model)
    : [...selected.value, model]
}

const nt = new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 })
</script>

<template>
  <main class="page-shell">
    <header class="hero">
      <p class="eyebrow">STATIC VISUALIZATION · TAIWAN / NTD</p>
      <h1>RTX 50 系列價格趨勢</h1>
      <p>2026 年 4 至 9 月・各型號月中位數・8 款桌上型顯示卡</p>
    </header>

    <section class="notice" aria-label="資料說明">
      僅載入自行彙整的月中位數 CSV；原始通路資料不會被重發。更新規則與來源網址請見 README。
    </section>

    <section class="controls" aria-label="型號篩選">
      <button v-for="model in allModels" :key="model" class="filter" :class="{ active: selected.includes(model) }" @click="toggle(model)">
        <i :style="{ backgroundColor: colors[model] }"></i>{{ model }}
      </button>
    </section>

    <section v-if="loading" class="panel status">載入 CSV…</section>
    <section v-else-if="error" class="panel status error">{{ error }}</section>
    <template v-else>
      <section class="dashboard-layout">
        <section class="panel chart-panel">
          <PriceLineChart :rows="shownData" :colors="colors" />
        </section>
        <aside class="summary-sidebar" aria-label="最新價格摘要">
          <h2>最新產品價格</h2>
          <section class="summary-list">
            <article v-for="item in latestRows" :key="item.model" class="summary-card">
              <span class="dot" :style="{ backgroundColor: item.color }"></span>
              <p>{{ item.model }}</p>
              <strong>{{ nt.format(item.latest) }}</strong>
              <small :class="item.delta > 0 ? 'up' : item.delta < 0 ? 'down' : ''">4-9 月 {{ item.delta > 0 ? '+' : '' }}{{ nt.format(item.delta) }}</small>
            </article>
          </section>
        </aside>
      </section>
    </template>

    <footer>Vue 3 + Vite + D3.js · CSV static data</footer>
  </main>
</template>
