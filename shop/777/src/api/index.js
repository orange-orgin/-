import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  timeout: 5000
})

instance.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const authAPI = {
  login(data) {
    return instance.post('/login', data)
  },
  getShop() {
    return instance.get('/shop')
  },
  updateShop(data) {
    return instance.put('/shop', data)
  }
}

export const ordersAPI = {
  getOrders(params) {
    return instance.get('/orders', { params })
  },
  getOrder(id) {
    return instance.get(`/orders/${id}`)
  },
  updateOrderStatus(data) {
    return instance.put('/orders/status', data)
  }
}

export const dishesAPI = {
  getDishes(params) {
    return instance.get('/dishes', { params })
  },
  addDish(data) {
    return instance.post('/dishes', data)
  },
  updateDish(data) {
    return instance.put('/dishes', data)
  },
  deleteDish(id) {
    return instance.delete(`/dishes?id=${id}`)
  },
  updateStock(data) {
    return instance.put('/dishes/stock', data)
  },
  updateStatus(data) {
    return instance.put('/dishes/status', data)
  },
  batchOperate(data) {
    return instance.put('/dishes/batch', data)
  }
}

export const categoriesAPI = {
  getCategories() {
    return instance.get('/categories')
  },
  addCategory(data) {
    return instance.post('/categories', data)
  },
  updateCategory(data) {
    return instance.put('/categories', data)
  },
  deleteCategory(id) {
    return instance.delete(`/categories?id=${id}`)
  }
}

export const reviewsAPI = {
  getReviews(params) {
    return instance.get('/reviews', { params })
  },
  replyReview(data) {
    return instance.put('/reviews/reply', data)
  }
}

export const statisticsAPI = {
  getStatistics(params) {
    return instance.get('/statistics', { params })
  }
}
