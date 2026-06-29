import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface Sale {
  id: string
  date: string
  clientName: string
  description: string
  amount: number
}

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([])

  // Load from local storage
  const savedSales = localStorage.getItem('decoshop-sales')
  if (savedSales) {
    try {
      sales.value = JSON.parse(savedSales)
    } catch (e) {
      console.error('Failed to parse sales from localStorage', e)
    }
  }

  // Save to local storage on change
  watch(sales, (newSales) => {
    localStorage.setItem('decoshop-sales', JSON.stringify(newSales))
  }, { deep: true })

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID()
    }
    sales.value.unshift(newSale) // Add to top
  }

  const deleteSale = (id: string) => {
    sales.value = sales.value.filter(s => s.id !== id)
  }

  const totalRevenue = computed(() => {
    return sales.value.reduce((sum, sale) => sum + sale.amount, 0)
  })

  return {
    sales,
    addSale,
    deleteSale,
    totalRevenue
  }
})
