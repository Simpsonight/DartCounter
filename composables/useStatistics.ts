import type { Match } from '~/types/match'
import type { Turn } from '~/types/score'
import type { GameMode } from '~/types/game'

/**
 * Professional dart statistics following PDC standards
 */
export interface DetailedPlayerStats {
  // Basic stats
  gamesPlayed: number
  gamesWon: number
  winRate: number

  // Scoring stats
  threeDartAverage: number      // PPD/PPR - Points per 3-dart round (most important stat)
  bestThreeDartAvg: number      // Best 3-dart average in a single match
  totalPointsScored: number
  totalDartsThrown: number

  // Turn/Round stats
  totalTurns: number
  averageDartsPerTurn: number   // Usually ~3, lower if busts
  oneEighties: number           // 180s hit
  oneFourtyPlus: number         // 140+ scores
  oneHundredPlus: number        // 100+ scores
  tonEighty: number             // Same as oneEighties (PDC term)

  // Checkout stats
  checkoutAttempts: number
  successfulCheckouts: number
  checkoutPercentage: number
  highestCheckout: number
  averageCheckout: number
  checkoutsByRange: {
    under50: number
    range50to80: number
    range81to100: number
    range101to130: number
    range131to170: number
  }

  // Bust stats
  totalBusts: number
  bustPercentage: number

  // Performance by game mode
  statsByMode: Record<GameMode, ModeStats>

  // Legs/Sets stats
  legsPlayed: number
  legsWon: number
  legWinRate: number
  setsPlayed: number
  setsWon: number
  setWinRate: number

  // First 9 darts (opening scoring power)
  firstNineAverage: number

  // Recent form (last 5 games)
  recentForm: ('W' | 'L')[]
  recentWinRate: number

  // Match history for charts
  matchHistory: MatchStatPoint[]
}

export interface ModeStats {
  gamesPlayed: number
  gamesWon: number
  winRate: number
  threeDartAverage: number
  highestCheckout: number
}

export interface MatchStatPoint {
  matchId: string
  date: Date
  gameMode: GameMode
  won: boolean
  threeDartAvg: number
  checkout: number | null
  opponent: string
}

/**
 * Calculate detailed statistics from match history
 */
