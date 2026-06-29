<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { LayoutDashboard, PlusCircle } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 pb-20 md:pb-0">
    <!-- Navbar (Desktop) -->
    <header class="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl hidden md:block shadow-sm">
      <div class="container mx-auto flex h-16 items-center px-6 justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-slate-200/50">
            <img src="/logo.jpeg" alt="DecoShop Logo" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            DecoShop
          </h1>
        </div>

        <nav class="flex items-center gap-4">
          <Button 
            :variant="route.name === 'home' ? 'secondary' : 'ghost'"
            class="rounded-full px-6 transition-all duration-300"
            @click="router.push({ name: 'home' })"
          >
            <LayoutDashboard class="w-4 h-4 mr-2" />
            Tableau de bord
          </Button>
          <Button 
            class="rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
            @click="router.push({ name: 'add-sale' })"
          >
            <PlusCircle class="w-4 h-4 mr-2" />
            Nouvelle Vente
          </Button>
        </nav>
      </div>
    </header>

    <!-- Mobile Top Header (Just for branding) -->
    <header class="md:hidden sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3 px-4 flex justify-center items-center">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-slate-200/50">
          <img src="/logo.jpeg" alt="DecoShop Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-lg font-bold tracking-tight text-slate-900">DecoShop</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-7xl">
      <slot />
    </main>

    <!-- Bottom Navigation (Mobile) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div class="flex justify-around items-center h-16 px-2">
        <button 
          @click="router.push({ name: 'home' })"
          class="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors"
          :class="route.name === 'home' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'"
        >
          <div :class="['p-1.5 rounded-full transition-all duration-300', route.name === 'home' ? 'bg-slate-100' : '']">
            <LayoutDashboard class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-medium">Dashboard</span>
        </button>

        <div class="relative -top-5 flex justify-center w-full">
          <button 
            @click="router.push({ name: 'add-sale' })"
            class="flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <PlusCircle class="w-6 h-6" />
          </button>
        </div>

        <button 
          class="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-400 opacity-50 cursor-not-allowed"
        >
          <div class="p-1.5">
            <div class="w-5 h-5 rounded border-2 border-current opacity-80" />
          </div>
          <span class="text-[10px] font-medium">Réglages</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style>
/* Safest padding for modern mobile devices (e.g. iPhone home bar) */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
