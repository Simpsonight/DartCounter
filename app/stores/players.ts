import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { Player, PlayerFormData, PlayerStats } from '~/types/player'

export const usePlayersStore = defineStore('players', () => {
  const players = ref<Player[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { add, put, get, getAll, remove } = useIndexedDB()

  // Load all players from IndexedDB
  const loadPlayers = async () => {
    loading.value = true
    error.value = null
    try {
      const allPlayers = await getAll('players')
      // Sort by most recently updated
      players.value = allPlayers.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    } catch (e) {
      error.value = 'Failed to load players'
      console.error('Error loading players:', e)
    } finally {
      loading.value = false
    }
  }

  // Get a single player by ID
  const getPlayer = async (id: string): Promise<Player | undefined> => {
    try {
      return await get('players', id)
    } catch (e) {
      console.error('Error getting player:', e)
      return undefined
    }
  }

  // Create a new player
  const createPlayer = async (data: PlayerFormData): Promise<Player> => {
    loading.value = true
    error.value = null

    try {
      const newPlayer: Player = {
        id: uuidv4(),
        name: data.name.trim(),
        avatar: data.avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          totalDarts: 0,
          totalScore: 0,
          averageScore: 0,
          highestCheckout: 0,
          checkoutPercentage: 0
        }
      }

      await add('players', newPlayer)
      players.value.unshift(newPlayer)

      return newPlayer
    } catch (e) {
      error.value = 'Failed to create player'
      console.error('Error creating player:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update an existing player
  const updatePlayer = async (id: string, data: Partial<PlayerFormData>): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const player = await get('players', id)
      if (!player) {
        throw new Error('Player not found')
      }

      const updatedPlayer: Player = {
        ...player,
        name: data.name?.trim() ?? player.name,
        avatar: data.avatar ?? player.avatar,
        updatedAt: new Date()
      }

      await put('players', updatedPlayer)

      const index = players.value.findIndex(p => p.id === id)
      if (index !== -1) {
        players.value[index] = updatedPlayer
      }
    } catch (e) {
      error.value = 'Failed to update player'
      console.error('Error updating player:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update player statistics
  const updatePlayerStats = async (id: string, stats: Partial<PlayerStats>): Promise<void> => {
    try {
      const player = await get('players', id)
      if (!player) {
        throw new Error('Player not found')
      }

      const updatedPlayer: Player = {
        ...player,
        stats: {
          ...player.stats,
          ...stats
        },
        updatedAt: new Date()
      }

      await put('players', updatedPlayer)

      const index = players.value.findIndex(p => p.id === id)
      if (index !== -1) {
        players.value[index] = updatedPlayer
      }
    } catch (e) {
      console.error('Error updating player stats:', e)
      throw e
    }
  }

  // Delete a player
  const deletePlayer = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await remove('players', id)
      players.value = players.value.filter(p => p.id !== id)
    } catch (e) {
      error.value = 'Failed to delete player'
      console.error('Error deleting player:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Search players by name
  const searchPlayers = (query: string): Player[] => {
    if (!query.trim()) {
      return players.value
    }

    const lowerQuery = query.toLowerCase().trim()
    return players.value.filter(player =>
      player.name.toLowerCase().includes(lowerQuery)
    )
  }

  // Get top players by wins
  const getTopPlayers = (limit = 10): Player[] => {
    return [...players.value]
      .sort((a, b) => b.stats.gamesWon - a.stats.gamesWon)
      .slice(0, limit)
  }

  // Getters
  const playerCount = computed(() => players.value.length)
  const hasPlayers = computed(() => players.value.length > 0)

  return {
    // State
    players,
    loading,
    error,

    // Computed
    playerCount,
    hasPlayers,

    // Actions
    loadPlayers,
    getPlayer,
    createPlayer,
    updatePlayer,
    updatePlayerStats,
    deletePlayer,
    searchPlayers,
    getTopPlayers
  }
})
