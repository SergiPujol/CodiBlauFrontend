<template>
  <IonPage>
    <IonContent class="bg-gray-100 p-6">
      <div class="flex flex-col items-center justify-center h-full">
        <img
            src="/src/assets/logo-hospital-trueta.svg"
            alt="Logo Trueta"
            class="w-56 mb-10"
        />
        <IonButton
            expand="block"
            fill="clear"
            class="w-64 py-4 text-lg font-semibold rounded-2xl shadow mb-6
         bg-gray-300 hover:bg-gray-400 text-gray-900 transition"
            @click="$router.push({ name: 'Actions' })"
        >
          Iniciar Aturada
        </IonButton>
        <IonButton
            expand="block"
            fill="clear"
            class="w-64 py-4 text-lg font-semibold rounded-2xl shadow
         bg-gray-300 hover:bg-gray-400 text-gray-900 transition"
            @click="$router.push({ name: 'SessionList' })"
        >
          Llista d'aturades
        </IonButton>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { IonPage, IonContent, IonButton } from '@ionic/vue'
</script>
