<template>
  <div class="reviews-page">
    <div class="page-header">
      <div class="header-left">
        <el-select v-model="ratingFilter" placeholder="评分筛选" class="filter-select">
          <el-option label="全部" value="0" />
          <el-option label="5星" value="5" />
          <el-option label="4星" value="4" />
          <el-option label="3星" value="3" />
          <el-option label="2星" value="2" />
          <el-option label="1星" value="1" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索用户名或评价内容" class="search-input" :prefix-icon="Search" />
      </div>
    </div>

    <div class="reviews-list">
      <div class="review-card" v-for="review in filteredReviews" :key="review.id">
        <div class="review-header">
          <div class="user-info">
            <el-icon class="user-icon"><component :is="User" /></el-icon>
            <span class="user-name">{{ review.userName }}</span>
          </div>
          <div class="rating-stars">
            <el-icon v-for="i in 5" :key="i" :class="{ active: i <= review.rating }">
              <component :is="Star" />
            </el-icon>
          </div>
        </div>
        <div class="review-content"><p>{{ review.content }}</p></div>
        <div class="review-images" v-if="review.images && review.images.length > 0">
          <img v-for="(img, index) in review.images" :key="index" :src="img" class="review-image" @click="previewImage(img)" />
        </div>
        <div class="review-footer">
          <span class="review-time">{{ formatTime(review.createTime) }}</span>
          <button class="reply-btn" @click="showReplyModal(review)">
            <el-icon><component :is="ChatDotSquare" /></el-icon>
            {{ review.reply ? '编辑回复' : '回复' }}
          </button>
        </div>
        <div v-if="review.reply" class="reply-content">
          <span class="reply-label">商家回复：</span>
          <span class="reply-text">{{ review.reply }}</span>
        </div>
      </div>
    </div>

    <div v-if="filteredReviews.length === 0" class="empty-state">
      <el-icon class="empty-icon"><component :is="Document" /></el-icon>
      <p>暂无评价</p>
    </div>

    <el-dialog title="回复评价" v-model="showReply">
      <el-form :model="replyForm"><el-form-item label="回复内容" prop="reply"><el-input v-model="replyForm.reply" type="textarea" rows="4" placeholder="请输入回复内容" /></el-form-item></el-form>
      <template #footer><el-button @click="showReply = false">取消</el-button><el-button type="primary" @click="confirmReply">确认回复</el-button></template>
    </el-dialog>

    <el-dialog title="图片预览" v-model="showImageViewer" width="600px">
      <div style="text-align:center"><img :src="previewImageUrl" style="max-width:100%;max-height:70vh;border-radius:8px" /></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reviewsAPI } from '@/api'
import { formatTime } from '@/utils'
import { ElMessage } from 'element-plus'
import { Search, User, Star, ChatDotSquare, Document } from '@element-plus/icons-vue'

const ratingFilter = ref('0')
const keyword = ref('')
const showReply = ref(false)
const showImageViewer = ref(false)
const previewImageUrl = ref('')
const selectedReview = ref(null)
const replyForm = ref({ reply: '' })
const reviews = ref([])

onMounted(() => { loadReviews() })
async function loadReviews() {
  try { const res = await reviewsAPI.getReviews(); if (res.data) reviews.value = res.data } catch(e) { console.error('Failed to load reviews', e) }
}

const filteredReviews = computed(() => {
  let result = [...reviews.value]
  if (ratingFilter.value !== '0') result = result.filter(r => r.rating === parseInt(ratingFilter.value))
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(r => r.userName.toLowerCase().includes(kw) || r.content.toLowerCase().includes(kw))
  }
  return result.sort((a, b) => b.createTime - a.createTime)
})

function showReplyModal(review) { selectedReview.value = review; replyForm.value.reply = ''; showReply.value = true }

async function confirmReply() {
  if (!replyForm.value.reply.trim()) { ElMessage.warning('请输入回复内容'); return }
  await reviewsAPI.replyReview({ id: selectedReview.value.id, reply: replyForm.value.reply })
  const review = reviews.value.find(r => r.id === selectedReview.value.id)
  if (review) { review.reply = replyForm.value.reply; review.replyTime = Date.now() }
  showReply.value = false
  ElMessage.success('回复成功')
}

function previewImage(url) { previewImageUrl.value = url; showImageViewer.value = true }
</script>

<style lang="scss" scoped>
.reviews-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.header-left { display: flex; gap: 16px; }
.filter-select { width: 120px; }
.search-input { width: 280px; }
.reviews-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.review-card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.user-info { display: flex; align-items: center; gap: 8px; }
.user-info .user-icon { color: #667eea; font-size: 20px; }
.user-info .user-name { font-size: 14px; font-weight: 500; color: #333; }
.rating-stars .el-icon { font-size: 16px; color: #e0e0e0; }
.rating-stars .el-icon.active { color: #ffd700; }
.review-content { margin-bottom: 16px; }
.review-content p { margin: 0; font-size: 14px; color: #333; line-height: 1.6; }
.review-images { display: flex; gap: 12px; margin-bottom: 16px; }
.review-image { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer; }
.review-image:hover { opacity: 0.8; }
.review-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.review-time { font-size: 12px; color: #999; }
.reply-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: none; border-radius: 8px; font-size: 12px; cursor: pointer; background: #f0f5ff; color: #667eea; }
.reply-btn:hover { background: #e6ebf1; }
.reply-content { margin-top: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 13px; }
.reply-content .reply-label { color: #667eea; font-weight: 500; }
.reply-content .reply-text { color: #666; }
.empty-state { text-align: center; padding: 60px 0; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.empty-state .empty-icon { font-size: 48px; color: #d9d9d9; margin-bottom: 16px; }
.empty-state p { color: #999; font-size: 14px; }
@media (max-width: 1280px) { .reviews-list { grid-template-columns: 1fr; } }
</style>