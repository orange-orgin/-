const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

// 持久化文件路径
const DATA_FILE = path.join(__dirname, 'data-persist.json')

// 加载持久化数据（如存在），否则使用 data.js 作为初始数据
let data
if (fs.existsSync(DATA_FILE)) {
  data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
} else {
  data = require('./data')
}

// 每次写操作后自动保存
function saveData() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8') } catch(e) { console.error('Save failed:', e) }
}

// 生成唯一 id
let idSeq = 0
function uid(prefix) {
  idSeq += 1
  return prefix + Date.now() + '_' + idSeq + Math.floor(Math.random() * 100)
}

// ============ 数据自检 ============
// 修复历史数据中 id 为空 / 重复的问题（否则菜品会互相覆盖、购物车/下单会串菜）
;(function healData() {
  let changed = false
  const healList = (list, prefix) => {
    if (!Array.isArray(list)) return
    const seen = new Set()
    list.forEach(item => {
      if (!item.id || typeof item.id !== 'string' || seen.has(item.id)) {
        item.id = uid(prefix)
        changed = true
      }
      seen.add(item.id)
    })
  }
  healList(data.dishes, 'dish')
  healList(data.categories, 'cat')
  healList(data.shops, 'shop')
  healList(data.orders, 'ORD')
  healList(data.reviews, 'rev')

  // 订单里引用的菜品 id 若已失效，按菜名回填
  if (Array.isArray(data.orders)) {
    data.orders.forEach(o => {
      ;(o.items || []).forEach(i => {
        if (!i.dishId || !data.dishes.some(d => d.id === i.dishId)) {
          const byName = data.dishes.find(d => d.name === i.name)
          if (byName) { i.dishId = byName.id; changed = true }
        }
      })
    })
  }
  // 评价缺少 shopId 时按订单回填
  if (Array.isArray(data.reviews)) {
    data.reviews.forEach(r => {
      if (!r.shopId && r.orderId) {
        const o = data.orders.find(x => x.id === r.orderId)
        if (o) { r.shopId = o.shopId; r.shopName = o.shopName; changed = true }
      }
      if (!Array.isArray(r.tags)) { r.tags = []; changed = true }
    })
  }
  if (changed) { saveData(); console.log('🔧 已修复数据中的无效/重复 id') }
})()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/supervisor', express.static(path.join(__dirname, '..', 'supervisor')))
app.get('/supervisor', (req, res) => res.redirect('/supervisor/index.html'))

// 商家后台构建产物（存在 dist 时直接托管，方便单端口部署到云端）
const SHOP_DIST = path.join(__dirname, '..', 'shop', '777', 'dist')
if (fs.existsSync(path.join(SHOP_DIST, 'index.html'))) {
  app.use(express.static(SHOP_DIST))
}

const ok = (data) => ({ code: 0, message: 'success', data })
const fail = (code, message) => ({ code, message })

// ============ 认证 ============
// 自动保存：每次修改后 100ms 内写入磁盘（防抖合并连续写入）
let saveTimer = null
function autoSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(saveData, 100)
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const shop = data.shops.find(s => s.id === username)
  if (!shop || password !== '123456') return res.json(fail(-1, '账号或密码错误'))
  res.json(ok({ token: 'token-' + username + '-' + Date.now(), shopInfo: shop }))
})

// ============ 店铺 ============
app.get('/api/shop', (req, res) => {
  const shopId = req.query.shopId || req.headers['x-shop-id'] || 'shop1'
  const shop = data.shops.find(s => s.id === shopId)
  res.json(shop ? ok(shop) : fail(404, '店铺不存在'))
})

app.put('/api/shop', (req, res) => {
  const shop = data.shops.find(s => s.id === req.body.id)
  if (shop) { Object.assign(shop, req.body); autoSave(); res.json(ok(shop)) }
  else res.json(fail(404, '店铺不存在'))
})

// ============ 订单 ============
app.get('/api/orders', (req, res) => {
  let result = [...data.orders]
  const shopId = req.query.shopId || req.headers['x-shop-id'] || 'shop1'
  result = result.filter(o => o.shopId === shopId)
  if (req.query.status && req.query.status !== 'all') result = result.filter(o => o.status === req.query.status)
  if (req.query.keyword) {
    const kw = req.query.keyword.toLowerCase()
    result = result.filter(o => o.id.toLowerCase().includes(kw) || o.userName.toLowerCase().includes(kw))
  }
  res.json(ok(result.sort((a, b) => b.createTime - a.createTime)))
})

app.get('/api/orders/:id', (req, res) => {
  const order = data.orders.find(o => o.id === req.params.id || o.orderNo === req.params.id)
  res.json(order ? ok(order) : fail(404, '订单不存在'))
})

