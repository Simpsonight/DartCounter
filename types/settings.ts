import type { GameMode } from './game'

export interface AppSettings {
  // Game defaults
  defaultGameMode: GameMode
  defaultDoubleIn: boolean
  defaultDoubleOut: boolean
  defaultSets: number
  defaultLegs: number

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

  // UI preferences
  soundEnabled: true,
  hapticEnabled: true,
  showCheckoutHints: true,

  // Theme
  theme: 'dark'
}
