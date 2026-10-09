<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <img :src="authStore.shopInfo?.logo" class="logo" />
        <span class="shop-name">{{ authStore.shopInfo?.name }}</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        mode="vertical"
      >
        <el-menu-item index="/dashboard">
          <el-icon><component :is="icons.HomeFilled" /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><component :is="icons.ShoppingCart" /></el-icon>
          <span>订单管理</span>
          <el-badge v-if="ordersStore.newOrderCount > 0" :value="ordersStore.newOrderCount" class="order-badge" />
        </el-menu-item>
        <el-menu-item index="/dishes">
          <el-icon><component :is="icons.Food" /></el-icon>
          <span>菜品管理</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><component :is="icons.List" /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><component :is="icons.TrendCharts" /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/reviews">
          <el-icon><component :is="icons.ChatDotSquare" /></el-icon>
          <span>评价管理</span>
        </el-menu-item>
        <el-menu-item index="/store">
          <el-icon><component :is="icons.Setting" /></el-icon>
          <span>店铺设置</span>
        </el-menu-item>
      </el-menu>
    </aside>
    
    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <span class="title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <div class="business-status" :class="authStore.shopInfo?.status">
            <span class="status-dot"></span>
            {{ authStore.shopInfo?.status === 'open' ? '营业中' : '休息中' }}
          </div>
          <button class="bell-btn" @click="showNotification = !showNotification">
            <el-icon><component :is="icons.Bell" /></el-icon>
            <el-badge v-if="ordersStore.newOrderCount > 0" :value="ordersStore.newOrderCount" />
          </button>
          <button class="logout-btn" @click="handleLogout">
            <el-icon><component :is="icons.SwitchButton" /></el-icon>
            <span>退出登录</span>
          </button>
        </div>
      </header>
      
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>

    <NewOrderModal v-if="ordersStore.showNewOrderModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useOrdersStore } from '@/store/orders'
import { useDishesStore } from '@/store/dishes'
import { ordersAPI, dishesAPI, categoriesAPI } from '@/api'
import NewOrderModal from './NewOrderModal.vue'
import { ShoppingCart, Food, List, TrendCharts, ChatDotSquare, Setting, Bell, HomeFilled, SwitchButton } from '@element-plus/icons-vue'
import * as iconsAll from '@element-plus/icons-vue'

const icons = { ShoppingCart, Food, List, TrendCharts, ChatDotSquare, Setting, Bell, HomeFilled, SwitchButton }

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const dishesStore = useDishesStore()

const showNotification = ref(false)

const activeMenu = computed(() => route.path)

const pageTitleMap = {
  '/dashboard': '工作台',
  '/orders': '订单管理',
  '/dishes': '菜品管理',
  '/categories': '分类管理',
  '/statistics': '数据统计',
  '/reviews': '评价管理',
  '/store': '店铺设置'
}

const pageTitle = computed(() => pageTitleMap[route.path] || '工作台')

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

let interval = null

async function loadInitialData() {
  try {
    const [ordersRes, dishesRes, categoriesRes] = await Promise.all([
      ordersAPI.getOrders(),
      dishesAPI.getDishes(),
      categoriesAPI.getCategories()
    ])
    if (ordersRes.data) ordersStore.setOrders(ordersRes.data)
    if (dishesRes.data) dishesStore.setDishes(dishesRes.data)
    if (categoriesRes.data) dishesStore.setCategories(categoriesRes.data)
  } catch (e) {
    console.error('Failed to load initial data:', e)
  }
}

async function pollForNewOrders() {
  try {
    const prevIds = new Set(ordersStore.orders.map(o => o.id))
    const [ordersRes, dishesRes, categoriesRes] = await Promise.all([
      ordersAPI.getOrders(),
      dishesAPI.getDishes(),
      categoriesAPI.getCategories()
    ])
    if (ordersRes.data) {
      const newData = ordersRes.data
      ordersStore.setOrders(newData)
      // 检测新订单：之前不在集合中且状态为 pending
      const newPending = newData.filter(o => !prevIds.has(o.id) && o.status === 'pending')
      if (newPending.length > 0) {
        newPending.forEach(o => ordersStore.addOrder(o))
      }
    }
    if (dishesRes.data) dishesStore.setDishes(dishesRes.data)
    if (categoriesRes.data) dishesStore.setCategories(categoriesRes.data)
  } catch (e) {
    console.error('Polling failed:', e)
  }
}

onMounted(() => {
  loadInitialData()
  interval = setInterval(pollForNewOrders, 10000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  width: 220px;
  background-color: #2d3748;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #4a5568;
  
  .logo {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 10px;
  }
  
  .shop-name {
    font-size: 16px;
    font-weight: bold;
  }
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  
  :deep(.el-menu-item) {
    color: #a0aec0;
    margin: 0 10px;
    border-radius: 8px;
    margin-bottom: 5px;
    
    &:hover, &:focus {
      background-color: #4a5568;
      color: #fff;
    }
    
    &.is-active {
      background-color: #3182ce;
      color: #fff;
    }
  }
  
  :deep(.el-icon) {
    margin-right: 10px;
  }
}

.order-badge {
  margin-left: 5px;
}

.main-content {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
}

.top-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  .title {
    font-size: 18px;
    font-weight: bold;
    color: #2d3748;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.business-status {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  
  &.open {
    background-color: #c6f6d5;
    color: #22543d;
    
    .status-dot {
      background-color: #48bb78;
    }
  }
  
  &.closed {
    background-color: #fed7d7;
    color: #742a2a;
    
    .status-dot {
      background-color: #fc8181;
    }
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }
}

.bell-btn, .logout-btn {
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 8px;
  
  &:hover {
    background-color: #f7fafc;
    color: #2d3748;
  }
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
