<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSalesStore } from '@/store/sales'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const store = useSalesStore()

const formData = ref({
  date: new Date().toISOString().slice(0, 10),
  clientName: '',
  description: '',
  amount: ''
})

const isSubmitting = ref(false)

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
    router.push({ name: 'home' })
  }, 400)
}
</script>

<template>
  <div class="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle Vente</CardTitle>
        <CardDescription>Enregistrez une nouvelle vente pour DecoShop.</CardDescription>
      </CardHeader>
      
      <form @submit.prevent="handleSubmit">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="date">Date</Label>
            <Input id="date" type="date" v-model="formData.date" required />
          </div>
          
          <div class="space-y-2">
            <Label for="client">Nom du Client</Label>
            <Input id="client" v-model="formData.clientName" placeholder="Ex: Jean Dupont" required />
          </div>
          
          <div class="space-y-2">
            <Label for="description">Produit / Description</Label>
            <Input id="description" v-model="formData.description" placeholder="Ex: Décoration murale en bois" required />
          </div>
          
          <div class="space-y-2">
            <Label for="amount">Montant (€)</Label>
            <Input id="amount" type="number" step="0.01" min="0" v-model="formData.amount" placeholder="0.00" required />
          </div>
        </CardContent>
        
        <CardFooter class="flex justify-between">
          <Button variant="outline" type="button" @click="router.push({ name: 'home' })">Annuler</Button>
          <Button type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">Enregistrement...</span>
            <span v-else>Enregistrer la vente</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