export const useStatistics = () => {
  const { filterMatches } = useMatchHistory()

  /**
   * Calculate 3-dart average from turns
   */
  const calculateThreeDartAverage = (turns: Turn[], playerId: string): number => {
    const playerTurns = turns.filter(t => t.playerId === playerId && !t.isBust)

    if (playerTurns.length === 0) return 0

    let totalScore = 0
    let totalDarts = 0

    for (const turn of playerTurns) {
      totalScore += turn.totalScore
      totalDarts += turn.darts.length
    }

    // 3-dart average = (total score / total darts) * 3
    if (totalDarts === 0) return 0
    return (totalScore / totalDarts) * 3
  }

  /**
   * Calculate first 9 darts average (opening scoring)
   */
  const calculateFirstNineAverage = (turns: Turn[], playerId: string): number => {
    const playerTurns = turns
      .filter(t => t.playerId === playerId)
      .sort((a, b) => a.turnNumber - b.turnNumber)

    // Get first 3 turns (9 darts max)
    const firstThreeTurns = playerTurns.slice(0, 3)

    if (firstThreeTurns.length === 0) return 0

    let totalScore = 0
    let totalDarts = 0

    for (const turn of firstThreeTurns) {
      if (!turn.isBust) {
        totalScore += turn.totalScore
        totalDarts += turn.darts.length
      }
    }

    if (totalDarts === 0) return 0
    return (totalScore / totalDarts) * 3
  }

  /**
   * Count high scores (180s, 140+, 100+)
   */
  const countHighScores = (turns: Turn[], playerId: string) => {
    const playerTurns = turns.filter(t => t.playerId === playerId && !t.isBust)

    let oneEighties = 0
    let oneFourtyPlus = 0
    let oneHundredPlus = 0

    for (const turn of playerTurns) {
      if (turn.totalScore === 180) {
        oneEighties++
        oneFourtyPlus++
        oneHundredPlus++
      } else if (turn.totalScore >= 140) {
        oneFourtyPlus++
        oneHundredPlus++
      } else if (turn.totalScore >= 100) {
        oneHundredPlus++
      }
    }

    return { oneEighties, oneFourtyPlus, oneHundredPlus }
  }

  /**
   * Analyze checkout statistics
   */
  const analyzeCheckouts = (turns: Turn[], playerId: string) => {
    const checkoutTurns = turns.filter(
      t => t.playerId === playerId && t.isCheckout
    )

    const checkoutsByRange = {
      under50: 0,
      range50to80: 0,
      range81to100: 0,
      range101to130: 0,
      range131to170: 0
    }

    let totalCheckoutScore = 0

    for (const turn of checkoutTurns) {
      const score = turn.totalScore
      totalCheckoutScore += score

      if (score < 50) checkoutsByRange.under50++
      else if (score <= 80) checkoutsByRange.range50to80++
      else if (score <= 100) checkoutsByRange.range81to100++
      else if (score <= 130) checkoutsByRange.range101to130++
      else checkoutsByRange.range131to170++
    }

    return {
      checkoutsByRange,
      averageCheckout: checkoutTurns.length > 0 ? totalCheckoutScore / checkoutTurns.length : 0
    }
  }

  /**
   * Get comprehensive player statistics
   */
  const getDetailedPlayerStats = async (playerId: string): Promise<DetailedPlayerStats> => {
    const matches = await filterMatches({ playerId })

    // Initialize stats
    const stats: DetailedPlayerStats = {
      gamesPlayed: matches.length,
      gamesWon: 0,
      winRate: 0,
      threeDartAverage: 0,
      bestThreeDartAvg: 0,
      totalPointsScored: 0,
      totalDartsThrown: 0,
      totalTurns: 0,
      averageDartsPerTurn: 0,
      oneEighties: 0,
      oneFourtyPlus: 0,
      oneHundredPlus: 0,
      tonEighty: 0,
      checkoutAttempts: 0,
      successfulCheckouts: 0,
      checkoutPercentage: 0,
      highestCheckout: 0,
      averageCheckout: 0,
      checkoutsByRange: {
        under50: 0,
        range50to80: 0,
        range81to100: 0,
        range101to130: 0,
        range131to170: 0
      },
      totalBusts: 0,
      bustPercentage: 0,
      statsByMode: {
        '301': { gamesPlayed: 0, gamesWon: 0, winRate: 0, threeDartAverage: 0, highestCheckout: 0 },
        '501': { gamesPlayed: 0, gamesWon: 0, winRate: 0, threeDartAverage: 0, highestCheckout: 0 },
        '701': { gamesPlayed: 0, gamesWon: 0, winRate: 0, threeDartAverage: 0, highestCheckout: 0 }
      },
      legsPlayed: 0,
      legsWon: 0,
      legWinRate: 0,
      setsPlayed: 0,
      setsWon: 0,
      setWinRate: 0,
      firstNineAverage: 0,
      recentForm: [],
      recentWinRate: 0,
      matchHistory: []
    }

    if (matches.length === 0) return stats

    let totalThreeDartAvg = 0
    let totalFirstNineAvg = 0
    let matchAverages: number[] = []

    // Process each match
    for (const match of matches) {
      const playerData = match.players.find(p => p.playerId === playerId)
      if (!playerData) continue

      const won = match.winnerId === playerId
      if (won) stats.gamesWon++

      // Match history point
      const opponent = match.players.find(p => p.playerId !== playerId)
      const matchThreeDartAvg = calculateThreeDartAverage(match.turns, playerId)
      matchAverages.push(matchThreeDartAvg)

      const checkoutTurn = match.turns.find(
        t => t.playerId === playerId && t.isCheckout
      )

      stats.matchHistory.push({
        matchId: match.id,
        date: new Date(match.completedAt),
        gameMode: match.gameMode,
        won,
        threeDartAvg: Math.round(matchThreeDartAvg * 10) / 10,
        checkout: checkoutTurn?.totalScore || null,
        opponent: opponent?.playerName || 'Unknown'
      })

      // Accumulate totals
      stats.totalDartsThrown += playerData.dartCount
      stats.totalTurns += playerData.turnCount
      stats.checkoutAttempts += playerData.checkoutAttempts
      stats.successfulCheckouts += playerData.successfulCheckouts

      // Count high scores
      const highScores = countHighScores(match.turns, playerId)
      stats.oneEighties += highScores.oneEighties
      stats.oneFourtyPlus += highScores.oneFourtyPlus
      stats.oneHundredPlus += highScores.oneHundredPlus

      // Count busts
      const busts = match.turns.filter(t => t.playerId === playerId && t.isBust).length
      stats.totalBusts += busts

      // Checkouts analysis
      const checkoutAnalysis = analyzeCheckouts(match.turns, playerId)
      stats.checkoutsByRange.under50 += checkoutAnalysis.checkoutsByRange.under50
      stats.checkoutsByRange.range50to80 += checkoutAnalysis.checkoutsByRange.range50to80
      stats.checkoutsByRange.range81to100 += checkoutAnalysis.checkoutsByRange.range81to100
      stats.checkoutsByRange.range101to130 += checkoutAnalysis.checkoutsByRange.range101to130
      stats.checkoutsByRange.range131to170 += checkoutAnalysis.checkoutsByRange.range131to170

      // Highest checkout
      const matchHighestCheckout = match.turns
        .filter(t => t.playerId === playerId && t.isCheckout)
        .reduce((max, t) => Math.max(max, t.totalScore), 0)
      stats.highestCheckout = Math.max(stats.highestCheckout, matchHighestCheckout)

      // Best 3-dart average
      stats.bestThreeDartAvg = Math.max(stats.bestThreeDartAvg, matchThreeDartAvg)

      // First nine average
      const firstNine = calculateFirstNineAverage(match.turns, playerId)
      totalFirstNineAvg += firstNine

      // Total points scored
      const nonBustTurns = match.turns.filter(t => t.playerId === playerId && !t.isBust)
      const matchPointsScored = nonBustTurns.reduce((sum, t) => sum + t.totalScore, 0)
      stats.totalPointsScored += matchPointsScored
      totalThreeDartAvg += matchThreeDartAvg

      // Per mode stats
      const mode = match.gameMode
      stats.statsByMode[mode].gamesPlayed++
      if (won) stats.statsByMode[mode].gamesWon++
      stats.statsByMode[mode].highestCheckout = Math.max(
        stats.statsByMode[mode].highestCheckout,
        matchHighestCheckout
      )

      // Legs/Sets
      if (match.totalLegs && match.totalLegs > 1) {
        stats.legsPlayed += match.totalLegs
        // Estimate legs won (simplified - actual tracking would need per-leg data)
      }
      if (match.totalSets && match.totalSets > 1) {
        stats.setsPlayed += match.totalSets
        if (match.setsWon) {
          stats.setsWon += match.setsWon[playerId] || 0
        }
      }
    }

    // Calculate averages and percentages
    stats.winRate = stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed) * 100 : 0
    stats.threeDartAverage = matches.length > 0 ? totalThreeDartAvg / matches.length : 0
    stats.firstNineAverage = matches.length > 0 ? totalFirstNineAvg / matches.length : 0
    stats.averageDartsPerTurn = stats.totalTurns > 0 ? stats.totalDartsThrown / stats.totalTurns : 0
    stats.checkoutPercentage = stats.checkoutAttempts > 0
      ? (stats.successfulCheckouts / stats.checkoutAttempts) * 100 : 0
    stats.bustPercentage = stats.totalTurns > 0
      ? (stats.totalBusts / stats.totalTurns) * 100 : 0
    stats.tonEighty = stats.oneEighties

    // Average checkout
    stats.averageCheckout = stats.successfulCheckouts > 0
      ? stats.totalPointsScored / stats.successfulCheckouts : 0

    // Calculate per-mode averages
    for (const mode of ['301', '501', '701'] as GameMode[]) {
      const modeMatches = matches.filter(m => m.gameMode === mode)
      if (modeMatches.length > 0) {
        let modeAvgTotal = 0
        for (const match of modeMatches) {
          modeAvgTotal += calculateThreeDartAverage(match.turns, playerId)
        }
        stats.statsByMode[mode].threeDartAverage = modeAvgTotal / modeMatches.length
        stats.statsByMode[mode].winRate = stats.statsByMode[mode].gamesPlayed > 0
          ? (stats.statsByMode[mode].gamesWon / stats.statsByMode[mode].gamesPlayed) * 100 : 0
      }
    }

    // Leg/Set win rates
    stats.legWinRate = stats.legsPlayed > 0 ? (stats.legsWon / stats.legsPlayed) * 100 : 0
    stats.setWinRate = stats.setsPlayed > 0 ? (stats.setsWon / stats.setsPlayed) * 100 : 0

    // Recent form (last 5 games)
    const recentMatches = matches.slice(0, 5)
    stats.recentForm = recentMatches.map(m => m.winnerId === playerId ? 'W' : 'L')
    const recentWins = stats.recentForm.filter(f => f === 'W').length
    stats.recentWinRate = recentMatches.length > 0 ? (recentWins / recentMatches.length) * 100 : 0

    // Sort match history by date (newest first)
    stats.matchHistory.sort((a, b) => b.date.getTime() - a.date.getTime())

    // Round averages for display
    stats.threeDartAverage = Math.round(stats.threeDartAverage * 10) / 10
    stats.bestThreeDartAvg = Math.round(stats.bestThreeDartAvg * 10) / 10
    stats.firstNineAverage = Math.round(stats.firstNineAverage * 10) / 10
    stats.averageCheckout = Math.round(stats.averageCheckout * 10) / 10
    stats.winRate = Math.round(stats.winRate * 10) / 10
    stats.checkoutPercentage = Math.round(stats.checkoutPercentage * 10) / 10
    stats.bustPercentage = Math.round(stats.bustPercentage * 10) / 10

    return stats
  }

  /**
   * Get chart data for player performance over time
   */
  const getPerformanceChartData = async (playerId: string, limit: number = 20) => {
    const stats = await getDetailedPlayerStats(playerId)

    // Get last N matches, reversed for chronological order
    const chartMatches = stats.matchHistory.slice(0, limit).reverse()

    return {
      labels: chartMatches.map(m =>
        new Date(m.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
      ),
      averages: chartMatches.map(m => m.threeDartAvg),
      results: chartMatches.map(m => m.won ? 1 : 0),
      checkouts: chartMatches.map(m => m.checkout || 0)
    }
  }

  /**
   * Compare two players head-to-head
   */
  const getHeadToHead = async (player1Id: string, player2Id: string) => {
    const { getAllMatches } = useMatchHistory()
    const allMatches = await getAllMatches()

    const h2hMatches = allMatches.filter(m =>
      m.players.some(p => p.playerId === player1Id) &&
      m.players.some(p => p.playerId === player2Id)
    )

    const player1Wins = h2hMatches.filter(m => m.winnerId === player1Id).length
    const player2Wins = h2hMatches.filter(m => m.winnerId === player2Id).length

    return {
      totalMatches: h2hMatches.length,
      player1Wins,
      player2Wins,
      matches: h2hMatches
    }
  }

  return {
    getDetailedPlayerStats,
    getPerformanceChartData,
    getHeadToHead,
    calculateThreeDartAverage,
    calculateFirstNineAverage
  }
}
