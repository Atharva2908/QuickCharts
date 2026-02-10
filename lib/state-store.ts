import { create } from 'zustand'

export interface FileState {
  uploadedFile: File | null
  fileName: string
  fileSize: number
  uploadedAt: string | null
  isUploading: boolean
  uploadProgress: number
  uploadError: string | null
  setUploadedFile: (file: File | null, name: string, size: number) => void
  setUploading: (loading: boolean) => void
  setUploadProgress: (progress: number) => void
  setUploadError: (error: string | null) => void
  clearFile: () => void
}

export interface DataState {
  parsedData: any[] | null
  analysis: Record<string, any> | null
  quality: Record<string, any> | null
  columns: string[]
  isAnalyzing: boolean
  analysisError: string | null
  setParsedData: (data: any[]) => void
  setAnalysis: (analysis: Record<string, any>, quality: Record<string, any>) => void
  setColumns: (cols: string[]) => void
  setAnalyzing: (loading: boolean) => void
  setAnalysisError: (error: string | null) => void
  clearData: () => void
}

export interface ChartState {
  selectedChartType: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram'
  selectedXColumn: string | null
  selectedYColumn: string | null
  setChartType: (type: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram') => void
  setXColumn: (col: string) => void
  setYColumn: (col: string) => void
  clearChart: () => void
}

export interface UIState {
  activeTab: string
  isLoading: boolean
  errorMessage: string | null
  successMessage: string | null
  setActiveTab: (tab: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (message: string | null) => void
  clear: () => void
}

// File State Store
export const useFileStore = create<FileState>((set) => ({
  uploadedFile: null,
  fileName: '',
  fileSize: 0,
  uploadedAt: null,
  isUploading: false,
  uploadProgress: 0,
  uploadError: null,

  setUploadedFile: (file, name, size) =>
    set({
      uploadedFile: file,
      fileName: name,
      fileSize: size,
      uploadedAt: new Date().toISOString(),
    }),

  setUploading: (loading) => set({ isUploading: loading }),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  setUploadError: (error) => set({ uploadError: error }),

  clearFile: () =>
    set({
      uploadedFile: null,
      fileName: '',
      fileSize: 0,
      uploadedAt: null,
      isUploading: false,
      uploadProgress: 0,
      uploadError: null,
    }),
}))

// Data State Store
export const useDataStore = create<DataState>((set) => ({
  parsedData: null,
  analysis: null,
  quality: null,
  columns: [],
  isAnalyzing: false,
  analysisError: null,

  setParsedData: (data) => set({ parsedData: data }),

  setAnalysis: (analysis, quality) => set({ analysis, quality }),

  setColumns: (cols) => set({ columns: cols }),

  setAnalyzing: (loading) => set({ isAnalyzing: loading }),

  setAnalysisError: (error) => set({ analysisError: error }),

  clearData: () =>
    set({
      parsedData: null,
      analysis: null,
      quality: null,
      columns: [],
      isAnalyzing: false,
      analysisError: null,
    }),
}))

// Chart State Store
export const useChartStore = create<ChartState>((set) => ({
  selectedChartType: 'bar',
  selectedXColumn: null,
  selectedYColumn: null,

  setChartType: (type) => set({ selectedChartType: type }),

  setXColumn: (col) => set({ selectedXColumn: col }),

  setYColumn: (col) => set({ selectedYColumn: col }),

  clearChart: () =>
    set({
      selectedChartType: 'bar',
      selectedXColumn: null,
      selectedYColumn: null,
    }),
}))

// UI State Store
export const useUIStore = create<UIState>((set) => ({
  activeTab: 'overview',
  isLoading: false,
  errorMessage: null,
  successMessage: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ errorMessage: error }),

  setSuccess: (message) => set({ successMessage: message }),

  clear: () =>
    set({
      activeTab: 'overview',
      isLoading: false,
      errorMessage: null,
      successMessage: null,
    }),
}))

// Combined hook to get all state
export function useAppState() {
  const fileState = useFileStore()
  const dataState = useDataStore()
  const chartState = useChartStore()
  const uiState = useUIStore()

  return {
    file: fileState,
    data: dataState,
    chart: chartState,
    ui: uiState,
  }
}
