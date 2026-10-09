// pages/login/login.js
Page({
  data: {
    canUse: false
  },
  
  onLoad() {
    // 检查是否已经授权
    this.checkAuth();
  },
  
  onShow() {
    // 检查是否已经登录
    const app = getApp();
    if (app.globalData.isLogin) {
      this.goHome();
    }
  },
  
  // 检查是否可以使用微信授权
  checkAuth() {
    if (wx.getUserProfile) {
      this.setData({ canUse: true });
    }
  },
  
  // 微信一键登录
  async getUserProfile(e) {
    wx.showLoading({ title: '授权中...' });
    
    try {
      // 模拟获取用户信息
      const userInfo = {
        nickName: '校园用户',
        avatarUrl: 'https://img.yzcdn.cn/vant/avatar.jpg',
        gender: 1,
        country: 'China',
        province: '广东',
        city: '广州'
      };
      
      // 保存用户信息
      const app = getApp();
      app.setUser(userInfo);
      
      wx.hideLoading();
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });
      
      // 跳转到首页
      setTimeout(() => {
        this.goHome();
      }, 1500);
      
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      });
    }
  },
  
  // 游客模式（不推荐）
  guestLogin() {
    const app = getApp();
    app.setUser({
      nickName: '游客',
      avatarUrl: 'https://img.yzcdn.cn/vant/default-avatar.jpg'
    });
    
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    });
    
    setTimeout(() => {
      this.goHome();
    }, 1500);
  },
  
  // 跳转到首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});