// 更新订单状态（接单/拒单/完成/取消）—— 含合法状态转换校验
app.put('/api/orders/status', (req, res) => {
  const { orderId, status, reason } = req.body
  const order = data.orders.find(o => o.id === orderId || o.orderNo === orderId)
  if (!order) return res.json(fail(404, '订单不存在'))
  
  // 合法状态转换校验
  const allowedTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['completed'],
    completed: [],
    cancelled: []
  }
  if (!allowedTransitions[order.status]?.includes(status)) {
    return res.json(fail(400, `不允许从 ${order.status} 转换到 ${status}`))
  }
  
  order.status = status
  order.updateTime = Date.now()
  if (reason) order.cancelReason = reason
  autoSave()
  
  if (status === 'completed') {
    const shop = data.shops.find(s => s.id === order.shopId)
    if (shop) shop.monthlySales = (shop.monthlySales || 0) + 1
    
    // 动态更新统计数据
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const weekIdx = Math.floor((new Date().getDate() - 1) / 7)
    const monthIdx = new Date().getMonth()
    
    if (!data.statistics.daily) data.statistics.daily = { dates: [], sales: [], orders: [] }
    if (!data.statistics.weekly) data.statistics.weekly = { dates: [], sales: [], orders: [] }
    if (!data.statistics.monthly) data.statistics.monthly = { dates: [], sales: [], orders: [] }
    
    // 日统计
    const dailyIdx = data.statistics.daily.dates.indexOf(today)
    if (dailyIdx !== -1) {
      data.statistics.daily.sales[dailyIdx] = (data.statistics.daily.sales[dailyIdx] || 0) + order.totalPrice
      data.statistics.daily.orders[dailyIdx] = (data.statistics.daily.orders[dailyIdx] || 0) + 1
    } else {
      data.statistics.daily.dates.push(today)
      data.statistics.daily.sales.push(order.totalPrice)
      data.statistics.daily.orders.push(1)
    }
    
    // 分类销售占比更新
    order.items.forEach(item => {
      const dish = data.dishes.find(d => d.id === item.dishId)
      if (dish && dish.categoryId) {
        const cat = data.categories.find(c => c.id === dish.categoryId)
        if (cat) {
          const catEntry = data.categorySales.find(cs => cs.name === cat.name)
          if (catEntry) catEntry.value += item.price * item.quantity
          else data.categorySales.push({ name: cat.name, value: item.price * item.quantity })
        }
      }
    })
    
    // 热卖菜品排行更新
    order.items.forEach(item => {
      const topEntry = data.topDishes.find(td => td.name === item.name)
      if (topEntry) topEntry.sales += item.quantity
      else data.topDishes.push({ name: item.name, sales: item.quantity })
    })
    data.topDishes.sort((a, b) => b.sales - a.sales)
    if (data.topDishes.length > 10) data.topDishes = data.topDishes.slice(0, 10)
  }
  
  res.json(ok(order))
})

// ============ 菜品 ============
app.get('/api/dishes', (req, res) => {
  let result = [...data.dishes]
  const shopId = req.query.shopId || req.headers['x-shop-id'] || 'shop1'
  result = result.filter(d => d.shopId === shopId)
  if (req.query.categoryId) result = result.filter(d => d.categoryId === req.query.categoryId)
  if (req.query.status && req.query.status !== 'all') result = result.filter(d => (d.status || 'active') === req.query.status)
  if (req.query.keyword) {
    const kw = req.query.keyword.toLowerCase()
    result = result.filter(d => d.name.toLowerCase().includes(kw))
  }
  result = result.map(d => ({ ...d, status: d.status || 'active' }))
  res.json(ok(result))
})

app.post('/api/dishes', (req, res) => {
  const body = { ...req.body }
  delete body.id // id 一律由服务端生成，避免前端传空字符串导致所有菜品 id 相同
  const newDish = { id: uid('dish'), ...body, status: body.status || 'active', sales: body.sales || 0, createdAt: Date.now() }
  data.dishes.push(newDish)
  autoSave()
  res.json(ok(newDish))
})

app.put('/api/dishes', (req, res) => {
  const id = req.body.id
  if (!id) return res.json(fail(400, '缺少id'))
  const dish = data.dishes.find(d => d.id === id)
  if (dish) { Object.assign(dish, req.body); autoSave(); res.json(ok(dish)) }
  else res.json(fail(404, '菜品不存在'))
})
app.put('/api/dishes/:id', (req, res) => {
  const dish = data.dishes.find(d => d.id === req.params.id)
  if (dish) { Object.assign(dish, req.body); autoSave(); res.json(ok(dish)) }
  else res.json(fail(404, '菜品不存在'))
})

