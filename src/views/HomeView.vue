<template>
  <IonPage>
    <IonContent class="bg-gray-100 p-6">
      <div class="flex flex-col items-center justify-center h-full">
        <!-- Botó iniciar aturada -->
        <IonButton
            expand="block"
            fill="clear"
            class="w-64 py-4 text-lg font-semibold rounded-2xl shadow mb-6 bg-red-500 hover:bg-red-600 text-white"
            @click="$router.push({ name: 'Actions' })"
        >
          Iniciar Aturada
        </IonButton>

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
