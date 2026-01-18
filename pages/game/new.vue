<template>
  <div class="min-h-screen bg-slate-950 safe-top safe-bottom">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex items-center gap-4">
          <button
            @click="navigateTo('/')"
            class="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-white">New Game</h1>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 py-6">
      <div class="space-y-6">
        <!-- Step 1: Game Mode -->
        <div class="card">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">1</span>
            Select Game Mode
          </h2>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="mode in gameModes"
              :key="mode"
              @click="selectedMode = mode"
              :class="[
                'p-6 rounded-xl border-2 transition-all',
                selectedMode === mode
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              ]"
            >
              <div class="text-3xl font-bold text-white mb-1">{{ mode }}</div>
              <div class="text-xs text-slate-400">{{ getGameModeLabel(mode) }}</div>
            </button>
          </div>
        </div>

        <!-- Step 2: Select Players -->
        <div class="card">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">2</span>
            Select Players ({{ selectedPlayers.length }}/{{ MAX_PLAYERS }})
          </h2>

          <!-- Selected Players -->
          <div v-if="selectedPlayers.length > 0" class="space-y-2 mb-4">
            <div
              v-for="(player, index) in selectedPlayers"
              :key="player.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-slate-800"
            >
              <PlayerAvatar :name="player.name" :avatar="player.avatar" size="sm" />
              <div class="flex-1 min-w-0">
                <div class="text-white font-medium truncate">{{ player.name }}</div>
                <div class="text-xs text-slate-400">Player {{ index + 1 }}</div>
              </div>
              <button
                @click="removePlayer(player.id)"
                class="p-2 text-slate-400 hover:text-dart-red transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Add Player -->
          <div class="space-y-3">
            <!-- Quick Add from Existing -->
            <div v-if="availablePlayers.length > 0">
              <label class="block text-sm font-medium text-slate-300 mb-2">
                Add from existing players
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="player in availablePlayers.slice(0, 4)"
                  :key="player.id"
                  @click="addPlayer(player)"
                  :disabled="selectedPlayers.length >= MAX_PLAYERS"
                  class="flex items-center gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                >
                  <PlayerAvatar :name="player.name" :avatar="player.avatar" size="sm" />
                  <span class="text-white text-sm truncate flex-1">{{ player.name }}</span>
                </button>
              </div>
            </div>

            <!-- Create New Player -->
            <UiButton
              variant="secondary"
              full-width
              @click="showCreatePlayer = true"
              :disabled="selectedPlayers.length >= MAX_PLAYERS"
            >
              + Create New Player
            </UiButton>
          </div>

          <!-- Minimum Players Warning -->
          <div v-if="selectedPlayers.length < MIN_PLAYERS" class="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p class="text-sm text-amber-400">
              ⚠️ Select at least 1 player to start the game
            </p>
          </div>
        </div>

        <!-- Step 3: Game Settings -->
        <div class="card">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">3</span>
            Game Settings
          </h2>
          <div class="space-y-4">
            <!-- Double In -->
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="text-white font-medium">Double In</div>
                <div class="text-sm text-slate-400">Must hit a double to start scoring</div>
              </div>
              <input
                v-model="settings.doubleIn"
                type="checkbox"
                class="w-12 h-6 rounded-full appearance-none bg-slate-700 checked:bg-primary-600 relative cursor-pointer transition-colors
                       before:content-[''] before:absolute before:top-1 before:left-1 before:w-4 before:h-4 before:rounded-full before:bg-white before:transition-transform
                       checked:before:translate-x-6"
              />
            </label>

            <!-- Double Out -->
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="text-white font-medium">Double Out</div>
                <div class="text-sm text-slate-400">Must finish on a double (Standard rule)</div>
              </div>
              <input
                v-model="settings.doubleOut"
                type="checkbox"
                class="w-12 h-6 rounded-full appearance-none bg-slate-700 checked:bg-primary-600 relative cursor-pointer transition-colors
                       before:content-[''] before:absolute before:top-1 before:left-1 before:w-4 before:h-4 before:rounded-full before:bg-white before:transition-transform
                       checked:before:translate-x-6"
              />
            </label>

            <!-- Sets -->
            <div>
              <label class="block text-white font-medium mb-2">
                Sets (First to {{ Math.ceil(settings.sets / 2) }})
              </label>
              <div class="flex items-center gap-3">
                <button
                  v-for="setCount in [1, 3, 5]"
                  :key="setCount"
                  @click="settings.sets = setCount"
                  :class="[
                    'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                    settings.sets === setCount
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  ]"
                >
                  {{ setCount === 1 ? '1 Set' : `Best of ${setCount}` }}
                </button>
              </div>
              <p class="text-xs text-slate-500 mt-2">
                {{ settings.sets === 1 ? 'Single set game' : `First player to win ${Math.ceil(settings.sets / 2)} sets wins` }}
              </p>
            </div>

            <!-- Legs -->
            <div>
              <label class="block text-white font-medium mb-2">
                Legs per Set (First to {{ Math.ceil(settings.legs / 2) }})
              </label>
              <div class="flex items-center gap-3">
                <button
                  v-for="legCount in [1, 3, 5]"
                  :key="legCount"
                  @click="settings.legs = legCount"
                  :class="[
                    'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                    settings.legs === legCount
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  ]"
                >
                  {{ legCount === 1 ? '1 Leg' : `Best of ${legCount}` }}
                </button>
              </div>
              <p class="text-xs text-slate-500 mt-2">
                {{ settings.legs === 1 ? 'Single leg per set' : `First player to win ${Math.ceil(settings.legs / 2)} legs wins the set` }}
              </p>
            </div>
          </div>
        </div>

        <!-- Start Game Button -->
        <UiButton
          variant="primary"
          size="lg"
          full-width
          @click="startGame"
          :disabled="!canStartGame"
        >
          Start Game
        </UiButton>
      </div>
    </div>

    <!-- Create Player Modal -->
    <UiModal
      :is-open="showCreatePlayer"
      title="Create New Player"
      @close="showCreatePlayer = false"
    >
      <PlayerForm
        submit-label="Create & Add Player"
        show-cancel
        @submit="handleCreatePlayer"
        @cancel="showCreatePlayer = false"
      />
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { GameMode } from '~/types/game'
import type { Player, PlayerFormData } from '~/types/player'
import { MIN_PLAYERS, MAX_PLAYERS, GAME_MODES } from '~/utils/constants'