app.delete('/api/dishes', (req, res) => {
  const id = req.query.id
  if (!id) return res.json(fail(400, '缺少id'))
  const idx = data.dishes.findIndex(d => d.id === id)
  if (idx !== -1) { data.dishes.splice(idx, 1); autoSave(); res.json(ok(null)) }
  else res.json(fail(404, '菜品不存在'))
})
app.delete('/api/dishes/:id', (req, res) => {
  const idx = data.dishes.findIndex(d => d.id === req.params.id)
  if (idx !== -1) { data.dishes.splice(idx, 1); autoSave(); res.json(ok(null)) }
  else res.json(fail(404, '菜品不存在'))
})

app.put('/api/dishes/stock', (req, res) => {
  const { id, delta } = req.body
  const dish = data.dishes.find(d => d.id === id)
  if (dish) { dish.stock = Math.max(0, (dish.stock || 0) + (delta || 0)); autoSave(); res.json(ok(dish)) }
  else res.json(fail(404, '菜品不存在'))
})

app.put('/api/dishes/status', (req, res) => {
  const { id, status } = req.body
  const dish = data.dishes.find(d => d.id === id)
  if (dish) { dish.status = status; autoSave(); res.json(ok({ ...dish, status })) }
  else res.json(fail(404, '菜品不存在'))
})

app.put('/api/dishes/batch', (req, res) => {
  const { ids, action, value } = req.body
  ids.forEach(id => {
    const dish = data.dishes.find(d => d.id === id)
    if (dish) { if (action === 'status') dish.status = value; else if (action === 'price') dish.price = value }
  })
  autoSave()
  res.json(ok(null))
})

// ============ 分类 ============
app.get('/api/categories', (req, res) => {
  res.json(ok(data.categories))
})

app.post('/api/categories', (req, res) => {
  const newCat = { id: uid('cat'), name: req.body.name, sortOrder: data.categories.length + 1 }
  data.categories.push(newCat)
  autoSave()
  res.json(ok(newCat))
})

app.put('/api/categories', (req, res) => {
  const id = req.body.id
  if (!id) return res.json(fail(400, '缺少id'))
  const cat = data.categories.find(c => c.id === id)
  if (cat) { Object.assign(cat, req.body); autoSave(); res.json(ok(cat)) }
  else res.json(fail(404, '分类不存在'))
})
app.put('/api/categories/:id', (req, res) => {
  const cat = data.categories.find(c => c.id === req.params.id)
  if (cat) { Object.assign(cat, req.body); autoSave(); res.json(ok(cat)) }
  else res.json(fail(404, '分类不存在'))
})
app.delete('/api/categories', (req, res) => {
  const id = req.query.id
  if (!id) return res.json(fail(400, '缺少id'))
  const idx = data.categories.findIndex(c => c.id === id)
  if (idx !== -1) {
    data.categories.splice(idx, 1)
    data.dishes.forEach(d => { if (d.categoryId === id) d.categoryId = '' })
    data.categories.forEach((c, i) => c.sortOrder = i + 1)
    res.json(ok(null))
  } else res.json(fail(404, '分类不存在'))
})
app.delete('/api/categories/:id', (req, res) => {
  const idx = data.categories.findIndex(c => c.id === req.params.id)
  if (idx !== -1) {
    data.categories.splice(idx, 1)
    data.dishes.forEach(d => { if (d.categoryId === req.params.id) d.categoryId = '' })
    data.categories.forEach((c, i) => c.sortOrder = i + 1)
    autoSave(); res.json(ok(null))
  } else res.json(fail(404, '分类不存在'))
})

// ============ 评价 ============
app.get('/api/reviews', (req, res) => {
  let result = [...data.reviews]
  if (req.query.rating) result = result.filter(r => r.rating === parseInt(req.query.rating))
  if (req.query.keyword) {
    const kw = req.query.keyword.toLowerCase()
    result = result.filter(r => r.userName.toLowerCase().includes(kw) || r.content.toLowerCase().includes(kw))
  }
  res.json(ok(result.sort((a, b) => b.createTime - a.createTime)))
})

app.put('/api/reviews/reply', (req, res) => {
  const { id, reply } = req.body
  const review = data.reviews.find(r => r.id === id)
  if (review) { review.reply = reply; review.replyTime = Date.now(); autoSave(); res.json(ok(review)) }
  else res.json(fail(404, '评价不存在'))
})

// ============ 统计 ============
app.get('/api/statistics', (req, res) => {
  const period = req.query.period || 'daily'
  res.json(ok({ statistics: data.statistics[period], categorySales: data.categorySales, topDishes: data.topDishes }))
})

