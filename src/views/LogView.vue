<template>
  <ion-page>
    <ion-header>
      <ion-toolbar :style="{ '--background': headerColor }">
        <ion-buttons slot="start">
          <ion-button fill="clear" color="black" @click="$router.back()">
            <ion-icon :icon="arrowBackOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Registre de la Sessió</ion-title>
        <ion-buttons slot="end" class="mr-3">
          <ion-button fill="solid" color="light" @click="showInfo = true">
            <ion-icon :icon="informationCircleOutline" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button v-if="sessionEnded" fill="solid" color="primary" @click="showConciliateAlert = true">
            Conciliar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-alert
        :is-open="showConciliateAlert"
        header="Introdueix el pacient"
        :inputs="[{ name: 'patientName', type: 'text', placeholder: 'Nom del pacient' }]"
        :buttons="[
        { text: 'Cancel·lar', role: 'cancel', handler: () => showConciliateAlert = false },
        { text: 'Acceptar', handler: handlePatientName }
      ]"
    />

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

    <ion-content class="p-4">
      <div
          v-if="sessionEnded"
          class="w-full bg-red-100 text-red-800 text-center font-bold py-2 border-b border-red-300"
      >
        ⚠️ La sessió ha finalitzat
      </div>

      <!-- Contenidor principal -->
      <div class="flex h-[calc(100vh-56px)] w-full gap-4">
        <!-- 1r terç: llista de cicles -->
        <div class="flex justify-center">
          <div class="w-80 h-full flex flex-col bg-gray-50 rounded-lg shadow-inner p-4 overflow-y-auto">
            <ul class="space-y-2 text-sm">
              <li
                  v-for="action in cycleLog"
                  :key="action.id"
                  class="p-2 rounded shadow-sm font-bold"
                  :class="action.isCycle
    ? (isShockable(action.cycle_rhythm_type)
        ? 'bg-blue-200 text-blue-900'
        : 'bg-red-200 text-red-900')
    : typeColors[action.type] || 'bg-white'"
              >
                <p>
                  {{ typeTranslations[action.type] || action.type }}
                  <span class="text-xs text-gray-600 ml-2">⏱️ {{ formatTime(action.executed_at) }}</span>
                </p>
              </li>
            </ul>
          </div>
        </div>

        <!-- 2n terç: rellotges i info -->
        <div class="flex-1 flex flex-col items-center justify-center px-8 min-h-[450px] gap-y-6">
          <!-- Ritme actual -->
          <div class="text-center mt-5"> <!-- menys marge superior -->
            <div
                class="text-4xl font-bold"
                :class="{
        'text-blue-500': isShockable(currentCycle?.rhythm_type),
        'text-red-500': !isShockable(currentCycle?.rhythm_type)
      }"
            >
              {{ currentCycle?.rhythm_type }}
            </div>
          </div>

          <!-- Rellotges -->
          <div class="grid grid-cols-3 gap-x-16 gap-y-8 justify-items-center text-center mx-auto">
            <!-- Sessió -->
            <div class="flex flex-col items-center">
              <h3 class="font-bold text-lg mb-4">Sessió</h3>
              <div class="relative w-40 h-40 scale-[1.4]">
                <svg class="transform -rotate-90 w-40 h-40">
                  <circle cx="78" cy="78" r="50" class="text-gray-300" stroke-width="10" fill="transparent" stroke="currentColor" />
                  <circle
                      cx="78"
                      cy="78"
                      r="50"
                      class="text-blue-500"
                      stroke-width="10"
                      fill="transparent"
                      stroke="currentColor"
                      stroke-dasharray="314"
                      :stroke-dashoffset="314 - (sessionElapsed / 3600) * 314"
                      stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center font-mono text-lg">
                  {{ formattedSessionTime }}
                </div>
              </div>
            </div>

            <!-- Cicle -->
            <div class="flex flex-col items-center">
              <h3 class="font-bold text-lg mb-4">Cicle</h3>
              <div class="relative w-40 h-40 scale-[1.4]" :class="{ 'intense-blink': cycleElapsed >= 100 }">
                <svg class="transform -rotate-90 w-40 h-40">
                  <circle cx="78" cy="78" r="50" class="text-gray-300" stroke-width="10" fill="transparent" stroke="currentColor" />
                  <circle
                      cx="78"
                      cy="78"
                      r="50"
                      class="text-green-500"
                      stroke-width="10"
                      fill="transparent"
                      stroke="currentColor"
                      stroke-dasharray="314"
                      :stroke-dashoffset="314 - (cycleElapsed / 120) * 314"
                      stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center font-mono text-lg">
                  {{ formattedCycleTime }}
                </div>
              </div>
            </div>

            <!-- Adrenalina -->
            <div class="flex flex-col items-center">
              <h3 class="font-bold text-lg mb-4">Adrenalina</h3>
              <div class="relative w-40 h-40 scale-[1.4]" :class="{ 'intense-blink': adrenalineElapsed >= 220 }">
                <svg class="transform -rotate-90 w-40 h-40">
                  <circle cx="78" cy="78" r="50" class="text-gray-300" stroke-width="10" fill="transparent" stroke="currentColor" />
                  <circle
                      cx="78"
                      cy="78"
                      r="50"
                      class="text-red-500"
                      stroke-width="10"
                      fill="transparent"
                      stroke="currentColor"
                      stroke-dasharray="314"
                      :stroke-dashoffset="314 - (adrenalineElapsed / 240) * 314"
                      stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center font-mono text-lg">
                  {{ formattedAdrenalineTime }}
                </div>
              </div>
            </div>
          </div>

          <!-- Info cicle -->
          <div class="mb-4 text-center">
            <div class="text-sm mt-4 text-gray-500">Cicle actual: {{ currentCycle?.number }}</div>
            <div class="text-sm mt-4 text-gray-500">Sessió #{{ sessionNumber }}</div>
            <img
                v-if="sessionNumber"
                src="/src/assets/logo-hospital-trueta.svg"
                alt="Logo Trueta"
                class="mx-auto mt-4 h-8 w-auto opacity-80"
            />
          </div>
        </div>

        <!-- 3r terç: registre -->
        <div ref="logContainer" class="w-80 bg-gray-50 rounded-lg shadow-inner p-4 overflow-y-auto">
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
                class="p-2 rounded shadow-sm font-bold"
                :class="action.isCycle
    ? (isShockable(action.cycle_rhythm_type)
        ? 'bg-blue-200 text-blue-900'
        : 'bg-red-200 text-red-900')
    : typeColors[action.type] || 'bg-white'"
            >
              <p v-if="action.isCycle">
                {{ action.type }}
                <span class="text-xs text-gray-600 ml-2">⏱️ {{ formatTime(action.executed_at) }}</span>
              </p>

              <template v-else>
                <p class="font-semibold">
                  {{ typeTranslations[action.type] || action.type }}
                  <span v-if="action.value" class="ml-1 text-gray-700">({{ action.value }})</span>
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
import {IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar} from '@ionic/vue'
import echo from '../echo'
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import api from "../axios"
import { IonModal } from "@ionic/vue";
import {arrowBackOutline, flash, informationCircleOutline} from "ionicons/icons"

