<template>
  <div class="dishes-page">
    <div class="page-header">
      <div class="header-left">
        <el-select v-model="categoryFilter" placeholder="选择分类" class="category-select" clearable>
          <el-option label="全部" value="" />
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" class="status-select">
          <el-option label="全部" value="all" />
          <el-option label="上架" value="active" />
          <el-option label="下架" value="inactive" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索菜品名称" class="search-input" :prefix-icon="Search" />
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openAddModal"><el-icon><component :is="Plus" /></el-icon>新增菜品</el-button>
        <el-button v-if="selectedDishes.length > 0" type="success" @click="batchUpdateStatus('active')"><el-icon><component :is="Check" /></el-icon>批量上架</el-button>
        <el-button v-if="selectedDishes.length > 0" type="warning" @click="batchUpdateStatus('inactive')"><el-icon><component :is="Close" /></el-icon>批量下架</el-button>
      </div>
    </div>

    <div class="dish-grid">
      <div class="dish-card" v-for="dish in filteredDishes" :key="dish.id" :class="{ selected: selectedDishes.includes(dish.id) }">
        <div class="dish-checkbox" @click.stop><el-checkbox v-model="selectedDishes" :label="dish.id" /></div>
        <div class="dish-image">
          <img :src="dish.image || fallbackImg" :alt="dish.name" loading="lazy" />
          <div class="status-badge" :class="dish.status || 'active'">{{ (dish.status || 'active') === 'active' ? '在售' : '停售' }}</div>
        </div>
        <div class="dish-info">
          <div class="dish-name">{{ dish.name }}</div>
          <div class="dish-price">
            <span class="current-price">¥{{ dish.price }}</span>
            <span class="original-price" v-if="dish.originalPrice > dish.price">¥{{ dish.originalPrice }}</span>
          </div>
          <div class="dish-meta">
            <span class="category">{{ getCategoryName(dish.categoryId) }}</span>
            <span class="stock">库存: {{ dish.stock }}</span>
            <span class="sales">已售: {{ dish.sales || 0 }}</span>
          </div>
          <div class="dish-desc">{{ dish.description || '暂无描述' }}</div>
        </div>
        <div class="dish-actions">
          <div class="action-btns">
            <button class="action-btn edit" @click="openEditModal(dish)"><el-icon><component :is="Edit" /></el-icon>编辑</button>
            <button class="action-btn toggle" :class="dish.status || 'active'" @click="toggleStatus(dish.id)">
              <el-icon><component :is="(dish.status || 'active') === 'active' ? Close : Check" /></el-icon>{{ (dish.status || 'active') === 'active' ? '下架' : '上架' }}
            </button>
            <button class="action-btn delete" @click="deleteDish(dish)"><el-icon><component :is="Delete" /></el-icon>删除</button>
          </div>
          <div class="stock-control">
            <button class="stock-btn" @click.stop="updateStock(dish.id, -1)">−</button>
            <span class="stock-value">{{ dish.stock }}</span>
            <button class="stock-btn" @click.stop="updateStock(dish.id, 1)">+</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredDishes.length === 0" class="empty-state">
      <el-icon class="empty-icon"><component :is="Document" /></el-icon>
      <p>{{ categories.length === 0 ? '请先创建分类，再添加菜品' : '暂无菜品' }}</p>
      <el-button v-if="categories.length === 0" type="primary" size="small" @click="goToCategories">去创建分类</el-button>
    </div>

    <el-dialog :title="isEdit ? '编辑菜品' : '新增菜品'" v-model="showModal" width="600px" :close-on-click-modal="false">
      <el-form :model="dishForm" ref="dishFormRef" label-width="100px">
        <el-form-item label="菜品名称" prop="name" :rules="[{required:true,message:'请输入菜品名称'}]">
          <el-input v-model="dishForm.name" placeholder="如：红烧肉" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId" :rules="[{required:true,message:'请选择分类'}]">
          <div style="display:flex;gap:8px;width:100%">
            <el-select v-model="dishForm.categoryId" placeholder="请选择分类" style="flex:1">
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-select>
            <el-button v-if="categories.length === 0" type="warning" size="small" @click="goToCategories">创建分类</el-button>
          </div>
        </el-form-item>
        <el-form-item label="价格 (¥)" prop="price" :rules="[{required:true,message:'请输入价格'}]">
          <el-input v-model.number="dishForm.price" type="number" placeholder="00.00" :min="0" :step="0.01" />
        </el-form-item>
        <el-form-item label="原价 (¥)">
          <el-input v-model.number="dishForm.originalPrice" type="number" placeholder="可不填" :min="0" :step="0.01" />
        </el-form-item>
        <el-form-item label="库存" prop="stock" :rules="[{required:true,message:'请输入库存数量'}]">
          <el-input-number v-model="dishForm.stock" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="菜品图片">
          <div class="image-upload">
            <img v-if="dishForm.image" :src="dishForm.image" class="preview-image" />
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><component :is="Upload" /></el-icon>
              <span>点击下方按钮生成</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
            <el-button size="small" @click="generateImage">🎨 根据名称生成图片</el-button>
            <el-input v-model="dishForm.image" placeholder="或粘贴图片 URL" size="small" style="flex:1;min-width:200px" clearable />
          </div>
        </el-form-item>
        <el-form-item label="菜品描述">
          <el-input v-model="dishForm.description" type="textarea" rows="3" placeholder="描述菜品的口味、食材等" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModal">取消</el-button>
        <el-button type="primary" @click="saveDish" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDishesStore } from '@/store/dishes'
