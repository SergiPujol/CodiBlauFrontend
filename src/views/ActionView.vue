<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start" v-if="!selectedRhythm">
          <ion-button @click="goHome">
            Inici
          </ion-button>
        </ion-buttons>
        <ion-title>Codi Blau</ion-title>
        <ion-buttons slot="end" v-if="sessionId">
          <ion-button color="danger" @click="confirmStopSession">
            Finalitzar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="pt-4 pb-4 px-6 space-y-6">
      <h2 v-if="sessionId" class="text-2xl font-bold text-center">
        Sessió #{{ sessionId }}
      </h2>
      <!-- 🔹 Rellotges -->
      <div v-if="sessionId" class="grid grid-cols-3 gap-4 text-center">
        <!-- Sessió -->
        <div>
          <h3 class="font-bold text-lg">Sessió</h3>
          <div class="relative w-28 h-28 mx-auto">
            <svg class="transform -rotate-90 w-28 h-28">
              <circle
                  cx="56" cy="56" r="50"
                  class="text-gray-300"
                  stroke-width="6"
                  fill="transparent"
                  stroke="currentColor"
              />
              <circle
                  cx="56" cy="56" r="50"
                  class="text-blue-500"
                  stroke-width="6"
                  fill="transparent"
                  stroke="currentColor"
                  stroke-dasharray="314"
                  :stroke-dashoffset="314 - (elapsedSeconds / 3600) * 314"
                  stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center font-mono">
              {{ formattedTime }}
            </div>
          </div>
        </div>

        <!-- Cicle -->
        <div>
          <h3 class="font-bold text-lg">Cicle</h3>
          <div class="relative w-28 h-28 mx-auto"
               :class="{ 'intense-blink': cycleElapsedSeconds >= 100 }">
            <svg class="transform -rotate-90 w-28 h-28">
              <circle cx="56" cy="56" r="50" class="text-gray-300" stroke-width="6" fill="transparent"
                      stroke="currentColor"/>
              <circle
                  cx="56" cy="56" r="50"
                  class="text-green-500"
                  stroke-width="6"
                  fill="transparent"
                  stroke="currentColor"
                  stroke-dasharray="314"
                  :stroke-dashoffset="314 - (cycleElapsedSeconds / 120) * 314"
                  stroke-linecap="round"

              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center font-mono">
              {{ formattedCycleTime }}
            </div>
          </div>
        </div>

        <!-- Adrenalina -->
        <div>
          <h3 class="font-bold text-lg">Adrenalina</h3>
          <div class="relative w-28 h-28 mx-auto"
               :class="{ 'intense-blink': isAdrenalineExpired }"
          >
            <svg class="transform -rotate-90 w-28 h-28">
              <circle cx="56" cy="56" r="50" class="text-gray-300" stroke-width="6" fill="transparent"
                      stroke="currentColor"/>
              <circle
                  cx="56" cy="56" r="50"
                  class="text-red-500"
                  stroke-width="6"
                  fill="transparent"
                  stroke="currentColor"
                  stroke-dasharray="314"
                  :stroke-dashoffset="314 - (adrenalineTime / 240) * 314"
                  stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center font-mono">
              {{ formattedAdrenalineTime }}
            </div>
          </div>
        </div>
      </div>

      <!-- 🔹 Info cicle -->
      <div v-if="selectedRhythm" class="text-center text-lg font-bold text-purple-600">
        {{ selectedRhythm }}
      </div>
      <div v-if="cycleNumber" class="text-center text-sm text-gray-500">
        Cicle actual: {{ cycleNumber }}
      </div>

      <!-- 🔹 Botons de ritme -->
      <div>
        <h2 v-if="!selectedRhythm" class="font-bold text-lg mb-2">Ritme inicial</h2>
        <div class="grid grid-cols-5 gap-2">
          <ion-button
              expand="block"
              v-for="rhythm in rhythms"
              :key="rhythm"
              fill="outline"
              color="medium"
              class="text-black font-bold hover:bg-gray-100"
              @click="startSessionWithRhythm(rhythm)"
              :class="{ 'animate-pulse': cycleElapsedSeconds >= 100 }"
          >
            {{ rhythm }}
          </ion-button>
        </div>
      </div>

      <!-- 🔹 Botons d'accions -->
      <div v-if="sessionId" class="grid grid-cols-5 gap-2">
        <!-- Adrenalina -->
        <ion-button
            expand="block"
            fill="solid"
            color="custom"
            @click="sendAction('adrenaline')"
            :class="{ 'rhythm-highlight': ['AESP', 'Asistòlia'].includes(selectedRhythm) }"
        >
          Adrenalina
        </ion-button>

        <!-- Descàrrega -->
        <ion-button
            expand="block"
            fill="solid"
            color="custom"
            @click="sendAction('shock')"
            :class="{ 'rhythm-highlight': ['FV', 'TV SP'].includes(selectedRhythm) }"
        >
          <ion-icon slot="icon-only" :icon="flash"></ion-icon>
        </ion-button>

        <!-- Amiodarona -->
        <ion-button expand="block" @click="selectAmiodarone" color="custom"
        >
          Amiodarona
        </ion-button>

        <!-- Altres medicacions -->
        <ion-button expand="block" @click="enterOtherMedication" color="custom"
        >
          Altres medicacions
        </ion-button>

        <!-- Esdeveniments -->
        <ion-button expand="block" @click="selectEvent" color="custom"
        >
          Esdeveniments
        </ion-button>
      </div>
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
  IonButton,
  IonIcon,
  alertController, actionSheetController
} from '@ionic/vue'
import {ref, computed, onUnmounted, onMounted} from 'vue'
import api from '../axios'
import 'ionicons'
import {onBeforeRouteLeave, useRouter} from "vue-router";
import { flash } from 'ionicons/icons'

