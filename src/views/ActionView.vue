<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Codi Blau</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="pt-4 pb-4 px-6 space-y-6">

      <!-- Rellotge de sessió -->
      <div v-if="sessionId" class="text-center text-xl font-mono mb-2">
        {{ formattedTime }}
      </div>
      <div v-if="sessionId" class="text-center text-sm text-gray-500">
        Sessió actual: {{ sessionId }}
      </div>
      <div v-if="cycleNumber" class="text-center text-sm text-gray-500">
        Cicle actual: {{ cycleNumber }}
      </div>

      <!-- Rellotge de cicle -->
      <div v-if="cycleNumber" class="text-center text-sm text-gray-500">
        Temps cicle: {{ formattedCycleTime }}
      </div>

      <!-- Tipus d'aturada -->
      <div>
        <h2 class="font-bold text-lg mb-2">Ritme</h2>
        <div class="grid grid-cols-3 gap-2">
          <ion-button
              expand="block"
              :color="selectedRhythm === 'FV' ? 'primary' : 'tertiary'"
              :disabled="selectedRhythm === 'FV'"
              @click="startSessionWithRhythm('FV')"
          >FV</ion-button>

          <ion-button
              expand="block"
              :color="selectedRhythm === 'AESP' ? 'primary' : 'tertiary'"
              :disabled="selectedRhythm === 'AESP'"
              @click="startSessionWithRhythm('AESP')"
          >AESP</ion-button>

          <ion-button
              expand="block"
              :color="selectedRhythm === 'asystole' ? 'primary' : 'tertiary'"
              :disabled="selectedRhythm === 'asystole'"
              @click="startSessionWithRhythm('asystole')"
          >Asistòlia</ion-button>
        </div>
      </div>

      <!-- Accions -->
      <div v-if="sessionId">

        <!-- Medicaments -->
        <div>
          <h2 class="font-bold text-lg mb-2">💊 Medicaments</h2>
          <div class="grid grid-cols-2 gap-2">
            <!-- Adrenalina -->
            <div class="relative">
              <ion-button
                  expand="block"
                  color="success"
                  @click="sendAction('adrenaline')"
                  :class="{ 'animate-pulse': isAdrenalineExpired }"
              >
                Adrenalina
              </ion-button>
              <div class="w-full h-1 bg-gray-300 rounded mt-1 overflow-hidden">
                <div
                    class="h-full bg-green-500 transition-all duration-1000"
                    :style="{ width: (adrenalineTime / 180) * 100 + '%' }"
                ></div>
              </div>
            </div>

            <!-- Amiodarona -->
            <ion-button expand="block" color="warning" @click="sendAction('amiodarone')">
              Amiodarona
            </ion-button>
          </div>
        </div>

        <!-- Intervencions -->
        <div>
          <h2 class="font-bold text-lg mb-2">🛠️ Intervencions</h2>
          <div class="grid grid-cols-2 gap-2">
            <ion-button expand="block" color="danger" @click="sendAction('defibrillation')">
              Desfibril·lació
            </ion-button>
            <ion-button expand="block" color="medium" @click="sendAction('ROSC')">
              ROSC
            </ion-button>
          </div>
        </div>

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
  IonButton
} from '@ionic/vue'
import { ref, computed, onUnmounted } from 'vue'
import api from '../axios'

const sessionId = ref(null)
const cycleId = ref(null)
const cycleNumber = ref(null)
const selectedRhythm = ref(null)
const sessionStartTime = ref(null)
const elapsedSeconds = ref(0)
let intervalId = null

// Temporitzador d’adrenalina
const adrenalineTime = ref(0)
const adrenalineInterval = ref(null)
const isAdrenalineExpired = computed(() => adrenalineTime.value >= 180)

//Temporitzador de cicle
const cycleStartTime = ref(null)
const cycleElapsedSeconds = ref(0)
let cycleIntervalId = null

const startAdrenalineTimer = () => {
  adrenalineTime.value = 0
  if (adrenalineInterval.value) clearInterval(adrenalineInterval.value)
  adrenalineInterval.value = setInterval(() => {
    adrenalineTime.value++
    if (adrenalineTime.value >= 180) {
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

      sessionId.value = res.data.id;
      cycleId.value = res.data.cycle_id;
      cycleNumber.value = 1; // primer cicle sempre és 1
      selectedRhythm.value = rhythm

      sessionStartTime.value = new Date(res.data.start_time.replace(' ', 'T'))
      elapsedSeconds.value = 0
      startCycleTimer()

      const sessionStart = res.data.start_time.replace(' ', 'T');
      sessionStartTime.value = new Date(sessionStart);
      selectedRhythm.value = rhythm;
      elapsedSeconds.value = 0;

      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        const now = new Date();
        elapsedSeconds.value = Math.floor((now - sessionStartTime.value) / 1000);
      }, 1000);

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
      startCycleTimer()
      console.log('Nou cicle creat amb ritme:', rhythm);
    } catch (error) {
      console.error('Error creant cicle:', error);
    }
  }
};

const sendAction = async (type) => {
  if (!sessionId.value || !cycleId.value) return

  const now = new Date()
  const executedAt = now.toISOString().slice(0, 19).replace('T', ' ')

  const data = {
    type,
    executed_at: executedAt,
    cycle_id: cycleId.value
  }

  try {
    const res = await api.post(`/sessions/${sessionId.value}/actions`, data)
    console.log('' +
        'Acció enviada:', res.data)

    if (type === 'adrenaline') {
      startAdrenalineTimer()
    }
  } catch (error) {
    console.error('Error enviant acció:', error)
  }
}

const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0')
  const seconds = (elapsedSeconds.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (adrenalineInterval.value) clearInterval(adrenalineInterval.value)
  if (cycleIntervalId) clearInterval(cycleIntervalId)
})
</script>
