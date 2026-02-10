/**
 * Data processing and formatting utilities
 */

export interface ChartData {
  name: string
  [key: string]: string | number
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Round number to specified decimal places
 */
export function roundTo(num: number, decimals = 2): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Get data type label from pandas dtype string
 */
export function getDataTypeLabel(dtype: string): string {
  if (!dtype) return 'Unknown'
  
  if (dtype.includes('int')) return 'Integer'
  if (dtype.includes('float')) return 'Decimal'
  if (dtype.includes('bool')) return 'Boolean'
  if (dtype.includes('datetime')) return 'DateTime'
  if (dtype.includes('date')) return 'Date'
  if (dtype.includes('object') || dtype.includes('str')) return 'Text'
  if (dtype.includes('category')) return 'Category'
  
  return 'Other'
}

/**
 * Get color for data quality score
 */
export function getQualityColor(score: number): string {
  if (score >= 0.9) return 'text-emerald-500'
  if (score >= 0.7) return 'text-amber-500'
  if (score >= 0.5) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * Get label for data quality score
 */
export function getQualityLabel(score: number): string {
  if (score >= 0.9) return 'Excellent'
  if (score >= 0.7) return 'Good'
  if (score >= 0.5) return 'Fair'
  if (score >= 0.3) return 'Poor'
  return 'Critical'
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Prepare data for bar/line chart
 */
export function prepareChartData(
  data: Record<string, any>[],
  xKey: string,
  yKey: string,
  aggregationType: 'count' | 'sum' | 'avg' = 'count'
): ChartData[] {
  const grouped: Record<string, any> = {}
  
  data.forEach(row => {
    const key = String(row[xKey])
    
    if (!grouped[key]) {
      grouped[key] = {
        name: key,
        values: [],
        count: 0,
      }
    }
    
    grouped[key].count++
    if (typeof row[yKey] === 'number') {
      grouped[key].values.push(row[yKey])
    }
  })
  
  return Object.entries(grouped).map(([_, group]) => {
    let yValue = group.count
    
    if (group.values.length > 0) {
      if (aggregationType === 'sum') {
        yValue = group.values.reduce((a: number, b: number) => a + b, 0)
      } else if (aggregationType === 'avg') {
        yValue = group.values.reduce((a: number, b: number) => a + b, 0) / group.values.length
      }
    }
    
    return {
      name: group.name,
      value: roundTo(yValue),
    }
  })
}

/**
 * Prepare data for scatter plot
 */
export function prepareScatterData(
  data: Record<string, any>[],
  xKey: string,
  yKey: string,
  limit = 100
): ChartData[] {
  return data
    .filter(row => 
      row[xKey] !== null && 
      row[yKey] !== null && 
      typeof row[xKey] === 'number' && 
      typeof row[yKey] === 'number'
    )
    .slice(0, limit)
    .map(row => ({
      [xKey]: row[xKey],
      [yKey]: row[yKey],
    }))
}

/**
 * Prepare data for histogram
 */
export function prepareHistogramData(
  values: number[],
  binCount = 20
): ChartData[] {
  if (values.length === 0) return []
  
  const filteredValues = values.filter(v => typeof v === 'number' && !isNaN(v))
  if (filteredValues.length === 0) return []
  
  const min = Math.min(...filteredValues)
  const max = Math.max(...filteredValues)
  const binSize = (max - min) / binCount
  
  const bins: Record<string, number> = {}
  
  for (let i = 0; i < binCount; i++) {
    const start = min + i * binSize
    const end = start + binSize
    const label = `${roundTo(start)}-${roundTo(end)}`
    bins[label] = 0
  }
  
  filteredValues.forEach(v => {
    const binIndex = Math.min(binCount - 1, Math.floor((v - min) / binSize))
    const start = min + binIndex * binSize
    const end = start + binSize
    const label = `${roundTo(start)}-${roundTo(end)}`
    bins[label]++
  })
  
  return Object.entries(bins).map(([label, frequency]) => ({
    name: label,
    frequency,
  }))
}

/**
 * Detect data type of a value
 */
export function detectValueType(value: any): string {
  if (value === null || value === undefined || value === '') return 'missing'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'numeric'
  if (typeof value === 'string') {
    if (!isNaN(Number(value))) return 'numeric'
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date'
    return 'text'
  }
  return 'unknown'
}

/**
 * Calculate percentiles
 */
export function calculatePercentile(
  values: number[],
  percentile: number
): number {
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

/**
 * Calculate quartiles
 */
export function calculateQuartiles(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const q1Index = Math.floor(sorted.length * 0.25)
  const q2Index = Math.floor(sorted.length * 0.5)
  const q3Index = Math.floor(sorted.length * 0.75)
  
  return {
    q1: sorted[q1Index],
    q2: sorted[q2Index],
    q3: sorted[q3Index],
    iqr: sorted[q3Index] - sorted[q1Index],
  }
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers(values: number[]) {
  const { q1, q3, iqr } = calculateQuartiles(values)
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr
  
  return values.filter(v => v < lowerBound || v > upperBound)
}

/**
 * Get color palette
 */
export function getColorPalette(index: number): string {
  const colors = [
    '#0088FE', // blue
    '#00C49F', // green
    '#FFBB28', // yellow
    '#FF8042', // orange
    '#8884D8', // light blue
    '#82CA9D', // light green
    '#FFC658', // light yellow
    '#FF7C7C', // light red
  ]
  
  return colors[index % colors.length]
}

/**
 * Format date
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      clonedObj[key] = deepClone(obj[key])
    }
    return clonedObj
  }
  return obj
}
