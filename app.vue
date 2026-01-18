<template>
  <div>
    <NuxtPage />
    <UiToastContainer />
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Dart Counter` : 'Dart Counter'
  }
})
</script>
