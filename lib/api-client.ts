import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('[v0] API Error:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        })
        return Promise.reject(error)
      }
    )
  }

  // Upload file and get analysis
  async uploadFile(file: File, onProgress?: (percent: number) => void) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await this.client.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentComplete)
          }
        },
      })

      return this.validateResponse(response.data, 'File upload')
    } catch (error) {
      throw this.handleError(error, 'File upload failed')
    }
  }

  // Get sample data
  async getSampleData() {
    try {
      const response = await this.client.get('/api/sample')
      return this.validateResponse(response.data, 'Sample data fetch')
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch sample data')
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health')
      return response.data
    } catch (error) {
      console.error('[v0] Health check failed:', error)
      return { status: 'unhealthy' }
    }
  }

  // Validate response structure
  private validateResponse(data: any, context: string) {
    if (!data) {
      throw new Error(`${context}: Empty response`)
    }

    if (data.error) {
      throw new Error(`${context}: ${data.error}`)
    }

    return data
  }

  // Handle errors
  private handleError(error: any, defaultMessage: string) {
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail)
    }

    if (error.message) {
      return new Error(`${defaultMessage}: ${error.message}`)
    }

    return new Error(defaultMessage)
  }
}

export const apiClient = new APIClient()
