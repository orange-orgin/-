export const mockShops = [
  {
    id: 'shop1',
    name: '美味餐厅',
    phone: '13800138001',
    address: '校园美食街A区101号',
    businessHours: '09:00-21:00',
    notice: '欢迎光临！今日特价：红烧肉立减5元',
    logo: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=restaurant%20logo%20food%20delicious%20modern&image_size=square',
    status: 'open',
    deliverFee: 0,
    minPrice: 10,
    score: 4.8,
    monthlySales: 2562,
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'shop2',
    name: '麻辣香锅',
    phone: '13800138002',
    address: '校园美食街B区202号',
    businessHours: '10:00-22:00',
    notice: '新店开业，全场8折！',
    logo: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=spicy%20food%20logo%20chinese%20style&image_size=square',
    status: 'open',
    deliverFee: 0,
    minPrice: 12,
    score: 4.6,
    monthlySales: 1892,
    createdAt: Date.now() - 86400000 * 15
  }
]

export const mockCategories = [
  { id: 'cat1', name: '招牌菜', sortOrder: 1 },
  { id: 'cat2', name: '家常菜', sortOrder: 2 },
  { id: 'cat3', name: '汤羹', sortOrder: 3 },
  { id: 'cat4', name: '主食', sortOrder: 4 },
  { id: 'cat5', name: '饮品', sortOrder: 5 }
]

export const mockDishes = [
  {
    id: 'dish1',
    name: '红烧肉',
    price: 38,
    originalPrice: 45,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=chinese%20braised%20pork%20belly%20hong%20shao%20rou%20delicious&image_size=square',
    stock: 50,
    description: '精选五花肉，慢火炖煮2小时，肥而不腻',
    categoryId: 'cat1',
    status: 'active',
    sales: 1256,
    createdAt: Date.now() - 86400000 * 20
  },
  {
    id: 'dish2',
    name: '宫保鸡丁',
    price: 28,
    originalPrice: 32,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=kung%20pao%20chicken%20with%20peanuts%20chinese%20food&image_size=square',
    stock: 30,
    description: '鸡肉嫩滑，花生酥脆，微辣鲜香',
    categoryId: 'cat2',
    status: 'active',
    sales: 892,
    createdAt: Date.now() - 86400000 * 18
  },
  {
    id: 'dish3',
    name: '鱼香肉丝',
    price: 26,
    originalPrice: 30,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=fish%20flavored%20shredded%20pork%20yu%20xiang%20rou%20si&image_size=square',
    stock: 40,
    description: '酸甜微辣，香气扑鼻',
    categoryId: 'cat2',
    status: 'active',
    sales: 756,
    createdAt: Date.now() - 86400000 * 15
  },
  {
    id: 'dish4',
    name: '番茄鸡蛋汤',
    price: 12,
    originalPrice: 15,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=tomato%20egg%20soup%20chinese%20style%20delicious&image_size=square',
    stock: 100,
    description: '营养丰富，老少皆宜',
    categoryId: 'cat3',
    status: 'active',
    sales: 1532,
    createdAt: Date.now() - 86400000 * 25
  },
  {
    id: 'dish5',
    name: '扬州炒饭',
    price: 18,
    originalPrice: 22,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=yangzhou%20fried%20rice%20chinese%20style%20eggs%20vegetables&image_size=square',
    stock: 60,
    description: '粒粒分明，配料丰富',
    categoryId: 'cat4',
    status: 'active',
    sales: 987,
    createdAt: Date.now() - 86400000 * 12
  },
  {
    id: 'dish6',
    name: '麻辣香锅',
    price: 45,
    originalPrice: 55,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=spicy%20mala%20xiang%20guo%20chinese%20food%20vegetables%20meat&image_size=square',
    stock: 25,
    description: '麻辣鲜香，食材丰富',
    categoryId: 'cat1',
    status: 'active',
    sales: 1123,
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: 'dish7',
    name: '酸梅汤',
    price: 8,
    originalPrice: 10,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=sour%20plum%20drink%20chinese%20traditional%20refreshing&image_size=square',
    stock: 200,
    description: '清凉解暑，酸甜可口',
    categoryId: 'cat5',
    status: 'active',
    sales: 2341,
    createdAt: Date.now() - 86400000 * 22
  },
  {
    id: 'dish8',
    name: '清蒸鲈鱼',
    price: 58,
    originalPrice: 68,
    image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=steamed%20sea%20bass%20chinese%20food%20fresh%20fish&image_size=square',
    stock: 15,
    description: '鲜嫩多汁，原汁原味',
    categoryId: 'cat1',
    status: 'inactive',
    sales: 423,
    createdAt: Date.now() - 86400000 * 8
  }
]

