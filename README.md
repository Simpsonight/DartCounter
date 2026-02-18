# Dart Counter

A professional dart scoring Progressive Web App for 301, 501, and 701 games. Built with Nuxt 3, Vue 3, and TypeScript. Works fully offline and can be installed on iOS and Android.

## Features

- **Game Modes** — 301, 501, 701 with sets and legs
- **Double-In / Double-Out** — Configurable rules per game
- **Checkout Suggestions** — Precomputed suggestions for scores 2–170
- **Bot Opponents** — Three difficulty levels (Beginner, Intermediate, Pro) with realistic throw simulation
- **Player Management** — Create and manage player profiles with persistent statistics
- **Statistics** — 3-dart average, first 9 average, checkout percentage, high score tracking (180s, 140+, 100+), performance trends
- **Training Mode** — Solo sessions tracked separately from competitive matches
- **Match History** — Full history with filters by game mode, player, and time period
- **Sound & Haptics** — Audio feedback via Web Audio API and iOS haptic feedback
- **PWA** — Installable, offline-capable, auto-updating

## Tech Stack

- [Nuxt 3](https://nuxt.com/) / [Vue 3](https://vuejs.org/) (Composition API)
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Pinia](https://pinia.vuejs.org/) for state management
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite PWA](https://vite-pwa-org.netlify.app/) with Workbox for offline support
- IndexedDB for local data persistence
- [Vitest](https://vitest.dev/) for testing

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Static site generation
npm run generate

# Preview production build
npm run preview
```

## Testing

```bash
# Run all tests
npm run test

# Run tests with browser UI
npm run test:ui

# Run a single test file
npx vitest run tests/unit/composables/useScoreValidation.spec.ts
```

## License

This project is licensed under the [MIT License](LICENSE).
