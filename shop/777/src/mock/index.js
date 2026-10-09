import Mock from 'mockjs'
import { mockShops, mockCategories, mockDishes, mockOrders, mockReviews, mockStatistics, mockCategorySales, mockTopDishes } from './data'

Mock.setup({
  timeout: '100-300'
})

// 登录接口
Mock.mock('/api/login', 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  const shop = mockShops.find(s => s.id === username && password === '123456')
  
  if (shop) {
    return {
      code: 0,
      message: '登录成功',
      data: {
        token: Mock.Random.guid(),
        shopInfo: shop
      }
    }
  }
  
  return {
    code: -1,
    message: '账号或密码错误'
  }
})

// 获取店铺信息
Mock.mock('/api/shop', 'get', () => ({
  code: 0,
  message: 'success',
  data: mockShops[0]
}))

// 更新店铺信息
Mock.mock('/api/shop', 'put', (options) => {
  const data = JSON.parse(options.body)
  const shop = mockShops.find(s => s.id === data.id)
  if (shop) {
    Object.assign(shop, data)
  }
  return {
    code: 0,
    message: '更新成功',
    data: shop
  }
})

// 获取订单列表
Mock.mock('/api/orders', 'get', (options) => {
  const params = new URLSearchParams(options.url.split('?')[1])
  const status = params.get('status')
  const keyword = params.get('keyword')
  
  let filteredOrders = [...mockOrders]
  
  if (status && status !== 'all') {
    filteredOrders = filteredOrders.filter(o => o.status === status)
  }
  
  if (keyword) {
    filteredOrders = filteredOrders.filter(o => 
      o.id.includes(keyword) || 
      o.userName.includes(keyword)
    )
  }
  
  return {
    code: 0,
    message: 'success',
    data: filteredOrders
  }
})

// 获取订单详情
Mock.mock(/\/api\/orders\/\d+/, 'get', (options) => {
  const id = options.url.split('/').pop()
  const order = mockOrders.find(o => o.id === id)
  
  return {
    code: 0,
    message: 'success',
    data: order || null
  }
})

// 更新订单状态
Mock.mock('/api/orders/status', 'put', (options) => {
  const { orderId, status, reason } = JSON.parse(options.body)
  const order = mockOrders.find(o => o.id === orderId)
  
  if (order) {
    order.status = status
    order.updateTime = Date.now()
    if (reason) order.cancelReason = reason
  }
  
  return {
    code: 0,
    message: '操作成功',
    data: order
  }
})

// 获取菜品分类
Mock.mock('/api/categories', 'get', () => ({
  code: 0,
  message: 'success',
  data: mockCategories
}))

// 添加分类
Mock.mock('/api/categories', 'post', (options) => {
  const data = JSON.parse(options.body)
  const newCategory = {
    id: 'cat' + Date.now(),
    name: data.name,
    sortOrder: mockCategories.length + 1
  }
  mockCategories.push(newCategory)
  
  return {
    code: 0,
    message: '添加成功',
    data: newCategory
  }
})

// 更新分类
Mock.mock('/api/categories', 'put', (options) => {
  const data = JSON.parse(options.body)
  const category = mockCategories.find(c => c.id === data.id)
  if (category) {
    Object.assign(category, data)
  }
  
  return {
    code: 0,
    message: '更新成功',
    data: category
  }
})

// 删除分类
Mock.mock('/api/categories', 'delete', (options) => {
  const params = new URLSearchParams(options.url.split('?')[1])
  const id = params.get('id')
  const index = mockCategories.findIndex(c => c.id === id)
  
  if (index !== -1) {
    mockCategories.splice(index, 1)
    mockCategories.forEach((c, i) => {
      c.sortOrder = i + 1
    })
  }
  
  return {
    code: 0,
    message: '删除成功'
  }
})

