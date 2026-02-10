export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface ValidationError {
  field: string
  message: string
  severity: ErrorSeverity
}

export interface FileValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export class ErrorHandler {
  static validateFile(file: File): FileValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Check file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    const validExtensions = ['.csv', '.xls', '.xlsx']

    const hasValidType = validTypes.includes(file.type)
    const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!hasValidType && !hasValidExtension) {
      errors.push({
        field: 'fileType',
        message: 'Invalid file type. Please upload a CSV or Excel file.',
        severity: 'error',
      })
    }

    // Check file size
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      errors.push({
        field: 'fileSize',
        message: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 100MB limit.`,
        severity: 'error',
      })
    }

    // Warn if file is too small (likely invalid)
    if (file.size < 100) {
      warnings.push({
        field: 'fileSize',
        message: 'File size is very small. Make sure the file contains valid data.',
        severity: 'warning',
      })
    }

    // Warn if file is large (may take time to process)
    if (file.size > 10 * 1024 * 1024) {
      warnings.push({
        field: 'fileSize',
        message: `Large file (${(file.size / 1024 / 1024).toFixed(2)}MB). Processing may take a moment.`,
        severity: 'warning',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  static validateData(data: any[]): ValidationError[] {
    const errors: ValidationError[] = []

    if (!Array.isArray(data)) {
      errors.push({
        field: 'data',
        message: 'Data must be an array.',
        severity: 'error',
      })
      return errors
    }

    if (data.length === 0) {
      errors.push({
        field: 'data',
        message: 'Dataset is empty. No rows found.',
        severity: 'error',
      })
      return errors
    }

    if (Object.keys(data[0]).length === 0) {
      errors.push({
        field: 'data',
        message: 'Dataset has no columns.',
        severity: 'error',
      })
      return errors
    }

    return errors
  }

  static validateColumns(columns: string[]): ValidationError[] {
    const errors: ValidationError[] = []

    if (!Array.isArray(columns) || columns.length === 0) {
      errors.push({
        field: 'columns',
        message: 'No columns found in dataset.',
        severity: 'error',
      })
      return errors
    }

    const duplicates = columns.filter((item, index) => columns.indexOf(item) !== index)
    if (duplicates.length > 0) {
      errors.push({
        field: 'columns',
        message: `Duplicate column names found: ${duplicates.join(', ')}`,
        severity: 'warning',
      })
    }

    return errors
  }

  static getErrorMessage(error: any): string {
    if (typeof error === 'string') return error

    if (error?.message) return error.message

    if (error?.response?.data?.detail) return error.response.data.detail

    if (error?.response?.data?.message) return error.response.data.message

    return 'An unexpected error occurred. Please try again.'
  }

  static formatValidationErrors(errors: ValidationError[]): string {
    if (errors.length === 0) return ''

    return errors.map((e) => `• ${e.message}`).join('\n')
  }
}

export class DataValidator {
  static isNumeric(value: any): boolean {
    if (value === null || value === undefined || value === '') return false
    return !isNaN(Number(value)) && isFinite(Number(value))
  }

  static isDate(value: any): boolean {
    if (value === null || value === undefined || value === '') return false
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  static isBoolean(value: any): boolean {
    if (value === null || value === undefined) return false
    const lowerVal = String(value).toLowerCase()
    return lowerVal === 'true' || lowerVal === 'false' || lowerVal === '1' || lowerVal === '0' || lowerVal === 'yes' || lowerVal === 'no'
  }

  static detectType(values: any[]): 'text' | 'numeric' | 'boolean' | 'date' | 'mixed' {
    if (values.length === 0) return 'text'

    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '')

    if (nonNullValues.length === 0) return 'text'

    let numericCount = 0
    let boolCount = 0
    let dateCount = 0

    nonNullValues.forEach((val) => {
      if (this.isNumeric(val)) numericCount++
      else if (this.isBoolean(val)) boolCount++
      else if (this.isDate(val)) dateCount++
    })

    const total = nonNullValues.length
    if (numericCount >= total * 0.8) return 'numeric'
    if (boolCount >= total * 0.8) return 'boolean'
    if (dateCount >= total * 0.8) return 'date'

    return 'text'
  }
}
