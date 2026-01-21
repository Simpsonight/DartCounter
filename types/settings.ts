import type { GameMode } from './game'
import type { BotDifficulty } from './bot'

export interface AppSettings {
  // Game defaults
  defaultGameMode: GameMode
  defaultDoubleIn: boolean
  defaultDoubleOut: boolean
  defaultSets: number
  defaultLegs: number

  // Bot settings
  defaultBotDifficulty: BotDifficulty

  // UI preferences
  soundEnabled: boolean
  hapticEnabled: boolean
  showCheckoutHints: boolean

  // Theme (for future use)
  theme: 'dark' | 'light' | 'system'
}

export const DEFAULT_SETTINGS: AppSettings = {
  // Game defaults
  defaultGameMode: '501',
  defaultDoubleIn: false,
  defaultDoubleOut: true,
  defaultSets: 1,
  defaultLegs: 1,

  // Bot settings
  defaultBotDifficulty: 'medium',

  // UI preferences
  soundEnabled: true,
  hapticEnabled: true,
  showCheckoutHints: true,

  // Theme
  theme: 'dark'
}
