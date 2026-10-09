// pages/order/order.js
const api = require('../../utils/api.js');

Page({
  data: {
    cart: [],
    shopName: '',
    shopId: null,
    deliveryFee: 0,
    goodsAmount: 0,
    totalAmount: 0,
    remark: '',
    // 优惠券相关（简化版）
    hasCoupon: false,
    couponDiscount: 0,
    canSubmit: true
  },
  
  onLoad() {
    this.loadOrderData();
  },
  
  loadOrderData() {
    const app = getApp();
    const cart = app.globalData.cart || [];
    
    if (cart.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    const shopId = cart[0].shopId;
    const shopName = cart[0].shopName;
    
    // 计算商品金额
    let goodsAmount = 0;
    cart.forEach(item => {
      goodsAmount += item.price * item.num;
    });
    
    // 配送费固定为 0
    const deliveryFee = 0;
    const totalAmount = goodsAmount + deliveryFee;
    
    this.setData({
      cart,
      shopName,
      shopId,
      deliveryFee,
      goodsAmount: goodsAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    });
  },
  
  // 备注输入
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },
  
  // 使用优惠券
  onUseCoupon() {
    // 简化版：随机优惠券
    const discount = Math.floor(Math.random() * 5) + 1;
    this.setData({
      hasCoupon: true,
      couponDiscount: discount,
      totalAmount: (parseFloat(this.data.totalAmount) - discount).toFixed(2)
    });
    
    wx.showToast({
      title: `优惠¥${discount}`,
      icon: 'success'
    });
  },
  
  // 取消优惠券
  onCancelCoupon() {
    // 直接重置优惠券状态，重新计算总价
    const goodsAmount = parseFloat(this.data.goodsAmount);
    const deliveryFee = this.data.deliveryFee;
    const totalAmount = (goodsAmount + deliveryFee).toFixed(2);
    
    this.setData({
      hasCoupon: false,
      couponDiscount: 0,
      totalAmount: totalAmount
    });
  },
  
  // 提交订单
  onSubmit() {
    if (!this.data.canSubmit) return;
    
    this.setData({ canSubmit: false });
    
    // 直接提交订单（重复检查已移除，由服务器端处理）
    this.doSubmitOrder();
  },
  
  // 执行下单
  async doSubmitOrder() {
    wx.showLoading({ title: '提交订单...' });
    
    try {
      const app = getApp();
      const orderData = {
        shopId: this.data.shopId,
        shopName: this.data.shopName,
        items: this.data.cart,
        totalAmount: parseFloat(this.data.totalAmount),
        remark: this.data.remark,
        userId: app.globalData.userId,
        userName: (app.globalData.userInfo && app.globalData.userInfo.nickName) || '学生'
      };
      
      // 创建订单
      const createRes = await api.createOrder(orderData);
      
      if (!createRes.success) {
        throw new Error(createRes.message);
      }
      
      // 模拟微信支付
      const payRes = await api.mockWxPay({
        orderId: createRes.data.orderId,
        totalAmount: this.data.totalAmount
      });
      
      wx.hideLoading();
      
      if (payRes.success) {
        // 清空购物车
        app.updateCart([]);
        
        // 更新首页角标
        const pages = getCurrentPages();
        if (pages.length > 1 && pages[0].updateCartBadge) {
          pages[0].updateCartBadge();
        }
        
        // 跳转到订单详情
        wx.redirectTo({
          url: `/pages/orderDetail/orderDetail?orderId=${createRes.data.orderId}&from=order`
        });
      } else {
        // 支付失败：订单已创建，需要撤销掉，否则会留下一个未支付的待接单订单
        const orderId = createRes.data.orderId;
        api.cancelOrder(orderId).catch(() => {});
        wx.showModal({
          title: '支付失败',
          content: payRes.message + '，是否重试？',
          success: (res) => {
            if (res.confirm) {
              this.setData({ canSubmit: true });
              this.doSubmitOrder();
            } else {
              this.setData({ canSubmit: true });
            }
          }
        });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: err.message || '下单失败',
        icon: 'none'
      });
      this.setData({ canSubmit: true });
    }
  },
  
  // 返回
  onBack() {
    wx.navigateBack();
  }
});