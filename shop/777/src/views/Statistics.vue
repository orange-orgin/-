<template>
  <div class="statistics-page">
    <div class="page-header">
      <div class="period-tabs">
        <button class="period-btn" :class="{ active: period === 'daily' }" @click="setPeriod('daily')">日统计</button>
        <button class="period-btn" :class="{ active: period === 'weekly' }" @click="setPeriod('weekly')">周统计</button>
        <button class="period-btn" :class="{ active: period === 'monthly' }" @click="setPeriod('monthly')">月统计</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon sales"><el-icon><component :is="Wallet" /></el-icon></div>
        <div class="stat-info"><div class="stat-value">¥{{ totalSales }}</div><div class="stat-label">总销售额</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orders"><el-icon><component :is="ShoppingCart" /></el-icon></div>
        <div class="stat-info"><div class="stat-value">{{ totalOrders }}</div><div class="stat-label">总订单数</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon avg"><el-icon><component :is="TrendCharts" /></el-icon></div>
        <div class="stat-info"><div class="stat-value">¥{{ avgOrderValue }}</div><div class="stat-label">客单价</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon dishes"><el-icon><component :is="Food" /></el-icon></div>
        <div class="stat-info"><div class="stat-value">{{ totalDishes }}</div><div class="stat-label">菜品总数</div></div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card"><div class="card-header"><h3>销售额趋势</h3></div><div class="chart-container"><div ref="salesChartRef" class="chart"></div></div></div>
      <div class="chart-card"><div class="card-header"><h3>订单数量</h3></div><div class="chart-container"><div ref="ordersChartRef" class="chart"></div></div></div>
    </div>

    <div class="charts-row">
      <div class="chart-card"><div class="card-header"><h3>分类销量占比</h3></div><div class="chart-container"><div ref="categoryChartRef" class="chart"></div></div></div>
      <div class="chart-card top-dishes-card">
        <div class="card-header"><h3>热卖菜品 TOP 10</h3></div>
        <div class="top-dishes-list">
          <div class="top-item" v-for="(item, index) in topDishes" :key="index">
            <div class="top-rank" :class="{ gold: index === 0, silver: index === 1, bronze: index === 2 }">{{ index + 1 }}</div>
            <div class="top-info"><div class="top-name">{{ item.name }}</div><div class="top-sales">销量: {{ item.sales }}</div></div>
            <div class="top-bar"><div class="bar-fill" :style="{ width: (item.sales / maxSales * 100) + '%' }"></div></div>
            <div class="top-num">{{ item.sales }}</div>
          </div>
          <div v-if="topDishes.length === 0" style="text-align:center;color:#999;padding:40px">暂无销售数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useDishesStore } from '@/store/dishes'
import { statisticsAPI } from '@/api'
import { Wallet, ShoppingCart, TrendCharts, Food } from '@element-plus/icons-vue'

const dishesStore = useDishesStore()
const period = ref('daily')
const salesChartRef = ref(null)
const ordersChartRef = ref(null)
const categoryChartRef = ref(null)
const statsData = ref({ statistics: { dates: [], sales: [], orders: [] }, categorySales: [], topDishes: [] })

const statistics = computed(() => statsData.value.statistics || { dates: [], sales: [], orders: [] })
const totalSales = computed(() => statistics.value.sales.reduce((sum, s) => sum + s, 0))
const totalOrders = computed(() => statistics.value.orders.reduce((sum, o) => sum + o, 0))
const avgOrderValue = computed(() => { if (totalOrders.value === 0) return 0; return (totalSales.value / totalOrders.value).toFixed(1) })
const totalDishes = computed(() => dishesStore.dishes.length)
const topDishes = computed(() => statsData.value.topDishes || [])
const categorySales = computed(() => statsData.value.categorySales || [])
const maxSales = computed(() => { const s = topDishes.value.map(d => d.sales); return s.length > 0 ? Math.max(...s) : 1 })

async function loadData() {
  try {
    const res = await statisticsAPI.getStatistics({ period: period.value })
    if (res.data) statsData.value = res.data
  } catch (e) { console.error('Failed to load statistics', e) }
  initCharts()
}

function setPeriod(p) { period.value = p; loadData() }
onMounted(() => { loadData() })
watch(period, () => { loadData() })

function initCharts() {
  if (salesChartRef.value) {
    const chart = echarts.init(salesChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>销售额: ¥{c}' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: statistics.value.dates },
      yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
      series: [{ name: '销售额', type: 'line', smooth: true, data: statistics.value.sales,
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(102, 126, 234, 0.3)' }, { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }]) },
        lineStyle: { color: '#667eea', width: 3 }, itemStyle: { color: '#667eea' } }]
    })
  }
  if (ordersChartRef.value) {
    const chart = echarts.init(ordersChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>订单数: {c}' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: statistics.value.dates },
      yAxis: { type: 'value' },
      series: [{ name: '订单数', type: 'bar', data: statistics.value.orders,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#764ba2' }, { offset: 1, color: '#667eea' }]), borderRadius: [6, 6, 0, 0] } }]
    })
  }
  if (categoryChartRef.value) {
    const chart = echarts.init(categoryChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', right: '5%', top: 'center' },
      series: [{ name: '分类销售', type: 'pie', radius: ['35%', '70%'], center: ['40%', '50%'],
        avoidLabelOverlap: false, itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' }, emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold', formatter: '{b}\n{d}%' } },
        labelLine: { show: false }, data: categorySales.value, color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'] }]
    })
  }
}
</script>

<style lang="scss" scoped>
.statistics-page { padding: 20px; }
.page-header { margin-bottom: 20px; }
.period-tabs { display: inline-flex; background: #fff; border-radius: 10px; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.period-btn { padding: 10px 24px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; background: transparent; transition: all 0.2s; }
.period-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-weight: 500; }
.period-btn:hover:not(.active) { background: #f5f7fa; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
.stat-card { background: #fff; border-radius: 16px; padding: 24px; display: flex; align-items: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-right: 20px; font-size: 24px; }
.stat-icon.sales { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff; }
.stat-icon.orders { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.stat-icon.avg { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #fff; }
.stat-icon.dishes { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: #fff; }
.stat-info { flex: 1; }
.stat-value { font-size: 28px; font-weight: 700; color: #2d3748; margin-bottom: 4px; }
.stat-label { font-size: 14px; color: #a0aec0; }
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.chart-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.chart-card.top-dishes-card .chart-container { height: auto; }
.card-header { margin-bottom: 20px; }
.card-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #2d3748; }
.chart-container { height: 300px; }
.chart { width: 100%; height: 100%; }
.top-dishes-list .top-item { display: flex; align-items: center; padding: 12px 0; }
.top-dishes-list .top-item:not(:last-child) { border-bottom: 1px solid #f0f0f0; }
.top-rank { width: 28px; height: 28px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #666; margin-right: 12px; }
.top-rank.gold { background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%); color: #8b6914; }
.top-rank.silver { background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%); color: #5a5a5a; }
.top-rank.bronze { background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%); color: #654321; }
.top-info { flex: 1; min-width: 0; }
.top-name { font-size: 14px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.top-sales { font-size: 12px; color: #999; }
.top-bar { width: 120px; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; margin: 0 12px; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border-radius: 4px; transition: width 0.3s; }
.top-num { width: 50px; text-align: right; font-size: 14px; font-weight: 600; color: #667eea; }
@media (max-width: 1280px) { .stats-row { grid-template-columns: repeat(2, 1fr); } .charts-row { grid-template-columns: 1fr; } }
</style>