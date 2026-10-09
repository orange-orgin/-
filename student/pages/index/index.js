// pages/index/index.js
const api = require('../../utils/api.js');

Page({
  data: {
    categories: [],
    currentCategoryId: 0,
    shops: [],
    announcements: [],
    searchKeyword: '',
    searchResults: [],
    showSearch: false,
    loading: true,
    cartBadge: 0
  },
  
  onLoad() {
    this.loadData();
  },
  
  onShow() {
    // 更新购物车角标
    this.updateCartBadge();
    
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },
  
  onReady() {
    // 初始化搜索组件
  },
  
  // 加载数据
  async loadData() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const [categoriesRes, shopsRes, announcementsRes] = await Promise.all([
        api.getCategories(),
        api.getShops(0),
        api.getAnnouncements()
      ]);
      
      this.setData({
        categories: categoriesRes.data,
        shops: shopsRes.data,
        announcements: announcementsRes.data,
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
  
  // 更新购物车角标
  updateCartBadge() {
    const app = getApp();
    const cart = app.globalData.cart || [];
    const total = cart.reduce((sum, item) => sum + item.num, 0);
    this.setData({ cartBadge: total });
    
    // 设置tabBar角标
    if (total > 0) {
      wx.setTabBarBadge({
        index: 0,
        text: total > 99 ? '99+' : String(total)
      });
    } else {
      wx.removeTabBarBadge({ index: 0 });
    }
  },
  
  // 分类切换
  async onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({ currentCategoryId: categoryId });
    
    wx.showLoading({ title: '加载中...' });
    const res = await api.getShops(categoryId);
    this.setData({ shops: res.data });
    wx.hideLoading();
  },
  
  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    
    if (keyword) {
      this.searchDishes(keyword);
    } else {
      this.setData({ showSearch: false, searchResults: [] });
    }
  },
  
  // 搜索确认
  onSearchConfirm(e) {
    const keyword = e.detail.value;
    if (keyword) {
      this.searchDishes(keyword);
    }
  },
  
  // 搜索菜品
  async searchDishes(keyword) {
    const res = await api.searchDishes(keyword);
    this.setData({ 
      showSearch: true,
      searchResults: res.data 
    });
  },
  
  // 清除搜索
  onClearSearch() {
    this.setData({
      searchKeyword: '',
      showSearch: false,
      searchResults: []
    });
  },
  
  // 跳转到商家页面
  onShopTap(e) {
    const shopId = e.currentTarget.dataset.id;
    const shop = this.data.shops.find(s => s.id === shopId);
    
    if (!shop) {
      wx.showToast({
        title: '商家不存在',
        icon: 'none'
      });
      return;
    }
    
    if (!shop.isOpen) {
      wx.showToast({
        title: '商家休息中',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/shop/shop?id=${shopId}`
    });
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
    const app = getApp();
    if (app.globalData.cart.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});