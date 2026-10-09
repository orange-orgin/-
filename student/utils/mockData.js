// utils/mockData.js

// 商家分类
const categories = [
  { id: 1, name: '全部', icon: '🍽️' },
  { id: 2, name: '快餐简餐', icon: '🍔' },
  { id: 3, name: '面馆', icon: '🍜' },
  { id: 4, name: '奶茶店', icon: '🧋' },
  { id: 5, name: '小吃', icon: '🍟' },
  { id: 6, name: '水果店', icon: '🍎' }
];

// 商家列表 - 完善的校园食堂商家
const shops = [
  {
    id: 1,
    name: '一食堂·快餐窗口',
    icon: '🍔',
    rating: 4.8,
    sales: 2562,
    distance: '200m',
    time: '15分钟',
    deliveryFee: 0,
    minAmount: 10,
    status: '营业中',
    isOpen: true,
    notice: '欢迎光临一食堂！新推出红烧肉套餐，限时优惠',
    banner: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '一食堂快餐窗口，提供各类家常菜套餐'
  },
  {
    id: 2,
    name: '二食堂·面食窗口',
    icon: '🍜',
    rating: 4.6,
    sales: 1892,
    distance: '300m',
    time: '20分钟',
    deliveryFee: 0,
    minAmount: 12,
    status: '营业中',
    isOpen: true,
    notice: '手工拉面，劲道爽滑，每日新鲜制作',
    banner: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '二食堂面食窗口，正宗手工面'
  },
  {
    id: 3,
    name: '校园奶茶店',
    icon: '🧋',
    rating: 4.9,
    sales: 3341,
    distance: '150m',
    time: '10分钟',
    deliveryFee: 0,
    minAmount: 8,
    status: '营业中',
    isOpen: true,
    notice: '新品上市：杨枝甘露，第二杯半价！',
    banner: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '校园人气奶茶店，新鲜现做'
  },
  {
    id: 4,
    name: '三食堂·特色小吃',
    icon: '🍟',
    rating: 4.5,
    sales: 1278,
    distance: '400m',
    time: '25分钟',
    deliveryFee: 0,
    minAmount: 15,
    status: '休息中',
    isOpen: false,
    notice: '营业时间：10:00-20:00',
    banner: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '三食堂特色小吃，各地风味'
  },
  {
    id: 5,
    name: '一食堂·盖浇饭',
    icon: '🍚',
    rating: 4.7,
    sales: 2134,
    distance: '200m',
    time: '18分钟',
    deliveryFee: 0,
    minAmount: 12,
    status: '营业中',
    isOpen: true,
    notice: '盖浇饭系列，米饭免费续加',
    banner: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '一食堂盖浇饭，经济实惠'
  },
  {
    id: 6,
    name: '校园水果店',
    icon: '🍎',
    rating: 4.8,
    sales: 867,
    distance: '250m',
    time: '15分钟',
    deliveryFee: 0,
    minAmount: 10,
    status: '营业中',
    isOpen: true,
    notice: '新鲜水果每日到货，品质保证',
    banner: 'https://img.yzcdn.cn/vant/cat.jpeg',
    description: '校园水果店，新鲜直达'
  }
];

