<template>
  <div class="modal-overlay" @click.self="handleDismiss">
    <div class="modal-content">
      <div class="modal-header">
        <div class="alert-icon">
          <el-icon class="bell-icon"><component :is="icons.Bell" /></el-icon>
        </div>
        <h3>新订单提醒</h3>
        <button class="close-btn" @click="handleDismiss">
          <el-icon><component :is="icons.X" /></el-icon>
        </button>
      </div>
      
      <div class="modal-body" v-if="order">
        <div class="order-info">
          <div class="info-row">
            <span class="label">订单号</span>
            <span class="value">{{ order.id }}</span>
          </div>
          <div class="info-row">
            <span class="label">用户</span>
            <span class="value">{{ order.userName }} {{ order.userPhone }}</span>
          </div>
          <div class="info-row">
            <span class="label">订单金额</span>
            <span class="value price">{{ order.totalPrice }}元</span>
          </div>
          <div class="info-row" v-if="order.remark">
            <span class="label">备注</span>
            <span class="value">{{ order.remark }}</span>
          </div>
        </div>
        
        <div class="items-title">商品明细</div>
        <div class="items-list">
          <div class="item" v-for="(item, index) in order.items" :key="index">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-price">{{ item.price }}元</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-reject" @click="handleReject">
          <el-icon><component :is="icons.XCircle" /></el-icon>
          拒单
        </button>
        <button class="btn-accept" @click="handleAccept">
          <el-icon><component :is="icons.CheckCircle" /></el-icon>
          接单
        </button>
      </div>
    </div>
  </div>
  
  <el-dialog
    title="拒单原因"
    :visible="showRejectModal"
    @close="showRejectModal = false"
  >
    <el-form :model="rejectForm">
      <el-form-item label="拒单原因" prop="reason">
        <el-input v-model="rejectForm.reason" type="textarea" rows="3" placeholder="请输入拒单原因" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showRejectModal = false">取消</el-button>
      <el-button type="primary" @click="confirmReject">确认拒单</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useOrdersStore } from '@/store/orders'
import { ordersAPI } from '@/api'
import { CircleClose, CircleCheck, Close } from '@element-plus/icons-vue'

const icons = { Close, CircleClose, CircleCheck, XCircle: CircleClose, CheckCircle: CircleCheck, X: Close }

const ordersStore = useOrdersStore()
const order = ref(null)
const showRejectModal = ref(false)
const rejectForm = ref({ reason: '' })

watch(() => ordersStore.pendingOrder, (newOrder) => {
  if (newOrder) {
    order.value = newOrder
    playNotificationSound()
  }
})

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (e) {
    console.log('Audio not supported')
  }
}

function handleDismiss() {
  ordersStore.dismissNewOrder()
  order.value = null
}

async function handleAccept() {
  if (order.value) {
    await ordersAPI.updateOrderStatus({
      orderId: order.value.id,
      status: 'processing'
    })
    ordersStore.updateOrderStatus(order.value.id, 'processing')
    handleDismiss()
  }
}

function handleReject() {
  showRejectModal.value = true
}

async function confirmReject() {
  if (order.value && rejectForm.value.reason.trim()) {
    await ordersAPI.updateOrderStatus({
      orderId: order.value.id,
      status: 'cancelled',
      reason: rejectForm.value.reason
    })
    ordersStore.updateOrderStatus(order.value.id, 'cancelled', rejectForm.value.reason)
    showRejectModal.value = false
    rejectForm.value.reason = ''
    handleDismiss()
  }
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 480px;
  max-width: 90%;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .alert-icon {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    animation: pulse 1s ease-in-out infinite;
  }
  
  .bell-icon {
    font-size: 20px;
    color: #fff;
  }
  
  h3 {
    flex: 1;
    margin: 0;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.modal-body {
  padding: 24px;
}

.order-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  
  .label {
    color: #999;
    font-size: 14px;
  }
  
  .value {
    color: #333;
    font-size: 14px;
    font-weight: 500;
    
    &.price {
      color: #f56c6c;
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.items-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.items-list {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
  
  .item-name {
    flex: 1;
    color: #333;
    font-size: 14px;
  }
  
  .item-price {
    color: #666;
    font-size: 14px;
    margin-right: 12px;
  }
  
  .item-quantity {
    color: #999;
    font-size: 12px;
    background: #f0f0f0;
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e8e8e8;
  background: #fafafa;
  
  button {
    flex: 1;
    height: 44px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }
  
  .btn-reject {
    background: #f5f7fa;
    color: #666;
    
    &:hover {
      background: #e8e8e8;
    }
  }
  
  .btn-accept {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
}
</style>