import { useAuthStore } from '@/store/auth'
import { dishesAPI } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Check, Close, Edit, Delete, Upload, Document } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const dishesStore = useDishesStore()

const categoryFilter = ref('')
const statusFilter = ref('all')
const keyword = ref('')
const selectedDishes = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const dishFormRef = ref(null)

const emptyForm = () => ({
  id: '', name: '', price: 0, originalPrice: 0, image: '', stock: 10,
  description: '', categoryId: '', shopId: '', status: 'active'
})

const dishForm = ref(emptyForm())
const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='.3em' font-size='40' fill='%23999'%3E%F0%9F%8D%BD%EF%B8%8F%3C/text%3E%3C/svg%3E"

const categories = computed(() => dishesStore.categories)

const filteredDishes = computed(() => {
  let result = [...dishesStore.dishes]
  if (categoryFilter.value) result = result.filter(d => d.categoryId === categoryFilter.value)
  if (statusFilter.value !== 'all') {
    result = result.filter(d => (d.status || 'active') === statusFilter.value)
  }
  if (keyword.value) result = result.filter(d => (d.name || '').toLowerCase().includes(keyword.value.toLowerCase()))
  return result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
})

// ==================== 数据刷新 ====================
async function refreshDishes() {
  try {
    const res = await dishesAPI.getDishes()
    if (res.data) dishesStore.setDishes(res.data)
  } catch (e) { /* silent */ }
}

onMounted(() => { refreshDishes() })

// ==================== 分类工具 ====================
function getCategoryName(categoryId) {
  if (!categoryId) return '未分类'
  const cat = categories.value.find(c => c.id === categoryId)
  return cat ? cat.name : '未分类'
}
function goToCategories() { showModal.value = false; router.push('/categories') }

// ==================== 弹窗 ====================
function openAddModal() { isEdit.value = false; dishForm.value = emptyForm(); showModal.value = true }
function openEditModal(dish) {
  isEdit.value = true
  dishForm.value = { ...dish }
  showModal.value = true
}
function closeModal() { showModal.value = false; isEdit.value = false; dishForm.value = emptyForm() }

function generateImage() {
  const seed = encodeURIComponent((dishForm.value.name || 'food').replace(/\s/g, '-'))
  dishForm.value.image = `https://picsum.photos/seed/${seed}/400/400`
}

// ==================== 保存 ====================
async function saveDish() {
  if (!dishForm.value.name || !dishForm.value.price || !dishForm.value.categoryId) {
    ElMessage.warning('请填写必填项：名称、价格、分类')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await dishesAPI.updateDish(dishForm.value)
    } else {
      dishForm.value.shopId = authStore.shopInfo?.id || 'shop1'
      await dishesAPI.addDish(dishForm.value)
    }
    await refreshDishes()
    ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
    closeModal()
  } catch { ElMessage.error('保存失败') }
  finally { saving.value = false }
}

// ==================== 上下架 ====================
async function toggleStatus(dishId) {
  try {
    const dish = dishesStore.dishes.find(d => d.id === dishId)
    if (!dish) return
    const newStatus = (dish.status || 'active') === 'active' ? 'inactive' : 'active'
    await dishesAPI.updateStatus({ id: dishId, status: newStatus })
    // 重新加载列表，确保 Vue 完全重新渲染
    await refreshDishes()
    ElMessage.success(newStatus === 'active' ? '已上架' : '已下架')
  } catch { ElMessage.error('状态更新失败') }
}

// ==================== 库存 ====================
async function updateStock(dishId, delta) {
  try {
    await dishesAPI.updateStock({ id: dishId, delta })
    await refreshDishes()
  } catch { ElMessage.error('库存更新失败') }
}

