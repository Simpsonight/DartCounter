<template>
  <div class="min-h-screen bg-slate-950 safe-top safe-bottom">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin text-4xl mb-4">⟳</div>
        <p class="text-slate-400">Loading player...</p>
      </div>
    </div>

    <!-- Player Not Found -->
    <div v-else-if="!player" class="flex items-center justify-center min-h-screen">
      <div class="card text-center max-w-md">
        <div class="text-6xl mb-4">🤷</div>
        <h2 class="text-2xl font-bold text-white mb-2">Player Not Found</h2>
        <p class="text-slate-400 mb-6">
          This player doesn't exist or has been deleted.
        </p>
        <UiButton variant="primary" @click="navigateTo('/players')">
          Back to Players
        </UiButton>
      </div>
    </div>

    <!-- Player Details -->
    <div v-else>
      <!-- Header -->
      <div class="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div class="max-w-2xl mx-auto px-4 py-8">
          <div class="flex items-start gap-6">
            <!-- Avatar -->
            <PlayerAvatar
              :name="player.name"
              :avatar="player.avatar"
              size="xl"
            />

            <!-- Info -->
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-white mb-2">{{ player.name }}</h1>
              <p class="text-slate-400 text-sm mb-4">
                Member since {{ formatDate(player.createdAt) }}
              </p>

              <!-- Quick Actions -->
              <div class="flex gap-2">
                <UiButton
                  variant="secondary"
                  size="sm"
                  @click="showEditModal = true"
                >
                  Edit Profile
                </UiButton>
                <UiButton
                  variant="danger"
                  size="sm"
                  @click="showDeleteModal = true"
                >
                  Delete
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="sticky top-0 z-10 bg-slate-950 border-b border-slate-800">
        <div class="max-w-2xl mx-auto px-4">
          <div class="flex">
            <button
              @click="activeTab = 'stats'"
              class="flex-1 py-3 text-center font-medium transition-colors border-b-2"
              :class="activeTab === 'stats'
                ? 'text-primary-400 border-primary-400'
                : 'text-slate-400 border-transparent hover:text-white'"
            >
              Statistics
            </button>
            <button
              @click="activeTab = 'history'"
              class="flex-1 py-3 text-center font-medium transition-colors border-b-2"
              :class="activeTab === 'history'
                ? 'text-primary-400 border-primary-400'
                : 'text-slate-400 border-transparent hover:text-white'"
            >
              Match History
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="max-w-2xl mx-auto px-4 py-6 pb-24">
        <!-- Statistics Tab -->
        <div v-if="activeTab === 'stats'">
          <PlayerStats :player-id="playerId" />
        </div>

        <!-- Match History Tab -->
        <div v-else-if="activeTab === 'history'">
          <PlayerMatchHistory :player-id="playerId" :player-name="player.name" />
        </div>
      </div>

      <!-- Back Button -->
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2">
        <UiButton variant="secondary" @click="navigateTo('/players')">
          ← Back to Players
        </UiButton>
      </div>
    </div>

    <!-- Edit Modal -->
    <UiModal
      :is-open="showEditModal"
      title="Edit Player"
      @close="showEditModal = false"
    >
      <PlayerForm
        v-if="player"
        :initial-data="player"
        submit-label="Update Player"
        show-cancel
        @submit="handleUpdate"
        @cancel="showEditModal = false"
      />
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal
      :is-open="showDeleteModal"
      title="Delete Player"
      @close="showDeleteModal = false"
    >
      <div class="space-y-4">
        <p class="text-slate-300">
          Are you sure you want to delete <strong class="text-white">{{ player?.name }}</strong>?
        </p>
        <p class="text-sm text-slate-400">
          This will permanently delete all data for this player. This action cannot be undone.
        </p>

        <div class="flex gap-3 pt-2">
          <UiButton
            variant="danger"
            :loading="deleting"
            @click="confirmDelete"
            full-width
          >
            Delete Player
          </UiButton>
          <UiButton
            variant="ghost"
            :disabled="deleting"
            @click="showDeleteModal = false"
          >
            Cancel
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { PlayerFormData } from '~/types/player'

// Lazy load heavy components for better initial load performance
const PlayerStats = defineAsyncComponent({
  loader: () => import('~/components/player/Stats.vue'),
  loadingComponent: {
    template: '<div class="text-center py-8"><div class="animate-spin text-4xl">⟳</div><p class="text-slate-400 mt-2">Loading statistics...</p></div>'
  }
})

const PlayerMatchHistory = defineAsyncComponent({
  loader: () => import('~/components/player/MatchHistory.vue'),
  loadingComponent: {
    template: '<div class="text-center py-8"><div class="animate-spin text-4xl">⟳</div><p class="text-slate-400 mt-2">Loading match history...</p></div>'
  }
})

const route = useRoute()
const playerId = route.params.id as string

const playersStore = usePlayersStore()
const player = ref(await playersStore.getPlayer(playerId))
const loading = ref(false)

// useHead must come after player is defined
useHead({
  title: () => player.value?.name || 'Player Details'
})

// Tabs
const activeTab = ref<'stats' | 'history'>('stats')

// Modals
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleting = ref(false)

// Format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Update player
const handleUpdate = async (data: PlayerFormData) => {
  try {
    await playersStore.updatePlayer(playerId, data)
    player.value = await playersStore.getPlayer(playerId)
    showEditModal.value = false
  } catch (error) {
    console.error('Failed to update player:', error)
  }
}

// Delete player
const confirmDelete = async () => {
  deleting.value = true
  try {
    await playersStore.deletePlayer(playerId)
    navigateTo('/players')
  } catch (error) {
    console.error('Failed to delete player:', error)
  } finally {
    deleting.value = false
  }
}
</script>
