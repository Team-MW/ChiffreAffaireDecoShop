<script setup lang="ts">
import { computed } from 'vue'
import { useSalesStore } from '@/store/sales'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table as UiTable, TableBody as UiTableBody, TableCell as UiTableCell, TableHead as UiTableHead, TableHeader as UiTableHeader, TableRow as UiTableRow } from '@/components/ui/table'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { TrendingUp, ArrowUpRight, ShoppingBag, Calendar, CalendarDays, Wallet } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const store = useSalesStore()

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
    <!-- Top Stats -->
    <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card class="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg relative overflow-hidden col-span-2 lg:col-span-1">
        <div class="absolute right-0 top-0 opacity-10 pointer-events-none">
          <TrendingUp class="w-32 h-32 -mt-4 -mr-4" />
        </div>
        <CardHeader class="flex flex-row items-center justify-between pb-2 z-10 relative">
          <CardTitle class="text-sm font-medium text-slate-300">CA Total</CardTitle>
          <div class="p-2 bg-white/10 rounded-lg">
            <ArrowUpRight class="w-4 h-4 text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent class="z-10 relative">
          <div class="text-3xl font-bold tracking-tight">{{ formatCurrency(store.totalRevenue) }}</div>
          <p class="text-xs text-slate-400 mt-1">
            {{ store.sales.length }} ventes au total
          </p>
        </CardContent>
      </Card>

      <Card class="shadow-sm border-slate-200/60">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-slate-500">Aujourd'hui</CardTitle>
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Wallet class="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-slate-900">{{ formatCurrency(store.todayRevenue) }}</div>
        </CardContent>
      </Card>
      
      <Card class="shadow-sm border-slate-200/60">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-slate-500">Cette Semaine</CardTitle>
          <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
            <CalendarDays class="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-slate-900">{{ formatCurrency(store.thisWeekRevenue) }}</div>
        </CardContent>
      </Card>
      
      <Card class="shadow-sm border-slate-200/60">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-slate-500">Ce Mois</CardTitle>
          <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Calendar class="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-slate-900">{{ formatCurrency(store.thisMonthRevenue) }}</div>
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
        <CardHeader class="pb-2 border-b border-slate-100">
          <CardTitle class="text-lg">Ventes Récentes</CardTitle>
          <CardDescription>Vos 5 dernières transactions.</CardDescription>
        </CardHeader>
        <CardContent class="p-0 flex-1 flex flex-col">
          <div v-if="store.sales.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag class="w-6 h-6 text-slate-400" />
            </div>
            <p class="text-slate-500 text-sm">Aucune vente enregistrée.</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <UiTable>
              <UiTableHeader class="bg-slate-50/50">
                <UiTableRow>
                  <UiTableHead class="w-[100px] pl-4">Client</UiTableHead>
                  <UiTableHead class="hidden md:table-cell">Produit</UiTableHead>
                  <UiTableHead class="text-right pr-4">Montant</UiTableHead>
                </UiTableRow>
              </UiTableHeader>
              <UiTableBody>
                <UiTableRow v-for="sale in store.sales.slice(0, 5)" :key="sale.id" class="group">
                  <UiTableCell class="pl-4">
                    <div class="font-medium text-slate-900 line-clamp-1">{{ sale.clientName }}</div>
                    <div class="text-xs text-slate-500 md:hidden mt-0.5">{{ formatDate(sale.date) }}</div>
                  </UiTableCell>
                  <UiTableCell class="hidden md:table-cell">
                    <div class="text-sm text-slate-600 line-clamp-1">{{ sale.description }}</div>
                    <div class="text-xs text-slate-400 mt-0.5">{{ formatDate(sale.date) }}</div>
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
  </div>
</template>
