// pages/cart/cart.js
const api = require('../../utils/api.js');

Page({
  data: {
    cart: [],
    shopName: '',
    shopId: null,
    deliveryFee: 0,
    totalPrice: 0,
    totalCount: 0,
    selectable: true
  },
  
  onLoad() {
    this.loadCart();
  },
  
  onShow() {
    this.loadCart();
  },
  
  loadCart() {
    const app = getApp();
    const cart = app.globalData.cart || [];
    
    if (cart.length === 0) {
      this.setData({
        cart: [],
        shopName: '',
        shopId: null,
        totalPrice: 0,
        totalCount: 0
      });
      return;
    }
    
    // 获取商家信息
    const shopId = cart[0].shopId;
    const shopName = cart[0].shopName;
    
    // 计算总价和数量
    let totalPrice = 0;
    let totalCount = 0;
    cart.forEach(item => {
      totalPrice += item.price * item.num;
      totalCount += item.num;
    });
    
    this.setData({
      cart,
      shopName,
      shopId,
      totalPrice: totalPrice.toFixed(2),
      totalCount
    });
  },
  
  // 增加数量
  onIncrease(e) {
    const id = e.currentTarget.dataset.id;
    this.updateQuantity(id, 1);
  },
  
  // 减少数量
  onDecrease(e) {
    const id = e.currentTarget.dataset.id;
    this.updateQuantity(id, -1);
  },
  
  // 更新数量
  updateQuantity(id, delta) {
    const app = getApp();
    let cart = app.globalData.cart;
    
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
      cart[index].num += delta;
      
      // 数量为0时移除
      if (cart[index].num <= 0) {
        cart.splice(index, 1);
      }
      
      app.updateCart(cart);
      this.loadCart();
      
      // 更新首页角标
      const pages = getCurrentPages();
      if (pages.length > 1 && pages[0].updateCartBadge) {
        pages[0].updateCartBadge();
      }
      
      // 如果购物车空了，返回上一页
      if (cart.length === 0) {
        wx.navigateBack();
      }
    }
  },
  
  // 清空购物车
  onClearCart() {
    wx.showModal({
      title: '提示',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.updateCart([]);
          
          // 更新首页角标
          const pages = getCurrentPages();
          if (pages.length > 1 && pages[0].updateCartBadge) {
            pages[0].updateCartBadge();
          }
          
          wx.navigateBack();
        }
      }
    });
  },
  
  // 去结算
  onCheckout() {
    if (this.data.cart.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      });
      return;
    }
    
    // 检查库存
    this.checkStockBeforeOrder();
  },
  
  // 下单前检查库存
  async checkStockBeforeOrder() {
    wx.showLoading({ title: '检查中...' });
    
    try {
      const res = await api.checkStock(this.data.cart);
      wx.hideLoading();
      
      const unavailableItems = res.data.items.filter(item => !item.available);
      
      if (unavailableItems.length > 0) {
        const names = unavailableItems.map(item => item.name).join('、');
        wx.showModal({
          title: '库存不足',
          content: `以下商品库存不足：${names}，请返回修改购物车`,
          showCancel: false
        });
        return;
      }
      
      // 库存检查通过，跳转结算
      wx.navigateTo({
        url: '/pages/order/order'
      });
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: '检查失败',
        icon: 'none'
      });
    }
  },
  
  // 返回
  onBack() {
    wx.navigateBack();
  }
});