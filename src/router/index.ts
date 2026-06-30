import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import AddSale from '../views/AddSale.vue'
import AddCA from '../views/AddCA.vue'
import History from '../views/History.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard
    },
    {
      path: '/add',
      name: 'add-sale',
      component: AddSale
    },
    {
      path: '/add-ca',
      name: 'add-ca',
      component: AddCA
    },
    {
      path: '/history',
      name: 'history',
      component: History
    }
  ]
})

export default router