// 菜品列表 - 完善的菜品数据
const dishes = [
  // 一食堂·快餐窗口 (shopId: 1)
  { id: 101, shopId: 1, name: '红烧肉套餐', price: 15, originalPrice: 18, image: 'https://img.yzcdn.cn/vant/apple-1.jpg', stock: 50, sales: 320, desc: '红烧肉+时蔬+米饭，肥而不腻' },
  { id: 102, shopId: 1, name: '宫保鸡丁套餐', price: 14, originalPrice: 16, image: 'https://img.yzcdn.cn/vant/apple-2.jpg', stock: 45, sales: 256, desc: '经典川菜，香辣可口' },
  { id: 103, shopId: 1, name: '糖醋里脊套餐', price: 16, originalPrice: 18, image: 'https://img.yzcdn.cn/vant/apple-3.jpg', stock: 40, sales: 198, desc: '酸甜适中，外酥里嫩' },
  { id: 104, shopId: 1, name: '番茄炒蛋套餐', price: 10, originalPrice: 12, image: 'https://img.yzcdn.cn/vant/apple-4.jpg', stock: 60, sales: 420, desc: '家常美味，营养健康' },
  { id: 105, shopId: 1, name: '鱼香肉丝套餐', price: 13, originalPrice: 15, image: 'https://img.yzcdn.cn/vant/apple-1.jpg', stock: 55, sales: 380, desc: '鱼香味浓，下饭神器' },
  { id: 106, shopId: 1, name: '可乐鸡腿套餐', price: 15, originalPrice: 17, image: 'https://img.yzcdn.cn/vant/apple-2.jpg', stock: 35, sales: 210, desc: '鸡腿鲜嫩，可乐入味' },
  
  // 二食堂·面食窗口 (shopId: 2)
  { id: 201, shopId: 2, name: '牛肉拉面', price: 16, originalPrice: 18, image: 'https://img.yzcdn.cn/vant/pear-1.jpg', stock: 60, sales: 456, desc: '手工拉面，牛肉大块' },
  { id: 202, shopId: 2, name: '西红柿鸡蛋面', price: 12, originalPrice: 14, image: 'https://img.yzcdn.cn/vant/pear-2.jpg', stock: 50, sales: 312, desc: '酸甜可口，汤鲜面滑' },
  { id: 203, shopId: 2, name: '炸酱面', price: 14, originalPrice: 16, image: 'https://img.yzcdn.cn/vant/pear-3.jpg', stock: 45, sales: 289, desc: '老北京风味，酱香浓郁' },
  { id: 204, shopId: 2, name: '酸辣粉', price: 10, originalPrice: 12, image: 'https://img.yzcdn.cn/vant/pear-4.jpg', stock: 70, sales: 520, desc: '酸辣开胃，粉条劲道' },
  { id: 205, shopId: 2, name: '排骨面', price: 18, originalPrice: 20, image: 'https://img.yzcdn.cn/vant/pear-1.jpg', stock: 30, sales: 178, desc: '排骨酥烂，汤底浓郁' },
  
  // 校园奶茶店 (shopId: 3)
  { id: 301, shopId: 3, name: '珍珠奶茶', price: 10, originalPrice: 12, image: 'https://img.yzcdn.cn/vant/apple-1.jpg', stock: 100, sales: 890, desc: '经典奶茶，珍珠Q弹' },
  { id: 302, shopId: 3, name: '杨枝甘露', price: 16, originalPrice: 18, image: 'https://img.yzcdn.cn/vant/apple-2.jpg', stock: 50, sales: 456, desc: '芒果+西柚+椰浆，清爽解暑' },
  { id: 303, shopId: 3, name: '芋泥波波奶茶', price: 14, originalPrice: 16, image: 'https://img.yzcdn.cn/vant/apple-3.jpg', stock: 60, sales: 623, desc: '芋泥细腻，波波Q弹' },
  { id: 304, shopId: 3, name: '四季春茶', price: 8, originalPrice: 10, image: 'https://img.yzcdn.cn/vant/apple-4.jpg', stock: 80, sales: 445, desc: '清香茶饮，回甘悠长' },
  { id: 305, shopId: 3, name: '柠檬养乐多', price: 12, originalPrice: 14, image: 'https://img.yzcdn.cn/vant/apple-1.jpg', stock: 70, sales: 567, desc: '柠檬+养乐多，酸甜好喝' },
  { id: 306, shopId: 3, name: '红豆奶茶', price: 11, originalPrice: 13, image: 'https://img.yzcdn.cn/vant/apple-2.jpg', stock: 65, sales: 389, desc: '红豆软糯，奶茶香浓' },
  
  // 三食堂·特色小吃 (shopId: 4) - 休息中
  { id: 401, shopId: 4, name: '炸鸡排', price: 12, originalPrice: 15, image: 'https://img.yzcdn.cn/vant/pear-1.jpg', stock: 0, sales: 234, desc: '外酥里嫩，香辣过瘾' },
  { id: 402, shopId: 4, name: '章鱼小丸子', price: 10, originalPrice: 12, image: 'https://img.yzcdn.cn/vant/pear-2.jpg', stock: 0, sales: 189, desc: '日式风味，料足味美' },
  
  // 一食堂·盖浇饭 (shopId: 5)
  { id: 501, shopId: 5, name: '青椒肉丝盖饭', price: 12, originalPrice: 14, image: 'https://img.yzcdn.cn/vant/apple-1.jpg', stock: 50, sales: 567, desc: '青椒爽脆，肉丝嫩滑' },
  { id: 502, shopId: 5, name: '麻婆豆腐盖饭', price: 10, originalPrice: 12, image: 'https://img.yzcdn.cn/vant/apple-2.jpg', stock: 45, sales: 423, desc: '麻辣鲜香，豆腐嫩滑' },
  { id: 503, shopId: 5, name: '回锅肉盖饭', price: 14, originalPrice: 16, image: 'https://img.yzcdn.cn/vant/apple-3.jpg', stock: 40, sales: 378, desc: '川菜经典，肥而不腻' },
  { id: 504, shopId: 5, name: '土豆牛腩盖饭', price: 16, originalPrice: 18, image: 'https://img.yzcdn.cn/vant/apple-4.jpg', stock: 35, sales: 289, desc: '牛腩软烂，土豆绵糯' },
  { id: 505, shopId: 5, name: '香菇滑鸡盖饭', price: 13, originalPrice: 15, image: 'https://img.yzcdn.cn/vant/apple-1.jpg', stock: 42, sales: 312, desc: '香菇鲜美，鸡肉嫩滑' },
  
  // 校园水果店 (shopId: 6)
  { id: 601, shopId: 6, name: '鲜切西瓜', price: 8, originalPrice: 10, image: 'https://img.yzcdn.cn/vant/pear-1.jpg', stock: 80, sales: 678, desc: '新鲜西瓜，清凉解暑' },
  { id: 602, shopId: 6, name: '水果拼盘', price: 15, originalPrice: 18, image: 'https://img.yzcdn.cn/vant/pear-2.jpg', stock: 30, sales: 345, desc: '多种水果，营养均衡' },
  { id: 603, shopId: 6, name: '鲜榨橙汁', price: 12, originalPrice: 15, image: 'https://img.yzcdn.cn/vant/pear-3.jpg', stock: 50, sales: 456, desc: '新鲜橙子现榨，维C满满' },
  { id: 604, shopId: 6, name: '香蕉', price: 5, originalPrice: 6, image: 'https://img.yzcdn.cn/vant/pear-4.jpg', stock: 100, sales: 234, desc: '新鲜香蕉，香甜软糯' }
];

