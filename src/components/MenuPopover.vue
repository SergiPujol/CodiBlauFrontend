<template>
  <ion-content>
    <ion-list>
      <template v-if="!showAlgorithmSubmenu">
        <ion-item button @click="showAlgorithmSubmenu = true">Algorismes</ion-item>
        <ion-item button @click="showInfo">Informació</ion-item>
      </template>

      <template v-else>
        <ion-item button @click="selectAlgorithm('desfibrillable')">Desfibril·lable</ion-item>
        <ion-item button @click="selectAlgorithm('no_desfibrillable')">No desfibril·lable</ion-item>
        <ion-item button @click="showAlgorithmSubmenu = false">Enrere</ion-item>
      </template>
    </ion-list>
  </ion-content>
</template>

<script setup>
import { ref } from 'vue'
import { popoverController } from '@ionic/vue'

const showAlgorithmSubmenu = ref(false)

const showInfo = async () => {
  console.log('Mostrar informació')
  const popover = await popoverController.getTop()
  if (popover) await popover.dismiss()
}

const selectAlgorithm = async (type) => {
  console.log('Algorisme seleccionat:', type)
  const popover = await popoverController.getTop()
  if (popover) await popover.dismiss()
}
</script>