// 获取菜品列表
Mock.mock('/api/dishes', 'get', (options) => {
  const params = new URLSearchParams(options.url.split('?')[1])
  const categoryId = params.get('categoryId')
  const status = params.get('status')
  const keyword = params.get('keyword')
  
  let filteredDishes = [...mockDishes]
  
  if (categoryId) {
    filteredDishes = filteredDishes.filter(d => d.categoryId === categoryId)
  }
  
  if (status && status !== 'all') {
    filteredDishes = filteredDishes.filter(d => d.status === status)
  }
  
  if (keyword) {
    filteredDishes = filteredDishes.filter(d => d.name.includes(keyword))
  }
  
  return {
    code: 0,
    message: 'success',
    data: filteredDishes
  }
})

// 添加菜品
Mock.mock('/api/dishes', 'post', (options) => {
  const data = JSON.parse(options.body)
  const newDish = {
    id: 'dish' + Date.now(),
    ...data,
    sales: 0,
    createdAt: Date.now()
  }
  mockDishes.push(newDish)
  
  return {
    code: 0,
    message: '添加成功',
    data: newDish
  }
})

// 更新菜品
Mock.mock('/api/dishes', 'put', (options) => {
  const data = JSON.parse(options.body)
  const dish = mockDishes.find(d => d.id === data.id)
  if (dish) {
    Object.assign(dish, data)
  }
  
  return {
    code: 0,
    message: '更新成功',
    data: dish
  }
})

// 删除菜品
Mock.mock('/api/dishes', 'delete', (options) => {
  const params = new URLSearchParams(options.url.split('?')[1])
  const id = params.get('id')
  const index = mockDishes.findIndex(d => d.id === id)
  
  if (index !== -1) {
    mockDishes.splice(index, 1)
  }
  
  return {
    code: 0,
    message: '删除成功'
  }
})

// 更新菜品库存
Mock.mock('/api/dishes/stock', 'put', (options) => {
  const { id, delta } = JSON.parse(options.body)
  const dish = mockDishes.find(d => d.id === id)
  
  if (dish) {
    dish.stock = Math.max(0, dish.stock + delta)
  }
  
  return {
    code: 0,
    message: '更新成功',
    data: dish
  }
})

// 更新菜品状态
Mock.mock('/api/dishes/status', 'put', (options) => {
  const { id, status } = JSON.parse(options.body)
  const dish = mockDishes.find(d => d.id === id)
  
  if (dish) {
    dish.status = status
  }
  
  return {
    code: 0,
    message: '更新成功',
    data: dish
  }
})

// 批量操作菜品
Mock.mock('/api/dishes/batch', 'put', (options) => {
  const { ids, action, value } = JSON.parse(options.body)
  
  ids.forEach(id => {
    const dish = mockDishes.find(d => d.id === id)
    if (dish) {
      if (action === 'status') {
        dish.status = value
      } else if (action === 'price') {
        dish.price = value
      }
    }
  })
  
  return {
    code: 0,
    message: '操作成功'
  }
})

// 获取评价列表
Mock.mock('/api/reviews', 'get', (options) => {
  const params = new URLSearchParams(options.url.split('?')[1])
  const rating = params.get('rating')
  const keyword = params.get('keyword')
  
  let filteredReviews = [...mockReviews]
  
  if (rating) {
    filteredReviews = filteredReviews.filter(r => r.rating === parseInt(rating))
  }
  
  if (keyword) {
    filteredReviews = filteredReviews.filter(r => 
      r.userName.includes(keyword) || 
      r.content.includes(keyword)
    )
  }
  
  return {
    code: 0,
    message: 'success',
    data: filteredReviews
  }
})

// 回复评价
Mock.mock('/api/reviews/reply', 'put', (options) => {
  const { id, reply } = JSON.parse(options.body)
  const review = mockReviews.find(r => r.id === id)
  
  if (review) {
    review.reply = reply
    review.replyTime = Date.now()
  }
  
  return {
    code: 0,
    message: '回复成功',
    data: review
  }
})

// 获取统计数据
Mock.mock('/api/statistics', 'get', (options) => {
  const params = new URLSearchParams(options.url.split('?')[1])
  const period = params.get('period') || 'daily'
  
  return {
    code: 0,
    message: 'success',
    data: {
      statistics: mockStatistics[period],
      categorySales: mockCategorySales,
      topDishes: mockTopDishes
    }
  }
})

export default Mock
