import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    if (error.response) {
      const message = error.response.data?.detail || error.response.statusText
      throw new Error(message)
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.')
    } else {
      throw new Error('Error setting up request')
    }
  }
)

export interface UploadResponse {
  data: Record<string, any>[]
  columns: string[]
  analysis: Record<string, AnalysisInfo>
  insights: Insight[]
  data_quality: DataQuality
  metadata: {
    filename: string
    rows: number
    columns: number
    uploaded_at: string
  }
}

export interface AnalysisInfo {
  dtype: string
  unique: number
  missing: number
  missing_percent: number
  mean?: number
  median?: number
  std?: number
  min?: number
  max?: number
  [key: string]: any
}

export interface Insight {
  type: 'general' | 'trend' | 'alert'
  title?: string
  message?: string
  description?: string
  recommendation?: string
  summary?: string
  metrics?: Record<string, number>
}

export interface DataQuality {
  quality_score: number
  missing_count: number
  duplicate_count: number
  completeness: number
  issues: string[]
}

// Upload file endpoint
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<UploadResponse>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

// Get sample data endpoint
export async function getSampleData(): Promise<UploadResponse> {
  const response = await apiClient.get<UploadResponse>('/api/sample-data')
  return response.data
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    await apiClient.get('/health')
    return true
  } catch {
    return false
  }
}