export const mockOrders = [
  {
    id: 'ORD20240115001',
    userId: 'user1',
    userName: '张三',
    userPhone: '13900139001',
    shopId: 'shop1',
    status: 'pending',
    items: [
      { dishId: 'dish1', name: '红烧肉', price: 38, quantity: 2 },
      { dishId: 'dish4', name: '番茄鸡蛋汤', price: 12, quantity: 1 }
    ],
    totalPrice: 88,
    remark: '不要辣',
    createTime: Date.now() - 60000,
    updateTime: Date.now() - 60000
  },
  {
    id: 'ORD20240115002',
    userId: 'user2',
    userName: '李四',
    userPhone: '13900139002',
    shopId: 'shop1',
    status: 'pending',
    items: [
      { dishId: 'dish2', name: '宫保鸡丁', price: 28, quantity: 1 },
      { dishId: 'dish5', name: '扬州炒饭', price: 18, quantity: 1 },
      { dishId: 'dish7', name: '酸梅汤', price: 8, quantity: 2 }
    ],
    totalPrice: 62,
    remark: '',
    createTime: Date.now() - 120000,
    updateTime: Date.now() - 120000
  },
  {
    id: 'ORD20240115003',
    userId: 'user3',
    userName: '王五',
    userPhone: '13900139003',
    shopId: 'shop1',
    status: 'processing',
    items: [
      { dishId: 'dish6', name: '麻辣香锅', price: 45, quantity: 1 },
      { dishId: 'dish7', name: '酸梅汤', price: 8, quantity: 1 }
    ],
    totalPrice: 53,
    remark: '少辣',
    createTime: Date.now() - 300000,
    updateTime: Date.now() - 240000
  },
  {
    id: 'ORD20240115004',
    userId: 'user4',
    userName: '赵六',
    userPhone: '13900139004',
    shopId: 'shop1',
    status: 'completed',
    items: [
      { dishId: 'dish3', name: '鱼香肉丝', price: 26, quantity: 2 },
      { dishId: 'dish4', name: '番茄鸡蛋汤', price: 12, quantity: 1 }
    ],
    totalPrice: 64,
    remark: '',
    createTime: Date.now() - 3600000,
    updateTime: Date.now() - 3000000
  },
  {
    id: 'ORD20240115005',
    userId: 'user5',
    userName: '钱七',
    userPhone: '13900139005',
    shopId: 'shop1',
    status: 'cancelled',
    items: [
      { dishId: 'dish1', name: '红烧肉', price: 38, quantity: 1 }
    ],
    totalPrice: 38,
    remark: '',
    cancelReason: '用户取消',
    createTime: Date.now() - 7200000,
    updateTime: Date.now() - 7100000
  }
]

export const mockReviews = [
  {
    id: 'rev1',
    orderId: 'ORD20240115004',
    userId: 'user4',
    userName: '赵六',
    rating: 5,
    content: '味道非常好，下次还来！',
    images: [
      'https://neeko-copilot.bytedance.net/api/text2image?prompt=delicious%20chinese%20food%20on%20plate%20restaurant&image_size=square'
    ],
    reply: '感谢您的好评，期待您的再次光临！',
    createTime: Date.now() - 2800000,
    replyTime: Date.now() - 2000000
  },
  {
    id: 'rev2',
    orderId: 'ORD20240114001',
    userId: 'user1',
    userName: '张三',
    rating: 4,
    content: '菜品不错，就是上菜有点慢',
    images: [],
    reply: '',
    createTime: Date.now() - 86400000,
    replyTime: null
  },
  {
    id: 'rev3',
    orderId: 'ORD20240113002',
    userId: 'user2',
    userName: '李四',
    rating: 5,
    content: '非常满意，红烧肉太好吃了！',
    images: [
      'https://neeko-copilot.bytedance.net/api/text2image?prompt=braised%20pork%20belly%20hong%20shao%20rou%20close%20up&image_size=square',
      'https://neeko-copilot.bytedance.net/api/text2image?prompt=chinese%20food%20table%20setting%20delicious&image_size=square'
    ],
    reply: '谢谢支持，我们会继续努力！',
    createTime: Date.now() - 172800000,
    replyTime: Date.now() - 170000000
  },
  {
    id: 'rev4',
    orderId: 'ORD20240112003',
    userId: 'user3',
    userName: '王五',
    rating: 3,
    content: '一般般吧，没有想象中好吃',
    images: [],
    reply: '',
    createTime: Date.now() - 259200000,
    replyTime: null
  }
]

export const mockStatistics = {
  daily: {
    dates: ['01-10', '01-11', '01-12', '01-13', '01-14', '01-15', '01-16'],
    sales: [1250, 1380, 1420, 1180, 1560, 1680, 1450],
    orders: [45, 52, 48, 41, 55, 58, 50],
    avgOrderValue: [27.8, 26.5, 29.6, 28.8, 28.4, 29.0, 29.0]
  },
  weekly: {
    dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    sales: [8520, 9230, 8890, 9560, 11200, 13500, 12800],
    orders: [305, 338, 312, 342, 401, 478, 448],
    avgOrderValue: [27.9, 27.3, 28.5, 27.9, 27.9, 28.2, 28.6]
  },
  monthly: {
    dates: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    sales: [45200, 38500, 52300, 49800, 56200, 61500, 68900, 72300, 58600, 54200, 51800, 58900],
    orders: [1620, 1405, 1880, 1785, 2015, 2210, 2455, 2588, 2105, 1945, 1865, 2108],
    avgOrderValue: [27.9, 27.4, 27.8, 27.9, 27.9, 27.8, 28.0, 27.9, 27.8, 27.9, 27.8, 27.9]
  }
}

export const mockCategorySales = [
  { name: '招牌菜', value: 3520 },
  { name: '家常菜', value: 2850 },
  { name: '汤羹', value: 1890 },
  { name: '主食', value: 2150 },
  { name: '饮品', value: 1680 }
]

export const mockTopDishes = [
  { name: '酸梅汤', sales: 2341 },
  { name: '番茄鸡蛋汤', sales: 1532 },
  { name: '红烧肉', sales: 1256 },
  { name: '麻辣香锅', sales: 1123 },
  { name: '扬州炒饭', sales: 987 },
  { name: '宫保鸡丁', sales: 892 },
  { name: '鱼香肉丝', sales: 756 },
  { name: '清蒸鲈鱼', sales: 423 }
]
