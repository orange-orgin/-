// pages/review/review.js
const api = require('../../utils/api.js');

Page({
  data: {
    orderId: '',
    order: null,
    rating: 5,
    selectedTags: [],
    content: '',
    images: [],
    tags: [],
    stars: [1, 2, 3, 4, 5],
    loading: true,
    loadError: false
  },
  
  onLoad(options) {
    this.setData({ orderId: options.orderId });
    this.loadData();
  },
  
  async loadData() {
    try {
      // 获取订单详情
      const orderRes = await api.getOrderDetail(this.data.orderId);
      if (!orderRes.success) {
        this.setData({ loadError: true, loading: false });
        wx.showToast({ title: '订单不存在', icon: 'none' });
        return;
      }
      this.setData({ order: orderRes.data });
      
      // 获取评价标签
      const tagsRes = await api.getReviewTags();
      this.setData({ tags: tagsRes.data });
      
      this.setData({ loading: false });
    } catch (err) {
      this.setData({ loadError: true, loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },
  
  // 返回
  onBack() {
    wx.navigateBack();
  },
  
  // 评分选择
  onRatingChange(e) {
    this.setData({ rating: e.currentTarget.dataset.rating });
  },
  
  // 标签选择
  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag;
    const selectedTags = this.data.selectedTags;
    const index = selectedTags.indexOf(tag);
    
    if (index > -1) {
      selectedTags.splice(index, 1);
    } else {
      if (selectedTags.length < 3) {
        selectedTags.push(tag);
      } else {
        wx.showToast({
          title: '最多选择3个标签',
          icon: 'none'
        });
        return;
      }
    }
    
    this.setData({ selectedTags });
  },
  
  // 文字评价输入
  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },
  
  // 添加图片（简化版，暂不支持）
  onAddImage() {
    wx.showToast({
      title: '图片功能暂未开放',
      icon: 'none'
    });
  },
  
  // 提交评价
  async onSubmit() {
    if (!this.data.content) {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '提交中...' });
    
    try {
      const reviewData = {
        orderId: this.data.orderId,
        rating: this.data.rating,
        tags: this.data.selectedTags,
        content: this.data.content,
        images: this.data.images
      };
      
      const res = await api.submitReview(reviewData);
      
      wx.hideLoading();
      
      if (res.success) {
        // 更新订单的已评价状态
        const app = getApp();
        const orders = app.globalData.orders || [];
        const orderIndex = orders.findIndex(o => o.id === this.data.orderId);
        
        if (orderIndex > -1) {
          orders[orderIndex].hasReviewed = true;
          app.saveOrders(orders);
        }
        
        wx.showToast({
          title: '评价成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
    }
  }
});