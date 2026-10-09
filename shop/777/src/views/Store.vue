<template>
  <div class="store-page">
    <div class="page-header">
      <h2>店铺设置</h2>
      <p>管理店铺基础信息</p>
    </div>
    
    <div class="form-container">
      <el-form :model="storeForm" ref="storeFormRef" label-width="120px">
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          
          <el-form-item label="店铺名称" prop="name" required>
            <el-input v-model="storeForm.name" placeholder="请输入店铺名称" />
          </el-form-item>
          
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="storeForm.phone" placeholder="请输入联系电话" />
          </el-form-item>
          
          <el-form-item label="店铺地址" prop="address">
            <el-input v-model="storeForm.address" placeholder="请输入店铺地址" />
          </el-form-item>
          
          <el-form-item label="店铺Logo">
            <div class="logo-upload">
              <img 
                v-if="storeForm.logo" 
                :src="storeForm.logo" 
                class="logo-preview"
                @click="uploadLogo"
              />
              <div v-else class="upload-placeholder" @click="uploadLogo">
                <el-icon class="upload-icon"><component :is="icons.Upload" /></el-icon>
                <span>点击上传Logo</span>
              </div>
            </div>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">营业设置</h3>
          
          <el-form-item label="营业时间" prop="businessHours">
            <el-time-picker
              v-model="businessHoursStart"
              format="HH:mm"
              placeholder="开始时间"
            />
            <span class="time-separator">至</span>
            <el-time-picker
              v-model="businessHoursEnd"
              format="HH:mm"
              placeholder="结束时间"
            />
          </el-form-item>
          
          <el-form-item label="营业状态">
            <div class="status-switch">
              <span class="status-label">{{ storeForm.status === 'open' ? '营业中' : '休息中' }}</span>
              <el-switch 
                v-model="storeForm.status" 
                active-value="open" 
                inactive-value="closed"
                active-text="营业"
                inactive-text="休息"
              />
            </div>
          </el-form-item>
          
          <el-form-item label="店铺公告" prop="notice">
            <el-input 
              v-model="storeForm.notice" 
              type="textarea" 
              rows="3" 
              placeholder="请输入店铺公告（将在小程序端展示）"
            />
          </el-form-item>
        </div>
        
        <div class="form-actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="saveStore">保存设置</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { authAPI } from '@/api'
import { ElMessage } from 'element-plus'
import * as icons from '@element-plus/icons-vue'

const authStore = useAuthStore()

const storeForm = ref({
  id: '',
  name: '',
  phone: '',
  address: '',
  logo: '',
  businessHours: '',
  status: 'open',
  notice: ''
})

const businessHoursStart = ref('')
const businessHoursEnd = ref('')

const storeFormRef = ref(null)

onMounted(() => {
  if (authStore.shopInfo) {
    storeForm.value = { ...authStore.shopInfo }
    const hours = storeForm.value.businessHours
    if (hours && hours.includes('-')) {
      const [start, end] = hours.split('-')
      businessHoursStart.value = start
      businessHoursEnd.value = end
    }
  }
})

function uploadLogo() {
  storeForm.value.logo = `https://neeko-copilot.bytedance.net/api/text2image?prompt=restaurant%20logo%20modern%20food%20delicious&image_size=square`
}

function resetForm() {
  if (authStore.shopInfo) {
    storeForm.value = { ...authStore.shopInfo }
    const hours = storeForm.value.businessHours
    if (hours && hours.includes('-')) {
      const [start, end] = hours.split('-')
      businessHoursStart.value = start
      businessHoursEnd.value = end
    }
  }
}

async function saveStore() {
  if (!storeForm.value.name) {
    ElMessage.warning('请填写店铺名称')
    return
  }
  
  if (businessHoursStart.value && businessHoursEnd.value) {
    storeForm.value.businessHours = businessHoursStart.value + '-' + businessHoursEnd.value
  }
  
  try {
    await authAPI.updateShop(storeForm.value)
    authStore.updateShopInfo(storeForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>

<style lang="scss" scoped>
.store-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0 0 4px 0;
    font-size: 20px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #999;
    font-size: 14px;
  }
}

.form-container {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 30px;
  
  &:last-of-type {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.logo-upload {
  .logo-preview {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 12px;
    cursor: pointer;
    border: 2px dashed #d9d9d9;
  }
  
  .upload-placeholder {
    width: 120px;
    height: 120px;
    border: 2px dashed #d9d9d9;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
      border-color: #667eea;
    }
    
    .upload-icon {
      font-size: 28px;
      color: #999;
      margin-bottom: 8px;
    }
    
    span {
      color: #999;
      font-size: 13px;
    }
  }
}

.time-separator {
  margin: 0 12px;
  color: #999;
}

.status-switch {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .status-label {
    font-size: 14px;
    color: #333;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}
</style>
