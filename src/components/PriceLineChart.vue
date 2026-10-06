<script setup>
import * as d3 from 'd3'
import { nextTick, onBeforeUnmount, watch } from 'vue'

const props = defineProps({ rows: { type: Array, required: true }, colors: { type: Object, required: true } })
let host
let observer

function render() {
  if (!host) return
  const width = Math.max(host.clientWidth, 320)
  const height = 500
  const margin = { top: 28, right: 24, bottom: 58, left: 86 }
  const svg = d3.select(host).selectAll('svg').data([null]).join('svg').attr('viewBox', `0 0 ${width} ${height}`)
  svg.selectAll('*').remove()
  if (!props.rows.length) {
    svg.append('text').attr('x', width / 2).attr('y', height / 2).attr('text-anchor', 'middle').attr('fill', '#94a3b8').text('請至少選擇一個型號')
    return
  }
  const parseMonth = d3.timeParse('%Y-%m')
  const rows = props.rows.map((row) => ({ ...row, date: parseMonth(row.month) }))
  const months = [...new Set(rows.map((row) => +row.date))].map((ms) => new Date(ms)).sort(d3.ascending)
  const x = d3.scaleTime().domain(d3.extent(months)).range([margin.left, width - margin.right])
  const y = d3.scaleLinear().domain([0, d3.max(rows, (row) => row.median_ntd) * 1.08]).nice().range([height - margin.bottom, margin.top])
  const plot = svg.append('g')
  plot.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(months.length).tickFormat(d3.timeFormat('%Y-%m')))
  plot.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(7).tickFormat((v) => `${d3.format(',')(v / 1000)}k`))
  plot.append('g').attr('class', 'grid').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(7).tickSize(-(width - margin.left - margin.right)).tickFormat(''))
  const groups = d3.group(rows, (row) => row.model)
  const line = d3.line().x((d) => x(d.date)).y((d) => y(d.median_ntd))
  const tooltip = d3.select(host).selectAll('.chart-tooltip').data([null]).join('div').attr('class', 'chart-tooltip')
  for (const [model, values] of groups) {
    const color = props.colors[model]
    plot.append('path').datum(values.sort((a, b) => d3.ascending(a.date, b.date))).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 3).attr('d', line)
    plot.selectAll(`.point-${model.replaceAll(' ', '-')}`).data(values).join('circle').attr('cx', (d) => x(d.date)).attr('cy', (d) => y(d.median_ntd)).attr('r', 5).attr('fill', color)
      .on('mouseenter', (event, d) => tooltip.style('opacity', 1).html(`<b>${d.model}</b><br>${d.month}　NT$ ${d3.format(',')(d.median_ntd)}<br>樣本數：${d.sample_count}`))
      .on('mousemove', (event) => tooltip.style('left', `${event.offsetX + 14}px`).style('top', `${event.offsetY - 12}px`))
      .on('mouseleave', () => tooltip.style('opacity', 0))
  }
}

watch(() => props.rows, async () => { await nextTick(); render() }, { deep: true, immediate: true })
watch(() => host, () => render())

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

<template><div :ref="setHost" class="chart-host"></div></template>