// ==================== 删除 ====================
async function deleteDish(dish) {
  try {
    await ElMessageBox.confirm(`确定要删除菜品"${dish.name}"吗？此操作不可恢复。`, '删除确认', {
      confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
    })
    await dishesAPI.deleteDish(dish.id)
    dishesStore.deleteDish(dish.id)
    selectedDishes.value = selectedDishes.value.filter(id => id !== dish.id)
    ElMessage.success('删除成功')
  } catch { /* cancelled */ }
}

// ==================== 批量 ====================
async function batchUpdateStatus(status) {
  if (selectedDishes.value.length === 0) { ElMessage.warning('请勾选菜品'); return }
  // 筛选出状态不一致的 id，避免无效请求
  const needUpdateIds = dishesStore.dishes
    .filter(d => selectedDishes.value.includes(d.id) && (d.status || 'active') !== status)
    .map(d => d.id)
  if (needUpdateIds.length === 0) {
    ElMessage.info('选中菜品已是目标状态，无需修改')
    return
  }
  try {
    await dishesAPI.batchOperate({ ids: needUpdateIds, action: 'status', value: status })
    selectedDishes.value = []
    await refreshDishes()
    ElMessage.success(status === 'active' ? '批量上架成功' : '批量下架成功')
  } catch {
    await refreshDishes()
    ElMessage.error('批量操作失败，已刷新')
  }
}
</script>

<style lang="scss" scoped>
.dishes-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.header-left { display: flex; gap: 16px; }
.category-select { width: 140px; }
.status-select { width: 120px; }
.search-input { width: 250px; }
.header-right { display: flex; gap: 12px; }
.dish-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.dish-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: all 0.2s; position: relative; }
.dish-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.dish-card.selected { border: 2px solid #667eea; }
.dish-checkbox { position: absolute; top: 12px; right: 12px; z-index: 10; }
.dish-image { position: relative; height: 180px; overflow: hidden; background: #f5f5f5; }
.dish-image img { width: 100%; height: 100%; object-fit: cover; }
.status-badge { position: absolute; top: 10px; left: 10px; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.status-badge.active { background: #ecfdf5; color: #10b981; }
.status-badge.inactive { background: #fef3c7; color: #f59e0b; }
.dish-info { padding: 16px 16px 8px; }
.dish-name { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dish-price { margin-bottom: 6px; }
.current-price { font-size: 20px; font-weight: 700; color: #f56c6c; }
.original-price { font-size: 14px; color: #999; text-decoration: line-through; margin-left: 8px; }
.dish-meta { display: flex; gap: 12px; margin-bottom: 6px; font-size: 12px; }
.dish-meta .category { background: #f0f5ff; color: #667eea; padding: 2px 8px; border-radius: 8px; }
.dish-meta .stock { color: #666; }
.dish-meta .sales { color: #999; }
.dish-desc { font-size: 13px; color: #999; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 18px; }
.dish-actions { padding: 8px 16px 16px; }
.stock-control { display: flex; align-items: center; gap: 6px; padding-top: 8px; border-top: 1px dashed #eee; }
.stock-btn { width: 28px; height: 28px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.stock-btn:hover { background: #f0f5ff; border-color: #667eea; color: #667eea; }
.stock-value { min-width: 32px; text-align: center; font-size: 14px; font-weight: 500; }
.action-btns { display: flex; gap: 8px; }
.action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 8px; border: none; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.action-btn.edit { background: #f0f5ff; color: #667eea; }
.action-btn.edit:hover { background: #e6ebf1; }
.action-btn.toggle.active { background: #fef0f0; color: #f56c6c; }
.action-btn.toggle.active:hover { background: #fee2e2; }
.action-btn.toggle.inactive { background: #ecfdf5; color: #10b981; }
.action-btn.toggle.inactive:hover { background: #d1fae5; }
.action-btn.delete { background: #fff1f0; color: #ff4d4f; }
.action-btn.delete:hover { background: #ffccc7; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-icon { font-size: 48px; color: #d9d9d9; margin-bottom: 16px; }
.empty-state p { color: #999; font-size: 14px; margin-bottom: 12px; }
.image-upload { width: 100%; min-height: 120px; display: flex; align-items: center; justify-content: center; }
.preview-image { width: 200px; height: 200px; object-fit: cover; border-radius: 8px; }
.upload-placeholder { width: 100%; height: 180px; border: 2px dashed #d9d9d9; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; }
.upload-placeholder:hover { border-color: #667eea; }
.upload-icon { font-size: 32px; margin-bottom: 8px; }
@media (max-width: 1400px) { .dish-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 1000px) { .dish-grid { grid-template-columns: 1fr; } }
</style>