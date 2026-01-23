import type { Match, MatchSummary, MatchFilter } from '~/types/match'

export const useMatchHistory = () => {
  const { getAll, get, remove: removeFromDb } = useIndexedDB()

  /**
   * Get all matches from history
   */
  const getAllMatches = async (): Promise<Match[]> => {
    try {
      const matches = await getAll<Match>('matches')
      // Sort by completion date (newest first)
      return matches.sort((a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )
    } catch (error) {
      console.error('Failed to load matches:', error)
      return []
    }
  }

  /**
   * Get a single match by ID
   */
  const getMatch = async (matchId: string): Promise<Match | null> => {
    try {
      return await get<Match>('matches', matchId)
    } catch (error) {
      console.error('Failed to load match:', error)
      return null
    }
  }

  /**
   * Get match summaries (lighter weight for list view)
   * @param excludeTraining - If true, excludes solo games (training sessions)
   */
  const getMatchSummaries = async (excludeTraining = false): Promise<MatchSummary[]> => {
    try {
      let matches = await getAllMatches()

      // Filter out training sessions (solo games with 1 player)
      if (excludeTraining) {
        matches = matches.filter(m => m.players.length > 1)
      }

      return matches.map(match => {
        const winner = match.players.find(p => p.playerId === match.winnerId)
        return {
          id: match.id,
          gameMode: match.gameMode,
          playerNames: match.players.map(p => p.playerName),
          winnerName: winner?.playerName || 'Unknown',
          duration: match.duration,
          completedAt: match.completedAt,
          isTraining: match.players.length === 1
        }
      })
    } catch (error) {
      console.error('Failed to load match summaries:', error)
      return []
    }
  }

  /**
   * Filter matches by criteria
   */
  const filterMatches = async (filter: MatchFilter): Promise<Match[]> => {
    try {
      let matches = await getAllMatches()

      if (filter.gameMode) {
        matches = matches.filter(m => m.gameMode === filter.gameMode)
      }

      if (filter.playerId) {
        matches = matches.filter(m =>
          m.players.some(p => p.playerId === filter.playerId)
        )
      }

      if (filter.startDate) {
        matches = matches.filter(m =>
          new Date(m.completedAt) >= filter.startDate!
        )
      }

      if (filter.endDate) {
        matches = matches.filter(m =>
          new Date(m.completedAt) <= filter.endDate!
        )
      }

      return matches
    } catch (error) {
      console.error('Failed to filter matches:', error)
      return []
    }
  }

  /**
   * Delete a match from history
   */
  const deleteMatch = async (matchId: string): Promise<void> => {
    try {
      await removeFromDb('matches', matchId)
    } catch (error) {
      console.error('Failed to delete match:', error)
      throw error
    }
  }

  /**
   * Get player statistics from match history
   */
  const getPlayerStats = async (playerId: string) => {
    try {
      const matches = await filterMatches({ playerId })

      const gamesPlayed = matches.length
      const gamesWon = matches.filter(m => m.winnerId === playerId).length

      let totalDarts = 0
      let totalScore = 0
      let totalCheckouts = 0
      let highestCheckout = 0

      for (const match of matches) {
        const playerData = match.players.find(p => p.playerId === playerId)
        if (playerData) {
          totalDarts += playerData.dartCount
          totalScore += (parseInt(match.gameMode) - playerData.finalScore)
          totalCheckouts += playerData.successfulCheckouts

          // Find highest checkout from turns
          const playerCheckoutTurns = match.turns.filter(
            t => t.playerId === playerId && t.isCheckout
          )
          for (const turn of playerCheckoutTurns) {
            highestCheckout = Math.max(highestCheckout, turn.totalScore)
          }
        }
      }

      const averageScore = totalDarts > 0 ? totalScore / (totalDarts / 3) : 0

      return {
        gamesPlayed,
        gamesWon,
        winRate: gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0,
        averageScore: Math.round(averageScore * 10) / 10,
        totalCheckouts,
        highestCheckout
      }
    } catch (error) {
      console.error('Failed to get player stats:', error)
      return null
    }
  }

  return {
    getAllMatches,
    getMatch,
    getMatchSummaries,
    filterMatches,
    deleteMatch,
    getPlayerStats
  }
}
