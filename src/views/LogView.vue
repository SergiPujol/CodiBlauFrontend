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
        <ion-buttons slot="end">
          <ion-button fill="solid" color="light" @click="showInfo = true">
            <ion-icon :icon="informationCircleOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-modal :is-open="showInfo" @didDismiss="showInfo = false">
      <ion-content
          fullscreen
          class="flex items-center justify-center bg-black"
          :style="{ padding: 0, overflow: 'hidden' }"
      >
        <img
            :src="['FV', 'TV SP'].includes(currentCycle?.rhythm_type)
        ? '/images/alritme%20desfibril·Lable.jpg'
        : '/images/algoritme%20no%20desfibril·lable.jpg'"
            alt="Algoritme"
            class="w-full h-full object-contain"
        />
      </ion-content>
    </ion-modal>

    <ion-content class="p-4" :style="{'--background': backgroundColor}">
      <div
          v-if="sessionEnded"
          class="w-full bg-red-100 text-red-800 text-center font-bold py-2 border-b border-red-300"
      >
        ⚠️ La sessió ha finalitzat
      </div>
      <div class="flex w-full h-full">
        <!-- 1r terç: imatge del ritme -->
        <div class="w-1/3 pr-4 flex items-center justify-center">
          <img
              :src="['FV', 'TV SP'].includes(currentCycle?.rhythm_type)
              ? '/images/alritme%20desfibril·Lable.jpg'
              : '/images/algoritme%20no%20desfibril·lable.jpg'"
              :alt="['FV', 'TV SP'].includes(currentCycle?.rhythm_type)
              ? 'Algoritme desfibril·lable'
              : 'Algoritme no desfibril·lable'"
              class="w-full h-auto rounded"
          />
        </div>

        <!-- 2n terç: rellotges i botons -->
        <div class="w-2/3 pr-4 flex flex-col justify-center">
          <div class="mb-4 text-center">
            <h2 class="text-xl font-bold">Sessió #{{ sessionNumber }}</h2>
          </div>

          <div class="grid grid-cols-3 gap-4 text-center mb-6">
            <!-- Sessió -->
            <div>
              <h3 class="font-bold text-lg">Sessió</h3>
              <div class="relative w-28 h-28 mx-auto">
                <svg class="transform -rotate-90 w-28 h-28">
                  <circle cx="56" cy="56" r="50" class="text-gray-300" stroke-width="6" fill="transparent"
                          stroke="currentColor"/>
                  <circle
                      cx="56"
                      cy="56"
                      r="50"
                      class="text-blue-500"
                      stroke-width="6"
                      fill="transparent"
                      stroke="currentColor"
                      stroke-dasharray="314"
                      :stroke-dashoffset="314 - (sessionElapsed / 3600) * 314"
                      stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center font-mono">
                  {{ formattedSessionTime }}
                </div>
              </div>
            </div>

            <!-- Cicle -->
            <div>
              <h3 class="font-bold text-lg">Cicle</h3>
              <div class="relative w-28 h-28 mx-auto" :class="{ 'intense-blink': cycleElapsed >= 100 }">
                <svg class="transform -rotate-90 w-28 h-28">
                  <circle cx="56" cy="56" r="50" class="text-gray-300" stroke-width="6" fill="transparent"
                          stroke="currentColor"/>
                  <circle
                      cx="56"
                      cy="56"
                      r="50"
                      class="text-green-500"
                      stroke-width="6"
                      fill="transparent"
                      stroke="currentColor"
                      stroke-dasharray="314"
                      :stroke-dashoffset="314 - (cycleElapsed / 120) * 314"
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
              <div class="relative w-28 h-28 mx-auto" :class="{ 'intense-blink': adrenalineElapsed >= 220 }">
                <svg class="transform -rotate-90 w-28 h-28">
                  <circle cx="56" cy="56" r="50" class="text-gray-300" stroke-width="6" fill="transparent"
                          stroke="currentColor"/>
                  <circle
                      cx="56"
                      cy="56"
                      r="50"
                      class="text-red-500"
                      stroke-width="6"
                      fill="transparent"
                      stroke="currentColor"
                      stroke-dasharray="314"
                      :stroke-dashoffset="314 - (adrenalineElapsed / 240) * 314"
                      stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center font-mono">
                  {{ formattedAdrenalineTime }}
                </div>
              </div>
            </div>
          </div>

          <!-- Info cicle -->
          <div class="my-6 text-center">
            <div class="text-4xl font-bold ">
              {{ currentCycle?.rhythm_type }}
            </div>
            <div class="text-sm text-gray-500 mt-6">
              Cicle actual: {{ currentCycle?.number }}
            </div>
          </div>


          <!--          &lt;!&ndash; Botons de ritme (només visuals) &ndash;&gt;-->
          <!--          <div class="grid grid-cols-5 gap-2 mb-6">-->
          <!--            <ion-button expand="block" fill="outline" color="medium" class="text-black font-bold hover:bg-gray-100">FV-->
          <!--            </ion-button>-->
          <!--            <ion-button expand="block" fill="outline" color="medium" class="text-black font-bold hover:bg-gray-100">TV-->
          <!--              SP-->
          <!--            </ion-button>-->
          <!--            <ion-button expand="block" fill="outline" color="medium" class="text-black font-bold hover:bg-gray-100">-->
          <!--              AESP-->
          <!--            </ion-button>-->
          <!--            <ion-button expand="block" fill="outline" color="medium" class="text-black font-bold hover:bg-gray-100">-->
          <!--              Asistòlia-->
          <!--            </ion-button>-->
          <!--            <ion-button expand="block" fill="outline" color="medium" class="text-black font-bold hover:bg-gray-100">-->
          <!--              ROSC-->
          <!--            </ion-button>-->
          <!--          </div>-->

          <!--          &lt;!&ndash; Botons d'accions (només visuals) &ndash;&gt;-->
          <!--          <div class="grid grid-cols-5 gap-2 mb-6">-->
          <!--            <ion-button expand="block" fill="solid" color="custom">Adrenalina</ion-button>-->
          <!--            <ion-button expand="block" fill="solid" color="custom">-->
          <!--              <ion-icon slot="icon-only" :icon="flash"></ion-icon>-->
          <!--            </ion-button>-->
          <!--            <ion-button expand="block" fill="solid" color="custom">Amiodarona</ion-button>-->
          <!--            <ion-button expand="block" fill="solid" color="custom">Altres medicacions</ion-button>-->
          <!--            <ion-button expand="block" fill="solid" color="custom">Esdeveniments</ion-button>-->
          <!--          </div>-->
        </div>

        <!-- 3r terç: registre -->
        <div ref="logContainer" class="w-1/3 bg-gray-50 rounded-lg shadow-inner p-3 overflow-y-auto">
          <div v-if="loading" class="text-center mt-6">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <div v-else-if="actions.length === 0" class="text-center text-gray-500 text-sm">
            No hi ha accions.
          </div>

          <ul v-else class="space-y-2 text-sm">
            <li
                v-for="action in actions"
                :key="action.id"
                class="p-2 rounded shadow-sm"
                :class="action.isCycle
    ? 'bg-blue-200 font-bold text-blue-900'
    : typeColors[action.type] || 'bg-white'">

              <p v-if="action.isCycle">
                {{ action.type }}
                <!-- afegim hora del cicle -->
                <span class="text-xs text-gray-600 ml-2">⏱️ {{ formatTime(action.executed_at) }}</span>
              </p>

              <template v-else>
                <p class="font-semibold">
                  {{ typeTranslations[action.type] || action.type }}
                  <span v-if="action.value" class="ml-1 text-gray-700">
        ({{ action.value }})
      </span>
                </p>
                <p class="text-xs text-gray-600">⏱️ {{ formatTime(action.executed_at) }}</p>
                <p class="text-xs text-gray-500">Cicle: {{ action.cycle_number }}</p>
              </template>
            </li>

          </ul>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar} from '@ionic/vue'
