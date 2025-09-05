import { createRouter, createWebHistory } from '@ionic/vue-router'
import ActionView from '../views/ActionView.vue'
import LogView from "../views/LogView.vue";
import HomeView from "../views/HomeView.vue";
import SessionListView from "../views/SessionListView.vue";

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
        path: '/sessions/',
        name: 'SessionList',
        component: SessionListView
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