// 轮播公告
const announcements = [
  { id: 1, title: '🎉 新用户首单立减5元，快来下单吧！', link: '' },
  { id: 2, title: '📢 一食堂推出红烧肉套餐，限时优惠中', link: '' },
  { id: 3, title: '🧋 校园奶茶店新品杨枝甘露第二杯半价', link: '' }
];

// 评价标签
const reviewTags = ['味道好', '包装好', '份量足', '送达快', '态度好', '干净卫生', '价格实惠', '菜品新鲜'];

// 模拟评价
const reviews = [
  { id: 1, orderId: 'ORD001', dishName: '红烧肉套餐', avatar: 'https://img.yzcdn.cn/vant/avatar-1.jpg', nickname: '小明', rating: 5, tags: ['味道好', '份量足'], content: '红烧肉很好吃，肥而不腻，米饭还可以续加，性价比很高！', images: ['https://img.yzcdn.cn/vant/apple-1.jpg'], time: '2024-01-15 12:30' },
  { id: 2, orderId: 'ORD002', dishName: '珍珠奶茶', avatar: 'https://img.yzcdn.cn/vant/avatar-2.jpg', nickname: '小红', rating: 4, tags: ['送达快'], content: '奶茶很好喝，珍珠Q弹，就是有点甜', images: [], time: '2024-01-14 18:20' },
  { id: 3, orderId: 'ORD003', dishName: '牛肉拉面', avatar: 'https://img.yzcdn.cn/vant/avatar-3.jpg', nickname: '阿强', rating: 5, tags: ['份量足', '味道好'], content: '面条劲道，牛肉很大块，汤头很鲜，分量很足', images: ['https://img.yzcdn.cn/vant/apple-2.jpg'], time: '2024-01-13 20:15' }
];

// 导出数据
module.exports = {
  categories,
  shops,
  dishes,
  announcements,
  reviewTags,
  reviews
};