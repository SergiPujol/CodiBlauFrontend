import { createRouter, createWebHistory } from '@ionic/vue-router'
import ActionView from '../views/ActionView.vue'
import LogView from "../views/LogView.vue";
import HomeView from "../views/HomeView.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/actions',
        name: 'Actions',
        component: ActionView
    },
    {
        path: '/log/',
        name: 'Log',
        component: () => import('../views/LogView.vue')
    },
    {
        path: '/log/:id',
        name: 'Log',
        component: () => import('../views/LogView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
