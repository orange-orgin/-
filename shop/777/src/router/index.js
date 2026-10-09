import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') },
      { path: '/orders', name: 'Orders', component: () => import('@/views/Orders.vue') },
      { path: '/dishes', name: 'Dishes', component: () => import('@/views/Dishes.vue') },
      { path: '/categories', name: 'Categories', component: () => import('@/views/Categories.vue') },
      { path: '/statistics', name: 'Statistics', component: () => import('@/views/Statistics.vue') },
      { path: '/reviews', name: 'Reviews', component: () => import('@/views/Reviews.vue') },
      { path: '/store', name: 'Store', component: () => import('@/views/Store.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.path !== '/login' && !authStore.token) {
    next('/login')
  } else if (to.path === '/login' && authStore.token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
