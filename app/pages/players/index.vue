<template>
  <div class="min-h-screen bg-slate-950 safe-top safe-bottom">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-white">Players</h1>
            <p class="text-sm text-slate-400 mt-1">
              {{ playerCount }} {{ playerCount === 1 ? 'player' : 'players' }}
            </p>
          </div>
          <UiButton
            variant="primary"
            size="md"
            @click="showCreateModal = true"
          >
            + Add Player
          </UiButton>
        </div>

        <!-- Search -->
        <div v-if="hasPlayers" class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search players..."
            class="w-full px-4 py-3 pl-10 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- Loading State -->
      <div v-if="loading && !hasPlayers" class="card text-center py-12">
        <div class="inline-block animate-spin text-4xl mb-4">⟳</div>
        <p class="text-slate-400">Loading players...</p>
      </div>

      <!-- Player List -->
      <PlayerList
        v-else
        :players="filteredPlayers"
        show-actions
        @player-click="navigateToPlayer"
        @edit="handleEdit"
        @delete="handleDeleteClick"
      >
        <template #empty-action>
          <UiButton
            variant="primary"
            @click="showCreateModal = true"
          >
            Create First Player
          </UiButton>
        </template>
      </PlayerList>
    </div>

    <!-- Create Player Modal -->
    <UiModal
      :is-open="showCreateModal"
      title="Create New Player"
      @close="showCreateModal = false"
    >
      <PlayerForm
        submit-label="Create Player"
        show-cancel
        @submit="handleCreate"
        @cancel="showCreateModal = false"
      />
    </UiModal>

    <!-- Edit Player Modal -->
    <UiModal
      :is-open="showEditModal"
      title="Edit Player"
      @close="closeEditModal"
    >
      <PlayerForm
        v-if="editingPlayer"
        :initial-data="editingPlayer"
        submit-label="Update Player"
        show-cancel
        @submit="handleUpdate"
        @cancel="closeEditModal"
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
          Are you sure you want to delete <strong class="text-white">{{ deletingPlayer?.name }}</strong>?
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

    <!-- Back Button -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2">
      <UiButton
        variant="secondary"
        @click="navigateTo('/')"
      >
        ← Back to Home
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player, PlayerFormData } from '~/types/player'

useHead({
  title: 'Players'
})

const playersStore = usePlayersStore()
const { players, loading, playerCount, hasPlayers } = storeToRefs(playersStore)

// Search
const searchQuery = ref('')
const filteredPlayers = computed(() => {
  if (!searchQuery.value.trim()) {
    return players.value
  }
  return playersStore.searchPlayers(searchQuery.value)
})

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingPlayer = ref<Player | null>(null)
const deletingPlayer = ref<Player | null>(null)
const deleting = ref(false)

// Load players on mount
onMounted(async () => {
  await playersStore.loadPlayers()
})

// Create player
const handleCreate = async (data: PlayerFormData) => {
  try {
    await playersStore.createPlayer(data)
    showCreateModal.value = false
  } catch (error) {
    console.error('Failed to create player:', error)
  }
}

// Edit player
const handleEdit = (player: Player) => {
  editingPlayer.value = player
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingPlayer.value = null
}

const handleUpdate = async (data: PlayerFormData) => {
  if (!editingPlayer.value) return

  try {
    await playersStore.updatePlayer(editingPlayer.value.id, data)
    closeEditModal()
  } catch (error) {
    console.error('Failed to update player:', error)
  }
}

// Delete player
const handleDeleteClick = (player: Player) => {
  deletingPlayer.value = player
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletingPlayer.value) return

  deleting.value = true
  try {
    await playersStore.deletePlayer(deletingPlayer.value.id)
    showDeleteModal.value = false
    deletingPlayer.value = null
  } catch (error) {
    console.error('Failed to delete player:', error)
  } finally {
    deleting.value = false
  }
}

// Navigation
const navigateToPlayer = (player: Player) => {
  navigateTo(`/players/${player.id}`)
}
</script>
