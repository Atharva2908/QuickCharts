'use client'

import React, { useRef } from "react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, FileUp, AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import axios from 'axios'

interface FileUploadProps {
  onDataUpload: (data: any, fileName: string) => void
}

export default function FileUploadSection({ onDataUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.csv', '.xlsx', '.xls']
    const isValidType = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )
    const maxSize = 100 * 1024 * 1024 // 100MB
    const isValidSize = file.size <= maxSize

    if (!isValidType) {
      setError('Invalid file type. Please upload a CSV or Excel file.')
      return false
    }
    if (!isValidSize) {
      setError('File size exceeds 100MB limit.')
      return false
    }
    return true
  }

  const processFile = async (file: File) => {
    if (!validateFile(file)) return

    setIsLoading(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        'http://localhost:8000/api/upload',
        formData,
        {
          // ✅ REMOVED Content-Type header - axios auto-sets for FormData
          timeout: 60000, // 60s timeout
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentComplete = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
              setProgress(percentComplete)
              console.log(`Upload progress: ${percentComplete}%`)
            }
          },
        }
      )

      onDataUpload(response.data, file.name)
    } catch (err: any) {
      console.error('Upload error:', err)
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'Failed to process file. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
      // Reset input to allow same file re-upload
      e.target.value = ''
    }
  }

  const handleSelectFileClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold text-foreground">
          Transform Your Data Into Insights
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload your CSV or Excel file and instantly get interactive visualizations, 
          data analysis, and AI-generated insights without any technical expertise.
        </p>
      </div>

      {/* Upload Card */}
      <Card 
        className={`border-2 border-dashed transition-all duration-200 p-0.5 hover:shadow-lg ${
          isDragging 
            ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
            : 'border-border/40 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className={`p-4 rounded-full transition-all ${
              isLoading ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
              {isLoading ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-primary" />
              )}
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-foreground">
                {isLoading ? 'Processing Your File...' : 'Drop your file here'}
              </h3>
              <p className="text-muted-foreground">
                {isLoading 
                  ? 'Analyzing data and generating visualizations...' 
                  : 'or click below to select a CSV or Excel file (max 100MB)'
                }
              </p>
            </div>

            {!isLoading && (
              <>
                <Button 
                  onClick={handleSelectFileClick}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                  disabled={isLoading}
                  size="lg"
                >
                  <FileUp className="w-5 h-5 mr-2" />
                  Select File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="sr-only"
                  disabled={isLoading}
                />
              </>
            )}

            {/* Progress Bar */}
            {isLoading && progress > 0 && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Upload Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert className="border-destructive bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="border-border/40 p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FileUp className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">Easy Upload</h4>
            <p className="text-sm text-muted-foreground">
              Support for CSV and Excel files up to 100MB. Drag & drop or click to upload.
            </p>
          </div>
        </Card>

        <Card className="border-border/40 p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">Auto Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Automatic data type detection, missing values analysis, and quality assessment.
            </p>
          </div>
        </Card>

        <Card className="border-border/40 p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">Smart Insights</h4>
            <p className="text-sm text-muted-foreground">
              AI-generated insights, trends, and recommendations in simple language.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
