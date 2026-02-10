'use client'

import React, { useRef } from "react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, FileUp, AlertCircle, Loader2, BarChart3 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
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

  // Processing pipeline visualization
  const pipelineChartConfig = {
    type: 'bar',
    data: {
      labels: ['Upload', 'Parse', 'Analyze', 'Visualize'],
      datasets: [{
        label: 'Pipeline',
        data: [25, 50, 75, 100],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { ticks: { font: { size: 11 } } } }
    }
  }

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
      setError('Invalid file type. Please upload CSV, XLSX, or XLS files only.')
      return false
    }
    if (!isValidSize) {
      setError('File size exceeds 100MB limit. Please choose a smaller file.')
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
          timeout: 60000,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentComplete = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
              setProgress(percentComplete)
            }
          },
        }
      )

      onDataUpload(response.data, file.name)
    } catch (err: any) {
      console.error('Upload error:', err)
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to process file. Please check server and try again.'
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
      e.target.value = ''
    }
  }

  const handleSelectFileClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-secondary/20 px-6 py-3 rounded-full">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h2 className="text-4xl font-black bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Transform Data Into Insights
          </h2>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Drag & drop your CSV/Excel file to instantly unlock interactive charts, 
          automated analysis, and AI-powered insights. No setup required.
        </p>
      </div>

      {/* Upload Card */}
      <Card 
        className={`relative border-2 border-dashed transition-all duration-300 p-1 hover:shadow-2xl hover:scale-[1.02] ${
          isDragging 
            ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 ring-4 ring-primary/30 shadow-2xl' 
            : 'border-border/30 hover:border-primary/60 bg-gradient-to-br from-background/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            {/* Animated Icon */}
            <div className={`p-6 rounded-2xl transition-all duration-500 ${
              isDragging ? 'bg-primary/20 scale-110' : 'bg-primary/10 hover:scale-105'
            }`}>
              {isLoading ? (
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              ) : isDragging ? (
                <FileUp className="w-16 h-16 text-primary" />
              ) : (
                <Upload className="w-16 h-16 text-primary group-hover:scale-110 transition-transform duration-200" />
              )}
            </div>

            {/* Status Text */}
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-foreground">
                {isLoading ? '🔄 Processing Your Data...' : 
                 isDragging ? '🚀 Drop to Upload!' : 'Drop your file here or click below'}
              </h3>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                {isLoading 
                  ? 'Analyzing structure → Detecting patterns → Generating visualizations...' 
                  : 'Supports CSV, XLSX, XLS files • Maximum 100MB • Instant analysis'
                }
              </p>
            </div>

            {/* Action Button */}
            {!isLoading && (
              <Button 
                onClick={handleSelectFileClick}
                className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-10 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl h-auto rounded-2xl transition-all duration-300 transform hover:-translate-y-1"
                disabled={isLoading}
                size="lg"
              >
                <FileUp className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" />
                Choose File
              </Button>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="sr-only"
              disabled={isLoading}
            />

            {/* Enhanced Progress */}
            {isLoading && progress > 0 && (
              <div className="w-full max-w-lg bg-background/80 backdrop-blur-sm p-6 rounded-2xl border border-border/30 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-foreground">Processing Pipeline</span>
                  <span className="text-2xl font-bold text-primary">{progress}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary to-secondary rounded-full shadow-inner"
                />
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  {progress < 30 ? 'Uploading file...' : 
                   progress < 70 ? 'Parsing data...' : 
                   'Generating visualizations...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-destructive/50 bg-destructive/5 border-l-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <AlertDescription className="font-medium text-destructive/90">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        {[
          { icon: FileUp, title: 'Lightning Upload', desc: 'Drag & drop or click. Supports CSV/Excel up to 100MB instantly.' },
          { icon: BarChart3, title: 'Auto Analysis', desc: 'Smart data detection, quality checks, and visualization generation.' },
          { icon: Upload, title: 'AI Insights', desc: 'Automated pattern detection and actionable recommendations.' }
        ].map(({ icon: Icon, title, desc }, idx) => (
          <Card key={idx} className="border-border/40 bg-gradient-to-b from-card p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border-0 bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {title}
              </h4>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
