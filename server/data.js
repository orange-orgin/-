// 共享数据中心 —— 初始数据模板（仅在无持久化文件时使用）

const shops = [
  { id: 'shop1', name: '美味餐厅', phone: '13800138001', address: '校园美食街A区101号', businessHours: '09:00-21:00', notice: '', logo: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=restaurant%20logo%20food%20delicious%20modern&image_size=square', status: 'open', deliverFee: 0, minPrice: 10, score: 4.8, monthlySales: 0, createdAt: Date.now() - 86400000 * 30 },
  { id: 'shop2', name: '麻辣香锅', phone: '13800138002', address: '校园美食街B区202号', businessHours: '10:00-22:00', notice: '', logo: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=spicy%20food%20logo%20chinese%20style&image_size=square', status: 'open', deliverFee: 0, minPrice: 12, score: 4.6, monthlySales: 0, createdAt: Date.now() - 86400000 * 15 }
]

const categories = []
const dishes = []
const orders = []
const reviews = []

const statistics = {
  daily: { dates: [], sales: [], orders: [] },
  weekly: { dates: [], sales: [], orders: [] },
  monthly: { dates: [], sales: [], orders: [] }
}

const categorySales = []
const topDishes = []

const supervisors = [
  { id: 'admin', username: 'admin', password: 'admin123', name: '平台管理员' }
]

const evaluations = []
const rewards = []

// 商家注册申请
const registrations = []

const studentShops = [
  { id: 1, serverId: 'shop1', name: '美味餐厅', icon: '🍽️', rating: 4.8, sales: 0, distance: '200m', time: '15分钟', deliveryFee: 0, minAmount: 10, status: '营业中', isOpen: true, notice: '', banner: '', description: '' },
  { id: 2, serverId: 'shop2', name: '麻辣香锅', icon: '🌶️', rating: 4.6, sales: 0, distance: '300m', time: '20分钟', deliveryFee: 0, minAmount: 12, status: '营业中', isOpen: true, notice: '', banner: '', description: '' }
]

const studentDishes = []

module.exports = { shops, categories, dishes, orders, reviews, statistics, categorySales, topDishes, supervisors, evaluations, rewards, registrations, studentShops, studentDishes }