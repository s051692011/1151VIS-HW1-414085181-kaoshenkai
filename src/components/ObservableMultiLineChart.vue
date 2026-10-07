<script setup>
import * as d3 from 'd3'
import { nextTick, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  rows: { type: Array, required: true },
  models: { type: Array, required: true },
  colors: { type: Object, required: true },
})

let host
let observer

function render() {
  if (!host) return

  const width = Math.max(host.clientWidth, 320)
  const height = 480
  const margin = { top: 32, right: 28, bottom: 58, left: 86 }
  const svg = d3.select(host).selectAll('svg').data([null]).join('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', '全部八款 RTX 50 系列月中位數多序列折線圖')
  svg.selectAll('*').remove()

  if (!props.rows.length) return

  const parseMonth = d3.timeParse('%Y-%m')
  const rows = props.rows.map((row) => ({ ...row, date: parseMonth(row.month) }))
  const months = [...new Set(rows.map((row) => +row.date))]
    .map((value) => new Date(value))
    .sort(d3.ascending)
  const x = d3.scaleTime()
    .domain(d3.extent(months))
    .range([margin.left, width - margin.right])
  const y = d3.scaleLinear()
    .domain([0, d3.max(rows, (row) => row.median_ntd) * 1.08])
    .nice()
    .range([height - margin.bottom, margin.top])
  const line = d3.line()
    .x((row) => x(row.date))
    .y((row) => y(row.median_ntd))
  const plot = svg.append('g')
  const groups = d3.group(rows, (row) => row.model)

  plot.append('g')
    .attr('class', 'observable-axis')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(months.length).tickFormat(d3.timeFormat('%Y-%m')))
  plot.append('g')
    .attr('class', 'observable-axis')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(7).tickFormat((value) => `${d3.format(',')(value / 1000)}k`))
  plot.append('g')
    .attr('class', 'observable-grid')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(7).tickSize(-(width - margin.left - margin.right)).tickFormat(''))

  const series = plot.append('g').attr('class', 'observable-series')
    .selectAll('path')
    .data(props.models.map((model) => ({ model, values: (groups.get(model) ?? []).sort((a, b) => d3.ascending(a.date, b.date)) })))
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', (item) => props.colors[item.model])
    .attr('stroke-width', 2.5)
    .attr('d', (item) => line(item.values))

  const focus = plot.append('g').attr('class', 'observable-focus').style('display', 'none')
  focus.append('line').attr('class', 'observable-focus-line').attr('y1', margin.top).attr('y2', height - margin.bottom)
  const focusDots = focus.selectAll('circle')
    .data(props.models)
    .join('circle')
    .attr('r', 4.5)
    .attr('stroke-width', 2)
    .attr('fill', '#f5f5f5')
    .attr('stroke', (model) => props.colors[model])

  const tooltip = d3.select(host).selectAll('.observable-tooltip').data([null]).join('div')
    .attr('class', 'observable-tooltip')
  const bisect = d3.bisector((row) => row.date).center

  function pointermove(event) {
    const [pointerX] = d3.pointer(event)
    const targetDate = x.invert(pointerX)
    const nearestRows = props.models.map((model) => {
      const values = groups.get(model) ?? []
      return values[bisect(values, targetDate)]
    }).filter(Boolean)
    if (!nearestRows.length) return

    const nearest = d3.least(nearestRows, (row) => Math.abs(+row.date - +targetDate))
    const activeMonth = nearest.date
    const activeRows = nearestRows.filter((row) => +row.date === +activeMonth)
    const activeModels = new Set(activeRows.map((row) => row.model))
    series.attr('opacity', (item) => activeModels.has(item.model) ? 1 : 0.2)
    focus.style('display', null)
    focus.select('line').attr('x1', x(activeMonth)).attr('x2', x(activeMonth))
    focusDots
      .attr('cx', (model) => x(activeRows.find((row) => row.model === model)?.date ?? activeMonth))
      .attr('cy', (model) => y(activeRows.find((row) => row.model === model)?.median_ntd ?? 0))
      .style('display', (model) => activeModels.has(model) ? null : 'none')
    const content = activeRows
      .sort((a, b) => d3.descending(a.median_ntd, b.median_ntd))
      .map((row) => `<li><span style="background:${props.colors[row.model]}"></span>${row.model}<b>NT$ ${d3.format(',')(row.median_ntd)}</b></li>`)
      .join('')
    tooltip
      .style('opacity', 1)
      .style('left', `${Math.min(event.offsetX + 14, width - 224)}px`)
      .style('top', `${Math.max(event.offsetY - 18, 10)}px`)
      .html(`<strong>${d3.timeFormat('%Y-%m')(activeMonth)}</strong><ul>${content}</ul>`)
  }

  function pointerleave() {
    series.attr('opacity', 1)
    focus.style('display', 'none')
    tooltip.style('opacity', 0)
  }

  plot.append('rect')
    .attr('class', 'observable-overlay')
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('width', width - margin.left - margin.right)
    .attr('height', height - margin.top - margin.bottom)
    .on('pointermove', pointermove)
    .on('pointerleave', pointerleave)
}

watch(() => props.rows, async () => { await nextTick(); render() }, { deep: true, immediate: true })

function setHost(el) {
  host = el
  if (host) {
    observer = new ResizeObserver(render)
    observer.observe(host)
    render()
  }
}

onBeforeUnmount(() => observer?.disconnect())
</script>

<template><div :ref="setHost" class="observable-chart-host"></div></template>
