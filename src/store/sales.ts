import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Sale {
  id: string
  date: string
  clientName?: string
  description?: string
  amount: number
  paymentMethod: 'CB' | 'ESPECE' | 'FLOA' | 'VIREMENT'
  orderNumber?: string
}

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([])
  const isLoading = ref(false)

  const fetchSales = async () => {
    isLoading.value = true
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false })
      
    if (!error && data) {
      sales.value = data
    } else {
      console.error('Error fetching sales:', error)
    }
    isLoading.value = false
  }

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    // Fournir des valeurs par défaut pour satisfaire les contraintes NOT NULL de Supabase
    const payload = {
      ...sale,
      clientName: sale.clientName || 'Client',
      description: sale.description || 'Vente'
    }

    const { data, error } = await supabase
      .from('sales')
      .insert([payload])
      .select()
      
    if (!error && data) {
      sales.value.unshift(data[0])
    } else {
      console.error('Error adding sale:', error)
    }
  }

  const deleteSale = async (id: string) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)
      
    if (!error) {
      sales.value = sales.value.filter(s => s.id !== id)
    } else {
      console.error('Error deleting sale:', error)
    }
  }

  const deleteAllSales = async () => {
    if (!confirm('Voulez-vous vraiment TOUT effacer ?')) return
    
    isLoading.value = true
    const { error } = await supabase
      .from('sales')
      .delete()
      .not('id', 'is', null)
      
    if (!error) {
      sales.value = []
    } else {
      console.error('Error deleting all sales:', error)
    }
    isLoading.value = false
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

  // === Statistiques par moyen de paiement (Aujourd'hui) ===
  const todayRevenueCB = computed(() => {
    const today = new Date().toLocaleDateString('fr-FR')
    return sales.value
      .filter(sale => new Date(sale.date).toLocaleDateString('fr-FR') === today && sale.paymentMethod === 'CB')
      .reduce((sum, sale) => sum + sale.amount, 0)
  })

  const todayRevenueEspece = computed(() => {
    const today = new Date().toLocaleDateString('fr-FR')
    return sales.value
      .filter(sale => new Date(sale.date).toLocaleDateString('fr-FR') === today && sale.paymentMethod === 'ESPECE')
      .reduce((sum, sale) => sum + sale.amount, 0)
  })

  const todayRevenueFloa = computed(() => {
    const today = new Date().toLocaleDateString('fr-FR')
    return sales.value
      .filter(sale => new Date(sale.date).toLocaleDateString('fr-FR') === today && sale.paymentMethod === 'FLOA')
      .reduce((sum, sale) => sum + sale.amount, 0)
  })

  return {
    sales,
    isLoading,
    fetchSales,
    addSale,
    deleteSale,
    deleteAllSales,
    totalRevenue,
    todayRevenue,
    thisWeekRevenue,
    thisMonthRevenue,
    todayRevenueCB,
    todayRevenueEspece,
    todayRevenueFloa
  }
})
