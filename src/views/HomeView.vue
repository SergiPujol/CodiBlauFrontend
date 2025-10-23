<template>
  <IonPage>
    <IonContent class="bg-gray-100 p-6">
      <div class="flex flex-col items-center justify-center h-full">
        <img
            src="/src/assets/logo-hospital-trueta.svg"
            alt="Logo Trueta"
            class="w-56 mb-10"
        />

        <!-- 🔹 Botó iniciar aturada -->
        <IonButton
            expand="block"
            fill="clear"
            class="w-64 py-4 text-lg font-semibold rounded-2xl shadow mb-6 bg-red-500 hover:bg-red-600 text-white"
            @click="$router.push({ name: 'Actions' })"
        >
          Iniciar Aturada
        </IonButton>

        <!-- 🔹 Botó llista d'aturades -->
        <IonButton
            expand="block"
            fill="clear"
            class="w-64 py-4 text-lg font-semibold rounded-2xl shadow bg-blue-500 hover:bg-blue-600 text-white"
            @click="$router.push({ name: 'SessionList' })"
        >
          Llista d'aturades actives
        </IonButton>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { IonPage, IonContent, IonButton } from '@ionic/vue'
</script>
