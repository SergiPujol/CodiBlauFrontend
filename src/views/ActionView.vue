<template>
  <ion-page>
    <ion-header>
      <ion-toolbar :style="{ '--background': headerColor }">
        <!-- Botó enrere -->
        <ion-buttons slot="start">
          <ion-button fill="clear" color="black" @click="$router.back()">
            <ion-icon :icon="arrowBackOutline" slot="icon-only" />
          </ion-button>
          <!-- Botó menú -->
          <ion-button fill="clear" color="black" @click="openMenuPopover($event)">
            <ion-icon :icon="menuOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>

        <!-- Logo i text centrat -->
        <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <template v-if="!sessionId">
            <img src="/src/assets/logo-hospital-trueta.svg" alt="Logo Trueta" class="h-8 w-auto" />
          </template>
          <template v-else>
            <p class="text-2xl font-bold tracking-wide text-gray-700">
              Codi Blau
            </p>
          </template>
        </div>


        <!-- Botó sortir -->
        <ion-buttons slot="end" v-if="sessionId">
          <ion-button @click="confirmDeleteSession">Sortir</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="pt-4 pb-4 px-6 space-y-6" :class="{ 'rosc-background': hasROSC }">

      <!-- Ritme seleccionat -->
      <h2
          v-if="selectedRhythm"
          class="text-center !font-bold !text-4xl"
          :class="isShockable ? 'text-blue-500' : 'text-red-500'"
      >
        {{ selectedRhythm }}
      </h2>

      <!-- 🔹 Rellotges -->
      <div v-if="sessionId" class="grid grid-cols-3 gap-4 text-center">
        <!-- Sessió -->
        <div>
          <h3 class="font-bold text-lg">Sessió</h3>
          <div class="relative w-40 h-40 scale-[1.4] mx-auto">
            <svg class="transform -rotate-90 w-40 h-40">
              <circle cx="78" cy="78" r="50" class="text-gray-300" stroke-width="10" fill="transparent" stroke="currentColor" />
              <circle
                  cx="78" cy="78" r="50"
                  class="text-blue-500"
                  stroke-width="10"
                  fill="transparent"
                  stroke="currentColor"
                  stroke-dasharray="314"
                  :stroke-dashoffset="314 - (elapsedSeconds / 3600) * 314"
                  stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center font-mono text-lg">
              {{ formattedTime }}
            </div>
          </div>
        </div>

        <!-- Cicle -->
        <div>
          <h3 class="font-bold text-lg">Cicle</h3>
          <div class="relative w-40 h-40 scale-[1.4] mx-auto" :class="{ 'intense-blink': cycleElapsedSeconds >= 100 }">
            <svg class="transform -rotate-90 w-40 h-40">
              <circle cx="78" cy="78" r="50" class="text-gray-300" stroke-width="10" fill="transparent" stroke="currentColor"/>
              <circle
                  cx="78" cy="78" r="50"
                  class="text-green-500"
                  stroke-width="10"
                  fill="transparent"
                  stroke="currentColor"
                  stroke-dasharray="314"
                  :stroke-dashoffset="314 - (cycleElapsedSeconds / 120) * 314"
                  stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center font-mono text-lg">
              {{ formattedCycleTime }}
            </div>
          </div>
        </div>

        <!-- Adrenalina -->
        <div>
          <h3 class="font-bold text-lg">Adrenalina</h3>
          <div class="relative w-40 h-40 scale-[1.4] mx-auto" :class="{ 'intense-blink': isAdrenalineExpired }">
            <svg class="transform -rotate-90 w-40 h-40">
              <circle cx="78" cy="78" r="50" class="text-gray-300" stroke-width="10" fill="transparent" stroke="currentColor"/>
              <circle
                  cx="78" cy="78" r="50"
                  class="text-red-500"
                  stroke-width="10"
                  fill="transparent"
                  stroke="currentColor"
                  stroke-dasharray="314"
                  :stroke-dashoffset="314 - (adrenalineTime / 240) * 314"
                  stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center font-mono text-lg">
              {{ formattedAdrenalineTime }}
            </div>
          </div>
        </div>

      </div>

      <div v-if="cycleNumber" class="text-center text-sm text-gray-500">
        Cicle actual: {{ cycleNumber }}
      </div>

      <!-- Pantalla inicial: dos colors -->
      <div v-if="!selectedRhythm" class="h-full flex">
        <!-- Meitat esquerra -->
        <div class="w-1/2 h-full bg-blue-300 flex flex-col justify-center items-center p-6 text-white">
          <h2 class="text-2xl font-bold mb-6">Desfibril·lables</h2>
          <div class="space-y-4 w-full max-w-xs">
            <ion-button
                expand="block"
                v-for="rhythm in ['FV','TV SP']"
                :key="rhythm"
                class="font-bold shadow-md"
                style="--background: linear-gradient(135deg, #3b82f6, #60a5fa); --color: white"
                @click="handleRhythm(rhythm)"
            >
              {{ rhythm }}
            </ion-button>
          </div>
        </div>

        <!-- Meitat dreta -->
        <div class="w-1/2 h-full bg-red-300 flex flex-col justify-center items-center p-6 text-white">
          <h2 class="text-2xl font-bold mb-6">No desfibril·lables</h2>
          <div class="space-y-4 w-full max-w-xs">
            <ion-button
                expand="block"
                v-for="rhythm in ['AESP','Asistòlia']"
                :key="rhythm"
                class="font-bold shadow-md"
                style="--background: linear-gradient(135deg, #ef4444, #f87171); --color: white"
                @click="handleRhythm(rhythm)"
            >
              {{ rhythm }}
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Un cop seleccionat: barra horitzontal sense ROSC -->
      <div v-else class="grid grid-cols-4 gap-2">
        <ion-button
            expand="block"
            v-for="rhythm in ['FV','TV SP']"
            :key="rhythm"
            class="font-bold shadow-md border-2 rounded-lg"
            style="--background: #dbeafe; --color: #3b82f6; --border-color: #3b82f6; --border-radius: 0.5rem;"
            @click="handleRhythm(rhythm)"
        >
          {{ rhythm }}
        </ion-button>

        <ion-button
            expand="block"
            v-for="rhythm in ['AESP','Asistòlia']"
            :key="rhythm"
            class="font-bold shadow-md border-2 rounded-lg"
            style="--background: rgba(251,105,111,0.73); --color: #b30519; --border-color: rgba(239,68,68,0.82); --border-radius: 0.5rem;"
            @click="handleRhythm(rhythm)"
        >
          {{ rhythm }}
        </ion-button>
      </div>

      <!-- 🔹 Botons d'accions -->
      <div v-if="sessionId" class="grid grid-cols-5 gap-2 mb-4">
        <ion-button expand="block" fill="outline" class="btn-adrenaline" @click="sendAction('adrenaline')">
          Adrenalina
        </ion-button>

        <ion-button expand="block" fill="outline" class="btn-shock" @click="sendAction('shock')">
          <ion-icon slot="icon-only" :icon="flash" />
        </ion-button>

        <ion-button expand="block" fill="outline" class="btn-amiodarone" @click="selectAmiodarone">
          Amiodarona
        </ion-button>

        <ion-button expand="block" fill="outline" class="btn-other" @click="enterOtherMedication">
          Altres medicacions
        </ion-button>

        <ion-button expand="block" fill="outline" class="btn-event" @click="selectEvent">
          Esdeveniments
        </ion-button>

      </div>

      <!-- 🔹 Botons especials -->
      <div v-if="sessionId" class="grid grid-cols-2 gap-4 mb-4">
        <ion-button
            expand="block"
            fill="outline"
            color="medium"
            class="text-black font-bold hover:bg-gray-100"
            @click="confirmStopSession('exitus')"
        >
          Èxitus
        </ion-button>

        <!-- ROSC substitueix Tèrminus -->
        <ion-button
            expand="block"
            fill="outline"
            color="success"
            class="font-bold text-white"
            @click="handleRhythm('ROSC')"
        >
          ROSC
        </ion-button>
      </div>

      <!-- Botó Finalitzar sessió -->
      <div v-if="sessionId" class="mt-4">
        <ion-button
            expand="block"
            fill="outline"
            color="danger"
            class="font-bold"
            @click="confirmStopSession('finish')"
        >
          Finalitzar sessió
        </ion-button>
      </div>

      <h4
          v-if="sessionId"
          class="absolute bottom-4 right-4 text-sm font-bold text-gray-700"
      >
        Sessió #{{ sessionId }}
      </h4>
      <img
          v-if="sessionId"
          src="/src/assets/logo-hospital-trueta.svg"
          alt="Logo Trueta"
          class="absolute bottom-6 left-6 h-6 w-auto opacity-80"
      />

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
  alertController, actionSheetController,
    popoverController
} from '@ionic/vue'
import {ref, computed, onUnmounted, onMounted} from 'vue'
import api from '../axios'
import 'ionicons'
import {onBeforeRouteLeave, useRouter} from "vue-router";
import {arrowBackOutline, menuOutline, flash} from 'ionicons/icons'
import {jsPDF} from "jspdf";
import MenuPopover from "../components/MenuPopover.vue";

