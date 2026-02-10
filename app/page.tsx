'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import FileUploadSection from '@/components/file-upload'
import DataDashboard from '@/components/data-dashboard'
import { BarChart3 } from 'lucide-react'

export default function Page() {
  const [uploadedData, setUploadedData] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleDataUpload = (data: any, name: string) => {
    setUploadedData(data)
    setFileName(name)
  }

  const handleReset = () => {
    setUploadedData(null)
    setFileName('')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'hsl(10, 20%, 8%)', color: 'hsl(0, 0%, 95%)' }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-50 backdrop-blur-sm"
        style={{ borderColor: 'hsl(10, 20%, 20%)', backgroundColor: 'hsla(10, 20%, 8%, 0.95)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 136, 254, 0.1)' }}>
                <BarChart3 className="w-6 h-6" style={{ color: 'hsl(200, 100%, 50%)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">QuickCharts</h1>
                <p className="text-sm opacity-70">Smart Data Analysis Platform</p>
              </div>
            </div>
            {uploadedData && (
              <Button
                onClick={handleReset}
                className="text-foreground"
                style={{ borderColor: 'hsl(10, 20%, 25%)', backgroundColor: 'transparent', border: '1px solid' }}
              >
                Upload New File
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!uploadedData ? (
          <FileUploadSection onDataUpload={handleDataUpload} />
        ) : (
          <DataDashboard
            data={uploadedData}
            fileName={fileName}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t mt-16"
        style={{ borderColor: 'hsl(10, 20%, 20%)', backgroundColor: 'hsl(10, 20%, 10%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm opacity-70">
            <p>QuickCharts • Smart Data Visualization for Everyone</p>
            <p className="mt-2">Powered by advanced analytics and interactive visualizations</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
