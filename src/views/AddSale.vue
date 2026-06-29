<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSalesStore } from '@/store/sales'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const store = useSalesStore()

const formData = ref({
  date: new Date().toISOString().slice(0, 10),
  clientName: '',
  description: '',
  amount: ''
})

const isSubmitting = ref(false)
const isSuccess = ref(false)

const handleSubmit = () => {
  if (!formData.value.clientName || !formData.value.amount) return

  isSubmitting.value = true
  
  // Simulate slight delay for UX
  setTimeout(() => {
    store.addSale({
      date: formData.value.date,
      clientName: formData.value.clientName,
      description: formData.value.description,
      amount: parseFloat(formData.value.amount)
    })
    
    isSubmitting.value = false
    isSuccess.value = true
    
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 800)
  }, 600)
}
</script>

<template>
  <div class="max-w-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
    <button 
      @click="router.push({ name: 'home' })" 
      class="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      Retour au tableau de bord
    </button>

    <Card class="border-slate-200/60 shadow-md overflow-hidden relative">
      <!-- Success Overlay -->
      <div 
        v-if="isSuccess" 
        class="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 backdrop-blur-sm"
      >
        <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 class="w-8 h-8 text-emerald-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-900">Vente ajoutée !</h3>
        <p class="text-slate-500 mt-2 text-sm">Redirection en cours...</p>
      </div>

      <CardHeader class="border-b border-slate-100 bg-slate-50/50 pb-6">
        <CardTitle class="text-2xl">Nouvelle Vente</CardTitle>
        <CardDescription>Saisissez les informations de la transaction.</CardDescription>
      </CardHeader>
      
      <form @submit.prevent="handleSubmit">
        <CardContent class="space-y-5 pt-6">
          <div class="space-y-2.5">
            <Label for="date" class="text-slate-600">Date de la vente</Label>
            <Input 
              id="date" 
              type="date" 
              v-model="formData.date" 
              class="h-11 shadow-sm focus-visible:ring-slate-900 transition-all"
              required 
            />
          </div>
          
          <div class="space-y-2.5">
            <Label for="client" class="text-slate-600">Nom du Client</Label>
            <Input 
              id="client" 
              v-model="formData.clientName" 
              placeholder="Ex: Jean Dupont" 
              class="h-11 shadow-sm focus-visible:ring-slate-900 transition-all"
              required 
            />
          </div>
          
          <div class="space-y-2.5">
            <Label for="description" class="text-slate-600">Produit / Description</Label>
            <Input 
              id="description" 
              v-model="formData.description" 
              placeholder="Ex: Décoration murale en bois" 
              class="h-11 shadow-sm focus-visible:ring-slate-900 transition-all"
              required 
            />
          </div>
          
          <div class="space-y-2.5">
            <Label for="amount" class="text-slate-600">Montant de la transaction (€)</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">€</span>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                min="0" 
                v-model="formData.amount" 
                placeholder="0.00" 
                class="pl-8 h-12 text-lg font-semibold shadow-sm focus-visible:ring-slate-900 transition-all"
                required 
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 pb-6 bg-slate-50/30 border-t border-slate-50">
          <Button 
            variant="ghost" 
            type="button" 
            class="w-full sm:w-auto text-slate-500 hover:text-slate-900"
            @click="router.push({ name: 'home' })"
            :disabled="isSubmitting"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            class="w-full sm:w-auto h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all"
            :disabled="isSubmitting"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
            <span v-if="isSubmitting">Enregistrement...</span>
            <span v-else>Valider la vente</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
