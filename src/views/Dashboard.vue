<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSalesStore } from '@/store/sales'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table as UiTable, TableBody as UiTableBody, TableCell as UiTableCell, TableHead as UiTableHead, TableHeader as UiTableHeader, TableRow as UiTableRow } from '@/components/ui/table'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Wallet, CreditCard, Banknote, Smartphone, Calendar, CalendarDays, Search } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const store = useSalesStore()

const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date())
})

const chartData = computed(() => {
  const salesByDate: Record<string, number> = {}
  
  // Create last 7 days empty so chart always looks good
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    salesByDate[d.toLocaleDateString('fr-FR')] = 0
  }

  const sortedSales = [...store.sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  sortedSales.forEach(sale => {
    const dateStr = new Date(sale.date).toLocaleDateString('fr-FR')
    if (salesByDate[dateStr] !== undefined) {
      salesByDate[dateStr] += sale.amount
    } else {
      salesByDate[dateStr] = sale.amount
    }
  })

  // We take only the last 7 to 10 entries for a cleaner mobile chart
  const labels = Object.keys(salesByDate).slice(-7)
  const data = Object.values(salesByDate).slice(-7)

  return {
    labels,
    datasets: [
      {
        label: 'Chiffre d\'affaires (€)',
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15, 23, 42, 0.1)',
        data,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0f172a',
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
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 13, family: "'Geist', sans-serif" },
      bodyFont: { size: 14, weight: 'bold', family: "'Geist', sans-serif" },
      displayColors: false,
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
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-700">
    <!-- Top Stats (Mobile Optimized) -->
    <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card class="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg relative overflow-hidden col-span-2">
        <div class="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Wallet class="w-32 h-32 -mt-4 -mr-4" />
        </div>
        <CardHeader class="flex flex-row items-center justify-between pb-2 z-10 relative">
          <CardTitle class="text-sm font-medium text-slate-300">Total Aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent class="z-10 relative">
          <div class="text-3xl font-bold tracking-tight">{{ formatCurrency(store.todayRevenue) }}</div>
        </CardContent>
      </Card>

      <Card class="shadow-sm border-slate-200/60">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-xs font-medium text-slate-500">Carte Bancaire</CardTitle>
          <CreditCard class="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div class="text-lg font-bold text-slate-900">{{ formatCurrency(store.todayRevenueCB) }}</div>
        </CardContent>
      </Card>
      
      <Card class="shadow-sm border-slate-200/60">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-xs font-medium text-slate-500">Espèces</CardTitle>
          <Banknote class="w-4 h-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div class="text-lg font-bold text-slate-900">{{ formatCurrency(store.todayRevenueEspece) }}</div>
        </CardContent>
      </Card>

      <Card class="shadow-sm border-slate-200/60">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-xs font-medium text-slate-500">Floa</CardTitle>
          <Smartphone class="w-4 h-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div class="text-lg font-bold text-slate-900">{{ formatCurrency(store.todayRevenueFloa) }}</div>
        </CardContent>
      </Card>

      <Card class="shadow-sm border-slate-200/60">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-xs font-medium text-slate-500">Cette Semaine</CardTitle>
          <CalendarDays class="w-4 h-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div class="text-lg font-bold text-slate-900">{{ formatCurrency(store.thisWeekRevenue) }}</div>
        </CardContent>
      </Card>

      <Card class="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg relative overflow-hidden col-span-2 lg:col-span-4">
        <div class="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Calendar class="w-32 h-32 -mt-4 -mr-4" />
        </div>
        <CardHeader class="flex flex-row items-center justify-between pb-2 z-10 relative">
          <CardTitle class="text-sm font-medium text-slate-300 capitalize">Mois de {{ currentMonthName }}</CardTitle>
        </CardHeader>
        <CardContent class="z-10 relative">
          <div class="text-3xl font-bold tracking-tight">{{ formatCurrency(store.thisMonthRevenue) }}</div>
        </CardContent>
      </Card>
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
                  <UiTableHead class="text-right pr-4">Montant</UiTableHead>
                </UiTableRow>
              </UiTableHeader>
              <UiTableBody>
                <UiTableRow v-for="sale in filteredSales" :key="sale.id" class="group">
                  <UiTableCell class="pl-4">
                    <div class="font-medium text-slate-900 line-clamp-1">Vente ({{ sale.paymentMethod || 'CB' }})</div>
                    <div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{{ formatDate(sale.date) }}</span>
                      <span v-if="sale.clientName && sale.clientName !== 'Client'" class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium">{{ sale.clientName }}</span>
                    </div>
                  </UiTableCell>
                  <UiTableCell class="hidden md:table-cell">
                    <div class="text-sm text-slate-600 line-clamp-1">{{ sale.description && sale.description !== 'Vente' ? sale.description : '-' }}</div>
                  </UiTableCell>
                  <UiTableCell class="text-right pr-4 font-semibold text-slate-900">
                    {{ formatCurrency(sale.amount) }}
                  </UiTableCell>
                </UiTableRow>
              </UiTableBody>
            </UiTable>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Small unaccessible reset button -->
    <div class="pt-8 pb-2 flex justify-end">
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
