<script setup lang="ts">
import { NotificationProgress } from 'notivue';
import { useAuth } from "./composables/useAuth"

onBeforeMount(async()=>{
  await useAuth().fetchUser()
})
</script>

<template>
  <div>
    <!--<NuxtRouteAnnouncer />-->
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <Notivue v-slot="item">
    <NotivueSwipe :item="item">
      <Notification :item="item">
        <NotificationProgress :item="item" />
      </Notification>
    </NotivueSwipe>
  </Notivue>
</template>