import echo from '../echo'
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import api from "../axios"
import { IonModal } from "@ionic/vue";
import {flash, informationCircleOutline} from "ionicons/icons"

const route = useRoute()
const router = useRouter()
const sessionId = route.params.id

const actions = ref([])
const loading = ref(true)
const logContainer = ref(null)
const sessionNumber = ref('--')
const currentCycle = ref(null)
const showInfo = ref(false)

const sessionElapsed = ref(0)
const cycleElapsed = ref(0)
const adrenalineElapsed = ref(0)
let sessionTimer = null, cycleTimer = null, adrenalineTimer = null

const CYCLE_DEFAULT_SECONDS = 120
const ADRENALINE_EXPIRE_SECONDS = 240

const sessionEnded = ref(false)

const backgroundColor = computed(() => {
  const mapping = {
    'FV': '#bfdbfe',       // blau clar
    'TV SP': '#bfdbfe',
    'Asistòlia': '#fecaca', // vermell clar
    'AESP': '#fecaca',
    'ROSC': '#bbf7d0',     // verd clar
  }
  return mapping[currentCycle.value?.rhythm_type] || 'white'
})

function parseTimestamp(val) {
  if (val === null || val === undefined) return null
  if (typeof val === 'number' && isFinite(val)) {
    const s = String(val)
    return s.length === 10 ? Number(val) * 1000 : Number(val)
  }
  if (typeof val === 'string') {
    const s = val.trim()
    if (!s) return null
    if (/^\d+$/.test(s)) return s.length === 10 ? Number(s) * 1000 : Number(s)
    let tryStr = s
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) tryStr = s.replace(' ', 'T')
    const ms = Date.parse(tryStr)
    return Number.isFinite(ms) ? ms : null
  }
  return null
}

