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

  const todayRevenue = computed(() => {
    const today = new Date().toLocaleDateString('fr-FR')
    return sales.value
      .filter(sale => new Date(sale.date).toLocaleDateString('fr-FR') === today)
      .reduce((sum, sale) => sum + sale.amount, 0)
  })

  const thisWeekRevenue = computed(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    // Adjust to Monday
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    return sales.value
      .filter(sale => new Date(sale.date) >= startOfWeek)
      .reduce((sum, sale) => sum + sale.amount, 0)
  })

  const thisMonthRevenue = computed(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return sales.value
      .filter(sale => new Date(sale.date) >= startOfMonth)
      .reduce((sum, sale) => sum + sale.amount, 0)
  })

  return {
    sales,
    addSale,
    deleteSale,
    totalRevenue,
    todayRevenue,
    thisWeekRevenue,
    thisMonthRevenue
  }
})
