// pages/mine/mine.js
Page({
  data: {
    userInfo: null,
    menuItems: [
      { icon: '📍', text: '收货地址', path: '' },
      { icon: '💳', text: '支付方式', path: '' },
      { icon: '🔔', text: '消息通知', path: '' },
      { icon: '❓', text: '帮助中心', path: '' },
      { icon: '📝', text: '意见反馈', path: '' },
      { icon: '⚙️', text: '设置', path: '' }
    ],
    orderCounts: {
      all: 0,
      pending: 0,
      making: 0,
      completed: 0
    }
  },
  
  onShow() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    this.setData({ userInfo: app.globalData.userInfo });
    this.updateOrderCounts();
  },
  
  // 从服务端拉取订单统计（订单数据已统一存服务器，本地 globalData.orders 不再可信）
  async updateOrderCounts() {
    try {
      const res = await api.getOrders(-1);
      const orders = res.data || [];
      this.setData({
        orderCounts: {
          all: orders.length,
          pending: orders.filter(o => o.status === 0).length,
          making: orders.filter(o => o.status === 1).length,
          completed: orders.filter(o => o.status === 2).length
        }
      });
    } catch (err) {
      // 拉取失败时保持为 0，不影响页面展示
    }
  },
  
  // 跳转到登录页
  onLoginTap() {
    if (!this.data.userInfo) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },
  
  // 跳转到订单列表（orderList 是 tabBar 页面，只能用 switchTab）
  onOrderTap(e) {
    const status = e.currentTarget.dataset.status;
    const app = getApp();
    app.globalData.orderFilterStatus = Number(status);
    wx.switchTab({
      url: '/pages/orderList/orderList'
    });
  },
  
  // 菜单项点击
  onMenuTap(e) {
    const index = e.currentTarget.dataset.index;
    wx.showToast({
      title: this.data.menuItems[index].text,
      icon: 'none'
    });
  },
  
  // 退出登录
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.userInfo = null;
          app.globalData.isLogin = false;
          app.globalData.cart = [];
          wx.clearStorageSync();
          
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
});