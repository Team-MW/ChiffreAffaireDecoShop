<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSalesStore } from '@/store/sales'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table as UiTable, TableBody as UiTableBody, TableCell as UiTableCell, TableHead as UiTableHead, TableHeader as UiTableHeader, TableRow as UiTableRow } from '@/components/ui/table'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Wallet, CreditCard, Banknote, Smartphone, Calendar, Search, Trash2, ArrowRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const store = useSalesStore()
const router = useRouter()

const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date())
})

const chartData = computed(() => {
  const caByDate: Record<string, number> = {}
  const encaissementByDate: Record<string, number> = {}
  
  // Create last 7 days empty so chart always looks good
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('fr-FR')
    caByDate[dateStr] = 0
    encaissementByDate[dateStr] = 0
  }

  const sortedSales = [...store.sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  sortedSales.forEach(sale => {
    const dateStr = new Date(sale.date).toLocaleDateString('fr-FR')
    if (caByDate[dateStr] !== undefined) {
      if (sale.paymentMethod === 'CA') {
        caByDate[dateStr] += sale.amount
      } else {
        encaissementByDate[dateStr] += sale.amount
      }
    } else {
      if (sale.paymentMethod === 'CA') {
        caByDate[dateStr] = sale.amount
        encaissementByDate[dateStr] = 0
      } else {
        encaissementByDate[dateStr] = sale.amount
        caByDate[dateStr] = 0
      }
    }
  })

  // We take only the last 7 entries for a cleaner mobile chart
  const labels = Object.keys(caByDate).slice(-7)
  const caData = Object.values(caByDate).slice(-7)
  const encData = Object.values(encaissementByDate).slice(-7)

  return {
    labels,
    datasets: [
      {
        label: 'CA (€)',
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        data: caData,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#ef4444',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Encaissements (€)',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        data: encData,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }
})

const searchQuery = ref('')

const filteredSales = computed(() => {
  if (!searchQuery.value) return store.sales.slice(0, 5)
  const q = searchQuery.value.toLowerCase()
  return store.sales.filter(s => 
    (s.orderNumber && s.orderNumber.toLowerCase().includes(q)) ||
    (s.clientName && s.clientName.toLowerCase().includes(q)) ||
    (s.paymentMethod && s.paymentMethod.toLowerCase().includes(q)) ||
    s.amount.toString().includes(q)
  )
})

const searchTotalAmount = computed(() => {
  if (!searchQuery.value) return 0
  return filteredSales.value.reduce((sum, sale) => sum + sale.amount, 0)
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top' as const },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 13, family: "'Geist', sans-serif" },
      bodyFont: { size: 14, weight: 'bold', family: "'Geist', sans-serif" },
      displayColors: true,
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: "'Geist', sans-serif" } }
    },
    y: {
      border: { dash: [4, 4] },
      grid: { color: '#f1f5f9' },
      beginAtZero: true,
      ticks: { font: { family: "'Geist', sans-serif" } }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(dateString))
}

const handleDelete = async (id: string) => {
  if (confirm('Voulez-vous vraiment supprimer cette vente ?')) {
    await store.deleteSale(id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-3 md:gap-6 grid-cols-2">
      <!-- CA Column -->
      <div class="space-y-3 md:space-y-4">
        <h2 class="text-sm md:text-xl font-bold text-slate-800 flex items-center gap-1 md:gap-2">
          <Wallet class="w-4 h-4 md:w-5 md:h-5 text-red-500" />
          <span class="truncate">Chiffre d'Affaires</span>
        </h2>
        
        <Card class="bg-gradient-to-br from-red-600 to-red-500 text-white border-0 shadow-lg relative overflow-hidden">
          <div class="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Wallet class="w-32 h-32 -mt-4 -mr-4" />
          </div>
          <CardHeader class="pb-1 md:pb-2 p-3 md:p-6 z-10 relative">
            <CardTitle class="text-[10px] md:text-sm font-medium text-red-100 truncate">CA Aujourd'hui (J)</CardTitle>
          </CardHeader>
          <CardContent class="p-3 pt-0 md:p-6 md:pt-0 z-10 relative">
            <div class="text-base sm:text-lg md:text-3xl font-bold tracking-tight truncate">{{ formatCurrency(store.todayCA) }}</div>
          </CardContent>
        </Card>

        <Card class="bg-gradient-to-br from-red-500 to-red-400 text-white border-0 shadow-lg relative overflow-hidden">
          <CardHeader class="pb-1 md:pb-2 p-3 md:p-6 z-10 relative">
            <CardTitle class="text-[10px] md:text-sm font-medium text-red-100 truncate">CA Cette Semaine (S)</CardTitle>
          </CardHeader>
          <CardContent class="p-3 pt-0 md:p-6 md:pt-0 z-10 relative">
            <div class="text-base sm:text-lg md:text-3xl font-bold tracking-tight truncate">{{ formatCurrency(store.thisWeekCA) }}</div>
          </CardContent>
        </Card>

        <Card class="bg-gradient-to-br from-red-500 to-red-400 text-white border-0 shadow-lg relative overflow-hidden">
          <div class="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Calendar class="w-32 h-32 -mt-4 -mr-4" />
          </div>
          <CardHeader class="pb-1 md:pb-2 p-3 md:p-6 z-10 relative">
            <CardTitle class="text-[10px] md:text-sm font-medium text-red-100 capitalize truncate">CA Mois ({{ currentMonthName }})</CardTitle>
          </CardHeader>
          <CardContent class="p-3 pt-0 md:p-6 md:pt-0 z-10 relative">
            <div class="text-base sm:text-lg md:text-3xl font-bold tracking-tight truncate">{{ formatCurrency(store.thisMonthCA) }}</div>
          </CardContent>
        </Card>
      </div>

      <!-- Encaissements Column -->
      <div class="space-y-3 md:space-y-4">
        <h2 class="text-sm md:text-xl font-bold text-slate-800 flex items-center gap-1 md:gap-2">
          <Banknote class="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          <span class="truncate">Encaissements</span>
        </h2>
        
        <Card class="bg-gradient-to-br from-blue-600 to-blue-500 text-white border-0 shadow-lg relative overflow-hidden">
          <div class="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Wallet class="w-32 h-32 -mt-4 -mr-4" />
          </div>
          <CardHeader class="pb-1 md:pb-2 p-3 md:p-6 z-10 relative">
            <CardTitle class="text-[10px] md:text-sm font-medium text-blue-100 truncate">Total Aujourd'hui (J)</CardTitle>
          </CardHeader>
          <CardContent class="p-3 pt-0 md:p-6 md:pt-0 z-10 relative">
            <div class="text-base sm:text-lg md:text-3xl font-bold tracking-tight truncate">{{ formatCurrency(store.todayEncaissementTotal) }}</div>
          </CardContent>
        </Card>

        <Card class="bg-gradient-to-br from-blue-500 to-blue-400 text-white border-0 shadow-lg relative overflow-hidden">
          <CardHeader class="pb-1 md:pb-2 p-3 md:p-6 z-10 relative">
            <CardTitle class="text-[10px] md:text-sm font-medium text-blue-100 truncate">Total Semaine (S)</CardTitle>
          </CardHeader>
          <CardContent class="p-3 pt-0 md:p-6 md:pt-0 z-10 relative">
            <div class="text-base sm:text-lg md:text-3xl font-bold tracking-tight truncate">{{ formatCurrency(store.thisWeekEncaissementTotal) }}</div>
          </CardContent>
        </Card>

        <Card class="bg-gradient-to-br from-blue-500 to-blue-400 text-white border-0 shadow-lg relative overflow-hidden">
          <div class="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Calendar class="w-32 h-32 -mt-4 -mr-4" />
          </div>
          <CardHeader class="pb-1 md:pb-2 p-3 md:p-6 z-10 relative">
            <CardTitle class="text-[10px] md:text-sm font-medium text-blue-100 capitalize truncate">Total Mois ({{ currentMonthName }})</CardTitle>
          </CardHeader>
          <CardContent class="p-3 pt-0 md:p-6 md:pt-0 z-10 relative">
            <div class="text-base sm:text-lg md:text-3xl font-bold tracking-tight truncate">{{ formatCurrency(store.thisMonthEncaissementTotal) }}</div>
          </CardContent>
        </Card>

      </div>
    </div>

    <!-- Détails du jour (Full width) -->
    <div class="space-y-4">
      <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider pt-2">Détails du jour</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card class="shadow-sm border-slate-200/60 border-l-4 border-l-blue-500">
          <CardHeader class="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <CardTitle class="text-[11px] md:text-xs font-medium text-slate-500 truncate mr-2">Carte Bancaire</CardTitle>
            <CreditCard class="w-4 h-4 text-blue-500 shrink-0" />
          </CardHeader>
          <CardContent class="p-4 pt-0 md:p-6 md:pt-0">
            <div class="text-lg md:text-xl font-bold text-slate-900 truncate">{{ formatCurrency(store.todayRevenueCB) }}</div>
          </CardContent>
        </Card>
        
        <Card class="shadow-sm border-slate-200/60 border-l-4 border-l-emerald-500">
          <CardHeader class="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <CardTitle class="text-[11px] md:text-xs font-medium text-slate-500 truncate mr-2">Espèces</CardTitle>
            <Banknote class="w-4 h-4 text-emerald-500 shrink-0" />
          </CardHeader>
          <CardContent class="p-4 pt-0 md:p-6 md:pt-0">
            <div class="text-lg md:text-xl font-bold text-slate-900 truncate">{{ formatCurrency(store.todayRevenueEspece) }}</div>
          </CardContent>
        </Card>

        <Card class="shadow-sm border-slate-200/60 border-l-4 border-l-amber-500">
          <CardHeader class="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <CardTitle class="text-[11px] md:text-xs font-medium text-slate-500 truncate mr-2">Virement</CardTitle>
            <Wallet class="w-4 h-4 text-amber-500 shrink-0" />
          </CardHeader>
          <CardContent class="p-4 pt-0 md:p-6 md:pt-0">
            <div class="text-lg md:text-xl font-bold text-slate-900 truncate">{{ formatCurrency(store.todayRevenueVirement) }}</div>
          </CardContent>
        </Card>

        <Card class="shadow-sm border-slate-200/60 border-l-4 border-l-purple-500">
          <CardHeader class="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <CardTitle class="text-[11px] md:text-xs font-medium text-slate-500 truncate mr-2">Floa</CardTitle>
            <Smartphone class="w-4 h-4 text-purple-500 shrink-0" />
          </CardHeader>
          <CardContent class="p-4 pt-0 md:p-6 md:pt-0">
            <div class="text-lg md:text-xl font-bold text-slate-900 truncate">{{ formatCurrency(store.todayRevenueFloa) }}</div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid gap-6 grid-cols-1 lg:grid-cols-7">
      <!-- Chart -->
      <Card class="col-span-1 lg:col-span-4 shadow-sm border-slate-200/60">
        <CardHeader class="pb-2">
          <CardTitle class="text-lg">Évolution des Ventes</CardTitle>
          <CardDescription>Aperçu des 7 derniers jours.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-[250px] md:h-[300px] w-full mt-4">
            <Line :data="chartData" :options="chartOptions as any" />
          </div>
        </CardContent>
      </Card>

      <!-- Recent Sales List -->
      <Card class="col-span-1 lg:col-span-3 shadow-sm border-slate-200/60 flex flex-col">
        <CardHeader class="pb-4 border-b border-slate-100">
          <CardTitle class="text-lg">Ventes & Historique</CardTitle>
          <div class="mt-3 relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              v-model="searchQuery" 
              placeholder="Rechercher un bon ou client..." 
              class="pl-9 h-10 shadow-sm"
            />
          </div>
          <div v-if="searchQuery && filteredSales.length > 0" class="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between animate-in fade-in zoom-in-95">
            <span class="text-sm font-medium text-emerald-800">Total pour cette recherche :</span>
            <span class="font-bold text-emerald-600">{{ formatCurrency(searchTotalAmount) }}</span>
          </div>
        </CardHeader>
        <CardContent class="p-0 flex-1 flex flex-col">
          <div v-if="filteredSales.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Search class="w-5 h-5 text-slate-400" />
            </div>
            <p class="text-slate-500 text-sm">Aucune vente trouvée.</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <UiTable>
              <UiTableHeader class="bg-slate-50/50">
                <UiTableRow>
                  <UiTableHead class="w-[100px] pl-4">Type / Date</UiTableHead>
                  <UiTableHead class="hidden md:table-cell">Détails</UiTableHead>
                  <UiTableHead class="text-right">Montant</UiTableHead>
                  <UiTableHead class="w-[50px] pr-4"></UiTableHead>
                </UiTableRow>
              </UiTableHeader>
              <UiTableBody>
                <UiTableRow v-for="sale in filteredSales" :key="sale.id" class="group">
                  <UiTableCell class="pl-4">
                    <div class="font-medium text-slate-900 line-clamp-1">
                      <span v-if="sale.paymentMethod === 'CA'" class="text-red-600">CA</span>
                      <span v-else>Encaissement ({{ sale.paymentMethod || 'CB' }})</span>
                    </div>
                    <div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{{ formatDate(sale.date) }}</span>
                      <span v-if="sale.clientName && sale.clientName !== 'Client'" class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium">{{ sale.clientName }}</span>
                    </div>
                  </UiTableCell>
                  <UiTableCell class="hidden md:table-cell">
                    <div class="text-sm text-slate-600 line-clamp-1">{{ sale.description && sale.description !== 'Vente' ? sale.description : '-' }}</div>
                  </UiTableCell>
                  <UiTableCell class="text-right font-semibold text-slate-900">
                    {{ formatCurrency(sale.amount) }}
                  </UiTableCell>
                  <UiTableCell class="pr-4 text-right">
                    <button 
                      @click="handleDelete(sale.id)" 
                      class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md shadow-sm transition-all active:scale-95"
                      title="Supprimer la vente"
                    >
                      <Trash2 class="w-4 h-4" />
                      <span class="hidden sm:inline">Supprimer</span>
                    </button>
                  </UiTableCell>
                </UiTableRow>
              </UiTableBody>
            </UiTable>
            <div class="p-4 border-t border-slate-100 flex justify-center bg-slate-50/50">
              <button 
                @click="router.push({ name: 'history' })"
                class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Voir tout l'historique
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Small unaccessible reset button -->
    <div class="pt-4 pb-2 flex justify-end">
      <button 
        @click="store.deleteAllSales()" 
        class="text-[10px] text-slate-300 hover:text-red-500 transition-colors px-2 py-1 opacity-50 hover:opacity-100"
        title="Réinitialiser toutes les données"
      >
        Réinitialiser
      </button>
    </div>
  </div>
</template>