function firstValidTimestamp(...candidates) {
  for (const c of candidates) {
    const ms = parseTimestamp(c)
    if (ms !== null) return ms
  }
  return null
}

const formattedSessionTime = computed(() => {
  const safe = Number.isFinite(sessionElapsed.value) ? sessionElapsed.value : 0
  const min = String(Math.floor(safe / 60)).padStart(2, '0')
  const sec = String(safe % 60).padStart(2, '0')
  return `${min}:${sec}`
})

const formattedCycleTime = computed(() => {
  const safe = Number.isFinite(cycleElapsed.value) ? cycleElapsed.value : 0
  const min = String(Math.floor(safe / 60)).padStart(2, '0')
  const sec = String(safe % 60).padStart(2, '0')
  return `${min}:${sec}`
})

const formattedAdrenalineTime = computed(() => {
  const safe = Number.isFinite(adrenalineElapsed.value) ? adrenalineElapsed.value : 0
  const min = String(Math.floor(safe / 60)).padStart(2, '0')
  const sec = String(safe % 60).padStart(2, '0')
  return `${min}:${sec}`
})

// Scroll al log
const scrollToBottom = async () => {
  await nextTick()
  if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight
}

// Timers
function clearTimers() {
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null
  }
  if (cycleTimer) {
    clearInterval(cycleTimer);
    cycleTimer = null
  }
  if (adrenalineTimer) {
    clearInterval(adrenalineTimer);
    adrenalineTimer = null
  }
}

function startSessionTimer(initialSeconds = 0) {
  if (sessionTimer) clearInterval(sessionTimer)
  sessionElapsed.value = Number.isFinite(initialSeconds) ? Math.max(0, Math.floor(initialSeconds)) : 0
  sessionTimer = setInterval(() => sessionElapsed.value++, 1000)
}

function startCycleTimer(initialSeconds = 0) {
  if (cycleTimer) clearInterval(cycleTimer)
  cycleElapsed.value = Number.isFinite(initialSeconds) ? Math.max(0, Math.floor(initialSeconds)) : 0
  cycleTimer = setInterval(() => cycleElapsed.value++, 1000)
}

