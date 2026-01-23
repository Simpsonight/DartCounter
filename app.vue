<template>
  <UiErrorBoundary>
    <Analytics />
    <NuxtPage />
    <UiToastContainer />
  </UiErrorBoundary>
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Dart Counter` : 'Dart Counter'
  }
})
</script>
