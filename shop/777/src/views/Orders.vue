<template>
  <div class="orders-page">
    <div class="filter-bar">
      <div class="filter-left">
        <el-select v-model="statusFilter" placeholder="订单状态" class="filter-select">
          <el-option label="全部" value="all" />
          <el-option label="待接单" value="pending" />
          <el-option label="制作中" value="processing" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="date-picker" />
        <el-input v-model="keyword" placeholder="搜索订单号或用户名" class="search-input" :prefix-icon="Search" />
      </div>
      <div class="filter-right">
        <el-button type="primary" @click="refreshOrders">
          <el-icon><component :is="Refresh" /></el-icon> 刷新
        </el-button>
      </div>
    </div>

    <div class="tabs-row">
      <div class="tab-item" :class="{ active: statusFilter === 'all' }" @click="statusFilter = 'all'">
        <span class="tab-label">全部</span><span class="tab-count">{{ orders.length }}</span>
      </div>
      <div class="tab-item" :class="{ active: statusFilter === 'pending', highlight: pendingOrders.length > 0 }" @click="statusFilter = 'pending'">
        <span class="tab-label">待接单</span><span class="tab-count">{{ pendingOrders.length }}</span>
      </div>
      <div class="tab-item" :class="{ active: statusFilter === 'processing' }" @click="statusFilter = 'processing'">
        <span class="tab-label">制作中</span><span class="tab-count">{{ processingOrders.length }}</span>
      </div>
      <div class="tab-item" :class="{ active: statusFilter === 'completed' }" @click="statusFilter = 'completed'">
        <span class="tab-label">已完成</span><span class="tab-count">{{ completedOrders.length }}</span>
      </div>
      <div class="tab-item" :class="{ active: statusFilter === 'cancelled' }" @click="statusFilter = 'cancelled'">
        <span class="tab-label">已取消</span><span class="tab-count">{{ cancelledOrders.length }}</span>
      </div>
    </div>

    <div class="order-list">
      <div class="order-card" v-for="order in filteredOrders" :key="order.id">
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">{{ order.id }}</span>
            <el-tag :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </div>
          <span class="order-time">{{ formatTime(order.createTime) }}</span>
        </div>
        <div class="order-content">
          <div class="user-info">
            <el-icon class="user-icon"><component :is="User" /></el-icon>
            <span>{{ order.userName }} {{ order.userPhone }}</span>
          </div>
          <div class="items-preview">
            <div class="items" v-for="(item, index) in order.items" :key="index">
              <span>{{ item.name }} x{{ item.quantity }}</span>
            </div>
            <span v-if="order.remark" class="remark">备注：{{ order.remark }}</span>
          </div>
        </div>
        <div class="order-footer">
          <div class="total-price"><span class="label">订单金额</span><span class="price">¥{{ order.totalPrice }}</span></div>
          <div class="actions">
            <button class="action-btn detail" @click="showOrderDetail(order)"><el-icon><component :is="View" /></el-icon>详情</button>
            <button v-if="order.status === 'pending'" class="action-btn reject" @click="showRejectModal(order)"><el-icon><component :is="CircleClose" /></el-icon>拒单</button>
            <button v-if="order.status === 'pending'" class="action-btn accept" @click="handleAccept(order)"><el-icon><component :is="CircleCheck" /></el-icon>接单</button>
            <button v-if="order.status === 'processing'" class="action-btn complete" @click="handleComplete(order)"><el-icon><component :is="CircleCheck" /></el-icon>完成</button>
            <button v-if="order.status !== 'completed' && order.status !== 'cancelled'" class="action-btn cancel" @click="showCancelModal(order)"><el-icon><component :is="Close" /></el-icon>取消</button>
            <button v-if="order.status !== 'cancelled'" class="action-btn print" @click="printOrder(order)"><el-icon><component :is="Printer" /></el-icon>打印</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredOrders.length === 0" class="empty-state">
      <el-icon class="empty-icon"><component :is="Document" /></el-icon>
      <p>暂无订单</p>
    </div>

    <el-dialog title="订单详情" v-model="showDetail" width="500px">
      <div class="detail-content" v-if="selectedOrder">
        <div class="detail-section">
          <div class="detail-row"><span class="detail-label">订单号</span><span class="detail-value">{{ selectedOrder.id }}</span></div>
          <div class="detail-row"><span class="detail-label">状态</span><el-tag :class="getStatusClass(selectedOrder.status)">{{ getStatusText(selectedOrder.status) }}</el-tag></div>
          <div class="detail-row"><span class="detail-label">下单时间</span><span class="detail-value">{{ formatTime(selectedOrder.createTime) }}</span></div>
        </div>
        <div class="detail-section">
          <h4>用户信息</h4>
          <div class="detail-row"><span class="detail-label">姓名</span><span class="detail-value">{{ selectedOrder.userName }}</span></div>
          <div class="detail-row"><span class="detail-label">手机号</span><span class="detail-value">{{ selectedOrder.userPhone }}</span></div>
        </div>
        <div class="detail-section">
          <h4>商品明细</h4>
          <table class="items-table">
            <thead><tr><th>商品名称</th><th>单价</th><th>数量</th><th>小计</th></tr></thead>
            <tbody>
              <tr v-for="(item, index) in selectedOrder.items" :key="index">
                <td>{{ item.name }}</td><td>¥{{ item.price }}</td><td>{{ item.quantity }}</td><td>¥{{ item.price * item.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="detail-section">
          <div class="detail-row" v-if="selectedOrder.remark"><span class="detail-label">备注</span><span class="detail-value">{{ selectedOrder.remark }}</span></div>
          <div class="detail-row" v-if="selectedOrder.cancelReason"><span class="detail-label">取消原因</span><span class="detail-value">{{ selectedOrder.cancelReason }}</span></div>
        </div>
        <div class="total-section"><span class="total-label">订单总额</span><span class="total-price">¥{{ selectedOrder.totalPrice }}</span></div>
      </div>
    </el-dialog>

    <el-dialog title="拒单原因" v-model="showReject">
      <el-form :model="rejectForm"><el-form-item label="拒单原因" prop="reason"><el-input v-model="rejectForm.reason" type="textarea" rows="3" placeholder="请输入拒单原因" /></el-form-item></el-form>
      <template #footer><el-button @click="showReject = false">取消</el-button><el-button type="primary" @click="confirmReject">确认拒单</el-button></template>
    </el-dialog>

    <el-dialog title="取消订单" v-model="showCancel" width="450px">
      <el-form :model="cancelForm"><el-form-item label="取消原因" prop="reason"><el-input v-model="cancelForm.reason" type="textarea" rows="3" placeholder="请输入取消原因" /></el-form-item></el-form>
      <template #footer><el-button @click="showCancel = false">取消</el-button><el-button type="danger" @click="confirmCancel">确认取消</el-button></template>
    </el-dialog>

    <el-dialog title="小票打印" v-model="showPrint" width="400px">
      <div class="print-content" ref="printContent" v-if="printOrderData">
        <div class="print-header"><h3>{{ authStore.shopInfo?.name }}</h3><p>{{ authStore.shopInfo?.address }}</p><p>{{ authStore.shopInfo?.phone }}</p></div>
        <div class="print-body">
          <div class="print-row"><span>订单号：{{ printOrderData.id }}</span></div>
          <div class="print-row"><span>下单时间：{{ formatTime(printOrderData.createTime) }}</span></div>
          <div class="print-row"><span>用户：{{ printOrderData.userName }} {{ printOrderData.userPhone }}</span></div>
          <div class="print-divider"></div>
          <div class="print-items"><div class="print-item" v-for="(item, index) in printOrderData.items" :key="index"><span class="item-name">{{ item.name }}</span><span class="item-price">¥{{ item.price }}</span><span class="item-qty">x{{ item.quantity }}</span></div></div>
          <div class="print-divider"></div>
          <div v-if="printOrderData.remark" class="print-row"><span>备注：{{ printOrderData.remark }}</span></div>
          <div class="print-total"><span class="total-label">合计</span><span class="total-amount">¥{{ printOrderData.totalPrice }}</span></div>
        </div>
        <div class="print-footer"><p>感谢您的光临！</p></div>
      </div>
      <template #footer><el-button @click="showPrint = false">关闭</el-button><el-button type="primary" @click="handlePrint">打印预览</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore } from '@/store/orders'
import { useAuthStore } from '@/store/auth'
import { ordersAPI } from '@/api'
import { getStatusText, getStatusClass, formatTime } from '@/utils'
import { ElMessage } from 'element-plus'
import { Search, Refresh, User, View, CircleClose, CircleCheck, Close, Printer, Document } from '@element-plus/icons-vue'

const ordersStore = useOrdersStore()
const authStore = useAuthStore()

const statusFilter = ref('all')
const dateRange = ref([])
const keyword = ref('')
const showDetail = ref(false)
const showReject = ref(false)
const showCancel = ref(false)
const showPrint = ref(false)
const selectedOrder = ref(null)
const printOrderData = ref(null)
const rejectForm = ref({ reason: '' })
const cancelForm = ref({ reason: '' })
const printContent = ref(null)

const orders = computed(() => ordersStore.orders)
const pendingOrders = computed(() => ordersStore.pendingOrders)
const processingOrders = computed(() => ordersStore.processingOrders)
const completedOrders = computed(() => ordersStore.completedOrders)
const cancelledOrders = computed(() => ordersStore.cancelledOrders)

const filteredOrders = computed(() => {
  let result = [...orders.value]
  if (statusFilter.value !== 'all') result = result.filter(o => o.status === statusFilter.value)
  if (dateRange.value.length === 2) {
    const start = dateRange.value[0].getTime()
    const end = dateRange.value[1].getTime() + 86400000
    result = result.filter(o => o.createTime >= start && o.createTime <= end)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(o => o.id.toLowerCase().includes(kw) || o.userName.toLowerCase().includes(kw))
  }
  return result.sort((a, b) => b.createTime - a.createTime)
})

function refreshOrders() { statusFilter.value = 'all'; dateRange.value = []; keyword.value = '' }
function showOrderDetail(order) { selectedOrder.value = order; showDetail.value = true }
function showRejectModal(order) { selectedOrder.value = order; rejectForm.value.reason = ''; showReject.value = true }
function showCancelModal(order) { selectedOrder.value = order; cancelForm.value.reason = ''; showCancel.value = true }

async function handleAccept(order) {
  await ordersAPI.updateOrderStatus({ orderId: order.id, status: 'processing' })
  ordersStore.updateOrderStatus(order.id, 'processing')
  ElMessage.success('接单成功')
}

async function handleComplete(order) {
  await ordersAPI.updateOrderStatus({ orderId: order.id, status: 'completed' })
  ordersStore.updateOrderStatus(order.id, 'completed')
  ElMessage.success('订单已完成')
}

async function confirmReject() {
  if (!rejectForm.value.reason.trim()) { ElMessage.warning('请输入拒单原因'); return }
  await ordersAPI.updateOrderStatus({ orderId: selectedOrder.value.id, status: 'cancelled', reason: rejectForm.value.reason })
  ordersStore.updateOrderStatus(selectedOrder.value.id, 'cancelled', rejectForm.value.reason)
  showReject.value = false
  ElMessage.success('已拒单')
}

async function confirmCancel() {
  if (!cancelForm.value.reason.trim()) { ElMessage.warning('请输入取消原因'); return }
  await ordersAPI.updateOrderStatus({ orderId: selectedOrder.value.id, status: 'cancelled', reason: cancelForm.value.reason })
  ordersStore.updateOrderStatus(selectedOrder.value.id, 'cancelled', cancelForm.value.reason)
  showCancel.value = false
  ElMessage.success('订单已取消')
}

function printOrder(order) { printOrderData.value = order; showPrint.value = true }

function handlePrint() {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`<!DOCTYPE html><html><head><title>订单打印</title><style>body{font-family:'Courier New',monospace;padding:20px}.print-header{text-align:center;margin-bottom:20px}.print-header h3{margin:0}.print-header p{margin:4px 0;font-size:12px}.print-row{margin:6px 0;font-size:12px}.print-divider{border-top:1px dashed #ccc;margin:10px 0}.print-item{display:flex;justify-content:space-between;margin:6px 0;font-size:12px}.print-total{display:flex;justify-content:space-between;font-weight:bold;margin-top:10px}.print-footer{text-align:center;margin-top:20px;color:#999;font-size:12px}</style></head><body>${printContent.value?.innerHTML || ''}</body></html>`)
  printWindow.document.close()
  printWindow.print()
}
</script>

<style lang="scss" scoped>
.orders-page { padding: 20px; }
.filter-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.filter-left { display: flex; gap: 16px; }
.filter-select { width: 140px; }
.date-picker { width: 280px; }
.search-input { width: 250px; }
.tabs-row { display: flex; gap: 12px; margin-bottom: 20px; }
.tab-item { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #fff; border-radius: 20px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.tab-item:hover { background: #f5f7fa; }
.tab-item.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.tab-item.active .tab-label, .tab-item.active .tab-count { color: #fff; }
.tab-item.highlight .tab-count { background: #f56c6c; color: #fff; }
.tab-label { font-size: 14px; color: #666; }
.tab-count { background: #f0f0f0; padding: 2px 8px; border-radius: 10px; font-size: 12px; color: #666; min-width: 24px; text-align: center; }
.order-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.order-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.order-header .order-info { display: flex; align-items: center; gap: 12px; }
.order-id { font-size: 14px; font-family: monospace; color: #333; font-weight: 500; }
.order-time { font-size: 12px; color: #999; }
.order-content { margin-bottom: 16px; }
.user-info { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; color: #666; }
.user-icon { color: #667eea; }
.items-preview { display: flex; flex-wrap: wrap; gap: 8px; }
.items-preview .items { font-size: 13px; color: #333; background: #f5f7fa; padding: 4px 10px; border-radius: 12px; }
.remark { font-size: 13px; color: #f56c6c; margin-left: 8px; }
.order-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.total-price { display: flex; align-items: baseline; gap: 6px; }
.total-price .label { font-size: 14px; color: #999; }
.total-price .price { font-size: 20px; font-weight: 700; color: #f56c6c; }
.actions { display: flex; gap: 8px; }
.action-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: none; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.action-btn.detail { background: #f5f7fa; color: #666; }
.action-btn.detail:hover { background: #e8e8e8; }
.action-btn.reject { background: #fef0f0; color: #f56c6c; }
.action-btn.reject:hover { background: #fee2e2; }
.action-btn.accept { background: #ecfdf5; color: #10b981; }
.action-btn.accept:hover { background: #d1fae5; }
.action-btn.complete { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.action-btn.complete:hover { opacity: 0.9; }
.action-btn.cancel { background: #f5f7fa; color: #666; }
.action-btn.cancel:hover { background: #e8e8e8; }
.action-btn.print { background: #f5f7fa; color: #666; }
.action-btn.print:hover { background: #e8e8e8; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state .empty-icon { font-size: 48px; color: #d9d9d9; margin-bottom: 16px; }
.empty-state p { color: #999; font-size: 14px; }
.detail-content .detail-section { margin-bottom: 20px; }
.detail-content .detail-section h4 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #333; }
.detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
.detail-label { color: #999; font-size: 14px; }
.detail-value { color: #333; font-size: 14px; }
.items-table { width: 100%; border-collapse: collapse; }
.items-table th, .items-table td { padding: 8px; text-align: left; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
.items-table th { color: #999; font-weight: normal; }
.items-table td { color: #333; }
.total-section { display: flex; justify-content: space-between; align-items: baseline; padding-top: 16px; margin-top: 16px; border-top: 1px solid #f0f0f0; }
.total-section .total-label { font-size: 14px; color: #666; }
.total-section .total-price { font-size: 24px; font-weight: 700; color: #f56c6c; }
.print-content { font-family: 'Courier New', monospace; }
.print-content .print-header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #ccc; }
.print-content .print-header h3 { margin: 0; font-size: 16px; font-weight: bold; }
.print-content .print-header p { margin: 4px 0; font-size: 12px; color: #666; }
.print-body .print-row { margin: 6px 0; font-size: 12px; }
.print-body .print-divider { border-top: 1px dashed #ccc; margin: 12px 0; }
.print-items .print-item { display: flex; justify-content: space-between; margin: 6px 0; font-size: 12px; }
.print-item .item-name { flex: 1; }
.print-item .item-price { margin-left: 10px; }
.print-item .item-qty { margin-left: 10px; }
.print-total { display: flex; justify-content: space-between; font-weight: bold; margin-top: 15px; font-size: 14px; }
.print-total .total-label { font-weight: normal; }
.print-total .total-amount { font-size: 16px; color: #f56c6c; }
.print-footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc; color: #999; font-size: 12px; }
@media (max-width: 1400px) { .order-list { grid-template-columns: 1fr; } }
</style>