const router = useRouter()
const sessionId = ref(null)
const cycleId = ref(null)
const cycleNumber = ref(null)
const selectedRhythm = ref(null)
const sessionStartTime = ref(null)
const elapsedSeconds = ref(0)
const rhythms = ["FV", "TV SP", "AESP", "Asistòlia"]
let intervalId = null

// Temporitzador d’adrenalina
const adrenalineTime = ref(0)
const adrenalineInterval = ref(null)
const isAdrenalineExpired = computed(() => adrenalineTime.value >= 220)

//Temporitzador de cicle
const cycleStartTime = ref(null)
const cycleElapsedSeconds = ref(0)
let cycleIntervalId = null

const openMenu = ref(false)
const menuEvent = ref(null)

const formattedAdrenalineTime = computed(() => {
  const minutes = Math.floor(adrenalineTime.value / 60).toString().padStart(2, '0')
  const seconds = (adrenalineTime.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

const openMenuPopover = async (e) => {
  const popover = await popoverController.create({
    event: e,
    component: MenuPopover,
    translucent: true
  })
  await popover.present()
}

const showAlgorithm = () => {
  console.log('Mostrar algorismes')
  openMenu.value = false
}

const showInfo = () => {
  console.log('Mostrar informació')
  openMenu.value = false
}

const canUseAdrenaline = computed(() => ['FV', 'TV SP','AESP', 'Asistòlia'].includes(selectedRhythm.value))
const canUseShock = computed(() => ['FV', 'TV SP'].includes(selectedRhythm.value))
const canUseAnyAction = computed(() => selectedRhythm.value !== 'ROSC')
const canChangeRhythm = computed(() => selectedRhythm.value !== 'ROSC')

const hasROSC = ref(false)

const isShockable = computed(() => ['FV', 'TV SP'].includes(selectedRhythm.value))

const headerColor = computed(() => {
  if (selectedRhythm.value === 'ROSC' || hasROSC.value) return '#9ff2b6'
  if (isShockable.value) return '#dbeafe'
  if (selectedRhythm.value) return 'rgba(251,105,111,0.73)'
  return 'white'
})

const confirmDeleteSession = async () => {
  const alert = await alertController.create({
    header: 'Eliminar sessió',
    message: 'Si surts ara, s´esborraran les dades de la sessió. Vols continuar?',
    buttons: [
      {text: 'Cancel·lar', role: 'cancel'},
      {
        text: 'Sí, eliminar',
        role: 'confirm',
        handler: () => {
          deleteSession()
        }
      }
    ]
  })
  await alert.present()
}

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

const handleRhythm = async (rhythm) => {
  if (rhythm === 'ROSC') {
    hasROSC.value = true
    selectedRhythm.value = 'ROSC'

    // 🔹 Aturar rellotges
    pauseAllTimers()

    // 🔹 Guardar acció ROSC
    await sendAction('rosc')

    // 🔹 Tancar la sessió amb end_time
    if (sessionId.value) {
      try {
        const now = new Date()
        const end_time = now.toISOString().slice(0, 19).replace('T', ' ')

        await api.put(`/sessions/${sessionId.value}`, {
          end_time: end_time
        })

        console.log("🟢 ROSC registrat: sessió finalitzada i rellotges aturats")
      } catch (err) {
        console.error("Error tancant sessió amb ROSC:", err)
      }
    }
  } else {
    // 🔹 Flux normal: crear sessió o nou cicle
    await startSessionWithRhythm(rhythm)
  }
}

const pauseAllTimers = () => {
  if (intervalId) clearInterval(intervalId)
  if (cycleIntervalId) clearInterval(cycleIntervalId)
  if (adrenalineInterval.value) clearInterval(adrenalineInterval.value)
}

const startSessionWithRhythm = async (rhythm) => {
  if (rhythm === 'ROSC') {
    pauseAllTimers()
    await sendAction('rosc')
    selectedRhythm.value = 'ROSC'
    hasROSC.value = true
    console.log("🟢 ROSC detectat → rellotges aturats")
    return
  }

  // Reiniciem ROSC a l'iniciar nova sessió
  hasROSC.value = false

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

      sessionId.value = res.data.id;
      cycleId.value = res.data.cycle_id;
      cycleNumber.value = 1;
      selectedRhythm.value = rhythm;

      // Reiniciem rellotges
      sessionStartTime.value = new Date(res.data.start_time.replace(' ', 'T'));
      elapsedSeconds.value = 0;
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        const now = new Date();
        elapsedSeconds.value = Math.floor((now - sessionStartTime.value) / 1000);
      }, 1000);

      startCycleTimer();
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

      // Reiniciar cicle
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
    if (!hasROSC.value) { // 👈 Només actualitza end_time si no hi ha ROSC
      const now = new Date()
      const end_time = now.toISOString().slice(0, 19).replace('T', ' ')

      await api.put(`/sessions/${sessionId.value}`, {
        end_time: end_time
      })

      console.log('Sessió acabada correctament (end_time registrat)')
    } else {
      console.log('Sessió ja finalitzada amb ROSC, no s’actualitza end_time')
    }

    // 🔹 Netejar intervals
    if (intervalId) clearInterval(intervalId)
    if (adrenalineInterval.value) clearInterval(adrenalineInterval.value)
    if (cycleIntervalId) clearInterval(cycleIntervalId)

    // 🔹 Reset variables
    sessionId.value = null
    cycleId.value = null
    cycleNumber.value = null
    selectedRhythm.value = null
    hasROSC.value = false // 👈 Reset

    // 🔹 Tornar a Home
    router.push({name: 'Home'})
  } catch (error) {
    console.error('Error finalitzant sessió:', error)
  }
}