useHead({
  title: 'New Game'
})

const playersStore = usePlayersStore()
const settingsStore = useSettingsStore()
const { players } = storeToRefs(playersStore)

// Game setup state - initialize with defaults, will be updated from settings
const selectedMode = ref<GameMode>('501')
const selectedPlayers = ref<Player[]>([])
const settings = reactive({
  doubleIn: false,
  doubleOut: true,
  sets: 1,
  legs: 1
})
const showCreatePlayer = ref(false)

// Available game modes
const gameModes: GameMode[] = ['301', '501', '701']

// Load players and settings on mount
onMounted(async () => {
  await Promise.all([
    playersStore.loadPlayers(),
    settingsStore.loadSettings()
  ])

  // Apply user's default settings
  selectedMode.value = settingsStore.settings.defaultGameMode
  settings.doubleIn = settingsStore.settings.defaultDoubleIn
  settings.doubleOut = settingsStore.settings.defaultDoubleOut
  settings.sets = settingsStore.settings.defaultSets
  settings.legs = settingsStore.settings.defaultLegs
})

// Available players (not yet selected)
const availablePlayers = computed(() => {
  return players.value.filter(
    p => !selectedPlayers.value.find(sp => sp.id === p.id)
  )
})

// Can start game validation
const canStartGame = computed(() => {
  return selectedPlayers.value.length >= MIN_PLAYERS &&
         selectedPlayers.value.length <= MAX_PLAYERS
})

// Get game mode label
const getGameModeLabel = (mode: GameMode): string => {
  const labels: Record<GameMode, string> = {
    '301': 'Quick',
    '501': 'Standard',
    '701': 'Long'
  }
  return labels[mode]
}

// Add player to game
const addPlayer = (player: Player) => {
  if (selectedPlayers.value.length >= MAX_PLAYERS) {
    return
  }
  if (!selectedPlayers.value.find(p => p.id === player.id)) {
    selectedPlayers.value.push(player)
  }
}

// Remove player from game
const removePlayer = (playerId: string) => {
  selectedPlayers.value = selectedPlayers.value.filter(p => p.id !== playerId)
}

// Create new player and add to game
const handleCreatePlayer = async (data: PlayerFormData) => {
  try {
    const newPlayer = await playersStore.createPlayer(data)
    addPlayer(newPlayer)
    showCreatePlayer.value = false
  } catch (error) {
    console.error('Failed to create player:', error)
  }
}

// Start the game
const startGame = async () => {
  if (!canStartGame.value) {
    return
  }

  try {
    const gameStore = useGameStore()
    console.log('Creating game with:', {
      mode: selectedMode.value,
      playerCount: selectedPlayers.value.length,
      settings
    })

    const game = await gameStore.createGame(
      selectedMode.value,
      selectedPlayers.value,
      settings
    )

    console.log('Game created successfully:', game.id)
    // Navigate to the game
    navigateTo(`/game/${game.id}`)
  } catch (error) {
    console.error('Failed to create game - Full error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    alert(`Failed to create game: ${errorMessage}\n\nCheck browser console for details.`)
  }
}
</script>
