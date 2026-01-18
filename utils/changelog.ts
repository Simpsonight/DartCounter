/**
 * Changelog with semantic versioning (MAJOR.MINOR.PATCH)
 *
 * MAJOR: Breaking changes or major feature releases
 * MINOR: New features, backwards compatible
 * PATCH: Bug fixes, small improvements
 *
 * Each release should have:
 * - version: Semantic version string
 * - date: Release date (YYYY-MM-DD)
 * - title: Short release title
 * - changes: Array of change descriptions grouped by type
 */

export interface ChangelogEntry {
  version: string
  date: string
  title: string
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed' | 'security'
    description: string
  }[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2026-01-18',
    title: 'Settings & Polish',
    changes: [
      { type: 'added', description: 'Settings page with game defaults and preferences' },
      { type: 'added', description: 'Haptic feedback for touch interactions' },
      { type: 'added', description: 'Navigation guard to prevent accidental game exit' },
      { type: 'added', description: 'Global toast notification system' },
      { type: 'added', description: 'Checkout suggestions can be toggled in settings' },
      { type: 'changed', description: 'Game setup now uses saved default settings' },
      { type: 'changed', description: 'Improved mobile UI with fixed numpad at bottom' },
      { type: 'fixed', description: 'Auto-scroll to active player during game' }
    ]
  },
  {
    version: '0.1.0',
    date: '2026-01-17',
    title: 'Initial Release',
    changes: [
      { type: 'added', description: 'Core game modes: 301, 501, 701' },
      { type: 'added', description: 'Player management with stats tracking' },
      { type: 'added', description: 'Match history with detailed turn breakdown' },
      { type: 'added', description: 'Sets and legs tracking' },
      { type: 'added', description: 'Double-in and double-out rules' },
      { type: 'added', description: 'Checkout suggestions for scores 2-170' },
      { type: 'added', description: 'PWA support for offline play' },
      { type: 'added', description: 'iOS and Android installation support' }
    ]
  }
]

/**
 * Get the current (latest) version
 */
export const getCurrentVersion = (): string => {
  return CHANGELOG[0]?.version ?? '0.0.0'
}

/**
 * Get the current version entry with full details
 */
export const getCurrentVersionEntry = (): ChangelogEntry | undefined => {
  return CHANGELOG[0]
}

/**
 * Get version info formatted for display
 */
export const getVersionInfo = () => {
  const current = CHANGELOG[0]
  return {
    version: current?.version ?? '0.0.0',
    date: current?.date ?? 'Unknown',
    title: current?.title ?? 'Unknown'
  }
}
