// app.js
// 数据全部来自共享 Express 服务器 (http://localhost:3000)

App({
  globalData: {
    userInfo: null,
    userId: '',
    isLogin: false,
    cart: [],
    orders: [],
    serverBase: 'http://localhost:3000/api/student'
  },
  
  onLaunch() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLogin = true
    }

    // 恢复本地购物车，避免重新进入小程序后购物车被清空
    const cart = wx.getStorageSync('cart')
    if (Array.isArray(cart)) this.globalData.cart = cart

    // 稳定 userId：同一设备始终使用同一个 userId，订单列表才能按人过滤
    let userId = wx.getStorageSync('userId')
    if (!userId) {
      userId = 'stu_' + Date.now() + Math.floor(Math.random() * 1000)
      wx.setStorageSync('userId', userId)
    }
    this.globalData.userId = userId
  },

  // 设置当前用户（登录时调用）
  setUser(userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.isLogin = true
    wx.setStorageSync('userInfo', userInfo)
    let userId = wx.getStorageSync('userId')
    if (!userId) {
      userId = 'stu_' + Date.now() + Math.floor(Math.random() * 1000)
      wx.setStorageSync('userId', userId)
    }
    this.globalData.userId = userId
  },
  
  // 更新购物车
  updateCart(cart) {
    this.globalData.cart = cart
    wx.setStorageSync('cart', cart)
  },
  
  // 添加到购物车（带抛物线动画标记）
  addToCart(dish, shopId, shopName, callback) {
    let cart = this.globalData.cart;
    
    // 检查购物车是否有其他商家商品
    if (cart.length > 0 && cart[0].shopId !== shopId) {
      wx.showModal({
        title: '提示',
        content: '购物车中存在其他商家的商品，是否清空后添加？',
        success: (res) => {
          if (res.confirm) {
            cart = [];
            this.doAddToCart(dish, shopId, shopName, cart, callback);
          }
        }
      });
    } else {
      this.doAddToCart(dish, shopId, shopName, cart, callback);
    }
  },
  
  doAddToCart(dish, shopId, shopName, cart, callback) {
    const existingIndex = cart.findIndex(item => item.id === dish.id);
    
    if (existingIndex > -1) {
      cart[existingIndex].num += 1;
    } else {
      cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        num: 1,
        shopId: shopId,
        shopName: shopName,
        stock: dish.stock
      });
    }
    
    this.updateCart(cart);
    callback && callback();
  },
  
  // 更新本地订单
  saveOrders(orders) {
    this.globalData.orders = orders;
    wx.setStorageSync('orders', orders);
  },
  
  // 获取订单编号
  generateOrderId() {
    return 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  },
  
  // 获取取餐码
  generatePickupCode() {
    return Math.floor(1000 + Math.random() * 9000);
  }
});