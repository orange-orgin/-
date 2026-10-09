// pages/shop/shop.js
const api = require('../../utils/api.js');

Page({
  data: {
    shopId: null,
    shop: null,
    dishes: [],
    reviews: [],
    loading: true,
    reviewsLoading: false,
    cart: [],
    cartTotal: 0,
    cartCount: 0,
    showReviews: false,
    // 抛物线动画相关
    showParabola: false,
    parabolaX: 0,
    parabolaY: 0,
    targetX: 0,
    targetY: 0
  },
  
  onLoad(options) {
    this.setData({ shopId: parseInt(options.id) });
    this.loadData();
  },
  
  onShow() {
    // 更新购物车信息
    this.updateCart();
  },
  
  async loadData() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const [shopRes, dishesRes] = await Promise.all([
        api.getShopDetail(this.data.shopId),
        api.getDishesByShop(this.data.shopId)
      ]);
      
      this.setData({
        shop: shopRes.data,
        dishes: dishesRes.data,
        loading: false
      });
      
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },
  
  // 更新购物车信息（WXML 不能调用页面方法，所以把每个菜品的数量写进 dishes）
  updateCart() {
    const app = getApp();
    const cart = app.globalData.cart.filter(item => item.shopId === this.data.shopId);
    const cartCount = cart.reduce((sum, item) => sum + item.num, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.num, 0);
    const dishes = this.data.dishes.map(d => ({
      ...d,
      cartCount: (cart.find(c => c.id === d.id) || {}).num || 0
    }));
    
    this.setData({
      cart,
      dishes,
      cartCount,
      cartTotal: cartTotal.toFixed(2)
    });
  },
  
  // 添加到购物车（带抛物线动画）
  onAddToCart(e) {
    const dishId = e.currentTarget.dataset.id;
    const dish = this.data.dishes.find(d => d.id === dishId);
    
    // 获取点击位置和购物车位置
    const query = wx.createSelectorQuery();
    const that = this;
    
    query.select('.cart-bar').boundingClientRect(function(rect) {
      if (!rect) {
        // 如果找不到购物车元素，直接添加到购物车
        that.doAddToCart(dish);
        return;
      }
      that.setData({
        targetX: rect.left + 50,
        targetY: rect.top + 50
      });
    }).select('#dish-' + dishId).boundingClientRect(function(rect) {
      if (!rect) {
        that.doAddToCart(dish);
        return;
      }
      that.setData({
        parabolaX: rect.left + rect.width / 2,
        parabolaY: rect.top + rect.height / 2,
        showParabola: true
      });
      
      that.doAddToCart(dish);
    }).exec();
  },
  
  // 执行添加购物车操作
  doAddToCart(dish) {
    const app = getApp();
    app.addToCart(dish, this.data.shopId, this.data.shop.name, () => {
      this.updateCart();
      
      // 更新首页角标
      const pages = getCurrentPages();
      if (pages.length > 1 && pages[0].updateCartBadge) {
        pages[0].updateCartBadge();
      }
      
      // 隐藏抛物线动画
      if (this.data.showParabola) {
        setTimeout(() => {
          this.setData({ showParabola: false });
        }, 600);
      }
      
      wx.showToast({
        title: '已加入购物车',
        icon: 'success',
        duration: 1000
      });
    });
  },
  
  // 增加数量
  onIncrease(e) {
    const dishId = e.currentTarget.dataset.id;
    this.updateCartItem(dishId, 1);
  },
  
  // 减少数量
  onDecrease(e) {
    const dishId = e.currentTarget.dataset.id;
    this.updateCartItem(dishId, -1);
  },
  
  // 更新购物车商品数量
  updateCartItem(dishId, delta) {
    const app = getApp();
    let cart = app.globalData.cart;
    
    const index = cart.findIndex(item => item.id === dishId);
    if (index > -1) {
      cart[index].num += delta;
      
      if (cart[index].num <= 0) {
        cart.splice(index, 1);
      }
      
      app.updateCart(cart);
      this.updateCart();
      
      // 更新首页角标
      const pages = getCurrentPages();
      if (pages.length > 1 && pages[0].updateCartBadge) {
        pages[0].updateCartBadge();
      }
    }
  },
  
  // 获取当前菜品在购物车中的数量
  getCartItemCount(dishId) {
    const item = this.data.cart.find(c => c.id === dishId);
    return item ? item.num : 0;
  },
  
  // 跳转到菜品详情
  onDishTap(e) {
    const dishId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dish/dish?id=${dishId}`
    });
  },
  
  // 查看购物车
  onCartTap() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },
  
  // 去结算
  onCheckout() {
    if (this.data.cartCount === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/order/order'
    });
  },
  
  // 切换评价显示
  toggleReviews() {
    const newShowReviews = !this.data.showReviews;
    this.setData({ showReviews: newShowReviews });
    
    if (newShowReviews && this.data.reviews.length === 0) {
      this.loadReviews();
    }
  },
  
  // 加载商家评价
  async loadReviews() {
    this.setData({ reviewsLoading: true });
    
    try {
      const res = await api.getShopReviews(this.data.shopId);
      
      this.setData({
        reviews: res.data,
        reviewsLoading: false
      });
    } catch (err) {
      this.setData({ reviewsLoading: false });
      wx.showToast({ title: '加载评价失败', icon: 'none' });
    }
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
});