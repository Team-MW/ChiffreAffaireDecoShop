<script setup lang="ts">
import { onMounted } from 'vue'
import { useSalesStore } from '@/store/sales'
import AppLayout from '@/components/layout/AppLayout.vue'

const store = useSalesStore()

onMounted(() => {
  store.fetchSales()
})
</script>

<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
