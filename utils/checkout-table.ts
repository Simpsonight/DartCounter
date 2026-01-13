import type { CheckoutCombination } from '~/types/score'

/**
 * Precomputed checkout combinations for scores 2-170
 * Each score has one or more possible checkout combinations
 * Combinations are ordered by difficulty (easier first)
 */
export const CHECKOUT_TABLE: Record<number, CheckoutCombination[]> = {
  // 2-40: Simple double finishes
  2: [{ darts: ['D1'], description: 'Double 1', difficulty: 'easy' }],
  3: [{ darts: ['1', 'D1'], description: '1, Double 1', difficulty: 'easy' }],
  4: [{ darts: ['D2'], description: 'Double 2', difficulty: 'easy' }],
  5: [{ darts: ['1', 'D2'], description: '1, Double 2', difficulty: 'easy' }],
  6: [{ darts: ['D3'], description: 'Double 3', difficulty: 'easy' }],
  7: [{ darts: ['3', 'D2'], description: '3, Double 2', difficulty: 'easy' }],
  8: [{ darts: ['D4'], description: 'Double 4', difficulty: 'easy' }],
  9: [{ darts: ['1', 'D4'], description: '1, Double 4', difficulty: 'easy' }],
  10: [{ darts: ['D5'], description: 'Double 5', difficulty: 'easy' }],
  11: [{ darts: ['3', 'D4'], description: '3, Double 4', difficulty: 'easy' }],
  12: [{ darts: ['D6'], description: 'Double 6', difficulty: 'easy' }],
  13: [{ darts: ['5', 'D4'], description: '5, Double 4', difficulty: 'easy' }],
  14: [{ darts: ['D7'], description: 'Double 7', difficulty: 'easy' }],
  15: [{ darts: ['7', 'D4'], description: '7, Double 4', difficulty: 'easy' }],
  16: [{ darts: ['D8'], description: 'Double 8', difficulty: 'easy' }],
  17: [{ darts: ['9', 'D4'], description: '9, Double 4', difficulty: 'easy' }],
  18: [{ darts: ['D9'], description: 'Double 9', difficulty: 'easy' }],
  19: [{ darts: ['3', 'D8'], description: '3, Double 8', difficulty: 'easy' }],
  20: [{ darts: ['D10'], description: 'Double 10', difficulty: 'easy' }],
  21: [{ darts: ['5', 'D8'], description: '5, Double 8', difficulty: 'easy' }],
  22: [{ darts: ['D11'], description: 'Double 11', difficulty: 'easy' }],
  23: [{ darts: ['7', 'D8'], description: '7, Double 8', difficulty: 'easy' }],
  24: [{ darts: ['D12'], description: 'Double 12', difficulty: 'easy' }],
  25: [{ darts: ['9', 'D8'], description: '9, Double 8', difficulty: 'easy' }],
  26: [{ darts: ['D13'], description: 'Double 13', difficulty: 'easy' }],
  27: [{ darts: ['11', 'D8'], description: '11, Double 8', difficulty: 'easy' }],
  28: [{ darts: ['D14'], description: 'Double 14', difficulty: 'easy' }],
  29: [{ darts: ['13', 'D8'], description: '13, Double 8', difficulty: 'easy' }],
  30: [{ darts: ['D15'], description: 'Double 15', difficulty: 'easy' }],
  31: [{ darts: ['15', 'D8'], description: '15, Double 8', difficulty: 'easy' }],
  32: [{ darts: ['D16'], description: 'Double 16', difficulty: 'easy' }],
  33: [{ darts: ['17', 'D8'], description: '17, Double 8', difficulty: 'easy' }],
  34: [{ darts: ['D17'], description: 'Double 17', difficulty: 'medium' }],
  35: [{ darts: ['19', 'D8'], description: '19, Double 8', difficulty: 'easy' }],
  36: [{ darts: ['D18'], description: 'Double 18', difficulty: 'medium' }],
  37: [{ darts: ['5', 'D16'], description: '5, Double 16', difficulty: 'easy' }],
  38: [{ darts: ['D19'], description: 'Double 19', difficulty: 'medium' }],
  39: [{ darts: ['7', 'D16'], description: '7, Double 16', difficulty: 'easy' }],
  40: [{ darts: ['D20'], description: 'Double 20', difficulty: 'medium' }],

  // 41-60: Two dart finishes
  41: [{ darts: ['9', 'D16'], description: '9, Double 16', difficulty: 'easy' }],
  42: [{ darts: ['10', 'D16'], description: '10, Double 16', difficulty: 'easy' }],
  43: [{ darts: ['11', 'D16'], description: '11, Double 16', difficulty: 'easy' }],
  44: [{ darts: ['12', 'D16'], description: '12, Double 16', difficulty: 'easy' }],
  45: [{ darts: ['13', 'D16'], description: '13, Double 16', difficulty: 'easy' }],
  46: [{ darts: ['14', 'D16'], description: '14, Double 16', difficulty: 'easy' }],
  47: [{ darts: ['15', 'D16'], description: '15, Double 16', difficulty: 'easy' }],
  48: [{ darts: ['16', 'D16'], description: '16, Double 16', difficulty: 'easy' }],
  49: [{ darts: ['17', 'D16'], description: '17, Double 16', difficulty: 'easy' }],
  50: [
    { darts: ['Bull'], description: 'Bullseye', difficulty: 'medium' },
    { darts: ['18', 'D16'], description: '18, Double 16', difficulty: 'easy' }
  ],

  // 51-70: Two dart finishes with trebles
  51: [{ darts: ['19', 'D16'], description: '19, Double 16', difficulty: 'easy' }],
  52: [{ darts: ['20', 'D16'], description: '20, Double 16', difficulty: 'easy' }],
  53: [{ darts: ['13', 'D20'], description: '13, Double 20', difficulty: 'medium' }],
  54: [{ darts: ['14', 'D20'], description: '14, Double 20', difficulty: 'medium' }],
  55: [{ darts: ['15', 'D20'], description: '15, Double 20', difficulty: 'medium' }],
  56: [{ darts: ['16', 'D20'], description: '16, Double 20', difficulty: 'medium' }],
  57: [{ darts: ['17', 'D20'], description: '17, Double 20', difficulty: 'medium' }],
  58: [{ darts: ['18', 'D20'], description: '18, Double 20', difficulty: 'medium' }],
  59: [{ darts: ['19', 'D20'], description: '19, Double 20', difficulty: 'medium' }],
  60: [{ darts: ['20', 'D20'], description: '20, Double 20', difficulty: 'medium' }],

  // 61-100: Three dart finishes
  61: [{ darts: ['T15', 'D8'], description: 'Treble 15, Double 8', difficulty: 'medium' }],
  62: [{ darts: ['T10', 'D16'], description: 'Treble 10, Double 16', difficulty: 'medium' }],
  63: [{ darts: ['T13', 'D12'], description: 'Treble 13, Double 12', difficulty: 'medium' }],
  64: [{ darts: ['T16', 'D8'], description: 'Treble 16, Double 8', difficulty: 'medium' }],
  65: [{ darts: ['T11', 'D16'], description: 'Treble 11, Double 16', difficulty: 'medium' }],
  66: [{ darts: ['T10', 'D18'], description: 'Treble 10, Double 18', difficulty: 'medium' }],
  67: [{ darts: ['T17', 'D8'], description: 'Treble 17, Double 8', difficulty: 'medium' }],
  68: [{ darts: ['T20', 'D4'], description: 'Treble 20, Double 4', difficulty: 'hard' }],
  69: [{ darts: ['T19', 'D6'], description: 'Treble 19, Double 6', difficulty: 'medium' }],
  70: [{ darts: ['T18', 'D8'], description: 'Treble 18, Double 8', difficulty: 'medium' }],

  71: [{ darts: ['T13', 'D16'], description: 'Treble 13, Double 16', difficulty: 'medium' }],
  72: [{ darts: ['T16', 'D12'], description: 'Treble 16, Double 12', difficulty: 'medium' }],
  73: [{ darts: ['T19', 'D8'], description: 'Treble 19, Double 8', difficulty: 'medium' }],
  74: [{ darts: ['T14', 'D16'], description: 'Treble 14, Double 16', difficulty: 'medium' }],
  75: [{ darts: ['T17', 'D12'], description: 'Treble 17, Double 12', difficulty: 'medium' }],
  76: [{ darts: ['T20', 'D8'], description: 'Treble 20, Double 8', difficulty: 'hard' }],
  77: [{ darts: ['T15', 'D16'], description: 'Treble 15, Double 16', difficulty: 'medium' }],
  78: [{ darts: ['T18', 'D12'], description: 'Treble 18, Double 12', difficulty: 'medium' }],
  79: [{ darts: ['T13', 'D20'], description: 'Treble 13, Double 20', difficulty: 'hard' }],
  80: [{ darts: ['T20', 'D10'], description: 'Treble 20, Double 10', difficulty: 'hard' }],

  81: [{ darts: ['T19', 'D12'], description: 'Treble 19, Double 12', difficulty: 'medium' }],
  82: [{ darts: ['Bull', 'D16'], description: 'Bullseye, Double 16', difficulty: 'hard' }],
  83: [{ darts: ['T17', 'D16'], description: 'Treble 17, Double 16', difficulty: 'medium' }],
  84: [{ darts: ['T20', 'D12'], description: 'Treble 20, Double 12', difficulty: 'hard' }],
  85: [{ darts: ['T15', 'D20'], description: 'Treble 15, Double 20', difficulty: 'hard' }],
  86: [{ darts: ['T18', 'D16'], description: 'Treble 18, Double 16', difficulty: 'medium' }],
  87: [{ darts: ['T17', 'D18'], description: 'Treble 17, Double 18', difficulty: 'hard' }],
  88: [{ darts: ['T20', 'D14'], description: 'Treble 20, Double 14', difficulty: 'hard' }],
  89: [{ darts: ['T19', 'D16'], description: 'Treble 19, Double 16', difficulty: 'medium' }],
  90: [{ darts: ['T20', 'D15'], description: 'Treble 20, Double 15', difficulty: 'hard' }],

  91: [{ darts: ['T17', 'D20'], description: 'Treble 17, Double 20', difficulty: 'hard' }],
  92: [{ darts: ['T20', 'D16'], description: 'Treble 20, Double 16', difficulty: 'hard' }],
  93: [{ darts: ['T19', 'D18'], description: 'Treble 19, Double 18', difficulty: 'hard' }],
  94: [{ darts: ['T18', 'D20'], description: 'Treble 18, Double 20', difficulty: 'hard' }],
  95: [{ darts: ['T19', 'D19'], description: 'Treble 19, Double 19', difficulty: 'hard' }],
  96: [{ darts: ['T20', 'D18'], description: 'Treble 20, Double 18', difficulty: 'hard' }],
  97: [{ darts: ['T19', 'D20'], description: 'Treble 19, Double 20', difficulty: 'hard' }],
  98: [{ darts: ['T20', 'D19'], description: 'Treble 20, Double 19', difficulty: 'hard' }],
  99: [{ darts: ['T19', 'D21'], description: 'Treble 19, Double 21', difficulty: 'hard' }],
  100: [{ darts: ['T20', 'D20'], description: 'Treble 20, Double 20', difficulty: 'hard' }],

  // 101-120: Three dart combinations
  101: [{ darts: ['T20', '9', 'D16'], description: 'T20, 9, D16', difficulty: 'hard' }],
  102: [{ darts: ['T20', '10', 'D16'], description: 'T20, 10, D16', difficulty: 'hard' }],
  103: [{ darts: ['T20', '11', 'D16'], description: 'T20, 11, D16', difficulty: 'hard' }],
  104: [{ darts: ['T20', '12', 'D16'], description: 'T20, 12, D16', difficulty: 'hard' }],
  105: [{ darts: ['T20', '13', 'D16'], description: 'T20, 13, D16', difficulty: 'hard' }],
  106: [{ darts: ['T20', '14', 'D16'], description: 'T20, 14, D16', difficulty: 'hard' }],
  107: [{ darts: ['T20', '15', 'D16'], description: 'T20, 15, D16', difficulty: 'hard' }],
  108: [{ darts: ['T20', '16', 'D16'], description: 'T20, 16, D16', difficulty: 'hard' }],
  109: [{ darts: ['T20', '17', 'D16'], description: 'T20, 17, D16', difficulty: 'hard' }],
  110: [{ darts: ['T20', 'Bull'], description: 'T20, Bullseye', difficulty: 'hard' }],

  111: [{ darts: ['T20', '19', 'D16'], description: 'T20, 19, D16', difficulty: 'hard' }],
  112: [{ darts: ['T20', '20', 'D16'], description: 'T20, 20, D16', difficulty: 'hard' }],
  113: [{ darts: ['T20', '13', 'D20'], description: 'T20, 13, D20', difficulty: 'hard' }],
  114: [{ darts: ['T20', '14', 'D20'], description: 'T20, 14, D20', difficulty: 'hard' }],
  115: [{ darts: ['T20', '15', 'D20'], description: 'T20, 15, D20', difficulty: 'hard' }],
  116: [{ darts: ['T20', '16', 'D20'], description: 'T20, 16, D20', difficulty: 'hard' }],
  117: [{ darts: ['T20', '17', 'D20'], description: 'T20, 17, D20', difficulty: 'hard' }],
  118: [{ darts: ['T20', '18', 'D20'], description: 'T20, 18, D20', difficulty: 'hard' }],
  119: [{ darts: ['T20', '19', 'D20'], description: 'T20, 19, D20', difficulty: 'hard' }],
  120: [{ darts: ['T20', '20', 'D20'], description: 'T20, 20, D20', difficulty: 'hard' }],

  // 121-140: More complex three dart finishes
  121: [{ darts: ['T20', 'T11', 'D14'], description: 'T20, T11, D14', difficulty: 'hard' }],
  122: [{ darts: ['T18', 'T18', 'D7'], description: 'T18, T18, D7', difficulty: 'hard' }],
  123: [{ darts: ['T19', 'T16', 'D9'], description: 'T19, T16, D9', difficulty: 'hard' }],
  124: [{ darts: ['T20', 'T14', 'D11'], description: 'T20, T14, D11', difficulty: 'hard' }],
  125: [{ darts: ['T20', 'T15', 'D10'], description: 'T20, T15, D10', difficulty: 'hard' }],
  126: [{ darts: ['T19', 'T19', 'D6'], description: 'T19, T19, D6', difficulty: 'hard' }],
  127: [{ darts: ['T20', 'T17', 'D8'], description: 'T20, T17, D8', difficulty: 'hard' }],
  128: [{ darts: ['T18', 'T14', 'D16'], description: 'T18, T14, D16', difficulty: 'hard' }],
  129: [{ darts: ['T19', 'T16', 'D12'], description: 'T19, T16, D12', difficulty: 'hard' }],
  130: [{ darts: ['T20', 'T18', 'D8'], description: 'T20, T18, D8', difficulty: 'hard' }],

  131: [{ darts: ['T20', 'T13', 'D16'], description: 'T20, T13, D16', difficulty: 'hard' }],
  132: [{ darts: ['Bull', 'Bull', 'D16'], description: 'Bull, Bull, D16', difficulty: 'hard' }],
  133: [{ darts: ['T20', 'T19', 'D8'], description: 'T20, T19, D8', difficulty: 'hard' }],
  134: [{ darts: ['T20', 'T14', 'D16'], description: 'T20, T14, D16', difficulty: 'hard' }],
  135: [{ darts: ['Bull', 'T17', 'D20'], description: 'Bull, T17, D20', difficulty: 'hard' }],
  136: [{ darts: ['T20', 'T20', 'D8'], description: 'T20, T20, D8', difficulty: 'hard' }],
  137: [{ darts: ['T20', 'T15', 'D16'], description: 'T20, T15, D16', difficulty: 'hard' }],
  138: [{ darts: ['T20', 'T18', 'D12'], description: 'T20, T18, D12', difficulty: 'hard' }],
  139: [{ darts: ['T20', 'T13', 'D20'], description: 'T20, T13, D20', difficulty: 'hard' }],
  140: [{ darts: ['T20', 'T20', 'D10'], description: 'T20, T20, D10', difficulty: 'hard' }],

  // 141-150: Difficult three dart finishes
  141: [{ darts: ['T20', 'T19', 'D12'], description: 'T20, T19, D12', difficulty: 'hard' }],
  142: [{ darts: ['T20', 'T14', 'D20'], description: 'T20, T14, D20', difficulty: 'hard' }],
  143: [{ darts: ['T20', 'T17', 'D16'], description: 'T20, T17, D16', difficulty: 'hard' }],
  144: [{ darts: ['T20', 'T20', 'D12'], description: 'T20, T20, D12', difficulty: 'hard' }],
  145: [{ darts: ['T20', 'T15', 'D20'], description: 'T20, T15, D20', difficulty: 'hard' }],
  146: [{ darts: ['T20', 'T18', 'D16'], description: 'T20, T18, D16', difficulty: 'hard' }],
  147: [{ darts: ['T20', 'T17', 'D18'], description: 'T20, T17, D18', difficulty: 'hard' }],
  148: [{ darts: ['T20', 'T20', 'D14'], description: 'T20, T20, D14', difficulty: 'hard' }],
  149: [{ darts: ['T20', 'T19', 'D16'], description: 'T20, T19, D16', difficulty: 'hard' }],
  150: [{ darts: ['T20', 'T18', 'D18'], description: 'T20, T18, D18', difficulty: 'hard' }],

  // 151-160: Very difficult finishes
  151: [{ darts: ['T20', 'T17', 'D20'], description: 'T20, T17, D20', difficulty: 'hard' }],
  152: [{ darts: ['T20', 'T20', 'D16'], description: 'T20, T20, D16', difficulty: 'hard' }],
  153: [{ darts: ['T20', 'T19', 'D18'], description: 'T20, T19, D18', difficulty: 'hard' }],
  154: [{ darts: ['T20', 'T18', 'D20'], description: 'T20, T18, D20', difficulty: 'hard' }],
  155: [{ darts: ['T20', 'T19', 'D19'], description: 'T20, T19, D19', difficulty: 'hard' }],
  156: [{ darts: ['T20', 'T20', 'D18'], description: 'T20, T20, D18', difficulty: 'hard' }],
  157: [{ darts: ['T20', 'T19', 'D20'], description: 'T20, T19, D20', difficulty: 'hard' }],
  158: [{ darts: ['T20', 'T20', 'D19'], description: 'T20, T20, D19', difficulty: 'hard' }],
  160: [{ darts: ['T20', 'T20', 'D20'], description: 'T20, T20, D20', difficulty: 'hard' }],

  // 161-170: Maximum finishes
  161: [{ darts: ['T20', 'T17', 'Bull'], description: 'T20, T17, Bullseye', difficulty: 'hard' }],
  164: [{ darts: ['T20', 'T18', 'Bull'], description: 'T20, T18, Bullseye', difficulty: 'hard' }],
  167: [{ darts: ['T20', 'T19', 'Bull'], description: 'T20, T19, Bullseye', difficulty: 'hard' }],
  170: [{ darts: ['T20', 'T20', 'Bull'], description: 'T20, T20, Bullseye', difficulty: 'hard' }]
}

/**
 * Check if a score has a possible checkout
 */
export function hasCheckout(score: number): boolean {
  return score >= 2 && score <= 170 && score in CHECKOUT_TABLE
}

/**
 * Get checkout combinations for a specific score
 */
export function getCheckouts(score: number): CheckoutCombination[] {
  return CHECKOUT_TABLE[score] || []
}
