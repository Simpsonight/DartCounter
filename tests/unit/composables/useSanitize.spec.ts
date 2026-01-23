import { describe, it, expect } from 'vitest'
import { useSanitize } from '~/composables/useSanitize'

describe('useSanitize', () => {
  const {
    escapeHtml,
    sanitizePlayerName,
    sanitizeNumber,
    sanitizeDartScore,
    sanitizeGameMode,
    sanitizeUrl,
    sanitizeUuid,
    sanitizeObject
  } = useSanitize()

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      )
    })

    it('should escape ampersand', () => {
      expect(escapeHtml('foo & bar')).toBe('foo &amp; bar')
    })

    it('should escape quotes', () => {
      expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;')
      expect(escapeHtml("'hello'")).toBe('&#x27;hello&#x27;')
    })

    it('should escape backticks and equals', () => {
      expect(escapeHtml('`code`')).toBe('&#x60;code&#x60;')
      expect(escapeHtml('a=b')).toBe('a&#x3D;b')
    })

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('should handle non-string input', () => {
      expect(escapeHtml(null as unknown as string)).toBe('')
      expect(escapeHtml(undefined as unknown as string)).toBe('')
    })

    it('should leave safe strings unchanged', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World')
      expect(escapeHtml('Player123')).toBe('Player123')
    })
  })

  describe('sanitizePlayerName', () => {
    it('should trim whitespace', () => {
      expect(sanitizePlayerName('  John  ')).toBe('John')
    })

    it('should remove control characters', () => {
      expect(sanitizePlayerName('John\x00Doe')).toBe('JohnDoe')
      expect(sanitizePlayerName('John\nDoe')).toBe('JohnDoe')
      expect(sanitizePlayerName('John\tDoe')).toBe('JohnDoe')
    })

    it('should collapse multiple spaces', () => {
      expect(sanitizePlayerName('John    Doe')).toBe('John Doe')
    })

    it('should limit length', () => {
      const longName = 'A'.repeat(100)
      expect(sanitizePlayerName(longName).length).toBe(50)
    })

    it('should allow custom max length', () => {
      const longName = 'A'.repeat(100)
      expect(sanitizePlayerName(longName, 20).length).toBe(20)
    })

    it('should handle empty input', () => {
      expect(sanitizePlayerName('')).toBe('')
      expect(sanitizePlayerName(null as unknown as string)).toBe('')
    })

    it('should preserve valid characters', () => {
      expect(sanitizePlayerName('Max Müller')).toBe('Max Müller')
      expect(sanitizePlayerName('José García')).toBe('José García')
    })
  })

  describe('sanitizeNumber', () => {
    it('should clamp to min/max range', () => {
      expect(sanitizeNumber(150, 0, 100, 0)).toBe(100)
      expect(sanitizeNumber(-10, 0, 100, 0)).toBe(0)
    })

    it('should parse string numbers', () => {
      expect(sanitizeNumber('50', 0, 100, 0)).toBe(50)
      expect(sanitizeNumber('3.14', 0, 10, 0)).toBe(3.14)
    })

    it('should return default for invalid input', () => {
      expect(sanitizeNumber('abc', 0, 100, 50)).toBe(50)
      expect(sanitizeNumber(NaN, 0, 100, 50)).toBe(50)
      expect(sanitizeNumber(Infinity, 0, 100, 50)).toBe(50)
    })

    it('should handle null/undefined', () => {
      // Number(null) = 0, which is within [0, 100] range
      expect(sanitizeNumber(null, 0, 100, 50)).toBe(0)
      // Number(undefined) = NaN, returns default
      expect(sanitizeNumber(undefined, 0, 100, 50)).toBe(50)
    })
  })

  describe('sanitizeDartScore', () => {
    it('should accept valid dart scores', () => {
      expect(sanitizeDartScore(0)).toBe(0)
      expect(sanitizeDartScore(60)).toBe(60)
      expect(sanitizeDartScore(180)).toBe(180)
    })

    it('should clamp scores above 180 to 180', () => {
      // sanitizeDartScore clamps to [0, 180] then checks integer
      expect(sanitizeDartScore(181)).toBe(180)
    })

    it('should clamp negative scores to 0', () => {
      // sanitizeDartScore clamps to [0, 180]
      expect(sanitizeDartScore(-1)).toBe(0)
    })

    it('should reject non-integer scores', () => {
      expect(sanitizeDartScore(50.5)).toBe(null)
    })

    it('should handle string input', () => {
      expect(sanitizeDartScore('100')).toBe(100)
      expect(sanitizeDartScore('abc')).toBe(null)
    })
  })

  describe('sanitizeGameMode', () => {
    it('should accept valid game modes', () => {
      expect(sanitizeGameMode('301')).toBe('301')
      expect(sanitizeGameMode('501')).toBe('501')
      expect(sanitizeGameMode('701')).toBe('701')
    })

    it('should return default for invalid modes', () => {
      expect(sanitizeGameMode('401')).toBe('501')
      expect(sanitizeGameMode('invalid')).toBe('501')
      expect(sanitizeGameMode(123)).toBe('501')
    })
  })

  describe('sanitizeUrl', () => {
    it('should allow safe URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
      expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000')
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page')
    })

    it('should block javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('')
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('')
    })

    it('should block data: URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
    })

    it('should block vbscript: URLs', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('')
    })

    it('should handle empty input', () => {
      expect(sanitizeUrl('')).toBe('')
      expect(sanitizeUrl(null as unknown as string)).toBe('')
    })

    it('should trim whitespace', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com')
    })
  })

  describe('sanitizeUuid', () => {
    it('should accept valid UUIDs', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000'
      expect(sanitizeUuid(validUuid)).toBe(validUuid)
    })

    it('should accept UUIDs with uppercase', () => {
      const validUuid = '550E8400-E29B-41D4-A716-446655440000'
      expect(sanitizeUuid(validUuid)).toBe(validUuid)
    })

    it('should reject invalid UUIDs', () => {
      expect(sanitizeUuid('not-a-uuid')).toBe(null)
      expect(sanitizeUuid('550e8400-e29b-41d4-a716')).toBe(null)
      expect(sanitizeUuid('550e8400e29b41d4a716446655440000')).toBe(null)
    })

    it('should handle null/undefined', () => {
      expect(sanitizeUuid(null)).toBe(null)
      expect(sanitizeUuid(undefined)).toBe(null)
    })
  })

  describe('sanitizeObject', () => {
    it('should escape strings in object', () => {
      const obj = { name: '<script>alert(1)</script>' }
      const result = sanitizeObject(obj)
      expect(result.name).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;')
    })

    it('should escape strings in arrays', () => {
      const obj = { items: ['<b>test</b>', 'normal'] }
      const result = sanitizeObject(obj)
      expect(result.items[0]).toBe('&lt;b&gt;test&lt;&#x2F;b&gt;')
      expect(result.items[1]).toBe('normal')
    })

    it('should handle nested objects', () => {
      const obj = { nested: { name: '<script>' } }
      const result = sanitizeObject(obj)
      expect(result.nested.name).toBe('&lt;script&gt;')
    })

    it('should preserve non-string values', () => {
      const obj = { count: 42, active: true, value: null }
      const result = sanitizeObject(obj)
      expect(result.count).toBe(42)
      expect(result.active).toBe(true)
      expect(result.value).toBe(null)
    })
  })
})
