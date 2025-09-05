<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="goHome">
             Inici
          </ion-button>
        </ion-buttons>
        <ion-title>Sessions Actives</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="p-4">
      <div v-if="loading" class="text-center mt-6">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else-if="sessions.length === 0" class="text-center text-gray-500 mt-6">
        No hi ha cap sessió activa
      </div>

      <ion-list v-else>
        <ion-item
            v-for="session in sessions"
            :key="session.id"
            button
            detail
            @click="goToSession(session.id)"
        >
          <ion-label>
            <h2 class="font-bold">Sessió #{{ session.id }}</h2>
            <p>Hora d’inici: {{ formatHour(session.start_time) }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from "@ionic/vue"
import { ref, onMounted } from "vue"
import api from "../axios"
import { useRouter } from "vue-router"

const router = useRouter()
const sessions = ref([])
const loading = ref(true)

const loadSessions = async () => {
  loading.value = true
  try {
    const res = await api.get("/sessions/list?active=1")
    sessions.value = res.data
  } catch (err) {
    console.error("Error carregant sessions:", err)
  } finally {
    loading.value = false
  }
}

const formatHour = (dateString) => {
  const d = new Date(dateString.replace(" ", "T"))
  return d.toLocaleTimeString("ca-ES", { hour12: false })
}

const goToSession = (id) => {
  router.push({ name: "Log", params: { id } })
}

const goHome = () => {
  router.push({ name: 'Home' })
}

onMounted(loadSessions)

</script>
