import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const newOrderCount = ref(0)
  const showNewOrderModal = ref(false)
  const pendingOrder = ref(null)

  const pendingOrders = computed(() => 
    orders.value.filter(o => o.status === 'pending')
  )

  const processingOrders = computed(() => 
    orders.value.filter(o => o.status === 'processing')
  )

  const completedOrders = computed(() => 
    orders.value.filter(o => o.status === 'completed')
  )

  const cancelledOrders = computed(() => 
    orders.value.filter(o => o.status === 'cancelled')
  )

  function setOrders(data) {
    orders.value = data
    newOrderCount.value = pendingOrders.value.length
  }

  function addOrder(order) {
    orders.value.unshift(order)
    newOrderCount.value++
    pendingOrder.value = order
    showNewOrderModal.value = true
  }

  function updateOrderStatus(orderId, status, reason = '') {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      order.updateTime = Date.now()
      if (reason) order.cancelReason = reason
      if (status !== 'pending') {
        newOrderCount.value = Math.max(0, newOrderCount.value - 1)
      }
    }
  }

  function dismissNewOrder() {
    showNewOrderModal.value = false
    pendingOrder.value = null
  }

  function decrementNewOrderCount() {
    newOrderCount.value = Math.max(0, newOrderCount.value - 1)
  }

  return {
    orders,
    newOrderCount,
    showNewOrderModal,
    pendingOrder,
    pendingOrders,
    processingOrders,
    completedOrders,
    cancelledOrders,
    setOrders,
    addOrder,
    updateOrderStatus,
    dismissNewOrder,
    decrementNewOrderCount
  }
})
