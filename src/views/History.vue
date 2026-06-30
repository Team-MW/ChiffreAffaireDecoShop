<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSalesStore } from '@/store/sales'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table as UiTable, TableBody as UiTableBody, TableCell as UiTableCell, TableHead as UiTableHead, TableHeader as UiTableHeader, TableRow as UiTableRow } from '@/components/ui/table'
import { Search, Trash2, ArrowLeft, History } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const store = useSalesStore()
const router = useRouter()
const searchQuery = ref('')

const filteredSales = computed(() => {
  if (!searchQuery.value) return store.sales
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString))
}

const handleDelete = async (id: string) => {
  if (confirm('Voulez-vous vraiment supprimer cette vente ?')) {
    await store.deleteSale(id)
  }
}
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push({ name: 'home' })" class="rounded-full hover:bg-slate-200 transition-colors">
        <ArrowLeft class="w-5 h-5 text-slate-700" />
      </Button>
      <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <History class="w-6 h-6 text-indigo-500" />
        Historique complet
      </h1>
    </div>

    <Card class="shadow-sm border-slate-200/60 flex flex-col min-h-[70vh]">
      <CardHeader class="pb-4 border-b border-slate-100 bg-slate-50/50">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle class="text-lg text-slate-800">Toutes les transactions</CardTitle>
          <div class="relative w-full sm:w-72">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              v-model="searchQuery" 
              placeholder="Rechercher..." 
              class="pl-9 h-10 shadow-sm border-slate-200 bg-white"
            />
          </div>
        </div>
        <div v-if="searchQuery && filteredSales.length > 0" class="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between animate-in fade-in zoom-in-95">
          <span class="text-sm font-medium text-indigo-800">Total pour cette recherche :</span>
          <span class="font-bold text-indigo-600">{{ formatCurrency(searchTotalAmount) }}</span>
        </div>
      </CardHeader>
      
      <CardContent class="p-0 flex-1 flex flex-col bg-white">
        <div v-if="filteredSales.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 shadow-inner">
            <Search class="w-6 h-6 text-slate-400" />
          </div>
          <h3 class="text-lg font-semibold text-slate-700 mb-1">Aucune transaction</h3>
          <p class="text-slate-500 text-sm max-w-xs">Nous n'avons trouvé aucune vente ou encaissement correspondant à votre recherche.</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <UiTable>
            <UiTableHeader class="bg-slate-50 border-b border-slate-100">
              <UiTableRow class="hover:bg-transparent">
                <UiTableHead class="w-[120px] pl-6 py-4 font-semibold text-slate-600">Type / Date</UiTableHead>
                <UiTableHead class="hidden sm:table-cell py-4 font-semibold text-slate-600">Client / Détails</UiTableHead>
                <UiTableHead class="text-right py-4 font-semibold text-slate-600">Montant</UiTableHead>
                <UiTableHead class="w-[60px] pr-6 py-4"></UiTableHead>
              </UiTableRow>
            </UiTableHeader>
            <UiTableBody>
              <UiTableRow v-for="sale in filteredSales" :key="sale.id" class="group transition-colors hover:bg-slate-50/80">
                <UiTableCell class="pl-6 py-4">
                  <div class="font-bold text-slate-900 flex items-center gap-2">
                    <span v-if="sale.paymentMethod === 'CA'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">CA</span>
                    <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{{ sale.paymentMethod || 'CB' }}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-1.5 font-medium">
                    {{ formatDate(sale.date) }}
                  </div>
                </UiTableCell>
                <UiTableCell class="hidden sm:table-cell py-4">
                  <div class="font-medium text-slate-800" v-if="sale.clientName && sale.clientName !== 'Client'">{{ sale.clientName }}</div>
                  <div class="text-slate-400 italic text-sm" v-else>Client standard</div>
                  <div class="text-sm text-slate-500 mt-0.5" v-if="sale.description && sale.description !== 'Vente'">{{ sale.description }}</div>
                </UiTableCell>
                <UiTableCell class="text-right font-bold text-slate-900 text-base py-4">
                  {{ formatCurrency(sale.amount) }}
                </UiTableCell>
                <UiTableCell class="pr-6 py-4 text-right">
                  <Button 
                    @click="handleDelete(sale.id)" 
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    title="Supprimer la transaction"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </UiTableCell>
              </UiTableRow>
            </UiTableBody>
          </UiTable>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
