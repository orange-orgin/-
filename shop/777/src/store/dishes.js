import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDishesStore = defineStore('dishes', () => {
  const dishes = ref([])
  const categories = ref([])

  const activeDishes = computed(() => 
    dishes.value.filter(d => d.status === 'active')
  )

  const inactiveDishes = computed(() => 
    dishes.value.filter(d => d.status === 'inactive')
  )

  function setDishes(data) {
    dishes.value = data
  }

  function setCategories(data) {
    categories.value = data
  }

  function addDish(dish) {
    dishes.value.push(dish)
  }

  function updateDish(dishId, data) {
    const index = dishes.value.findIndex(d => d.id === dishId)
    if (index !== -1) {
      dishes.value[index] = { ...dishes.value[index], ...data }
    }
  }

  function toggleDishStatus(dishId) {
    const idx = dishes.value.findIndex(d => d.id === dishId)
    if (idx !== -1) {
      const updated = [...dishes.value]
      updated[idx] = {
        ...updated[idx],
        status: updated[idx].status === 'active' ? 'inactive' : 'active'
      }
      dishes.value = updated
    }
  }

  function updateStock(dishId, delta) {
    const idx = dishes.value.findIndex(d => d.id === dishId)
    if (idx !== -1) {
      const updated = [...dishes.value]
      updated[idx] = { ...updated[idx], stock: Math.max(0, updated[idx].stock + delta) }
      dishes.value = updated
    }
  }

  function setStock(dishId, value) {
    const idx = dishes.value.findIndex(d => d.id === dishId)
    if (idx !== -1) {
      const updated = [...dishes.value]
      updated[idx] = { ...updated[idx], stock: Math.max(0, value) }
      dishes.value = updated
    }
  }

  function deleteDish(dishId) {
    dishes.value = dishes.value.filter(d => d.id !== dishId)
  }

  function addCategory(category) {
    categories.value.push(category)
  }

  function updateCategory(categoryId, data) {
    const index = categories.value.findIndex(c => c.id === categoryId)
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...data }
    }
  }

  function deleteCategory(categoryId) {
    categories.value = categories.value.filter(c => c.id !== categoryId)
    dishes.value.forEach(d => {
      if (d.categoryId === categoryId) {
        d.categoryId = ''
      }
    })
  }

  function sortCategories(startIndex, endIndex) {
    const [removed] = categories.value.splice(startIndex, 1)
    categories.value.splice(endIndex, 0, removed)
    categories.value.forEach((c, i) => {
      c.sortOrder = i + 1
    })
  }

  return {
    dishes,
    categories,
    activeDishes,
    inactiveDishes,
    setDishes,
    setCategories,
    addDish,
    updateDish,
    toggleDishStatus,
    updateStock,
    setStock,
    deleteDish,
    addCategory,
    updateCategory,
    deleteCategory,
    sortCategories
  }
})
