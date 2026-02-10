'use client'

import { Card } from '@/components/ui/card'
import { File, Calendar, Database, Columns3, HardDrive } from 'lucide-react'
import { formatFileSize as formatBytes, formatDate } from '@/lib/data-utils'
import { API_BASE_URL } from '@/lib/constants'

interface FileMetadataProps {
  fileName: string
  fileSize?: number
  uploadedAt?: string
  rowCount: number
  columnCount: number
}

export default function FileMetadata({
  fileName,
  fileSize,
  uploadedAt,
  rowCount,
  columnCount,
}: FileMetadataProps) {
  // Dataset density chart
  const densityChartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify({
    type: 'doughnut',
    data: {
      labels: ['Rows', 'Columns'],
      datasets: [{
        data: [rowCount, columnCount],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      cutout: '60%'
    }
  }))}&w=100&h=100&f=png`

  const getFileIcon = () => {
    if (fileName.endsWith('.csv')) return <File className="w-12 h-12 text-green-500" />
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <Database className="w-12 h-12 text-blue-500" />
    return <File className="w-12 h-12 text-gray-500" />
  }

  const getFileType = () => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch(ext) {
      case 'csv': return 'CSV Spreadsheet'
      case 'xlsx': 
      case 'xls': return 'Excel Workbook'
      case 'json': return 'JSON Data'
      default: return 'Data File'
    }
  }

  return (
    <Card className="border-border/40 bg-gradient-to-br from-card/70 p-6 space-y-6 relative overflow-hidden">
      {/* Background density chart */}
      <div className="absolute top-6 right-6 opacity-20">
        <img
          src={densityChartUrl}
          alt="Dataset density"
          className="w-24 h-24"
          onError={(e) => e.currentTarget.style.display = 'none'}
        />
      </div>

      {/* File Header */}
      <div className="flex items-start gap-4 relative z-10">
        <div className="flex-shrink-0 mt-1 p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-foreground truncate mb-1">
            {fileName}
          </h3>
          <p className="text-sm text-muted-foreground bg-background/60 px-3 py-1 rounded-full inline-flex items-center gap-2">
            {getFileType()}
            <span className="text-xs bg-primary/20 text-primary/90 px-2 py-0.5 rounded-full font-mono">
              {fileName.split('.').pop()?.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* Dataset Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
        <div className="group space-y-2 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/40 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary/80 transition-colors">
            <Database className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wide uppercase">Rows</span>
          </div>
          <p className="text-3xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent group-hover:scale-[1.02] transition-transform">
            {rowCount.toLocaleString()}
          </p>
        </div>

        <div className="group space-y-2 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/40 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary/80 transition-colors">
            <Columns3 className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wide uppercase">Columns</span>
          </div>
          <p className="text-3xl font-black bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent group-hover:scale-[1.02] transition-transform">
            {columnCount}
          </p>
        </div>

        {fileSize !== undefined && (
          <div className="group space-y-2 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/40 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary/80 transition-colors">
              <HardDrive className="w-5 h-5" />
              <span className="text-xs font-semibold tracking-wide uppercase">File Size</span>
            </div>
            <p className="text-2xl font-black bg-gradient-to-r from-muted-foreground to-muted bg-clip-text text-transparent">
              {formatBytes(fileSize)}
            </p>
          </div>
        )}

        {uploadedAt && (
          <div className="group space-y-2 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/40 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary/80 transition-colors">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-semibold tracking-wide uppercase">Uploaded</span>
            </div>
            <p className="text-sm font-bold text-foreground bg-gradient-to-r from-foreground/90 to-primary/60 bg-clip-text">
              {formatDate(uploadedAt)}
            </p>
          </div>
        )}
      </div>

      {/* Dataset Density Summary */}
      <div className="pt-4 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground">
        <span>Density: {rowCount.toLocaleString()} rows × {columnCount} columns</span>
        <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
          {Math.round((rowCount / 1000) * columnCount)} cells
        </span>
      </div>
    </Card>
  )
}
