// pages/orderDetail/orderDetail.js
const api = require('../../utils/api.js');

Page({
  data: {
    orderId: '',
    order: null,
    loading: true,
    from: ''
  },
  
  onLoad(options) {
    this.setData({ 
      orderId: options.orderId,
      from: options.from || ''
    });
    this.loadOrderDetail();
  },
  
  async loadOrderDetail() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const res = await api.getOrderDetail(this.data.orderId);
      
      if (!res.success) {
        wx.hideLoading();
        wx.showToast({ title: '订单不存在', icon: 'none' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/orderList/orderList' });
        }, 1500);
        return;
      }
      
      // WXML 无法调用页面方法，状态文案/颜色在这里先算好
      const order = {
        ...res.data,
        statusText: this.getStatusText(res.data.status),
        statusColor: this.getStatusColor(res.data.status)
      };

      this.setData({
        order: order,
        loading: false
      });
      
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  
  // 获取状态文字
  getStatusText(status) {
    const statusMap = {
      0: '待接单',
      1: '制作中',
      2: '已完成',
      3: '已取消'
    };
    return statusMap[status] || '未知状态';
  },
  
  // 获取状态颜色
  getStatusColor(status) {
    const colorMap = {
      0: '#faad14',
      1: '#1890ff',
      2: '#52c41a',
      3: '#999'
    };
    return colorMap[status] || '#999';
  },
  
  // 取消订单
  onCancelOrder() {
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' });
          
          try {
            const result = await api.cancelOrder(this.data.orderId);
            wx.hideLoading();
            
            if (result.success) {
              wx.showToast({
                title: '订单已取消',
                icon: 'success'
              });
              this.loadOrderDetail();
            } else {
              wx.showToast({
                title: result.message,
                icon: 'none'
              });
            }
          } catch (err) {
            wx.hideLoading();
            wx.showToast({
              title: '取消失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },
  
  // 去评价
  onReview() {
    wx.navigateTo({
      url: `/pages/review/review?orderId=${this.data.orderId}`
    });
  },
  
  // 再来一单
  onRepeatOrder() {
    const app = getApp();
    const order = this.data.order;
    
    // 清空当前购物车
    app.updateCart([]);
    
    // 添加商品到购物车
    const cart = order.items.map(item => ({
      id: item.id || ('tmp_' + Math.random()),
      name: item.name,
      price: item.price,
      image: item.image || '',
      num: item.num,
      shopId: order.shopId,
      shopName: order.shopName,
      stock: item.stock || 999
    }));
    
    app.updateCart(cart);
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    });
    
    // 跳转购物车
    setTimeout(() => {
      wx.navigateTo({ url: '/pages/cart/cart' });
    }, 1200);
  },
  
  // 返回
  onBack() {
    if (this.data.from === 'order') {
      wx.switchTab({ url: '/pages/orderList/orderList' });
    } else {
      wx.navigateBack();
    }
  }
});