import { describe, it, expect } from 'vitest'
import { useCheckoutCalculator } from '~/composables/useCheckoutCalculator'

describe('useCheckoutCalculator', () => {
  const {
    getCheckoutSuggestions,
    isInCheckoutRange,
    getPreferredCheckout,
    getAllPossibleCheckouts,
    getAverageDartsForCheckout
  } = useCheckoutCalculator()

  describe('getCheckoutSuggestions', () => {
    it('should return checkout for simple double finish', () => {
      const suggestions = getCheckoutSuggestions(32)
      expect(suggestions).not.toBeNull()
      expect(suggestions?.score).toBe(32)
      expect(suggestions?.combinations[0].darts).toContain('D16')
    })

    it('should return checkout for two-dart finish', () => {
      const suggestions = getCheckoutSuggestions(50)
      expect(suggestions).not.toBeNull()
      expect(suggestions?.combinations.length).toBeGreaterThan(0)
      // 50 can be finished with Bull or 18, D16
      const dartStrings = suggestions?.combinations.map(c => c.darts.join(', '))
      expect(dartStrings?.some(d => d.includes('Bull') || d.includes('D16'))).toBe(true)
    })

    it('should return checkout for 170 (max)', () => {
      const suggestions = getCheckoutSuggestions(170)
      expect(suggestions).not.toBeNull()
      expect(suggestions?.combinations[0].darts).toEqual(['T20', 'T20', 'Bull'])
    })

    it('should return null for scores below 2', () => {
      expect(getCheckoutSuggestions(1)).toBeNull()
      expect(getCheckoutSuggestions(0)).toBeNull()
    })

    it('should return null for scores above 170', () => {
      expect(getCheckoutSuggestions(171)).toBeNull()
      expect(getCheckoutSuggestions(200)).toBeNull()
    })

    it('should return null for impossible checkouts', () => {
      expect(getCheckoutSuggestions(169)).toBeNull()
      expect(getCheckoutSuggestions(168)).toBeNull()
      expect(getCheckoutSuggestions(166)).toBeNull()
      expect(getCheckoutSuggestions(165)).toBeNull()
      expect(getCheckoutSuggestions(163)).toBeNull()
      expect(getCheckoutSuggestions(162)).toBeNull()
      expect(getCheckoutSuggestions(159)).toBeNull()
    })
  })

  describe('isInCheckoutRange', () => {
    it('should return true for valid checkout scores', () => {
      expect(isInCheckoutRange(2)).toBe(true)
      expect(isInCheckoutRange(32)).toBe(true)
      expect(isInCheckoutRange(100)).toBe(true)
      expect(isInCheckoutRange(170)).toBe(true)
    })

    it('should return false for scores below 2', () => {
      expect(isInCheckoutRange(1)).toBe(false)
      expect(isInCheckoutRange(0)).toBe(false)
    })

    it('should return false for scores above 170', () => {
      expect(isInCheckoutRange(171)).toBe(false)
      expect(isInCheckoutRange(501)).toBe(false)
    })

    it('should return false for impossible checkouts', () => {
      expect(isInCheckoutRange(169)).toBe(false)
      expect(isInCheckoutRange(168)).toBe(false)
    })
  })

  describe('getPreferredCheckout', () => {
    it('should return first (easiest) combination', () => {
      const checkout = getPreferredCheckout(32)
      expect(checkout).not.toBeNull()
      expect(checkout?.darts).toEqual(['D16'])
    })

    it('should return null for scores without checkout', () => {
      expect(getPreferredCheckout(169)).toBeNull()
      expect(getPreferredCheckout(200)).toBeNull()
    })

    it('should prefer easier combinations for 50', () => {
      const checkout = getPreferredCheckout(50)
      expect(checkout).not.toBeNull()
      // Bull (1 dart) or 18, D16 (2 darts) - both are valid
      expect(checkout?.darts.length).toBeLessThanOrEqual(2)
    })
  })

  describe('getAllPossibleCheckouts', () => {
    it('should return array of valid checkout scores', () => {
      const checkouts = getAllPossibleCheckouts()
      expect(Array.isArray(checkouts)).toBe(true)
      expect(checkouts.length).toBeGreaterThan(0)
    })

    it('should be in descending order', () => {
      const checkouts = getAllPossibleCheckouts()
      for (let i = 1; i < checkouts.length; i++) {
        expect(checkouts[i - 1]).toBeGreaterThan(checkouts[i])
      }
    })

    it('should start with 170', () => {
      const checkouts = getAllPossibleCheckouts()
      expect(checkouts[0]).toBe(170)
    })

    it('should not include impossible scores', () => {
      const checkouts = getAllPossibleCheckouts()
      expect(checkouts).not.toContain(169)
      expect(checkouts).not.toContain(168)
      expect(checkouts).not.toContain(166)
      expect(checkouts).not.toContain(165)
      expect(checkouts).not.toContain(163)
      expect(checkouts).not.toContain(162)
      expect(checkouts).not.toContain(159)
    })

    it('should end with 2', () => {
      const checkouts = getAllPossibleCheckouts()
      expect(checkouts[checkouts.length - 1]).toBe(2)
    })
  })

  describe('getAverageDartsForCheckout', () => {
    it('should return 1 for simple double finish', () => {
      expect(getAverageDartsForCheckout(2)).toBe(1) // D1
      expect(getAverageDartsForCheckout(32)).toBe(1) // D16
      expect(getAverageDartsForCheckout(40)).toBe(1) // D20
    })

    it('should return 2 for two-dart finishes', () => {
      expect(getAverageDartsForCheckout(3)).toBe(2) // 1, D1
      expect(getAverageDartsForCheckout(41)).toBe(2) // 9, D16
    })

    it('should return 3 for three-dart finishes', () => {
      expect(getAverageDartsForCheckout(101)).toBe(3) // T20, 9, D16
      expect(getAverageDartsForCheckout(170)).toBe(3) // T20, T20, Bull
    })

    it('should return 3 for impossible checkouts (default)', () => {
      expect(getAverageDartsForCheckout(169)).toBe(3)
      expect(getAverageDartsForCheckout(200)).toBe(3)
    })
  })

  describe('common checkouts', () => {
    it('should provide correct checkout for 32 (classic double 16)', () => {
      const suggestions = getCheckoutSuggestions(32)
      expect(suggestions?.combinations[0].description).toBe('Double 16')
    })

    it('should provide correct checkout for 40 (double 20)', () => {
      const suggestions = getCheckoutSuggestions(40)
      expect(suggestions?.combinations[0].description).toBe('Double 20')
    })

    it('should provide correct checkout for 100', () => {
      const suggestions = getCheckoutSuggestions(100)
      expect(suggestions?.combinations[0].darts).toEqual(['T20', 'D20'])
    })

    it('should provide correct checkout for 121', () => {
      const suggestions = getCheckoutSuggestions(121)
      expect(suggestions).not.toBeNull()
      expect(suggestions?.combinations[0].darts.length).toBe(3)
    })
  })
})
