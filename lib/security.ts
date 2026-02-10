export interface SecurityLimits {
  maxFileSize: number
  maxRows: number
  maxColumns: number
  maxMemory: number
  allowedFileTypes: string[]
  allowedExtensions: string[]
  rateLimitPerMinute: number
  requestTimeoutMs: number
}

export const DEFAULT_LIMITS: SecurityLimits = {
  maxFileSize: 100 * 1024 * 1024, // 100 MB
  maxRows: 1000000, // 1 million rows
  maxColumns: 500, // 500 columns
  maxMemory: 500 * 1024 * 1024, // 500 MB
  allowedFileTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  allowedExtensions: ['.csv', '.xls', '.xlsx'],
  rateLimitPerMinute: 60,
  requestTimeoutMs: 30000,
}

export class SecurityManager {
  private static requestTimestamps: Map<string, number[]> = new Map()

  /**
   * Validate file against security limits
   */
  static validateFile(file: File, limits: SecurityLimits = DEFAULT_LIMITS): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check file size
    if (file.size > limits.maxFileSize) {
      errors.push(`File size (${this.formatBytes(file.size)}) exceeds maximum allowed size (${this.formatBytes(limits.maxFileSize)})`)
    }

    // Check file type
    const isValidType = limits.allowedFileTypes.includes(file.type) || limits.allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!isValidType) {
      errors.push(`File type is not allowed. Accepted types: ${limits.allowedExtensions.join(', ')}`)
    }

    // Check for suspicious filename
    if (this.hasSuspiciousFilename(file.name)) {
      errors.push('File name contains invalid characters')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate data dimensions
   */
  static validateDataDimensions(rowCount: number, columnCount: number, limits: SecurityLimits = DEFAULT_LIMITS): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (rowCount > limits.maxRows) {
      errors.push(`Dataset exceeds maximum rows (${limits.maxRows}). Got ${rowCount} rows.`)
    }

    if (columnCount > limits.maxColumns) {
      errors.push(`Dataset exceeds maximum columns (${limits.maxColumns}). Got ${columnCount} columns.`)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Check rate limiting
   */
  static checkRateLimit(clientId: string, limits: SecurityLimits = DEFAULT_LIMITS): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Get or create timestamps array for this client
    let timestamps = this.requestTimestamps.get(clientId) || []

    // Remove old timestamps
    timestamps = timestamps.filter((timestamp) => timestamp > oneMinuteAgo)

    // Check if limit exceeded
    const allowed = timestamps.length < limits.rateLimitPerMinute

    if (allowed) {
      timestamps.push(now)
    }

    this.requestTimestamps.set(clientId, timestamps)

    return {
      allowed,
      remaining: Math.max(0, limits.rateLimitPerMinute - timestamps.length),
      resetTime: timestamps.length > 0 ? timestamps[0] + 60000 : now + 60000,
    }
  }

  /**
   * Sanitize column names to prevent injection attacks
   */
  static sanitizeColumnName(name: string): string {
    // Remove special characters but keep alphanumeric, underscore, and hyphen
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 255)
  }

  /**
   * Sanitize cell values
   */
  static sanitizeCellValue(value: any): any {
    if (value === null || value === undefined) return value

    const strValue = String(value)

    // Remove control characters
    const cleaned = strValue.replace(/[\x00-\x1F\x7F]/g, '')

    // Limit string length
    return cleaned.substring(0, 10000)
  }

  /**
   * Check for suspicious patterns in filename
   */
  private static hasSuspiciousFilename(filename: string): boolean {
    // Check for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return true
    }

    // Check for script tags or HTML
    if (filename.includes('<') || filename.includes('>') || filename.includes('{') || filename.includes('}')) {
      return true
    }

    return false
  }

  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Estimate memory usage
   */
  static estimateMemoryUsage(rowCount: number, columnCount: number, avgCellSize: number = 50): number {
    // Rough estimate: rowCount * columnCount * avgCellSize
    return rowCount * columnCount * avgCellSize
  }

  /**
   * Check if processing would exceed memory limit
   */
  static wouldExceedMemoryLimit(rowCount: number, columnCount: number, limits: SecurityLimits = DEFAULT_LIMITS): boolean {
    const estimatedMemory = this.estimateMemoryUsage(rowCount, columnCount)
    return estimatedMemory > limits.maxMemory
  }
}

/**
 * Content Security Policy headers
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
}

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
