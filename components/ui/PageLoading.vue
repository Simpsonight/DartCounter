<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center">
    <UiLoadingSpinner :text="text" size="lg" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: 'Loading...'
})
</script>
