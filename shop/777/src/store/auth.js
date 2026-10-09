import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const shopInfo = ref(JSON.parse(localStorage.getItem('shopInfo') || 'null'))
  const rememberMe = ref(localStorage.getItem('rememberMe') === 'true')

  const isLoggedIn = computed(() => !!token.value && !!shopInfo.value)

  function login(data) {
    token.value = data.token
    shopInfo.value = data.shopInfo
    if (rememberMe.value) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('shopInfo', JSON.stringify(data.shopInfo))
      localStorage.setItem('rememberMe', 'true')
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('shopInfo')
      localStorage.removeItem('rememberMe')
    }
  }

  function logout() {
    token.value = ''
    shopInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('shopInfo')
    localStorage.removeItem('rememberMe')
  }

  function updateShopInfo(info) {
    shopInfo.value = { ...shopInfo.value, ...info }
    localStorage.setItem('shopInfo', JSON.stringify(shopInfo.value))
  }

  function setRememberMe(val) {
    rememberMe.value = val
    localStorage.setItem('rememberMe', val ? 'true' : 'false')
  }

  return {
    token,
    shopInfo,
    rememberMe,
    isLoggedIn,
    login,
    logout,
    updateShopInfo,
    setRememberMe
  }
})