function startAdrenalineTimer(initialSeconds = 0) {
  if (adrenalineTimer) clearInterval(adrenalineTimer)
  adrenalineElapsed.value = Number.isFinite(initialSeconds) ? Math.max(0, Math.floor(initialSeconds)) : 0
  adrenalineTimer = setInterval(() => {
    adrenalineElapsed.value++
    if (adrenalineElapsed.value >= ADRENALINE_EXPIRE_SECONDS) {
      adrenalineElapsed.value = ADRENALINE_EXPIRE_SECONDS
      clearInterval(adrenalineTimer)
      adrenalineTimer = null
    }
  }, 1000)
}

function startAdrenalineTimerFromMs(startMs) {
  const ms = parseTimestamp(startMs)
  const secondsSince = ms ? Math.floor((Date.now() - ms) / 1000) : 0
  startAdrenalineTimer(secondsSince)
}

const formatTime = (datetime) => {
  const ms = parseTimestamp(datetime)
  if (ms === null) return '--:--:--'
  return new Date(ms).toLocaleTimeString('ca-ES', {hour: '2-digit', minute: '2-digit', second: '2-digit'})
}

// Traduccions i colors per accions
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

const typeColors = {
  adrenaline: 'bg-red-100 text-red-800',
  'amiodarone 300': 'bg-purple-100 text-purple-800',
  'amiodarone 150': 'bg-purple-100 text-purple-800',
  defibrillation: 'bg-yellow-100 text-yellow-800',
  rosc: 'bg-green-100 text-green-800',
  shock: 'bg-yellow-100 text-yellow-800',
  other_medication: 'bg-gray-100 text-gray-800',
  event: 'bg-blue-100 text-blue-800',
  iv: 'bg-pink-100 text-pink-800',
  io: 'bg-pink-100 text-pink-800',
  iot: 'bg-pink-100 text-pink-800',
  supraglottic: 'bg-pink-100 text-pink-800',
  cardiocompressor: 'bg-indigo-100 text-indigo-800',
  capnograph: 'bg-indigo-100 text-indigo-800'
}

const rhythmColors = {
  'FV': 'bg-blue-200',
  'TV SP': 'bg-blue-200',
  'Asistòlia': 'bg-red-200',
  'AESP': 'bg-red-200',
  'ROSC': 'bg-green-200'
}

const backgroundClass = computed(() => {
  return rhythmColors[currentCycle.value?.rhythm_type] || ''
})

const goHome = () => router.push({name: 'Home'})

