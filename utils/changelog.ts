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
  version: string;
  date: string;
  title: string;
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed' | 'security';
    description: string;
  }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.4.0',
    date: '2026-01-21',
    title: 'Bot Player',
    changes: [
      {
        type: 'added',
        description: 'Bot opponent for 1v1 games with three difficulty levels',
      },
      {
        type: 'added',
        description: 'Beginner bot (avg 30): Easy opponent for casual games',
      },
      {
        type: 'added',
        description:
          'Intermediate bot (avg 50): Challenging opponent at league level',
      },
      {
        type: 'added',
        description:
          'Pro bot (avg 95): PDC-level challenge for experienced players',
      },
      {
        type: 'added',
        description: 'Realistic throw simulation with dartboard adjacency',
      },
      { type: 'added', description: 'Bot difficulty setting in the settings' },
      {
        type: 'added',
        description: 'Quick start "Play against bot" in game setup',
      },
      {
        type: 'added',
        description: 'Bot indicator (🤖) in the player display',
      },
    ],
  },
  {
    version: '0.3.2',
    date: '2026-01-19',
    title: 'Sound Effects',
    changes: [
      {
        type: 'added',
        description:
          'Sound effects for game events (checkout, bust, 180, high scores)',
      },
      { type: 'added', description: 'Victory fanfare for match wins' },
      {
        type: 'added',
        description:
          'Audio feedback synthesized via Web Audio API (no external files)',
      },
      {
        type: 'added',
        description: 'Special "ONE HUNDRED AND EIGHTY!" celebration sound',
      },
    ],
  },
  {
    version: '0.3.1',
    date: '2026-01-19',
    title: 'iOS Haptic Feedback & Fixes',
    changes: [
      {
        type: 'added',
        description:
          'iOS Safari haptic feedback support (iOS 17.4+) via ios-haptics library',
      },
      {
        type: 'fixed',
        description: 'Settings not persisting after app reload',
      },
      {
        type: 'fixed',
        description: 'Settings save error (DataCloneError) with Vue reactivity',
      },
      {
        type: 'fixed',
        description:
          'Deprecated process.client usage replaced with import.meta.client',
      },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-01-19',
    title: 'Statistics & Match History',
    changes: [
      {
        type: 'added',
        description:
          'Professional dart statistics (3-dart average, first 9 avg, checkout %)',
      },
      {
        type: 'added',
        description: 'Player statistics page with detailed performance metrics',
      },
      {
        type: 'added',
        description: 'Performance trend chart showing 3-dart average over time',
      },
      { type: 'added', description: 'High scores tracking (180s, 140+, 100+)' },
      {
        type: 'added',
        description:
          'Checkout analysis by score range (2-50, 51-80, 81-100, 101-130, 131-170)',
      },
      {
        type: 'added',
        description: 'Match history filters (game mode, player, time period)',
      },
      {
        type: 'added',
        description:
          'Stats summary on match history page (matches, players, play time)',
      },
      {
        type: 'added',
        description: 'Recent form indicator (last 5 games W/L)',
      },
      {
        type: 'added',
        description: 'Stats breakdown by game mode (301, 501, 701)',
      },
      {
        type: 'added',
        description: 'Player match history tab with game details',
      },
      {
        type: 'changed',
        description: 'Player list now shows real statistics from match history',
      },
      {
        type: 'fixed',
        description:
          'Player stats showing 0 games - now calculated from matches',
      },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-01-18',
    title: 'Settings & Polish',
    changes: [
      {
        type: 'added',
        description: 'Settings page with game defaults and preferences',
      },
      { type: 'added', description: 'Haptic feedback for touch interactions' },
      {
        type: 'added',
        description: 'Navigation guard to prevent accidental game exit',
      },
      { type: 'added', description: 'Global toast notification system' },
      {
        type: 'added',
        description: 'Checkout suggestions can be toggled in settings',
      },
      {
        type: 'changed',
        description: 'Game setup now uses saved default settings',
      },
      {
        type: 'changed',
        description: 'Improved mobile UI with fixed numpad at bottom',
      },
      {
        type: 'fixed',
        description: 'Auto-scroll to active player during game',
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-01-17',
    title: 'Initial Release',
    changes: [
      { type: 'added', description: 'Core game modes: 301, 501, 701' },
      { type: 'added', description: 'Player management with stats tracking' },
      {
        type: 'added',
        description: 'Match history with detailed turn breakdown',
      },
      { type: 'added', description: 'Sets and legs tracking' },
      { type: 'added', description: 'Double-in and double-out rules' },
      { type: 'added', description: 'Checkout suggestions for scores 2-170' },
      { type: 'added', description: 'PWA support for offline play' },
      { type: 'added', description: 'iOS and Android installation support' },
    ],
  },
];

/**
 * Get the current (latest) version
 */
export const getCurrentVersion = (): string => {
  return CHANGELOG[0]?.version ?? '0.0.0';
};

/**
 * Get the current version entry with full details
 */
export const getCurrentVersionEntry = (): ChangelogEntry | undefined => {
  return CHANGELOG[0];
};

/**
 * Get version info formatted for display
 */
export const getVersionInfo = () => {
  const current = CHANGELOG[0];
  return {
    version: current?.version ?? '0.0.0',
    date: current?.date ?? 'Unknown',
    title: current?.title ?? 'Unknown',
  };
};
