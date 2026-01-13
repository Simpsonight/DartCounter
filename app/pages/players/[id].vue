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

      <!-- Stats -->
      <div class="max-w-2xl mx-auto px-4 py-6">
        <h2 class="text-xl font-bold text-white mb-4">Statistics</h2>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <!-- Games Played -->
          <div class="card text-center">
            <div class="text-3xl font-bold text-primary-400 mb-1">
              {{ player.stats.gamesPlayed }}
            </div>
            <div class="text-sm text-slate-400">Games Played</div>
          </div>

          <!-- Games Won -->
          <div class="card text-center">
            <div class="text-3xl font-bold text-dart-green mb-1">
              {{ player.stats.gamesWon }}
            </div>
            <div class="text-sm text-slate-400">Games Won</div>
          </div>

          <!-- Win Rate -->
          <div class="card text-center">
            <div class="text-3xl font-bold text-dart-gold mb-1">
              {{ winRate }}%
            </div>
            <div class="text-sm text-slate-400">Win Rate</div>
          </div>

          <!-- Average Score -->
          <div class="card text-center">
            <div class="text-3xl font-bold text-white mb-1">
              {{ player.stats.averageScore.toFixed(1) }}
            </div>
            <div class="text-sm text-slate-400">Average Score</div>
          </div>

          <!-- Highest Checkout -->
          <div class="card text-center">
            <div class="text-3xl font-bold text-dart-red mb-1">
              {{ player.stats.highestCheckout }}
            </div>
            <div class="text-sm text-slate-400">Highest Checkout</div>
          </div>

          <!-- Checkout % -->
          <div class="card text-center">
            <div class="text-3xl font-bold text-primary-400 mb-1">
              {{ player.stats.checkoutPercentage.toFixed(0) }}%
            </div>
            <div class="text-sm text-slate-400">Checkout Success</div>
          </div>
        </div>

        <!-- Match History (Coming Soon) -->
        <div class="card text-center py-8 border-dashed">
          <div class="text-4xl mb-3">📊</div>
          <h3 class="text-lg font-semibold text-white mb-2">Match History</h3>
          <p class="text-sm text-slate-400">
            Match history will be available in Phase 6
          </p>
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

const route = useRoute()
const playerId = route.params.id as string

useHead({
  title: () => player.value?.name || 'Player Details'
})

const playersStore = usePlayersStore()
const player = ref(await playersStore.getPlayer(playerId))
const loading = ref(false)

// Modals
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleting = ref(false)

// Computed
const winRate = computed(() => {
  if (!player.value || player.value.stats.gamesPlayed === 0) {
    return 0
  }
  return Math.round((player.value.stats.gamesWon / player.value.stats.gamesPlayed) * 100)
})

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
