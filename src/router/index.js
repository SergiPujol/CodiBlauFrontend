import { createRouter, createWebHistory } from '@ionic/vue-router'
import ActionView from '../views/ActionView.vue'
import LogView from "../views/LogView.vue";

const routes = [
    {
        path: '/',
        name: 'Actions',
        component: ActionView
    },
    {
        path: '/log/:id',
        name: 'LogView',
        component: () => import('../views/LogView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
