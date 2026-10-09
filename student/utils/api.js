// utils/api.js - 连接共享 Express 服务器 (http://localhost:3000)
// 微信开发者工具中请开启"不校验合法域名"

const BASE = 'http://localhost:3000/api/student'

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE + path,
      method: method,
      data: data,
      timeout: 5000,
      success(res) {
        if (res.statusCode === 200 && res.data) {
          const d = res.data
          // Express 返回格式: { code: 0, data: ... }
          if (d.code === 0) {
            resolve({ success: true, data: d.data })
          } else {
            resolve({ success: false, message: d.message, data: d.data })
          }
        } else {
          resolve({ success: false, message: '网络错误' })
        }
      },
      fail(err) {
        console.error('Request failed:', err)
        resolve({ success: false, message: '网络异常，请稍后重试' })
      }
    })
  })
}

const api = {
  // 商家分类（从共享服务端分类数据获取）
  getCategories() {
    const BASE_ADMIN = 'http://localhost:3000/api'
    return new Promise((resolve) => {
      wx.request({
        url: BASE_ADMIN + '/categories',
        method: 'GET',
        timeout: 5000,
        success(res) {
          if (res.statusCode === 200 && res.data && res.data.code === 0) {
            const cats = [{ id: 0, name: '全部', icon: '🍽️' }]
            res.data.data.forEach(c => cats.push({ id: c.id, name: c.name, icon: '🍔' }))
            resolve({ success: true, data: cats })
          } else {
            resolve({ success: true, data: [{ id: 0, name: '全部', icon: '🍽️' }] })
          }
        },
        fail() {
          resolve({ success: true, data: [{ id: 0, name: '全部', icon: '🍽️' }] })
        }
      })
    })
  },
  getShops(categoryId = 0) { return request('GET', '/shops?categoryId=' + categoryId) },
  getShopDetail(shopId) { return request('GET', '/shops/' + shopId) },

  // 菜品
  getDishesByShop(shopId) { return request('GET', '/dishes?shopId=' + shopId) },
  searchDishes(keyword) { return request('GET', '/dishes/search?keyword=' + encodeURIComponent(keyword)) },
  getDishDetail(dishId) { return request('GET', '/dishes/' + dishId) },

  // 公告
  getAnnouncements() { return request('GET', '/announcements') },

  // 库存校验（真实查询服务端库存）
  checkStock(items) {
    return request('POST', '/check-stock', { items })
  },

  // 支付模拟
  mockWxPay(orderInfo) {
    return new Promise(resolve => {
      setTimeout(() => {
        const success = Math.random() < 0.95
        resolve({ success, message: success ? '支付成功' : '支付失败，请重试', data: { orderId: orderInfo.orderId, payTime: new Date().toISOString(), transactionId: success ? 'WX' + Date.now() : '' } })
      }, 1500)
    })
  },

  // 创建订单（写入共享服务器，商家后台立即可见）
  createOrder(orderData) {
    return request('POST', '/orders', orderData)
  },

  // 订单
  getOrders(status = -1) {
    const app = typeof getApp === 'function' ? getApp() : null
    const userId = app ? app.globalData.userId : ''
    const params = []
    if (status >= 0) params.push('status=' + status)
    if (userId) params.push('userId=' + encodeURIComponent(userId))
    const query = params.length ? '?' + params.join('&') : ''
    return request('GET', '/orders' + query)
  },
  getOrderDetail(orderId) { return request('GET', '/orders/' + orderId) },
  cancelOrder(orderId) { return request('PUT', '/orders/' + orderId + '/cancel') },

  // 评价
  getReviewTags() { return Promise.resolve({ success: true, data: ['味道好', '包装好', '份量足', '送达快', '态度好', '干净卫生', '价格实惠', '菜品新鲜'] }) },
  getShopReviews(shopId) { return request('GET', '/reviews?shopId=' + shopId) },
  submitReview(reviewData) { return request('POST', '/reviews', reviewData) },
  getReviews() { return request('GET', '/reviews') }
}

module.exports = api