const route = useRoute()
const router = useRouter()
const sessionId = route.params.id

const actions = ref([])
const loading = ref(true)
const logContainer = ref(null)
const sessionNumber = ref('--')
const currentCycle = ref(null)
const showInfo = ref(false)
const showConciliateAlert = ref(false)

const sessionElapsed = ref(0)
const cycleElapsed = ref(0)
const adrenalineElapsed = ref(0)
let sessionTimer = null, cycleTimer = null, adrenalineTimer = null

const CYCLE_DEFAULT_SECONDS = 120
const ADRENALINE_EXPIRE_SECONDS = 240

const sessionEnded = ref(false)

const headerColor = computed(() => {
  const mapping = {
    'FV': '#dbeafe',       // blau clar
    'TV SP': '#dbeafe',
    'Asistòlia': 'rgba(251,105,111,0.73)', // vermell clar
    'AESP': 'rgba(251,105,111,0.73)',
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

const shockableRhythms = ['FV', 'TV SP']

const isShockable = (rhythm) => {
  if (!rhythm) return false
  return shockableRhythms.some(r => rhythm.toLowerCase().includes(r.toLowerCase()))
}

function handlePatientName(inputs) {
  showConciliateAlert.value = false
  const name = inputs.patientName
  if (name) {
    alert(`Pacient introduït: ${name}`)
    // funció de conciliació
  }
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
  adrenaline: 'bg-orange-100 text-orange-800',
  'amiodarone 300': 'bg-purple-100 text-purple-800',
  'amiodarone 150': 'bg-purple-100 text-purple-800',
  defibrillation: 'bg-yellow-100 text-yellow-800',
  shock: 'bg-yellow-100 text-yellow-800',
  rosc: 'bg-teal-100 text-teal-800',
  other_medication: 'bg-gray-100 text-gray-700',
  event: 'bg-sky-100 text-sky-800',
  iv: 'bg-cyan-100 text-cyan-800',
  io: 'bg-cyan-100 text-cyan-800',
  iot: 'bg-cyan-100 text-cyan-800',
  supraglottic: 'bg-cyan-100 text-cyan-800',
  cardiocompressor: 'bg-indigo-100 text-indigo-800',
  capnograph: 'bg-indigo-100 text-indigo-800'
}

const cycleLog = computed(() => {
  return actions.value
      .filter(a =>
          a.isCycle ||
          ['adrenaline', 'shock'].includes((a.type || '').toLowerCase()) ||
          (a.type || '').toLowerCase().includes('adrenalina')
      )
      .sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at))
})


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
      isCycle: true,
      cycle_rhythm_type: c.rhythm_type
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
      isCycle: true,
      cycle_rhythm_type: event.rhythm_type
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
