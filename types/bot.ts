/**
 * Bot Player Types and Configurations
 *
 * Defines difficulty levels and behavior parameters for AI opponents.
 * Hit rates are calibrated to produce realistic 3-dart averages.
 */

export type BotDifficulty = 'easy' | 'medium' | 'pro';

/**
 * Configuration for bot behavior at each difficulty level
 */
export interface BotConfig {
  name: string; // Display name (e.g., "Anfänger Bot")
  difficulty: BotDifficulty;
  averageRange: [number, number]; // Expected 3-dart average range
  trebleHitRate: number; // Probability of hitting intended treble (0-1)
  doubleHitRate: number; // Probability of hitting intended double (0-1)
  bullHitRate: number; // Probability of hitting bull (0-1)
  singleHitRate: number; // Probability of hitting intended single (0-1)
  missVariance: number; // How many segments away misses can land (1-3)
  thinkingDelayMs: [number, number]; // Min/max delay between darts for realism
}

/**
 * Predefined bot configurations for each difficulty level
 *
 * Hit rates are tuned to produce these approximate averages:
 * - Easy: 30-40 (pub player level)
 * - Medium: 45-60 (league player level)
 * - Pro: 85-105 (professional level)
 */
export const BOT_CONFIGS: Record<BotDifficulty, BotConfig> = {
  easy: {
    name: 'Anfänger Bot',
    difficulty: 'easy',
    averageRange: [30, 40],
    trebleHitRate: 0.05, // 5% chance to hit treble - very rare!
    doubleHitRate: 0.2, // 20% chance to hit doubles
    bullHitRate: 0.05, // 5% chance to hit bull
    singleHitRate: 0.6, // 60% chance to hit intended single
    missVariance: 3, // Can miss by up to 3 segments + complete misses
    thinkingDelayMs: [1000, 2000],
  },
  medium: {
    name: 'Mittel Bot',
    difficulty: 'medium',
    averageRange: [45, 60],
    trebleHitRate: 0.25, // 25% chance to hit trebles
    doubleHitRate: 0.35, // 35% chance to hit doubles
    bullHitRate: 0.2, // 20% chance to hit bull
    singleHitRate: 0.65, // 65% chance to hit intended single
    missVariance: 2, // Can miss by up to 2 segments
    thinkingDelayMs: [600, 1200],
  },
  pro: {
    name: 'Profi Bot',
    difficulty: 'pro',
    averageRange: [85, 105],
    trebleHitRate: 0.55, // 55% chance to hit trebles (PDC average ~45-50%)
    doubleHitRate: 0.6, // 60% chance to hit doubles
    bullHitRate: 0.45, // 45% chance to hit bull
    singleHitRate: 0.9, // 90% chance to hit intended single
    missVariance: 1, // Only misses to adjacent segments
    thinkingDelayMs: [400, 800],
  },
};

/**
 * Bot difficulty labels for UI display
 */
export const BOT_DIFFICULTY_LABELS: Record<
  BotDifficulty,
  { label: string; sublabel: string }
> = {
  easy: { label: 'Anfänger', sublabel: 'Ø 30' },
  medium: { label: 'Mittel', sublabel: 'Ø 50' },
  pro: { label: 'Profi', sublabel: 'Ø 95' },
};

/**
 * Get bot config by difficulty
 */
export const getBotConfig = (difficulty: BotDifficulty): BotConfig => {
  return BOT_CONFIGS[difficulty];
};

/**
 * Generate a unique bot player ID
 */
export const generateBotId = (difficulty: BotDifficulty): string => {
  return `bot-${difficulty}-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

/**
 * Check if a player ID belongs to a bot
 */
export const isBotPlayerId = (playerId: string): boolean => {
  return playerId.startsWith('bot-');
};

/**
 * Extract difficulty from bot player ID
 */
export const getBotDifficultyFromId = (
  playerId: string,
): BotDifficulty | null => {
  if (!isBotPlayerId(playerId)) return null;

  const parts = playerId.split('-');
  if (parts.length >= 2) {
    const difficulty = parts[1] as BotDifficulty;
    if (difficulty in BOT_CONFIGS) {
      return difficulty;
    }
  }
  return null;
};
