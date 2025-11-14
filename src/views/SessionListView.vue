<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button fill="clear" color="light" @click="$router.back()">
            <ion-icon :icon="arrowBackOutline" slot="icon-only"></ion-icon>
          </ion-button>

          <div class="flex items-center gap-2 ml-2">
            <span class="text-white font-semibold text-lg">Sessions</span>
            <ion-button
                fill="clear"
                color="light"
                size="small"
                class="p-0 flex items-center justify-center"
                @click="loadSessions"
            >
              <ion-icon :icon="refreshOutline"></ion-icon>
            </ion-button>
          </div>
        </ion-buttons>

        <ion-buttons slot="start">
          <ion-button @click="showFilter = true">
            <ion-icon :icon="filterIcon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>


      <!-- Barra de filtres activa -->
      <div v-if="hasActiveFilters" class="filters-bar">
        <template v-if="currentFilter !== 'all'">
    <span class="filter-chip" @click="clearFilter('status')">
      {{ currentFilter === 'active' ? 'Actives' : 'Finalitzades' }}
      <ion-icon :icon="closeIcon" class="close-icon"></ion-icon>
    </span>
        </template>

        <!-- Data d'inici -->
        <template v-if="filterStartDate">
    <span class="filter-chip" @click="clearFilter('start')">
      Des de: {{ formatDate(filterStartDate) }}
      <ion-icon :icon="closeIcon" class="close-icon"></ion-icon>
    </span>
        </template>

        <!-- Data de fi -->
        <template v-if="filterEndDate">
    <span class="filter-chip" @click="clearFilter('end')">
      Fins a: {{ formatDate(filterEndDate) }}
      <ion-icon :icon="closeIcon" class="close-icon"></ion-icon>
    </span>
        </template>
      </div>

    </ion-header>

    <!-- Modal de filtres -->
    <ion-modal :is-open="showFilter" @didDismiss="showFilter = false">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Filtres</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="applyFilters">Aplica</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content class="modal-content no-scroll">
        <!-- Estat -->
        <div class="section">
          <h3 class="section-title">Estat de la sessió</h3>
          <div class="flex flex-wrap gap-4">
            <ion-button expand="block" :fill="currentFilter==='active'?'solid':'outline'" color="success" @click="currentFilter='active'">Actives</ion-button>
            <ion-button expand="block" :fill="currentFilter==='finished'?'solid':'outline'" color="warning" @click="currentFilter='finished'">Finalitzades</ion-button>
            <ion-button expand="block" :fill="currentFilter==='all'?'solid':'outline'" color="medium" @click="currentFilter='all'">Totes</ion-button>
          </div>
        </div>

        <!-- Dates -->
        <div class="section flex gap-6 items-start">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-2">Data d'inici</label>
            <ion-datetime
                v-model="filterStartDate"
                display-format="YYYY-MM-DD"
                placeholder="Inici"
                class="calendar"
            ></ion-datetime>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium mb-2">Data de fi</label>
            <ion-datetime
                v-model="filterEndDate"
                display-format="YYYY-MM-DD"
                placeholder="Fi"
                class="calendar"
            ></ion-datetime>
          </div>
        </div>

        <div v-if="filterStartDate || filterEndDate" class="mt-2 text-sm text-gray-600 text-center">
          Rang seleccionat:
          <span>{{ filterStartDate ? formatDate(filterStartDate) + ' ' + formatHour(filterStartDate) : '---' }}</span> -
          <span>{{ filterEndDate ? formatDate(filterEndDate) + ' ' + formatHour(filterEndDate) : '---' }}</span>
        </div>

        <!-- Botó de reiniciar -->
        <div class="flex justify-center mt-4">
          <ion-button color="danger" fill="outline" class="px-6 py-3" @click="resetFilters">
            Reinicia filtres
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
    <!-- Llista de sessions -->
    <ion-content class="p-4">
      <div v-if="loading" class="text-center mt-6">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else-if="sessions.length === 0" class="text-center text-gray-500 mt-6">
        No hi ha cap sessió
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
            <p>Data: {{ formatDate(session.start_time) }} {{ formatHour(session.start_time) }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonButton, IonButtons, IonIcon, IonSpinner, IonModal, IonDatetime
} from "@ionic/vue"
import {ref, onMounted, computed} from "vue"
import api from "../axios"
import {useRouter} from "vue-router"
import {optionsOutline, closeCircleOutline, arrowBackOutline, refreshOutline} from "ionicons/icons"

const router = useRouter()
const sessions = ref([])
const loading = ref(true)

const showFilter = ref(false)
const currentFilter = ref('active')
const filterIcon = optionsOutline

const filterStartDate = ref(null)
const filterEndDate = ref(null)

const loadSessions = async () => {
  loading.value = true
  try {
    let url = "/sessions/list"
    const params = []

    if (currentFilter.value === "active") params.push("active=1")
    else if (currentFilter.value === "finished") params.push("finished=1")


    if (filterStartDate.value) params.push(`start_date=${filterStartDate.value}`)
    if (filterEndDate.value) params.push(`end_date=${filterEndDate.value}`)

    if (params.length > 0) url += "?" + params.join("&")

    const res = await api.get(url)
    sessions.value = res.data
  } catch (err) {
    console.error("Error carregant sessions:", err)
  } finally {
    loading.value = false
  }
}

const closeIcon = closeCircleOutline

const hasActiveFilters = computed(() => {
  return (
      currentFilter.value !== 'all' ||
      filterStartDate.value !== null ||
      filterEndDate.value !== null
  )
})

const clearFilter = (type) => {
  if (type === 'status') currentFilter.value = 'all'
  if (type === 'start') filterStartDate.value = null
  if (type === 'end') filterEndDate.value = null
  loadSessions()
}

const applyFilters = () => {
  showFilter.value = false
  loadSessions()
}

const resetFilters = () => {
  currentFilter.value = "active"
  filterStartDate.value = null
  filterEndDate.value = null
}

const formatDate = (dateString) => {
  const d = new Date(dateString.replace(" ", "T"))
  return d.toLocaleDateString("ca-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}

const formatHour = (dateString) => {
  const d = new Date(dateString.replace(" ", "T"))
  return d.toLocaleTimeString("ca-ES", {hour12: false})
}

const goToSession = (id) => {
  router.push({name: "Log", params: {id}})
}

const goHome = () => {
  router.push({name: 'Home'})
}

onMounted(() => loadSessions())
</script>

<style scoped>
ion-modal {
  --width: 97%;
  --max-width: 600px;
  --height: 80vh;
  --border-radius: 20px;
  margin: 0 auto;
}

.modal-content {
  --background: #f9fafb;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.no-scroll {
  overflow: hidden;
}

.section {
  padding: 1rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.12);
}

.section-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: #374151;
}

.calendar {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  width: 100%;
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
}

.filter-chip {
  display: flex;
  align-items: center;
  background-color: #e0f2fe;
  color: #0369a1;
  font-weight: 500;
  border-radius: 9999px;
  padding: 0.15rem 0.6rem;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.2s;
}

.filter-chip:hover {
  background-color: #bae6fd;
}

.close-icon {
  font-size: 1rem;
  margin-left: 0.25rem;
}


</style>