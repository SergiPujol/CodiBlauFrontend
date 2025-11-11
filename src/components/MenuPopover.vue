<template>
  <ion-content class="p-0">
    <ion-list class="p-0 menu-list">
      <ion-item button @click="selectAlgorithm('shockable')">Desfibril·lable</ion-item>
      <ion-item button @click="selectAlgorithm('non_shockable')">No desfibril·lable</ion-item>
    </ion-list>

    <ion-modal
        :is-open="selectedImage !== null"
        @didDismiss="selectedImage = null"
        :initial-breakpoint="1"
        :breakpoints="[1]"
    >
      <ion-content class="bg-black flex items-center justify-center">
        <img
            :src="selectedImage"
            class="w-full h-full object-contain"
            alt="algorisme"
        />
      </ion-content>
    </ion-modal>

  </ion-content>
</template>

<script setup>
import { ref } from 'vue'
import { popoverController } from '@ionic/vue'

const selectedImage = ref(null)

const selectAlgorithm = async (type) => {
  selectedImage.value = type === 'shockable'
      ? '/images/alritme desfibril·Lable.jpg'
      : '/images/algoritme no desfibril·lable.jpg'

  const popover = await popoverController.getTop()
  if (popover) await popover.dismiss()
}
</script>

<style scoped>
.menu-list {
  --padding-start: 0;
  --padding-end: 0;
}

ion-item {
  --padding-start: 12px;
  --inner-padding-end: 12px;
  --min-height: 42px;
}
</style>