// ============ 学生端专用接口 ============

// 服务端商家 id（shop1）→ 学生端商家 id（1）映射
function toStudentShopId(serverShopId) {
  const ss = data.studentShops.find(s => s.serverId === serverShopId)
  return ss ? ss.id : (data.studentShops[0] ? data.studentShops[0].id : 1)
}
// 学生端商家 id → 服务端商家 id
function toServerShopId(studentShopId) {
  const ss = data.studentShops.find(s => s.id === Number(studentShopId))
  return ss ? ss.serverId : 'shop1'
}

// 学生端商家列表
app.get('/api/student/shops', (req, res) => {
  // 根据商家后台实时状态更新 isOpen
  const result = data.studentShops.map(ss => {
    const srv = data.shops.find(s => s.id === ss.serverId)
    if (srv) {
      ss.isOpen = srv.status === 'open'
      ss.status = srv.status === 'open' ? '营业中' : '休息中'
      ss.notice = srv.notice
      ss.minAmount = srv.minPrice
    }
    return ss
  })
  if (req.query.categoryId > 0) {
    res.json(ok(result)) // 简化版，全返回
  } else {
    res.json(ok(result))
  }
})

// 学生端商家详情
app.get('/api/student/shops/:id', (req, res) => {
  const shop = data.studentShops.find(s => s.id === parseInt(req.params.id))
  if (!shop) return res.json(fail(404, '商家不存在'))
  const srv = data.shops.find(s => s.id === shop.serverId)
  if (srv) {
    shop.isOpen = srv.status === 'open'
    shop.status = srv.status === 'open' ? '营业中' : '休息中'
    shop.notice = srv.notice
  }
  res.json(ok(shop))
})

// 学生端菜品列表（按商家）
app.get('/api/student/dishes', (req, res) => {
  const shopId = parseInt(req.query.shopId)
  let result = []
  if (shopId) {
    const studentShop = data.studentShops.find(s => s.id === shopId)
    if (studentShop) {
      result = data.dishes.filter(d => d.shopId === studentShop.serverId && (d.status || 'active') === 'active')
    }
  }
  result = result.map(d => ({
    id: d.id,
    shopId: shopId,
    name: d.name,
    price: d.price,
    originalPrice: d.originalPrice,
    image: d.image,
    stock: d.stock,
    sales: d.sales || 0,
    desc: d.description || ''
  }))
  res.json(ok(result))
})

// 学生端搜索菜品
app.get('/api/student/dishes/search', (req, res) => {
  const keyword = req.query.keyword || ''
  let result = data.dishes.filter(d => (d.status || 'active') === 'active' && d.name.toLowerCase().includes(keyword.toLowerCase()))
  result = result.map(d => ({
    id: d.id,
    shopId: toStudentShopId(d.shopId),
    shopName: (data.shops.find(s => s.id === d.shopId) || {}).name || '',
    name: d.name,
    price: d.price,
    originalPrice: d.originalPrice,
    image: d.image,
    stock: d.stock,
    sales: d.sales,
    desc: d.description
  }))
  res.json(ok(result))
})

// 学生端库存校验 —— 真实查询服务端菜品库存
app.post('/api/student/check-stock', (req, res) => {
  const { items } = req.body  // items: [{ id, num }]
  if (!items || !Array.isArray(items)) return res.json(fail(400, '参数错误'))
  const checked = items.map(item => {
    const dish = data.dishes.find(d => d.id === item.id)
    if (!dish) return { id: item.id, name: item.name || '', available: false, stock: 0, reason: '菜品已下架' }
    if (dish.status !== 'active') return { id: item.id, name: dish.name, available: false, stock: dish.stock, reason: '菜品已下架' }
    if (dish.stock < item.num) return { id: item.id, name: dish.name, available: false, stock: dish.stock, reason: '库存不足' }
    return { id: item.id, name: dish.name, available: true, stock: dish.stock }
  })
  res.json(ok({ canOrder: checked.every(c => c.available), items: checked }))
})

// 学生端菜品详情
app.get('/api/student/dishes/:id', (req, res) => {
  const dish = data.dishes.find(d => d.id === req.params.id)
  if (!dish) return res.json(fail(404, '菜品不存在'))
  res.json(ok({
    id: dish.id,
    shopId: toStudentShopId(dish.shopId),
    shopName: (data.shops.find(s => s.id === dish.shopId) || {}).name || '',
    name: dish.name,
    price: dish.price,
    originalPrice: dish.originalPrice,
    image: dish.image,
    stock: dish.stock,
    sales: dish.sales || 0,
    desc: dish.description || ''
  }))
})