onMounted(async () => {
  const channel = echo.channel(`session.${sessionId}`)
      .listen('.SessionUpdated', (e) => {
        console.log("Sessió actualitzada per WS:", e.session)

        if (e.session.end_time) {
          sessionEnded.value = true
          clearTimers()

          const sessionStartMs = parseTimestamp(e.session.start_time)
          const sessionEndMs = parseTimestamp(e.session.end_time)

          if (sessionStartMs && sessionEndMs) {
            sessionElapsed.value = Math.floor((sessionEndMs - sessionStartMs) / 1000)
          }

          cycleElapsed.value = 0
          adrenalineElapsed.value = 0

          const endIso = sessionEndMs ? new Date(sessionEndMs).toISOString() : new Date().toISOString()
          actions.value.push({
            id: `session-end-${sessionId}`,
            type: "Fi de la sessió",
            executed_at: endIso,
            session_id: sessionId,
            isCycle: true
          })
          actions.value.sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))
          scrollToBottom()
        }
      })
  loading.value = true

  const cycleMap = new Map()

  function resolveCycleData(cycle_id) {
    if (!cycle_id) return {cycle_number: '--', cycle_rhythm_type: '--', startMs: null}
    const c = cycleMap.get(cycle_id)
    return {
      cycle_number: c?.number ?? '--',
      cycle_rhythm_type: c?.rhythm_type ?? '--',
      startMs: c?.startMs ?? null
    }
  }

  // ---------------------------------------------------------------------

  try {
    const res = await api.get(`/sessions/${sessionId}`)
    const session = res.data
    if (session.end_time) {
      sessionEnded.value = true
      clearTimers()
    }
    sessionNumber.value = session.id ?? sessionId

    if (Array.isArray(session.cycles)) {
      session.cycles.forEach(c => {
        cycleMap.set(c.id, {
          number: c.number,
          rhythm_type: c.rhythm_type,
          startMs: parseTimestamp(c.start_time)
        })
      })
    }

    const oldActions = (Array.isArray(session.actions) ? session.actions : []).map(a => {
      const resolved = resolveCycleData(a.cycle_id)
      return {
        ...a,
        cycle_number: resolved.cycle_number,
        cycle_rhythm_type: resolved.cycle_rhythm_type,
        isCycle: false
      }
    })

    const cycleActions = (Array.isArray(session.cycles) ? session.cycles : []).map(c => ({
      id: `cycle-${c.id}`,
      type: `Canvi de cicle: ${c.number}, ${c.rhythm_type || ''}`.trim(),
      executed_at: new Date(c.start_time).toISOString(),
      session_id: c.session_id,
      cycle_number: c.number,
      isCycle: true
    }))

    actions.value = [...oldActions, ...cycleActions].sort(
        (a, b) => new Date(a.executed_at) - new Date(b.executed_at)
    )

    const endMsNow = parseTimestamp(session.end_time)
    if (endMsNow) {
      const endIso = new Date(endMsNow).toISOString()
      const endActionId = `session-end-${sessionId}`

      const sessionStartMs = firstValidTimestamp(
          session.start_time,
          session.startTime,
          session.started_at,
          session.startedAt,
          session.created_at
      )

      if (!actions.value.find(a => String(a.id) === String(endActionId))) {
        let durationStr = ''
        if (sessionStartMs && endMsNow) {
          const totalSeconds = Math.floor((endMsNow - sessionStartMs) / 1000)
          const min = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
          const sec = String(totalSeconds % 60).padStart(2, '0')
          durationStr = ` (Durada: ${min}:${sec})`
        }
        actions.value.push({
          id: endActionId,
          type: `Fi de la sessió${durationStr}`,
          executed_at: endIso,
          session_id: session.id ?? sessionId,
          isCycle: true
        })

        // reordenar després d'afegir
        actions.value.sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))
      }
    }

    // Sessió
    const sessionStartMs = firstValidTimestamp(
        session.start_time, session.startTime, session.started_at, session.startedAt, session.created_at
    )

    if (sessionStartMs) {
      const startIso = new Date(sessionStartMs).toISOString()
      const startActionId = `session-start-${sessionId}`

      if (!actions.value.find(a => String(a.id) === String(startActionId))) {
        actions.value.push({
          id: startActionId,
          type: "Inici de la sessió",
          executed_at: startIso,
          session_id: session.id ?? sessionId,
          isCycle: true
        })

        actions.value.sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))
      }
    }

    const sElapsed = sessionStartMs ? Math.floor((Date.now() - sessionStartMs) / 1000) : 0
    startSessionTimer(sElapsed)

    // Cicle: agafa l'últim cicle existent
    if (Array.isArray(session.cycles) && session.cycles.length > 0) {
      const lastCycle = session.cycles.reduce((prev, curr) =>
          parseTimestamp(curr.start_time) > parseTimestamp(prev.start_time) ? curr : prev
      )
      currentCycle.value = {number: lastCycle.number, rhythm_type: lastCycle.rhythm_type}
      const cElapsed = lastCycle.start_time ? Math.floor((Date.now() - parseTimestamp(lastCycle.start_time)) / 1000) : 0
      startCycleTimer(cElapsed)
    }

    // Adrenalina: agafa l'última acció d'adrenalina
    const adrenalineActions = actions.value.filter(a =>
        String(a.type || '').toLowerCase().includes('adrenaline') ||
        String(a.type || '').toLowerCase().includes('adrenalina')
    )
    if (adrenalineActions.length > 0) {
      const lastAdrenaline = adrenalineActions.reduce((prev, curr) =>
          parseTimestamp(curr.executed_at) > parseTimestamp(prev.executed_at) ? curr : prev
      )
      const adElapsed = lastAdrenaline.executed_at
          ? Math.floor((Date.now() - parseTimestamp(lastAdrenaline.executed_at)) / 1000)
          : 0
      startAdrenalineTimer(adElapsed)
    }

    const sessionEndMs = parseTimestamp(session.end_time)

    if (sessionEndMs) {
      sessionEnded.value = true
      clearTimers()

      if (sessionStartMs) {
        const duration = Math.floor((sessionEndMs - sessionStartMs) / 1000)
        sessionElapsed.value = duration > 0 ? duration : 0
      } else {
        sessionElapsed.value = 0
      }

      cycleElapsed.value = 0
      adrenalineElapsed.value = 0

    } else {
      const sElapsed = sessionStartMs
          ? Math.floor((Date.now() - sessionStartMs) / 1000)
          : 0
      startSessionTimer(sElapsed)

    }

    // ----------------------------------------------------------------

  } catch (err) {
    console.error('Error carregant sessió:', err)
  } finally {
    loading.value = false
  }

  channel.subscribed(() => console.log(`✅ Subscrits a session.${sessionId}`))

  channel.listen('.actionregistered', (event) => {
    const executedMs = firstValidTimestamp(event.executed_at, event.started_at, event.created_at)
    const executedIso = executedMs ? new Date(executedMs).toISOString() : (event.executed_at ?? new Date().toISOString())

    if (!actions.value.find(a => String(a.id) === String(event.id))) {
      const resolved = resolveCycleData(event.cycle_id)
      const newAction = {
        id: event.id,
        type: event.type,
        executed_at: executedIso,
        session_id: event.session_id,
        value: event.value || null,
        isCycle: false,
        cycle_number: event.cycle_number ?? resolved.cycle_number,
        cycle_rhythm_type: event.cycle_rhythm_type ?? resolved.cycle_rhythm_type
      }
      actions.value.push(newAction)
      actions.value.sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))

      // Només adrenalina toca el timer
      if (String(event.type || '').toLowerCase().includes('adrenaline') ||
          String(event.type || '').toLowerCase().includes('adrenalina')) {
        startAdrenalineTimerFromMs(executedMs ?? event.executed_at)
      }

      scrollToBottom()
    }
  })

  channel.listen('.cyclestarted', (event) => {
    const startMs = firstValidTimestamp(event.started_at, event.start_time, event.executed_at, event.created_at)
    const executed_at_iso = startMs ? new Date(startMs).toISOString() : (event.executed_at ?? new Date().toISOString())

    actions.value.push({
      id: `cycle-${event.id}`,
      type: `Canvi de cicle: ${event.number}, ${event.rhythm_type || ''}`.trim(),
      executed_at: executed_at_iso,
      session_id: event.session_id,
      cycle_number: event.number,
      isCycle: true
    })

    currentCycle.value = {number: event.number, rhythm_type: event.rhythm_type}

    const cElapsed = startMs ? Math.floor((Date.now() - startMs) / 1000) : 0
    startCycleTimer(cElapsed)

    actions.value.sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))
    scrollToBottom()
  })

  channel.error(error => console.error('❌ Error al canal:', error))
})

</script>

<style>
.intense-blink {
  animation: blink 1s steps(2, start) infinite;
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}

.image-modal::part(backdrop) {
  background: rgba(0,0,0,0.6);
}

.image-modal::part(content) {
  width: 95vw;        /* mida màxima */
  height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
}



</style>
