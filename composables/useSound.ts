/**
 * Sound effects composable for game audio feedback
 *
 * Uses Web Audio API to generate sounds programmatically
 * No external sound files needed - sounds are synthesized in real-time
 *
 * Inspired by: https://marcgg.com/blog/2016/11/01/javascript-audio/
 */

// Audio context singleton (reuse to avoid browser limits)
let audioContext: AudioContext | null = null

export const useSound = () => {
  // Check if sound is enabled in settings
  const isEnabled = computed(() => {
    if (import.meta.server) return false

    try {
      const settingsStore = useSettingsStore()
      return settingsStore.soundEnabled
    } catch {
      return true
    }
  })

  // Check if Web Audio API is supported
  const isSupported = computed(() => {
    if (import.meta.server) return false
    return 'AudioContext' in window || 'webkitAudioContext' in window
  })

  /**
   * Get or create audio context
   */
  const getContext = (): AudioContext | null => {
    if (import.meta.server) return null

    if (!audioContext) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioContext = new AudioContextClass()
      } catch (error) {
        console.debug('Failed to initialize audio context:', error)
        return null
      }
    }

    return audioContext
  }

  /**
   * Resume audio context if suspended (browser autoplay policy)
   */
  const resumeContext = async () => {
    const ctx = getContext()
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        // Silently fail
      }
    }
  }

  /**
   * Play a tone with envelope (attack, sustain, release)
   */
  const playTone = (
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) => {
    if (!isEnabled.value) return

    const ctx = getContext()
    if (!ctx) return

    resumeContext()

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    // Envelope: quick attack, sustain, smooth release
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01) // Attack
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + duration * 0.5) // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration) // Release

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }

  /**
   * Play multiple tones in sequence (melody)
   */
  const playMelody = (
    notes: { freq: number; duration: number }[],
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) => {
    if (!isEnabled.value) return

    const ctx = getContext()
    if (!ctx) return

    resumeContext()

    let startTime = ctx.currentTime

    notes.forEach(note => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(note.freq, startTime)

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + note.duration)

      startTime += note.duration * 0.9 // Slight overlap for smoother melody
    })
  }

  /**
   * Play noise burst (for error/bust sounds)
   */
  const playNoise = (duration: number, volume: number = 0.2) => {
    if (!isEnabled.value) return

    const ctx = getContext()
    if (!ctx) return

    resumeContext()

    // Create noise buffer
    const bufferSize = ctx.sampleRate * duration
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer

    // Low-pass filter for softer sound
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, ctx.currentTime)

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    whiteNoise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    whiteNoise.start(ctx.currentTime)
    whiteNoise.stop(ctx.currentTime + duration)
  }

  // ==========================================
  // Game Sound Effects
  // ==========================================

  /**
   * Checkout sound - triumphant ascending melody
   * Plays when a player checks out (wins leg/match)
   */
  const playCheckout = () => {
    // C5 -> E5 -> G5 -> C6 (major chord arpeggio)
    playMelody([
      { freq: 523.25, duration: 0.12 },  // C5
      { freq: 659.25, duration: 0.12 },  // E5
      { freq: 783.99, duration: 0.12 },  // G5
      { freq: 1046.50, duration: 0.25 }, // C6
    ], 'triangle', 0.35)
  }

  /**
   * Bust sound - descending error tone
   * Plays when a player busts (exceeds score or leaves 1)
   */
  const playBust = () => {
    // Descending minor seconds
    playMelody([
      { freq: 440, duration: 0.15 },   // A4
      { freq: 349.23, duration: 0.2 }, // F4
    ], 'sawtooth', 0.2)

    // Add noise for emphasis
    setTimeout(() => playNoise(0.1, 0.1), 100)
  }

  /**
   * Button tap sound - subtle click
   * Plays when numpad buttons are pressed
   */
  const playTap = () => {
    playTone(800, 0.05, 'sine', 0.15)
  }

  /**
   * Score confirm sound - pleasant ding
   * Plays when a valid score is submitted
   */
  const playConfirm = () => {
    playTone(880, 0.1, 'triangle', 0.25)
  }

  /**
   * Turn start sound - subtle notification
   * Plays when it's a player's turn
   */
  const playTurnStart = () => {
    playTone(660, 0.08, 'sine', 0.15)
  }

  /**
   * 180 sound - epic fanfare!
   * Plays when a player scores maximum 180
   */
  const play180 = () => {
    // Epic ascending fanfare
    playMelody([
      { freq: 523.25, duration: 0.1 },  // C5
      { freq: 659.25, duration: 0.1 },  // E5
      { freq: 783.99, duration: 0.1 },  // G5
      { freq: 1046.50, duration: 0.15 }, // C6
      { freq: 1318.51, duration: 0.25 }, // E6
    ], 'square', 0.3)
  }

  /**
   * High score sound - quick achievement ding
   * Plays for scores 100+, 140+
   */
  const playHighScore = () => {
    // Quick two-note chime
    playMelody([
      { freq: 880, duration: 0.08 },   // A5
      { freq: 1108.73, duration: 0.15 }, // C#6
    ], 'triangle', 0.25)
  }

  /**
   * Double sound - subtle feedback for double hit
   */
  const playDouble = () => {
    playMelody([
      { freq: 660, duration: 0.05 },
      { freq: 880, duration: 0.08 },
    ], 'sine', 0.2)
  }

  /**
   * Triple sound - subtle feedback for triple hit
   */
  const playTriple = () => {
    playMelody([
      { freq: 660, duration: 0.04 },
      { freq: 880, duration: 0.04 },
      { freq: 1100, duration: 0.06 },
    ], 'sine', 0.2)
  }

  /**
   * Win match sound - ultimate victory fanfare
   */
  const playWinMatch = () => {
    // Extended victory melody
    playMelody([
      { freq: 523.25, duration: 0.12 },  // C5
      { freq: 659.25, duration: 0.12 },  // E5
      { freq: 783.99, duration: 0.12 },  // G5
      { freq: 1046.50, duration: 0.2 },  // C6
      { freq: 1318.51, duration: 0.12 }, // E6
      { freq: 1567.98, duration: 0.3 },  // G6
    ], 'triangle', 0.4)
  }

  return {
    isEnabled,
    isSupported,
    // Core
    playTone,
    playMelody,
    playNoise,
    // Game sounds
    playCheckout,
    playBust,
    playTap,
    playConfirm,
    playTurnStart,
    play180,
    playHighScore,
    playDouble,
    playTriple,
    playWinMatch
  }
}