// 学生端创建订单 —— 关键！订单进入共享数据，商家后台立刻可见
app.post('/api/student/orders', (req, res) => {
  const { shopId, shopName, items, totalAmount, remark, userId, userName } = req.body
  const orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000)
  const pickupCode = String(Math.floor(1000 + Math.random() * 9000))
  
  const studentShop = data.studentShops.find(s => s.id === shopId)
  const serverShopId = studentShop ? studentShop.serverId : 'shop1'
  
  const order = {
    id: orderId,
    orderNo: orderId,
    userId: userId || 'student',
    userName: userName || '学生',
    userPhone: '13900000000',
    shopId: serverShopId,
    shopName: shopName || (studentShop ? studentShop.name : '美味餐厅'),
    status: 'pending',
    items: items.map(i => ({
      dishId: i.id,
      name: i.name,
      price: i.price,
      quantity: i.num
    })),
    totalPrice: totalAmount,
    actualPrice: totalAmount,
    deliverFee: 0,
    discountAmount: 0,
    remark: remark || '',
    pickupCode: pickupCode,
    createTime: Date.now(),
    updateTime: Date.now()
  }
  
  // 扣减库存
  items.forEach(i => {
    const dish = data.dishes.find(d => d.id === i.id)
    if (dish) {
      dish.stock = Math.max(0, dish.stock - i.num)
      dish.sales = (dish.sales || 0) + i.num
    }
  })
  
  data.orders.unshift(order)
  autoSave()
  res.json(ok({ orderId, pickupCode }))
})

// 学生端获取我的订单
app.get('/api/student/orders', (req, res) => {
  let result = [...data.orders]
  if (req.query.userId) result = result.filter(o => o.userId === req.query.userId)
  if (req.query.status >= 0) {
    const statusMap = { 0: 'pending', 1: 'processing', 2: 'completed', 3: 'cancelled' }
    const targetStatus = statusMap[req.query.status]
    if (targetStatus) result = result.filter(o => o.status === targetStatus)
  }
  // 转换成学生端格式
  result = result.map(o => ({
    id: o.id,
    orderId: o.id,
    shopId: toStudentShopId(o.shopId),
    shopName: o.shopName,
    items: o.items.map(i => ({ id: i.dishId, name: i.name, price: i.price, num: i.quantity, image: '' })),
    goodsAmount: o.totalPrice,
    totalAmount: o.actualPrice || o.totalPrice,
    deliveryFee: o.deliverFee || 0,
    couponDiscount: o.discountAmount || 0,
    status: o.status === 'pending' ? 0 : o.status === 'processing' ? 1 : o.status === 'completed' ? 2 : 3,
    pickupCode: o.pickupCode,
    remark: o.remark || '',
    createTime: new Date(o.createTime).toISOString(),
    hasReviewed: data.reviews.some(r => r.orderId === o.id)
  }))
  res.json(ok(result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))))
})

// 学生端获取订单详情
app.get('/api/student/orders/:id', (req, res) => {
  const order = data.orders.find(o => o.id === req.params.id || o.orderNo === req.params.id)
  if (!order) return res.json(fail(404, '订单不存在'))
  const o = order
  res.json(ok({
    id: o.id, orderId: o.id, shopId: 1, shopName: o.shopName,
    items: o.items.map(i => ({ id: i.dishId, name: i.name, price: i.price, num: i.quantity, image: '' })),
    goodsAmount: o.totalPrice, totalAmount: o.actualPrice || o.totalPrice,
    deliveryFee: o.deliverFee || 0, couponDiscount: o.discountAmount || 0,
    status: o.status === 'pending' ? 0 : o.status === 'processing' ? 1 : o.status === 'completed' ? 2 : 3,
    pickupCode: o.pickupCode, remark: o.remark || '',
    createTime: new Date(o.createTime).toISOString(),
    hasReviewed: data.reviews.some(r => r.orderId === o.id)
  }))
})

// 学生端取消订单
app.put('/api/student/orders/:id/cancel', (req, res) => {
  const order = data.orders.find(o => o.id === req.params.id || o.orderNo === req.params.id)
  if (!order) return res.json(fail(404, '订单不存在'))
  if (order.status !== 'pending') return res.json(fail(400, '订单已接单，无法取消'))
  order.status = 'cancelled'
  order.cancelReason = '用户取消'
  order.updateTime = Date.now()
  autoSave()
  // 恢复库存
  order.items.forEach(i => {
    const dish = data.dishes.find(d => d.id === i.dishId)
    if (dish) dish.stock = (dish.stock || 0) + i.quantity
  })
  res.json(ok(order))
})

