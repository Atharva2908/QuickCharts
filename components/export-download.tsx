'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, FileJson, FileText, ImageIcon } from 'lucide-react'

interface ExportDownloadProps {
  data: any[]
  fileName: string
  analysis: Record<string, any>
}

export default function ExportDownload({ data, fileName, analysis }: ExportDownloadProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportCSV = () => {
    setIsExporting(true)
    try {
      const headers = data.length > 0 ? Object.keys(data[0]) : []
      const csv = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              if (value === null || value === undefined) return ''
              if (typeof value === 'string' && value.includes(',')) return `"${value}"`
              return value
            })
            .join(',')
        ),
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_cleaned.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('[v0] CSV export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportJSON = () => {
    setIsExporting(true)
    try {
      const jsonData = {
        metadata: {
          fileName,
          exportDate: new Date().toISOString(),
          rowCount: data.length,
          columnCount: data.length > 0 ? Object.keys(data[0]).length : 0,
        },
        analysis,
        data,
      }

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_analysis.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('[v0] JSON export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportSummaryReport = () => {
    setIsExporting(true)
    try {
      let report = `DATA ANALYSIS SUMMARY REPORT\n`
      report += `${'='.repeat(50)}\n\n`

      report += `File: ${fileName}\n`
      report += `Rows: ${data.length}\n`
      report += `Columns: ${data.length > 0 ? Object.keys(data[0]).length : 0}\n`
      report += `Generated: ${new Date().toLocaleString()}\n\n`

      report += `COLUMN ANALYSIS\n`
      report += `${'-'.repeat(50)}\n`
      Object.entries(analysis).forEach(([col, info]: [string, any]) => {
        report += `\n${col}:\n`
        report += `  Type: ${info.type || 'Unknown'}\n`
        report += `  Unique: ${info.unique || 'N/A'}\n`
        report += `  Missing: ${((info.missing_percent || 0) * 100).toFixed(2)}%\n`
        if (info.mean !== undefined) report += `  Mean: ${info.mean.toFixed(2)}\n`
        if (info.max !== undefined) report += `  Max: ${info.max.toFixed(2)}\n`
        if (info.min !== undefined) report += `  Min: ${info.min.toFixed(2)}\n`
      })

      const blob = new Blob([report], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_report.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('[v0] Report export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="p-6 border-border/40 bg-card/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Results
          </h3>
          <p className="text-sm text-muted-foreground">Download your analysis in various formats</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={exportCSV}
            disabled={isExporting || data.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            CSV Data
          </Button>

          <Button
            onClick={exportJSON}
            disabled={isExporting || data.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileJson className="w-4 h-4 mr-2" />
            JSON Report
          </Button>

          <Button
            onClick={exportSummaryReport}
            disabled={isExporting || data.length === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Text Report
          </Button>
        </div>

        {isExporting && <p className="text-sm text-muted-foreground text-center">Preparing export...</p>}
      </div>
    </Card>
  )
}
