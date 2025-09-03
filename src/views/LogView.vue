<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Registre de la Sessió</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="p-4">
      <div v-if="actions.length === 0" class="text-center text-gray-500">
        No hi ha accions.
      </div>

      <ul v-else class="space-y-2">
        <li
            v-for="action in actions"
            :key="action.id"
            class="p-4 bg-white rounded shadow"
        >
          <p class="text-md font-semibold capitalize">{{ action.type }}</p>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sessionId = route.params.id
const actions = ref([])

onMounted(() => {
  console.log(`🎧 Escoltant canal session.${sessionId}`)

  const channel = echo.channel(`session.${sessionId}`)

  channel.subscribed(() => {
    console.log(`✅ Subscrits correctament a session.${sessionId}`)
  })
  console.log('Actions inicials:', actions.value)

  channel.listen('.actionregistered', (event) => {
    console.log('⚡ Acció rebuda via WebSocket:', event)

    const newAction = {
      id: event.id,
      type: event.type,
      executed_at: event.executed_at,
      session_id: event.session_id,
    }

    actions.value.push(newAction)
    actions.value.sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))
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
</script>
