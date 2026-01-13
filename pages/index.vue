<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6">
    <div class="card max-w-md w-full text-center space-y-6">
      <div>
        <h1 class="text-4xl font-bold text-primary-400 mb-2">
          🎯 Dart Counter
        </h1>
        <p class="text-slate-400">
          Professional dart scoring app
        </p>
      </div>

      <div class="space-y-3">
        <UiButton variant="primary" full-width @click="navigateTo('/game/new')">
          New Game
        </UiButton>
        <UiButton variant="secondary" full-width @click="navigateTo('/players')">
          Players
        </UiButton>
        <UiButton variant="secondary" full-width @click="navigateTo('/history')">
          Match History
        </UiButton>
      </div>

      <div class="pt-6 border-t border-slate-800">
        <p class="text-sm text-slate-500">
          Phase 1: Project Setup ✓<br>
          Phase 2: Player Management ✓
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Home'
})
</script>
