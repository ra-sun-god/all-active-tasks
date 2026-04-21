<script setup lang="ts">
import { NotificationProgress } from 'notivue';

</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
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
