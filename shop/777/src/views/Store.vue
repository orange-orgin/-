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
              <div class="logo-box" @click="triggerFileSelect">
                <img
                  v-if="storeForm.logo"
                  :src="storeForm.logo"
                  class="logo-preview"
                  @error="onLogoError"
                />
                <div v-else class="upload-placeholder">
                  <el-icon class="upload-icon"><component :is="icons.Upload" /></el-icon>
                  <span>点击上传Logo</span>
                </div>
              </div>
              <div class="logo-actions">
                <el-button size="small" type="primary" plain @click="triggerFileSelect">选择本地图片</el-button>
                <el-button size="small" @click="openLogoUrlDialog">使用图片链接</el-button>
                <el-button size="small" type="danger" plain :disabled="!storeForm.logo" @click="removeLogo">移除</el-button>
                <div class="logo-tip">支持 JPG / PNG / GIF，自动压缩到最长边 300px 后保存</div>
              </div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="onFileSelected"
              />
            </div>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">营业设置</h3>
          
          <el-form-item label="营业时间" prop="businessHours">
            <el-time-picker
              v-model="businessHoursStart"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="开始时间"
              class="time-picker"
            />
            <span class="time-separator">至</span>
            <el-time-picker
              v-model="businessHoursEnd"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="结束时间"
              class="time-picker"
            />
            <span v-if="businessHoursStart && businessHoursEnd" class="time-preview">
              当前：{{ businessHoursStart }} - {{ businessHoursEnd }}
            </span>
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

    <el-dialog v-model="logoUrlDialog" title="使用图片链接" width="480px" append-to-body>
      <el-input v-model="logoUrlInput" placeholder="请输入图片地址，如 https://example.com/logo.png" />
      <template #footer>
        <el-button @click="logoUrlDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmLogoUrl">确定</el-button>
      </template>
    </el-dialog>
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
const fileInputRef = ref(null)
const logoUrlDialog = ref(false)
const logoUrlInput = ref('')

// 把店铺信息回填到表单（含营业时间的拆分）
function fillForm(shop) {
  if (!shop) return
  storeForm.value = { ...shop }
  const matched = String(storeForm.value.businessHours || '').match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
  if (matched) {
    businessHoursStart.value = matched[1]
    businessHoursEnd.value = matched[2]
  } else {
    businessHoursStart.value = ''
    businessHoursEnd.value = ''
  }
}

onMounted(() => {
  fillForm(authStore.shopInfo)
})

// ---------- Logo 上传 ----------
function triggerFileSelect() {
  if (fileInputRef.value) fileInputRef.value.click()
}

function onFileSelected(e) {
  const input = e.target
  const file = input.files && input.files[0]
  input.value = '' // 清空，保证同一个文件能再次触发 change
  if (!file) return
  if (!/^image\//.test(file.type)) {
    ElMessage.warning('请选择图片文件（JPG / PNG / GIF）')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 5MB')
    return
  }
  compressImage(file, 300, (dataUrl) => {
    storeForm.value.logo = dataUrl
    ElMessage.success('Logo 已更新，记得点击「保存设置」')
  })
}

// 用 canvas 压缩到最长边 maxSize 再转 base64，避免把超大字符串写进后端
function compressImage(file, maxSize, callback) {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      callback(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => ElMessage.error('图片解析失败，请换一张')
    img.src = reader.result
  }
  reader.onerror = () => ElMessage.error('文件读取失败')
  reader.readAsDataURL(file)
}

function openLogoUrlDialog() {
  logoUrlInput.value = /^(data:|https?:)/i.test(storeForm.value.logo || '') ? '' : (storeForm.value.logo || '')
  logoUrlDialog.value = true
}

function confirmLogoUrl() {
  const url = (logoUrlInput.value || '').trim()
  if (!url) {
    ElMessage.warning('请输入图片链接')
    return
  }
  storeForm.value.logo = url
  logoUrlDialog.value = false
  ElMessage.success('Logo 已更新，记得点击「保存设置」')
}

function removeLogo() {
  storeForm.value.logo = ''
}

function onLogoError() {
  ElMessage.warning('Logo 图片加载失败，请重新上传')
}

function resetForm() {
  fillForm(authStore.shopInfo)
}

async function saveStore() {
  if (!storeForm.value.name) {
    ElMessage.warning('请填写店铺名称')
    return
  }
  
  const start = (businessHoursStart.value || '').trim()
  const end = (businessHoursEnd.value || '').trim()
  if (start && end) {
    if (start >= end) {
      ElMessage.warning('结束时间必须晚于开始时间')
      return
    }
    storeForm.value.businessHours = start + '-' + end
  } else if (start || end) {
    ElMessage.warning('请同时选择开始时间和结束时间')
    return
  } else {
    storeForm.value.businessHours = ''
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
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;

  .logo-box {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .logo-preview {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 12px;
    cursor: pointer;
    border: 2px dashed #d9d9d9;
    display: block;
    background: #fafafa;

    &:hover {
      border-color: #667eea;
    }
  }

  .logo-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .logo-tip {
    color: #999;
    font-size: 12px;
    line-height: 1.6;
    max-width: 320px;
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

.time-picker {
  width: 140px;
}

.time-preview {
  margin-left: 12px;
  color: #999;
  font-size: 13px;
}

.hidden-file-input {
  display: none;
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