const router = useRouter()
const sessionId = ref(null)
const cycleId = ref(null)
const cycleNumber = ref(null)
const selectedRhythm = ref(null)
const sessionStartTime = ref(null)
const elapsedSeconds = ref(0)
const rhythms = ["FV", "TV SP", "AESP", "Asistòlia", "ROSC"]
let intervalId = null

// Temporitzador d’adrenalina
const adrenalineTime = ref(0)
const adrenalineInterval = ref(null)
const isAdrenalineExpired = computed(() => adrenalineTime.value >= 220)

//Temporitzador de cicle
const cycleStartTime = ref(null)
const cycleElapsedSeconds = ref(0)
let cycleIntervalId = null

const formattedAdrenalineTime = computed(() => {
  const minutes = Math.floor(adrenalineTime.value / 60).toString().padStart(2, '0')
  const seconds = (adrenalineTime.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

const startAdrenalineTimer = () => {
  adrenalineTime.value = 0
  if (adrenalineInterval.value) clearInterval(adrenalineInterval.value)
  adrenalineInterval.value = setInterval(() => {
    adrenalineTime.value++
    if (adrenalineTime.value >= 240) {
      clearInterval(adrenalineInterval.value)
    }
  }, 1000)
}

// El rellotge es posa a 0 quan comença un nou cicle
const startCycleTimer = () => {
  cycleStartTime.value = new Date()
  cycleElapsedSeconds.value = 0

  if (cycleIntervalId) clearInterval(cycleIntervalId)

  cycleElapsedSeconds.value = Math.floor((new Date() - cycleStartTime.value) / 1000)

  cycleIntervalId = setInterval(() => {
    const now = new Date()
    cycleElapsedSeconds.value = Math.floor((now - cycleStartTime.value) / 1000)
  }, 1000)
}

const formattedCycleTime = computed(() => {
  const minutes = Math.floor(cycleElapsedSeconds.value / 60).toString().padStart(2, '0')
  const seconds = (cycleElapsedSeconds.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

const startSessionWithRhythm = async (rhythm) => {
  if (!sessionId.value) {
    try {
      const now = new Date();
      const start_time = now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0') + ' ' +
          String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0') + ':' +
          String(now.getSeconds()).padStart(2, '0');

      const res = await api.post('/sessions', {
        rhythm_type: rhythm,
        start_time: start_time
      });

      // 🔹 Assignació de variables de sessió i cicle
      sessionId.value = res.data.id;
      cycleId.value = res.data.cycle_id;
      cycleNumber.value = 1; // primer cicle sempre és 1
      selectedRhythm.value = rhythm;

      // 🔹 Temps de sessió
      sessionStartTime.value = new Date(res.data.start_time.replace(' ', 'T'));
      elapsedSeconds.value = 0;

      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        const now = new Date();
        elapsedSeconds.value = Math.floor((now - sessionStartTime.value) / 1000);
      }, 1000);

      // 🔹 Reiniciar cicle
      startCycleTimer();

      // 🔹 Reiniciar adrenalina
      adrenalineTime.value = 0;
      if (adrenalineInterval.value) clearInterval(adrenalineInterval.value);
      adrenalineInterval.value = null;

      console.log('Sessió creada amb ritme:', rhythm);
    } catch (error) {
      console.error('Error creant sessió:', error);
    }
  } else {
    // Crear nou cicle dins la sessió existent
    try {
      const res = await api.post(`/sessions/${sessionId.value}/cycles`, {
        rhythm_type: rhythm
      });
      cycleId.value = res.data.id;
      cycleNumber.value = res.data.number;
      selectedRhythm.value = rhythm;

      // 🔹 Reiniciar cicle al començar un nou cicle
      startCycleTimer();

      console.log('Nou cicle creat amb ritme:', rhythm);
    } catch (error) {
      console.error('Error creant cicle:', error);
    }
  }
};


const sendAction = async (type, value = null) => {
  if (!sessionId.value || !cycleId.value) return
  const now = new Date()
  const executedAt = now.toISOString().slice(0, 19).replace('T', ' ')
  const data = {type, executed_at: executedAt, cycle_id: cycleId.value}
  if (value) data.value = value
  try {
    const res = await api.post(`/sessions/${sessionId.value}/actions`, data)
    console.log("Acció enviada:", res.data)
    if (type === 'adrenaline') startAdrenalineTimer()
  } catch (e) {
    console.error(e)
  }
}

// Amiodarona
const selectAmiodarone = async () => {
  const actionSheet = await actionSheetController.create({
    header: 'Selecciona dosi',
    buttons: [
      {text: '300mg', handler: () => sendAction('amiodarone 300')},
      {text: '150mg', handler: () => sendAction('amiodarone 150')},
      {text: 'Cancel·lar', role: 'cancel'}
    ]
  })
  await actionSheet.present()
}

// Altres meds
const enterOtherMedication = async () => {
  const alert = await alertController.create({
    header: 'Altres medicacions',
    inputs: [{name: 'med', type: 'text', placeholder: 'Introdueix una medicació'}],
    buttons: [
      {text: 'Cancel·lar', role: 'cancel'},
      {
        text: 'Enviar', handler: (data) => {
          if (data.med) sendAction(data.med)
        }
      }
    ]
  })
  await alert.present()
}

// Events
const selectEvent = async () => {
  const actionSheet = await actionSheetController.create({
    header: 'Selecciona un esdeveniment',
    buttons: [
      {text: 'Accés IV', handler: () => sendAction('iv')},
      {text: 'Accés IO', handler: () => sendAction('io')},
      {text: 'IOT', handler: () => sendAction('iot')},
      {text: 'Accés supraglòtic', handler: () => sendAction('supraglottic')},
      {text: 'Cardiocompressor', handler: () => sendAction('cardiocompressor')},
      {text: 'Capnògraf', handler: () => sendAction('capnograph')},
      {text: 'Cancel·lar', role: 'cancel'}
    ]
  })
  await actionSheet.present()
}

const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0')
  const seconds = (elapsedSeconds.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

const stopSession = async () => {
  if (!sessionId.value) return

  try {
    const now = new Date()
    const end_time = now.toISOString().slice(0, 19).replace('T', ' ')

    await api.put(`/sessions/${sessionId.value}`, {
      end_time: end_time
    })

    console.log('Sessió acabada correctament')

    // Netejar intervals
    if (intervalId) clearInterval(intervalId)
    if (adrenalineInterval.value) clearInterval(adrenalineInterval.value)
    if (cycleIntervalId) clearInterval(cycleIntervalId)

    // Reset variables
    sessionId.value = null
    cycleId.value = null
    cycleNumber.value = null
    selectedRhythm.value = null

    // Tornar a Home
    router.push({name: 'Home'})
  } catch (error) {
    console.error('Error finalitzant sessió:', error)
  }
}

const stopSessionBeacon = () => {
  if (!sessionId.value) return

  const url = `${import.meta.env.VITE_API_URL}/sessions/${sessionId.value}/close`

  const data = new FormData()
  data.append("end", "1")

  navigator.sendBeacon(url, data)
  console.log("Sessió acabada via beacon")
}

onMounted(() => {
  window.addEventListener('beforeunload', (e) => {
    if (sessionId.value) {
      stopSessionBeacon()
      e.preventDefault()
      e.returnValue = ''
    }
  })
})

onBeforeRouteLeave(async (to, from, next) => {
  if (sessionId.value) {
    const alert = await alertController.create({
      header: 'Sortir de la sessió',
      message: 'Si surts es finalitzarà la sessió. Vols continuar?',
      buttons: [
        {
          text: 'Cancel·lar',
          role: 'cancel',
          handler: () => {
            next(false)
          }
        },
        {
          text: 'Sí, sortir',
          role: 'confirm',
          handler: async () => {
            await stopSession()
            next()
          }
        }
      ]
    })
    await alert.present()
  } else {
    next()
  }
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (adrenalineInterval.value) clearInterval(adrenalineInterval.value)
  if (cycleIntervalId) clearInterval(cycleIntervalId)
})

const confirmStopSession = async () => {
  const alert = await alertController.create({
    header: 'Finalitzar sessió',
    message: 'Vols acabar la sessió actual?',
    buttons: [
      {
        text: 'Cancel·lar',
        role: 'cancel'
      },
      {
        text: 'Sí, finalitzar',
        role: 'confirm',
        handler: () => {
          stopSession()
        }
      }
    ]
  })
  await alert.present()
}

const goHome = () => {
  router.push({name: 'Home'})
}

const otherMedication = ref("")

const sendOtherMedication = () => {
  if (!otherMedication.value) return
  sendAction("other_medication", otherMedication.value)
  otherMedication.value = ""
}
</script>
<style scoped>
.intense-blink {
  animation: intense-blink 0.6s infinite;
  transform-origin: center center;
}

@keyframes intense-blink {
  0%, 49% {
    opacity: 1;
    transform: scale(1);
  }
  50%, 100% {
    opacity: 0.2;
    transform: scale(1.15);
  }
}

.rhythm-highlight {
  animation: glow 1s ease-in-out infinite alternate;
  background-color: #60a5fa; /* blau més intens (Tailwind blue-400) */
  color: #000;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px #60a5fa, 0 0 10px #60a5fa;
  }
  to {
    box-shadow: 0 0 15px #3b82f6, 0 0 25px #3b82f6;
  }
}
</style>