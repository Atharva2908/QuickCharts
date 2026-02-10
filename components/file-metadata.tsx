'use client'

import { Card } from '@/components/ui/card'
import { File, Calendar, Database, Columns3, HardDrive } from 'lucide-react'
import { formatFileSize as formatBytes, formatDate } from '@/lib/data-utils'


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
  const getFileIcon = () => {
    if (fileName.endsWith('.csv')) return '📄'
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return '📊'
    return '📁'
  }

  return (
    <Card className="border-border/40 bg-card/50 p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{getFileIcon()}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">
            {fileName}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {fileName.split('.').pop()?.toUpperCase()} File
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Database className="w-4 h-4" />
            <span className="text-xs font-medium">Rows</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {rowCount.toLocaleString()}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Columns3 className="w-4 h-4" />
            <span className="text-xs font-medium">Columns</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {columnCount}
          </p>
        </div>

        {fileSize !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs font-medium">Size</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {formatBytes(fileSize)}
            </p>
          </div>
        )}

        {uploadedAt && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Uploaded</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(uploadedAt)}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
