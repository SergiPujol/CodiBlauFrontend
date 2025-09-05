<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="goHome">
            Inici
          </ion-button>
        </ion-buttons>
        <ion-title>Registre de la Sessió</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="p-4">
      <div v-if="loading" class="text-center mt-6">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else-if="actions.length === 0" class="text-center text-gray-500">
        No hi ha accions.
      </div>

      <ul v-else class="space-y-2">
        <li
            v-for="action in actions"
            :key="action.id"
            class="p-4 bg-white rounded shadow"
        >
          <p class="text-md font-semibold">{{ typeTranslations[action.type] || action.type }}</p>
          <p class="text-sm text-gray-600">
            ⏱️ {{ formatTime(action.executed_at) }}
          </p>
        </li>
      </ul>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/vue'
import echo from '../echo'
import {ref, onMounted, onUnmounted} from 'vue'
import {useRoute} from 'vue-router'
import { useRouter } from "vue-router"
import api from "../axios"

const route = useRoute()
const router = useRouter()
const sessionId = route.params.id
const actions = ref([])
const loading = ref(true)

onMounted(async () => {
  const channel = echo.channel(`session.${sessionId}`)

  // Carregar accions anteriors
  loading.value = true
  try {
    const res = await api.get(`/sessions/${sessionId}/actions`)
    actions.value = res.data
        .map(a => ({...a}))
        .sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))
  } catch (err) {
    console.error('Error carregant accions anteriors:', err)
  } finally {
    loading.value = false
  }

  // Escoltar accions en temps real
  channel.subscribed(() => {
    console.log(`✅ Subscrits correctament a session.${sessionId}`)
  })

  channel.listen('.actionregistered', (event) => {
    // Evitar duplicats
    if (!actions.value.find(a => a.id === event.id)) {
      const newAction = {
        id: event.id,
        type: event.type,
        executed_at: event.executed_at,
        session_id: event.session_id,
      }
      actions.value.push(newAction)
      actions.value.sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))
    }
  })

  channel.error((error) => {
    console.error('❌ Error al canal:', error)
  })
})

onUnmounted(() => {
  echo.leave(`session.${sessionId}`)
})

const formatTime = (datetime) => {
  const date = new Date(datetime)
  return date.toLocaleTimeString('ca-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const typeTranslations = {
  adrenaline: 'Adrenalina',
  amiodarone: 'Amiodarona',
  defibrillation: 'Desfibril·lació',
  rosc: 'ROSC',
}

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>