// 学生端提交评价 — 含订单状态和重复评价校验
app.post('/api/student/reviews', (req, res) => {
  const { orderId, rating, tags, content } = req.body
  if (!orderId || !rating) return res.json(fail(400, '缺少必要参数'))
  
  // 校验订单存在且状态为 completed
  const order = data.orders.find(o => o.id === orderId || o.orderNo === orderId)
  if (!order) return res.json(fail(404, '订单不存在'))
  if (order.status !== 'completed') return res.json(fail(400, '仅已完成的订单可评价'))
  
  // 校验不重复评价
  if (data.reviews.some(r => r.orderId === orderId)) {
    return res.json(fail(400, '该订单已评价，不能重复评价'))
  }
  
  const review = {
    id: uid('rev'),
    orderId,
    shopId: order.shopId,
    shopName: order.shopName,
    userId: order.userId || 'student',
    userName: order.userName || '学生',
    rating: Number(rating),
    tags: tags || [],
    content: content || '',
    images: [],
    reply: '',
    createTime: Date.now(),
    replyTime: null
  }
  data.reviews.push(review)
  autoSave()
  res.json(ok(review))
})

// 学生端获取评价（可按商家 shopId 过滤）
app.get('/api/student/reviews', (req, res) => {
  let result = [...data.reviews]
  if (req.query.shopId) {
    const serverShopId = toServerShopId(req.query.shopId)
    result = result.filter(r => r.shopId === serverShopId)
  }
  if (req.query.orderId) result = result.filter(r => r.orderId === req.query.orderId)
  result = result.map(r => ({
    ...r,
    tags: r.tags || [],
    avatar: 'https://img.yzcdn.cn/vant/avatar.jpg',
    nickname: r.userName,
    dishName: '菜品',
    time: new Date(r.createTime).toISOString()
  }))
  res.json(ok(result.sort((a, b) => b.createTime - a.createTime)))
})

// 轮播公告
app.get('/api/student/announcements', (req, res) => {
  res.json(ok([
    { id: 1, title: '🎉 新用户首单立减5元，快来下单吧！', link: '' },
    { id: 2, title: '📢 美味餐厅推出红烧肉套餐，限时优惠中', link: '' },
    { id: 3, title: '🧋 校园奶茶店新品杨枝甘露第二杯半价', link: '' }
  ]))
})

// 商家状态变化通知（小程序轮询检查商家上下架/菜品变更）
app.get('/api/student/shop-status/:id', (req, res) => {
  const studentShop = data.studentShops.find(s => s.id === parseInt(req.params.id))
  if (!studentShop) return res.json(fail(404, '商家不存在'))
  const srv = data.shops.find(s => s.id === studentShop.serverId)
  res.json(ok({ isOpen: srv ? srv.status === 'open' : false, status: srv ? srv.status : 'closed' }))
})

// ============ 商家注册 ============

// 商家提交注册申请
app.post('/api/register', (req, res) => {
  const { shopName, phone, address, businessHours, description } = req.body
  if (!shopName || !phone || !address) return res.json(fail(400, '店名、电话和地址为必填项'))
  
  // 检查是否已存在同名店铺
  if (data.shops.find(s => s.name === shopName)) return res.json(fail(400, '该店名已被注册'))
  if (data.registrations.find(r => r.shopName === shopName && r.status === 'pending')) return res.json(fail(400, '已有相同店名的申请在审核中'))
  
  const registration = {
    id: 'reg' + Date.now(),
    shopName,
    phone,
    address,
    businessHours: businessHours || '09:00-22:00',
    description: description || '',
    status: 'pending',
    rejectReason: '',
    createTime: Date.now()
  }
  data.registrations.push(registration)
  autoSave()
  res.json(ok({ id: registration.id, status: 'pending', message: '注册申请已提交，请等待审核' }))
})

// 监管方查看注册申请列表
app.get('/api/supervisor/registrations', (req, res) => {
  let result = [...data.registrations]
  if (req.query.status) result = result.filter(r => r.status === req.query.status)
  res.json(ok(result.sort((a, b) => b.createTime - a.createTime)))
})