const deleteSession = async () => {
  try {
    await api.delete(`/sessions/${sessionId.value}`)

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
    await router.push({name: 'Home'})
  } catch (err) {
    console.error("Error eliminant sessió:", err)
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

const confirmStopSession = async (endType = 'terminus') => {
  const alert = await alertController.create({
    header: 'Finalitzar la sessió',
    message: 'Vols acabar la sessió actual?',
    buttons: [
      {
        text: 'Cancel·lar',
        role: 'cancel'
      },
      {
        text: 'Sí, finalitzar sense PDF',
        role: 'confirm',
        handler: async () => {
          await stopSession()
        }
      },
      {
        text: 'Sí, finalitzar i generar PDF',
        role: 'confirm',
        handler: async () => {
          try {
            await generatePdfForSession()
          } catch (err) {
            console.error("Error generant PDF:", err)
          } finally {
            await stopSession()
          }
        }
      }
    ]
  })
  await alert.present()
}

const generatePdfForSession = async () => {
  if (!sessionId.value) {
    console.warn("No hi ha cap sessió activa per generar PDF")
    return
  }

  try {
    const typeTranslations = {
      adrenaline: 'Adrenalina',
      'amiodarone 300': 'Amiodarona 300mg',
      'amiodarone 150': 'Amiodarona 150mg',
      defibrillation: 'Desfibril·lació',
      rosc: 'ROSC',
      shock: 'Descàrrega',
      other_medication: 'Altres medicacions',
      event: 'Esdeveniment',
      iv: 'Accés IV',
      io: 'Accés IO',
      iot: 'IOT',
      supraglottic: 'Accés supraglòtic',
      cardiocompressor: 'Cardiocompressor',
      capnograph: 'Capnògraf'
    }

    const cycleTypeTranslations = {
      shockable: 'Ritme desfibril·lable',
      'non-shockable': 'Ritme no desfibril·lable',
      rosc: 'ROSC',
      unknown: 'Tipus desconegut'
    }

    // Peticions al backend
    const [actionsRes, cyclesRes] = await Promise.all([
      api.get(`/sessions/${sessionId.value}/actions`),
      api.get(`/sessions/${sessionId.value}/cycles`)
    ])

    const actions = actionsRes.data || []
    const cycles = cyclesRes.data || []

    // Map i ordenació
    const cycleMap = {}
    for (const c of cycles) {
      cycleMap[c.id] = c
    }

    actions.sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))

    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const marginLeft = 15
    let y = 20

    doc.setFontSize(14)
    doc.text(`Sessió #${sessionId.value}`, marginLeft, y)
    y += 8

    doc.setFontSize(10)
    const nowStr = new Date().toLocaleString('ca-ES')
    doc.text(`PDF generat: ${nowStr}`, marginLeft, y)
    y += 8

    doc.setFontSize(12)
    doc.text("Cicles i Accions", marginLeft, y)
    y += 8

    // Agrupem accions per número de cicle
    const actionsByCycle = {}
    for (const a of actions) {
      const c = cycleMap[a.cycle_id]
      const number = c ? c.number : '(sense cicle)'
      if (!actionsByCycle[number]) actionsByCycle[number] = []
      actionsByCycle[number].push(a)
    }

    const sortedCycleNumbers = Object.keys(actionsByCycle)
        .map(n => isNaN(Number(n)) ? n : Number(n))
        .sort((a, b) => a - b)

    doc.setFontSize(10)
    for (const cnum of sortedCycleNumbers) {
      if (y > 275) {
        doc.addPage()
        y = 20
      }

      // Ara busquem pel número correctament (convertint-lo a número si cal)
      const cycle = cycles.find(c => String(c.number) === String(cnum))
      const cycleType = cycle
          ? (cycleTypeTranslations[cycle.rhythm_type] || cycle.rhythm_type || 'Tipus desconegut')
          : 'Tipus desconegut'

// Formatem hora d'inici si existeix
      let startTimeStr = ''
      if (cycle?.start_time) {
        const date = new Date(cycle.start_time)
        const hh = String(date.getHours()).padStart(2, '0')
        const mm = String(date.getMinutes()).padStart(2, '0')
        const ss = String(date.getSeconds()).padStart(2, '0')
        startTimeStr = `${hh}:${mm}:${ss}`
      }

      doc.setFont(undefined, "bold")
      const cycleHeader = `Cicle ${cnum} — ${cycleType}${startTimeStr ? `  ${startTimeStr}` : ''}`
      doc.text(cycleHeader, marginLeft, y)

      doc.setFont(undefined, "normal")
      y += 6

      const list = actionsByCycle[cnum]
      for (const a of list) {
        if (y > 275) {
          doc.addPage()
          y = 20
        }

        // Format data DD/MM/YYYY HH:mm:ss
        let time = ''
        if (a.executed_at) {
          const date = new Date(a.executed_at)
          const dd = String(date.getDate()).padStart(2, '0')
          const mm = String(date.getMonth() + 1).padStart(2, '0')
          const yyyy = date.getFullYear()
          const hh = String(date.getHours()).padStart(2, '0')
          const min = String(date.getMinutes()).padStart(2, '0')
          const ss = String(date.getSeconds()).padStart(2, '0')
          time = `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`
        }

        const translatedType = typeTranslations[a.type] || a.type
        const valuePart = a.value ? ` — ${a.value}` : ''
        const line = `${time} • ${translatedType}${valuePart}`

        const maxWidth = 180
        const splitted = doc.splitTextToSize(line, maxWidth)
        doc.text(splitted, marginLeft, y)
        y += 6 * splitted.length
      }

      y += 4
    }

    const filename = `session_${sessionId.value}.pdf`
    doc.save(filename)
    console.log("PDF generat:", filename)

  } catch (err) {
    console.error("Error recuperant dades o generant PDF:", err)
    throw err
  }
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

.rhythm-highlight-shockable {
  animation: glow-shockable 1s ease-in-out infinite alternate;
  background-color: #60a5fa;
  color: #000;
}

.rhythm-highlight-not-shockable {
  animation: glow-not-shockable 1s ease-in-out infinite alternate;
  background-color: rgba(251, 105, 111, 0.73);
  color: #000;
}

@keyframes glow-shockable {
  from {
    box-shadow: 0 0 5px #60a5fa, 0 0 10px #60a5fa;
  }
  to {
    box-shadow: 0 0 15px #3b82f6, 0 0 25px #3b82f6;
  }
}

@keyframes glow-not-shockable {
  from {
    box-shadow: 0 0 5px rgba(239, 68, 68, 0.82), 0 0 10px #ef4444;
  }
  to {
    box-shadow: 0 0 15px #e01c1c, 0 0 25px #ff2222;
  }
}

.rosc-background {
  background-color: #4ade80;
}

ion-button[fill="outline"][color="custom"]::part(native) {
  border-color: #4b5563;
  color: #374151;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

ion-button[fill="outline"][color="custom"]::part(native):hover {
  background: rgba(255, 255, 255, 0.1);
}

/* A ActionView.vue o al teu style global */
.btn-adrenaline {
  --border-color: #f97316 !important;  /* taronja */
  --color: #c2410c !important;
}

.btn-shock {
  --border-color: #facc15 !important;  /* groc */
  --color: #b45309 !important;
}

.btn-amiodarone {
  --border-color: #d8b4fe !important;  /* morat */
  --color: #6b21a8 !important;
}

.btn-other {
  --border-color: #e5e7eb !important;  /* gris */
  --color: #374151 !important;
}

.btn-event {
  --border-color: #22d3ee !important;  /* cian */
  --color: #0e7490 !important;
}

</style>