<template>
  <div class="categories-page">
    <div class="page-header">
      <div class="header-title"><h2>菜品分类管理</h2><p>管理菜品分类，支持拖拽排序</p></div>
      <div class="header-actions">
        <el-button type="primary" @click="showAddModal = true"><el-icon><component :is="Plus" /></el-icon>新增分类</el-button>
      </div>
    </div>
    <div class="category-list">
      <div class="category-card" v-for="(category, index) in categories" :key="category.id">
        <div class="category-order"><el-icon class="drag-icon"><component :is="Remove" /></el-icon><span>{{ index + 1 }}</span></div>
        <div class="category-info"><div class="category-name">{{ category.name }}</div><div class="category-count">{{ getDishCount(category.id) }} 个菜品</div></div>
        <div class="category-actions">
          <button class="action-btn edit" @click="editCategory(category)"><el-icon><component :is="Edit" /></el-icon>编辑</button>
          <button class="action-btn delete" :disabled="getDishCount(category.id) > 0" @click="deleteCategory(category)"><el-icon><component :is="Delete" /></el-icon>删除</button>
        </div>
      </div>
    </div>
    <div v-if="categories.length === 0" class="empty-state">
      <el-icon class="empty-icon"><component :is="Document" /></el-icon>
      <p>暂无分类</p>
    </div>
    <el-dialog :title="isEdit ? '编辑分类' : '新增分类'" v-model="showAddModal">
      <el-form :model="categoryForm" ref="categoryFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name" required><el-input v-model="categoryForm.name" placeholder="请输入分类名称" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="closeModal">取消</el-button><el-button type="primary" @click="saveCategory">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDishesStore } from '@/store/dishes'
import { categoriesAPI } from '@/api'
import { ElMessage } from 'element-plus'
import { Plus, Remove, Edit, Delete, Document } from '@element-plus/icons-vue'

const dishesStore = useDishesStore()
const showAddModal = ref(false)
const isEdit = ref(false)
const categoryFormRef = ref(null)
const categoryForm = ref({ id: '', name: '' })

const categories = computed(() => [...dishesStore.categories].sort((a, b) => a.sortOrder - b.sortOrder))

function getDishCount(categoryId) { return dishesStore.dishes.filter(d => d.categoryId === categoryId).length }
function editCategory(category) { isEdit.value = true; categoryForm.value = { ...category }; showAddModal.value = true }
function closeModal() { showAddModal.value = false; isEdit.value = false; categoryForm.value = { id: '', name: '' } }

async function saveCategory() {
  if (!categoryForm.value.name.trim()) { ElMessage.warning('请输入分类名称'); return }
  try {
    if (isEdit.value) { await categoriesAPI.updateCategory(categoryForm.value); dishesStore.updateCategory(categoryForm.value.id, categoryForm.value); ElMessage.success('更新成功') }
    else { const response = await categoriesAPI.addCategory(categoryForm.value); dishesStore.addCategory(response.data); ElMessage.success('添加成功') }
    closeModal()
  } catch (error) { ElMessage.error('操作失败') }
}

async function deleteCategory(category) {
  const count = getDishCount(category.id)
  if (count > 0) { ElMessage.warning('该分类下存在菜品，无法删除'); return }
  if (confirm(`确定要删除分类"${category.name}"吗？`)) { await categoriesAPI.deleteCategory(category.id); dishesStore.deleteCategory(category.id); ElMessage.success('删除成功') }
}
</script>

<style lang="scss" scoped>
.categories-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header-title h2 { margin: 0 0 4px 0; font-size: 20px; font-weight: 600; }
.header-title p { margin: 0; color: #999; font-size: 14px; }
.category-list { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.category-card { display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #f0f0f0; }
.category-card:last-child { border-bottom: none; }
.category-card:hover { background: #fafafa; border-radius: 8px; }
.category-order { display: flex; align-items: center; gap: 8px; width: 60px; }
.drag-icon { color: #ccc; }
.category-order span { font-size: 18px; font-weight: 600; color: #ddd; width: 24px; text-align: center; }
.category-info { flex: 1; }
.category-name { font-size: 16px; font-weight: 500; color: #333; margin-bottom: 4px; }
.category-count { font-size: 13px; color: #999; }
.category-actions { display: flex; gap: 8px; }
.action-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: none; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.action-btn.edit { background: #f0f5ff; color: #667eea; }
.action-btn.edit:hover { background: #e6ebf1; }
.action-btn.delete { background: #fff1f0; color: #ff4d4f; }
.action-btn.delete:hover:not(:disabled) { background: #ffccc7; }
.action-btn.delete:disabled { opacity: 0.5; cursor: not-allowed; }
.empty-state { text-align: center; padding: 60px 0; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.empty-icon { font-size: 48px; color: #d9d9d9; margin-bottom: 16px; }
.empty-state p { color: #999; font-size: 14px; }
</style>