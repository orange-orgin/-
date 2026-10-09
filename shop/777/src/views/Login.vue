<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-header">
        <div class="logo-area">
          <img src="https://neeko-copilot.bytedance.net/api/text2image?prompt=food%20delivery%20logo%20modern%20colorful&image_size=square" alt="Logo" class="logo" />
        </div>
        <h2>校园点餐商家管理后台</h2>
        <p>欢迎登录</p>
      </div>

      <el-form :model="loginForm" ref="loginFormRef" class="login-form">
        <el-form-item prop="username" label="账号">
          <el-input v-model="loginForm.username" placeholder="请输入账号" prefix-icon="User" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item><div class="remember-me"><el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox></div></el-form-item>
        <el-form-item><el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">登录</el-button></el-form-item>

        <div class="account-hint">
          <span>测试账号：</span>
          <button class="account-btn" @click="setAccount('shop1')">shop1</button><span> / </span>
          <button class="account-btn" @click="setAccount('shop2')">shop2</button>
          <span> 密码：123456</span>
        </div>
        <div class="register-link">
          <span>还没有账号？</span>
          <button class="link-btn" @click="showRegister = true">注册新商户</button>
        </div>
      </el-form>
    </div>

    <!-- 注册弹窗 -->
    <el-dialog title="商户注册" v-model="showRegister" width="500px" :close-on-click-modal="false">
      <el-form :model="registerForm" ref="registerFormRef" label-width="100px">
        <el-form-item label="店铺名称" required><el-input v-model="registerForm.shopName" placeholder="如：老王烧烤" /></el-form-item>
        <el-form-item label="联系电话" required><el-input v-model="registerForm.phone" placeholder="如：13812345678" /></el-form-item>
        <el-form-item label="店铺地址" required><el-input v-model="registerForm.address" placeholder="如：校园美食街C区303号" /></el-form-item>
        <el-form-item label="营业时间"><el-input v-model="registerForm.businessHours" placeholder="如：09:00-22:00" /></el-form-item>
        <el-form-item label="店铺介绍"><el-input v-model="registerForm.description" type="textarea" rows="3" placeholder="简单介绍您的店铺" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="showRegister = false">取消</el-button><el-button type="primary" @click="handleRegister" :loading="registering">提交申请</el-button></template>
    </el-dialog>

    <!-- 注册结果 -->
    <el-dialog title="注册结果" v-model="showRegisterResult" width="400px">
      <div style="text-align:center;padding:20px">
        <div v-if="registerSuccess" style="font-size:40px;color:#10b981;margin-bottom:12px">✅</div>
        <div v-else style="font-size:40px;color:#ef4444;margin-bottom:12px">❌</div>
        <p style="font-size:16px;margin-bottom:8px">{{ registerResultMsg }}</p>
        <p v-if="registerSuccess" style="font-size:14px;color:#999">请等待监管方审核，审核通过后即可登录</p>
      </div>
      <template #footer><el-button type="primary" @click="showRegisterResult = false">知道了</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { authAPI } from '@/api'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const loginForm = ref({ username: '', password: '', rememberMe: false })
const loginFormRef = ref(null)
const loading = ref(false)

// Registration
const showRegister = ref(false)
const showRegisterResult = ref(false)
const registering = ref(false)
const registerSuccess = ref(false)
const registerResultMsg = ref('')
const registerForm = ref({ shopName: '', phone: '', address: '', businessHours: '09:00-22:00', description: '' })
const registerFormRef = ref(null)

onMounted(() => {
  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  if (rememberMe) {
    const savedUsername = localStorage.getItem('savedUsername')
    if (savedUsername) { loginForm.value.username = savedUsername; loginForm.value.rememberMe = true }
  }
})

function setAccount(account) { loginForm.value.username = account; loginForm.value.password = '123456' }

async function handleLogin() {
  loading.value = true
  try {
    const response = await authAPI.login({ username: loginForm.value.username, password: loginForm.value.password })
    if (response.code === 0) {
      authStore.setRememberMe(loginForm.value.rememberMe)
      if (loginForm.value.rememberMe) localStorage.setItem('savedUsername', loginForm.value.username)
      else localStorage.removeItem('savedUsername')
      authStore.login(response.data)
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } else { ElMessage.error(response.message) }
  } catch { ElMessage.error('登录失败，请重试') }
  finally { loading.value = false }
}

async function handleRegister() {
  if (!registerForm.value.shopName || !registerForm.value.phone || !registerForm.value.address) {
    ElMessage.warning('请填写店铺名称、电话和地址'); return
  }
  registering.value = true
  try {
    const response = await axios.post('/api/register', registerForm.value)
    if (response.data.code === 0) {
      registerSuccess.value = true; registerResultMsg.value = response.data.data.message
      registerForm.value = { shopName: '', phone: '', address: '', businessHours: '09:00-22:00', description: '' }
    } else { registerSuccess.value = false; registerResultMsg.value = response.data.message }
  } catch { registerSuccess.value = false; registerResultMsg.value = '网络错误，请稍后重试' }
  finally { showRegister.value = false; showRegisterResult.value = true; registering.value = false }
}
</script>

<style lang="scss" scoped>
.login-container { min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; padding: 20px; }
.login-wrapper { background: #fff; border-radius: 20px; padding: 40px; width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
.login-header { text-align: center; margin-bottom: 30px; }
.login-header .logo-area { margin-bottom: 16px; }
.login-header .logo { width: 80px; height: 80px; border-radius: 50%; }
.login-header h2 { margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #303133; }
.login-header p { margin: 0; color: #909399; font-size: 14px; }
.login-form :deep(.el-form-item) { margin-bottom: 20px; }
.login-form :deep(.el-input__wrapper) { border-radius: 10px; }
.login-btn { width: 100%; height: 44px; border-radius: 10px; font-size: 16px; font-weight: 500; }
.account-hint { text-align: center; margin-top: 16px; color: #909399; font-size: 13px; }
.account-btn { background: none; border: none; color: #667eea; cursor: pointer; padding: 2px 6px; border-radius: 4px; &:hover { background: #f0f5ff; } }
.register-link { text-align: center; margin-top: 12px; color: #909399; font-size: 13px; }
.link-btn { background: none; border: none; color: #667eea; cursor: pointer; text-decoration: underline; &:hover { color: #764ba2; } }
</style>