// 批准注册 —— 自动创建商家账号
app.put('/api/supervisor/registrations/:id/approve', (req, res) => {
  const reg = data.registrations.find(r => r.id === req.params.id)
  if (!reg) return res.json(fail(404, '申请不存在'))
  if (reg.status !== 'pending') return res.json(fail(400, '该申请已被处理'))
  
  reg.status = 'approved'
  
  // 创建商家账号
  const shopId = 'shop' + Date.now() + Math.floor(Math.random() * 100)
  const password = '123456'
  const newShop = {
    id: shopId,
    name: reg.shopName,
    phone: reg.phone,
    address: reg.address,
    businessHours: reg.businessHours,
    notice: '',
    logo: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=restaurant%20logo%20food%20modern',
    status: 'open',
    deliverFee: 0,
    minPrice: 10,
    score: 0,
    monthlySales: 0,
    createdAt: Date.now()
  }
  data.shops.push(newShop)
  
  // 同步添加学生端商家
  const studentShopId = data.studentShops.length + 1
  data.studentShops.push({
    id: studentShopId,
    serverId: shopId,
    name: reg.shopName,
    icon: '🏪',
    rating: 0,
    sales: 0,
    distance: '200m',
    time: '15分钟',
    deliveryFee: 0,
    minAmount: 10,
    status: '营业中',
    isOpen: true,
    notice: '',
    banner: '',
    description: reg.address
  })
  
  autoSave()
  res.json(ok({ shopId, shopName: reg.shopName, password, message: '审核通过并创建商家账号' }))
})

// 驳回注册
app.put('/api/supervisor/registrations/:id/reject', (req, res) => {
  const reg = data.registrations.find(r => r.id === req.params.id)
  if (!reg) return res.json(fail(404, '申请不存在'))
  if (reg.status !== 'pending') return res.json(fail(400, '该申请已被处理'))
  
  reg.status = 'rejected'
  reg.rejectReason = req.body.reason || '未填写驳回原因'
  autoSave()
  res.json(ok({ message: '已驳回该注册申请' }))
})

// ============ 监管方专用接口 ============

// 监管方登录
app.post('/api/supervisor/login', (req, res) => {
  const { username, password } = req.body
  const supervisor = data.supervisors.find(s => s.username === username && s.password === password)
  if (!supervisor) return res.json(fail(-1, '账号或密码错误'))
  res.json(ok({ token: 'sup-' + Date.now(), supervisorInfo: supervisor }))
})

// 监管方查看所有商家列表（含评分、销量、考评记录数）
app.get('/api/supervisor/shops', (req, res) => {
  const result = data.shops.map(shop => ({
    ...shop,
    evaluationCount: data.evaluations.filter(e => e.shopId === shop.id).length,
    rewardCount: data.rewards.filter(r => r.shopId === shop.id).length,
    completedOrders: data.orders.filter(o => o.shopId === shop.id && o.status === 'completed').length,
    averageRating: (() => {
      const shopReviews = data.reviews.filter(r => {
        const order = data.orders.find(o => o.id === r.orderId)
        return order && order.shopId === shop.id
      })
      if (shopReviews.length === 0) return 0
      return (shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length).toFixed(1)
    })()
  }))
  res.json(ok(result))
})

// 监管方查看指定商家详情
app.get('/api/supervisor/shops/:id', (req, res) => {
  const shop = data.shops.find(s => s.id === req.params.id)
  if (!shop) return res.json(fail(404, '商家不存在'))
  const shopEvaluations = data.evaluations.filter(e => e.shopId === shop.id).sort((a, b) => b.createTime - a.createTime)
  const shopRewards = data.rewards.filter(r => r.shopId === shop.id).sort((a, b) => b.createTime - a.createTime)
  const shopOrders = data.orders.filter(o => o.shopId === shop.id)
  const shopReviews = data.reviews.filter(r => shopOrders.some(o => o.id === r.orderId))
  
  res.json(ok({
    shop,
    evaluations: shopEvaluations,
    rewards: shopRewards,
    stats: {
      totalOrders: shopOrders.length,
      completedOrders: shopOrders.filter(o => o.status === 'completed').length,
      totalRevenue: shopOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.totalPrice, 0),
      averageRating: shopReviews.length > 0 ? (shopReviews.reduce((s, r) => s + r.rating, 0) / shopReviews.length).toFixed(1) : 0,
      reviewCount: shopReviews.length
    }
  }))
})

// 创建商家考评
app.post('/api/supervisor/evaluations', (req, res) => {
  const { shopId, type, score, content } = req.body
  if (!shopId || !type || score === undefined) return res.json(fail(400, '缺少必要参数'))
  const shop = data.shops.find(s => s.id === shopId)
  if (!shop) return res.json(fail(404, '商家不存在'))
  
  const evaluation = {
    id: 'eval' + Date.now(),
    shopId,
    shopName: shop.name,
    type, // 'quality' | 'service' | 'hygiene' | 'speed'
    score, // 1-100
    content: content || '',
    createTime: Date.now()
  }
  data.evaluations.push(evaluation)
  
  // 更新商家综合评分（所有考评的平均分）
  const allShopEvaluations = data.evaluations.filter(e => e.shopId === shopId)
  shop.score = parseFloat((allShopEvaluations.reduce((s, e) => s + e.score, 0) / allShopEvaluations.length).toFixed(1))
  
  autoSave()
  res.json(ok(evaluation))
})

