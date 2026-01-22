# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-01-22

### Training vs. Match

#### Added

- Training mode detection for solo games (1 player)
- Training badge (🎯) in player match history for solo sessions
- Statistics filter: All / Matches only / Training only

#### Changed

- Match History page (/history) now shows only real matches
- Player page shows both matches and training sessions

## [0.4.0] - 2026-01-21

### Bot Player

#### Added

- Bot opponent for 1v1 games with three difficulty levels
- Beginner bot (avg 30): Easy opponent for casual games
- Intermediate bot (avg 50): Challenging opponent at league level
- Pro bot (avg 95): PDC-level challenge for experienced players
- Realistic throw simulation with dartboard adjacency
- Bot difficulty setting in the settings
- Quick start "Play against bot" in game setup
- Bot indicator (🤖) in the player display

## [0.3.2] - 2026-01-19

### Sound Effects

#### Added

- Sound effects for game events (checkout, bust, 180, high scores)
- Victory fanfare for match wins
- Audio feedback synthesized via Web Audio API (no external files)
- Special "ONE HUNDRED AND EIGHTY!" celebration sound

## [0.3.1] - 2026-01-19

### iOS Haptic Feedback & Fixes

#### Added

- iOS Safari haptic feedback support (iOS 17.4+) via ios-haptics library

#### Fixed

- Settings not persisting after app reload
- Settings save error (DataCloneError) with Vue reactivity
- Deprecated process.client usage replaced with import.meta.client

## [0.3.0] - 2026-01-19

### Statistics & Match History

#### Added

- Professional dart statistics (3-dart average, first 9 avg, checkout %)
- Player statistics page with detailed performance metrics
- Performance trend chart showing 3-dart average over time
- High scores tracking (180s, 140+, 100+)
- Checkout analysis by score range (2-50, 51-80, 81-100, 101-130, 131-170)
- Match history filters (game mode, player, time period)
- Stats summary on match history page (matches, players, play time)
- Recent form indicator (last 5 games W/L)
- Stats breakdown by game mode (301, 501, 701)
- Player match history tab with game details

#### Changed

- Player list now shows real statistics from match history

#### Fixed

- Player stats showing 0 games - now calculated from matches

## [0.2.0] - 2026-01-18

### Settings & Polish

#### Added

- Settings page with game defaults and preferences
- Haptic feedback for touch interactions
- Navigation guard to prevent accidental game exit
- Global toast notification system
- Checkout suggestions can be toggled in settings

#### Changed

- Game setup now uses saved default settings
- Improved mobile UI with fixed numpad at bottom

#### Fixed

- Auto-scroll to active player during game

## [0.1.0] - 2026-01-17

### Initial Release

#### Added

- Core game modes: 301, 501, 701
- Player management with stats tracking
- Match history with detailed turn breakdown
- Sets and legs tracking
- Double-in and double-out rules
- Checkout suggestions for scores 2-170
- PWA support for offline play
- iOS and Android installation support

