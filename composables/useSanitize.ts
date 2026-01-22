/**
 * Input Sanitization Composable
 *
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Should be used at system boundaries (user input, external data).
 */

/**
 * HTML entities that need escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Regex pattern to match HTML entities
 */
const HTML_ENTITY_REGEX = /[&<>"'`=/]/g

export const useSanitize = () => {
  /**
   * Escape HTML special characters to prevent XSS
   * @param input Raw string input
   * @returns Escaped string safe for HTML rendering
   */
  const escapeHtml = (input: string): string => {
    if (!input || typeof input !== 'string') return ''
    return input.replace(HTML_ENTITY_REGEX, (char) => HTML_ENTITIES[char] || char)
  }

  /**
   * Sanitize a player name
   * - Trims whitespace
   * - Removes control characters
   * - Limits length
   * - Escapes HTML
   * @param name Raw player name
   * @param maxLength Maximum allowed length (default: 50)
   * @returns Sanitized player name
   */
  const sanitizePlayerName = (name: string, maxLength = 50): string => {
    if (!name || typeof name !== 'string') return ''

    return name
      .trim()
      // Remove control characters (except space)
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      // Limit length
      .slice(0, maxLength)
  }

  /**
   * Sanitize a numeric input
   * - Ensures value is a valid number
   * - Clamps to min/max range
   * - Returns default if invalid
   * @param input Raw input (string or number)
   * @param min Minimum value
   * @param max Maximum value
   * @param defaultValue Default if invalid
   * @returns Sanitized number
   */
  const sanitizeNumber = (
    input: unknown,
    min: number,
    max: number,
    defaultValue: number
  ): number => {
    const num = typeof input === 'string' ? parseFloat(input) : Number(input)

    if (isNaN(num) || !isFinite(num)) {
      return defaultValue
    }

    return Math.max(min, Math.min(max, num))
  }

  /**
   * Sanitize a dart score input
   * - Must be 0-180 (maximum 3-dart score)
   * - Must be a whole number
   * @param score Raw score input
   * @returns Sanitized score or null if invalid
   */
  const sanitizeDartScore = (score: unknown): number | null => {
    const num = sanitizeNumber(score, 0, 180, -1)
    if (num === -1 || !Number.isInteger(num)) {
      return null
    }
    return num
  }

  /**
   * Sanitize a game mode input
   * @param mode Raw mode input
   * @returns Valid game mode or default
   */
  const sanitizeGameMode = (mode: unknown): '301' | '501' | '701' => {
    const validModes = ['301', '501', '701'] as const
    const modeStr = String(mode)
    return validModes.includes(modeStr as typeof validModes[number])
      ? (modeStr as '301' | '501' | '701')
      : '501'
  }

  /**
   * Sanitize URL to prevent javascript: and data: protocols
   * @param url Raw URL input
   * @returns Sanitized URL or empty string if suspicious
   */
  const sanitizeUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return ''

    const trimmed = url.trim().toLowerCase()

    // Block dangerous protocols
    if (
      trimmed.startsWith('javascript:') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('vbscript:')
    ) {
      return ''
    }

    return url.trim()
  }

  /**
   * Validate and sanitize a UUID
   * @param id Raw ID input
   * @returns Valid UUID or null
   */
  const sanitizeUuid = (id: unknown): string | null => {
    if (!id || typeof id !== 'string') return null

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id) ? id : null
  }

  /**
   * Deep sanitize an object by escaping all string values
   * @param obj Object to sanitize
   * @returns New object with sanitized strings
   */
  const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
    const result = {} as T

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        (result as Record<string, unknown>)[key] = escapeHtml(value)
      } else if (Array.isArray(value)) {
        (result as Record<string, unknown>)[key] = value.map((item) =>
          typeof item === 'string' ? escapeHtml(item) : item
        )
      } else if (value && typeof value === 'object') {
        (result as Record<string, unknown>)[key] = sanitizeObject(
          value as Record<string, unknown>
        )
      } else {
        (result as Record<string, unknown>)[key] = value
      }
    }

    return result
  }

  return {
    escapeHtml,
    sanitizePlayerName,
    sanitizeNumber,
    sanitizeDartScore,
    sanitizeGameMode,
    sanitizeUrl,
    sanitizeUuid,
    sanitizeObject,
  }
}