// 获取所有考评记录
app.get('/api/supervisor/evaluations', (req, res) => {
  let result = [...data.evaluations]
  if (req.query.shopId) result = result.filter(e => e.shopId === req.query.shopId)
  if (req.query.type) result = result.filter(e => e.type === req.query.type)
  res.json(ok(result.sort((a, b) => b.createTime - a.createTime)))
})

// 删除考评记录
app.delete('/api/supervisor/evaluations/:id', (req, res) => {
  const idx = data.evaluations.findIndex(e => e.id === req.params.id)
  if (idx === -1) return res.json(fail(404, '考评不存在'))
  const removed = data.evaluations.splice(idx, 1)[0]
  
  // 重新计算商家评分
  const shopEvaluations = data.evaluations.filter(e => e.shopId === removed.shopId)
  const shop = data.shops.find(s => s.id === removed.shopId)
  if (shop) {
    shop.score = shopEvaluations.length > 0
      ? parseFloat((shopEvaluations.reduce((s, e) => s + e.score, 0) / shopEvaluations.length).toFixed(1))
      : 0
  }
  
  autoSave()
  res.json(ok(null))
})

// 创建平台奖励
app.post('/api/supervisor/rewards', (req, res) => {
  const { shopId, title, content, value } = req.body
  if (!shopId || !title) return res.json(fail(400, '缺少必要参数'))
  const shop = data.shops.find(s => s.id === shopId)
  if (!shop) return res.json(fail(404, '商家不存在'))
  
  const reward = {
    id: 'rwd' + Date.now(),
    shopId,
    shopName: shop.name,
    title,
    content: content || '',
    value: value || 0,
    createTime: Date.now()
  }
  data.rewards.push(reward)
  autoSave()
  res.json(ok(reward))
})

// 获取奖励记录
app.get('/api/supervisor/rewards', (req, res) => {
  let result = [...data.rewards]
  if (req.query.shopId) result = result.filter(r => r.shopId === req.query.shopId)
  res.json(ok(result.sort((a, b) => b.createTime - a.createTime)))
})

// 监管方工作台概览
app.get('/api/supervisor/dashboard', (req, res) => {
  const totalOrders = data.orders.length
  const todayOrders = data.orders.filter(o => {
    const today = new Date().toISOString().slice(0, 10)
    return new Date(o.createTime).toISOString().slice(0, 10) === today
  }).length
  const totalRevenue = data.orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.totalPrice, 0)
  
  res.json(ok({
    shopCount: data.shops.length,
    totalOrders,
    todayOrders,
    totalEvaluations: data.evaluations.length,
    totalRewards: data.rewards.length,
    totalRevenue,
    shopRankings: data.shops.map(s => ({
      id: s.id,
      name: s.name,
      score: s.score || 0,
      monthlySales: s.monthlySales || 0,
      status: s.status
    })).sort((a, b) => b.score - a.score)
  }))
})

// 商家后台是 SPA，非 API 路径一律回退到 index.html（支持前端路由刷新）
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/supervisor')) return next()
  if (!fs.existsSync(path.join(SHOP_DIST, 'index.html'))) return next()
  res.sendFile(path.join(SHOP_DIST, 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ 共享数据服务器已启动: http://localhost:${PORT}`)
  console.log(`   - 商家后台 API: http://localhost:${PORT}/api/orders`)
  console.log(`   - 学生端 API:   http://localhost:${PORT}/api/student/shops`)
})
// 监管端独立预览入口：同一个进程再监听一个端口，根路径直接跳到监管端页面，
// 其余请求（包括 /api）全部交回主 app 处理，因此两端数据完全共享、不会出现两份数据。
const SUPERVISOR_PORT = Number(process.env.SUPERVISOR_PORT || 3001)
if (SUPERVISOR_PORT && SUPERVISOR_PORT !== Number(PORT)) {
  const supervisorEntry = express()
  supervisorEntry.get('/', (req, res) => res.redirect('/supervisor/index.html'))
  supervisorEntry.get('/index.html', (req, res) => res.redirect('/supervisor/index.html'))
  supervisorEntry.use((req, res, next) => app(req, res, next))
  supervisorEntry.listen(SUPERVISOR_PORT, () => {
    console.log(`✅ 监管端入口已启动: http://localhost:${SUPERVISOR_PORT}/supervisor/index.html`)
  })
}
