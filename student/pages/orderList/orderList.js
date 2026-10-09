// pages/orderList/orderList.js
const api = require('../../utils/api.js');

Page({
  data: {
    orders: [],
    currentStatus: -1,
    statusList: [
      { status: -1, name: '全部' },
      { status: 0, name: '待接单' },
      { status: 1, name: '制作中' },
      { status: 2, name: '已完成' },
      { status: 3, name: '已取消' }
    ],
    loading: true,
    emptyText: '暂无订单'
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

    // 从「我的」页跳转时带过来的状态筛选（tabBar 页无法用 url 传参）
    if (typeof app.globalData.orderFilterStatus === 'number') {
      this.setData({ currentStatus: app.globalData.orderFilterStatus });
      app.globalData.orderFilterStatus = null;
    }

    this.loadOrders();
  },
  
  async loadOrders() {
    this.setData({ loading: true });
    
    try {
      const res = await api.getOrders(this.data.currentStatus);
      
      // 预处理订单数据，添加显示用的字段
      const orders = res.data.map(order => {
        // 处理商品名称显示
        const names = order.items.map(i => i.name).slice(0, 2).join('、');
        const goodsNamesText = order.items.length > 2 ? names + '...' : names;
        
        // 处理状态文本和颜色
        const statusText = this.getStatusText(order.status);
        const statusColor = this.getStatusColor(order.status);
        
        // 处理评价状态（模拟）
        const hasReviewed = order.hasReviewed || false;
        
        return {
          ...order,
          goodsNamesText,
          statusText,
          statusColor,
          hasReviewed
        };
      });
      
      this.setData({
        orders: orders,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },
  
  // 切换状态
  onStatusChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ currentStatus: status });
    this.loadOrders();
  },
  
  // 跳转到订单详情
  onOrderTap(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?orderId=${orderId}`
    });
  },
  
  // 去评价
  onReviewTap(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/review/review?orderId=${orderId}`
    });
  },
  
  // 获取状态文本
  getStatusText(status) {
    const map = {
      0: '待接单',
      1: '制作中',
      2: '已完成',
      3: '已取消'
    };
    return map[status] || '未知';
  },
  
  // 获取状态颜色
  getStatusColor(status) {
    const map = {
      0: '#faad14',
      1: '#1890ff',
      2: '#52c41a',
      3: '#999'
    };
    return map[status] || '#999';
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});