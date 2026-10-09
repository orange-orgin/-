<template>
  <div class="dashboard">
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon orders">
          <el-icon><component :is="ShoppingCart" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ todayOrders }}</div>
          <div class="stat-label">今日订单</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon sales">
          <el-icon><component :is="Wallet" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">¥{{ todaySales }}</div>
          <div class="stat-label">今日销售额</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon avg">
          <el-icon><component :is="TrendCharts" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">¥{{ avgOrderValue }}</div>
          <div class="stat-label">客单价</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">
          <el-icon><component :is="Clock" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">待接单</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="chart-card">
        <div class="card-header">
          <h3>今日订单趋势</h3>
        </div>
        <div class="chart-container">
          <div ref="orderChartRef" class="chart"></div>
        </div>
      </div>
      <div class="chart-card">
        <div class="card-header">
          <h3>销售分类占比</h3>
        </div>
        <div class="chart-container">
          <div ref="categoryChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <div class="bottom-content">
      <div class="chart-card">
        <div class="card-header">
          <h3>热卖菜品 TOP 10</h3>
        </div>
        <div class="top-dishes">
          <div class="dish-item" v-for="(item, index) in topDishes" :key="index">
            <div class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
            <div class="dish-info">
              <div class="dish-name">{{ item.name }}</div>
              <div class="dish-sales">销量：{{ item.sales }}</div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (item.sales / maxSales * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <div class="card-header">
          <h3>最新订单</h3>
        </div>
        <div class="order-list">
          <div class="order-item" v-for="order in recentOrders" :key="order.id">
            <div class="order-id">{{ order.id }}</div>
            <div class="order-user">{{ order.userName }}</div>
            <div class="order-price">¥{{ order.totalPrice }}</div>
            <el-tag :class="getStatusClassFn(order.status)">{{ getStatusTextFn(order.status) }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ShoppingCart, Wallet, TrendCharts, Clock } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useOrdersStore } from '@/store/orders'
import { useDishesStore } from '@/store/dishes'
import { statisticsAPI } from '@/api'
import { getStatusText, getStatusClass } from '@/utils'

const ordersStore = useOrdersStore()
const dishesStore = useDishesStore()

const getStatusTextFn = getStatusText
const getStatusClassFn = getStatusClass

const orderChartRef = ref(null)
const categoryChartRef = ref(null)

const todayOrders = computed(() => ordersStore.orders.filter(o => {
  const today = new Date()
  const orderDate = new Date(o.createTime)
  return today.toDateString() === orderDate.toDateString()
}).length)

const todaySales = computed(() => ordersStore.orders
  .filter(o => {
    const today = new Date()
    const orderDate = new Date(o.createTime)
    return today.toDateString() === orderDate.toDateString() && o.status !== 'cancelled'
  })
  .reduce((sum, o) => sum + o.totalPrice, 0))

const avgOrderValue = computed(() => {
  const validOrders = ordersStore.orders.filter(o => o.status !== 'cancelled')
  if (validOrders.length === 0) return 0
  return (validOrders.reduce((sum, o) => sum + o.totalPrice, 0) / validOrders.length).toFixed(1)
})

const pendingCount = computed(() => ordersStore.pendingOrders.length)

const topDishes = computed(() => {
  return [...dishesStore.dishes]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10)
    .map(d => ({ name: d.name, sales: d.sales }))
})

const maxSales = computed(() => {
  const sales = topDishes.value.map(d => d.sales)
  return sales.length > 0 ? Math.max(...sales) : 1
})

const recentOrders = computed(() => {
  return [...ordersStore.orders]
    .sort((a, b) => b.createTime - a.createTime)
    .slice(0, 8)
})

onMounted(() => {
  initOrderChart()
  initCategoryChart()
})

function initOrderChart() {
  if (!orderChartRef.value) return
  const chart = echarts.init(orderChartRef.value)
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const mockData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 30))
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: hours, axisLabel: { interval: 3 } },
    yAxis: { type: 'value' },
    series: [{
      name: '订单数',
      type: 'line',
      smooth: true,
      data: mockData,
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
        { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
      ])},
      lineStyle: { color: '#667eea', width: 3 },
      itemStyle: { color: '#667eea' }
    }]
  })
}

async function initCategoryChart() {
  if (!categoryChartRef.value) return
  let data = []
  try {
    const res = await statisticsAPI.getStatistics({ period: 'daily' })
    if (res.data && res.data.categorySales) data = res.data.categorySales
  } catch (e) { /* use empty */ }
  const chart = echarts.init(categoryChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'horizontal', bottom: '5%' },
    series: [{
      name: '分类销售',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      labelLine: { show: true },
      data: data,
      color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
    }]
  })
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  
  &.orders {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
  
  &.sales {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: #fff;
  }
  
  &.avg {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: #fff;
  }
  
  &.pending {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: #fff;
  }
}

.stat-info {
  flex: 1;
  
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #a0aec0;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.bottom-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
  }
}

.chart-container {
  height: 280px;
}

.chart {
  width: 100%;
  height: 100%;
}

.top-dishes {
  .dish-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    
    &:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }
  }
  
  .rank {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #666;
    margin-right: 12px;
    
    &.top {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
  
  .dish-info {
    flex: 1;
    min-width: 0;
    
    .dish-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .dish-sales {
      font-size: 12px;
      color: #999;
    }
  }
  
  .progress-bar {
    width: 120px;
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 3px;
      transition: width 0.3s;
    }
  }
}

.order-list {
  .order-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    
    &:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }
    
    .order-id {
      font-size: 13px;
      color: #666;
      font-family: monospace;
    }
    
    .order-user {
      font-size: 14px;
      color: #333;
    }
    
    .order-price {
      font-size: 14px;
      font-weight: 600;
      color: #f56c6c;
    }
  }
}

@media (max-width: 1280px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .bottom-content {
    grid-template-columns: 1fr;
  }
}
</style>