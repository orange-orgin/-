// pages/dish/dish.js
const api = require('../../utils/api.js');

// 辅助数组，用于星星显示
const stars = [1, 2, 3, 4, 5];

Page({
  data: {
    dishId: null,
    dish: null,
    shop: null,
    reviews: [],
    loading: true,
    quantity: 1,
    cartQuantity: 0,
    stars: stars
  },
  
  onLoad(options) {
    // 菜品 id 是字符串（如 dish123...），不能 parseInt
    this.setData({ dishId: options.id });
    this.loadData();
  },
  
  async loadData() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const [dishRes, reviewsRes] = await Promise.all([
        api.getDishDetail(this.data.dishId),
        api.getReviews()
      ]);
      
      if (!dishRes.success) {
        wx.showToast({ title: '菜品不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }
      
      // 获取商家信息
      const shopRes = await api.getShopDetail(dishRes.data.shopId);
      
      this.setData({
        dish: dishRes.data,
        shop: shopRes.data,
        reviews: reviewsRes.data,
        loading: false
      });
      
      this.updateCartQuantity();
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  
  // 更新购物车中该菜品的数量
  updateCartQuantity() {
    const app = getApp();
    const cart = app.globalData.cart;
    const item = cart.find(c => c.id === this.data.dishId);
    this.setData({ cartQuantity: item ? item.num : 0 });
  },
  
  // 增加数量
  onIncrease() {
    this.setData({ quantity: this.data.quantity + 1 });
  },
  
  // 减少数量
  onDecrease() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 });
    }
  },
  
  // 添加到购物车
  onAddToCart() {
    const app = getApp();
    const dish = this.data.dish;
    
    // 检查是否有其他商家的商品
    const cart = app.globalData.cart;
    if (cart.length > 0 && cart[0].shopId !== dish.shopId) {
      wx.showModal({
        title: '提示',
        content: '购物车中存在其他商家的商品，是否清空后添加？',
        success: (res) => {
          if (res.confirm) {
            const newCart = [];
            app.updateCart(newCart);
            this.doAddToCart();
          }
        }
      });
    } else {
      this.doAddToCart();
    }
  },
  
  doAddToCart() {
    const app = getApp();
    const dish = this.data.dish;
    const quantity = this.data.quantity;
    const shopName = (this.data.shop && this.data.shop.name) || dish.shopName || '商家';
    
    // 检查库存
    if (quantity > dish.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }
    
    // 获取或创建购物车项
    let cart = app.globalData.cart;
    const existingIndex = cart.findIndex(item => item.id === dish.id);
    
    if (existingIndex > -1) {
      cart[existingIndex].num += quantity;
    } else {
      cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        num: quantity,
        shopId: dish.shopId,
        shopName: shopName,
        stock: dish.stock
      });
    }
    
    app.updateCart(cart);
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1500
    });
    
    this.updateCartQuantity();
    
    // 更新首页角标
    const pages = getCurrentPages();
    if (pages.length > 1 && pages[0].updateCartBadge) {
      pages[0].updateCartBadge();
    }
  },
  
  // 直接购买（加入购物车并跳转）
  onBuyNow() {
    this.onAddToCart();
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/cart/cart'
      });
    }, 1500);
  },
  
  // 返回
  onBack() {
    wx.navigateBack();
  }
});