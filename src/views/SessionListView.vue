<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="goHome">Inici</ion-button>
        </ion-buttons>

        <ion-title>Sessions</ion-title>

        <ion-buttons slot="start" class="ml-2">
          <ion-button ref="filterBtn" @click="toggleFilter">
            <ion-icon :icon="filterIcon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- menú de filtres -->
      <div
          v-if="showFilter"
          ref="filterMenu"
          class="absolute bg-white border border-gray-300 rounded shadow z-50 p-2 flex flex-col items-center gap-3"
          :style="filterMenuStyle"
      >
        <ion-button
            :fill="currentFilter === 'active' ? 'solid' : 'outline'"
            color="primary"
            @click="setFilter('active')"
            class="w-40 h-12"
        >
          Actives
        </ion-button>
        <ion-button
            :fill="currentFilter === 'finished' ? 'solid' : 'outline'"
            color="primary"
            @click="setFilter('finished')"
            class="w-40 h-12"
        >
          Finalitzades
        </ion-button>
        <ion-button
            :fill="currentFilter === 'all' ? 'solid' : 'outline'"
            color="primary"
            @click="setFilter('all')"
            class="w-40 h-12"
        >
          Totes les sessions
        </ion-button>
      </div>
    </ion-header>

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
            <p>Hora d’inici: {{ formatHour(session.start_time) }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner
} from "@ionic/vue"
import {ref, onMounted, onUnmounted, nextTick} from "vue"
import api from "../axios"
import {useRouter} from "vue-router"
import {optionsOutline} from "ionicons/icons"

const router = useRouter()
const sessions = ref([])
const loading = ref(true)

const showFilter = ref(false)
const currentFilter = ref('active') // per defecte
const filterIcon = optionsOutline

const filterBtn = ref(null)
const filterMenu = ref(null)
const filterMenuStyle = ref({ top: '0px', left: '0px' })

const loadSessions = async () => {
  loading.value = true
  try {
    let url = "/sessions/list"
    if (currentFilter.value === 'active') url += "?active=1"
    else if (currentFilter.value === 'finished') url += "?finished=1"
    // si és 'all' no afegim paràmetre
    const res = await api.get(url)
    sessions.value = res.data
  } catch (err) {
    console.error("Error carregant sessions:", err)
  } finally {
    loading.value = false
  }
}

const setFilter = (filter) => {
  currentFilter.value = filter
  showFilter.value = false
  loadSessions()
}

const toggleFilter = async () => {
  showFilter.value = !showFilter.value
  await nextTick()
  if (showFilter.value && filterBtn.value) {
    const btnRect = filterBtn.value.$el.getBoundingClientRect()
    filterMenuStyle.value = {
      position: 'absolute',
      top: `${btnRect.bottom + window.scrollY}px`,
      left: `${btnRect.left + window.scrollX}px`
    }
  }
}

const handleClickOutside = (event) => {
  if (!showFilter.value) return
  const btnEl = filterBtn.value?.$el
  const menuEl = filterMenu.value
  if (
      btnEl && !btnEl.contains(event.target) &&
      menuEl && !menuEl.contains(event.target)
  ) {
    showFilter.value = false
  }
}

onMounted(() => {
  loadSessions()
  document.addEventListener("click", handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside)
})

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
</script>


<style scoped>
/* assegura que el menú apareix per sobre del contingut */
.absolute {
  position: absolute;
}
</style>
