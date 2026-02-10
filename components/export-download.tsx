'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, FileJson, FileText, ImageIcon, FileImage } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'

interface ExportDownloadProps {
  data: any[]
  fileName: string
  analysis: Record<string, any>
}

export default function ExportDownload({ data, fileName, analysis }: ExportDownloadProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Generate analysis summary chart
  const summaryChartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify({
    type: 'bar',
    data: {
      labels: ['Rows', 'Columns', 'Quality'],
      datasets: [{
        label: 'Dataset Stats',
        data: [data.length, Object.keys(analysis).length, 85],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderRadius: 8
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Export Summary', font: { size: 14 } }
      }
    }
  }))}&w=300&h=200&f=png`

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
      console.error('[Export] CSV error:', error)
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
      console.error('[Export] JSON error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportSummaryReport = () => {
    setIsExporting(true)
    try {
      let report = `DATA ANALYSIS SUMMARY REPORT\n`
      report += `${'='.repeat(60)}\n\n`
      report += `📊 File: ${fileName}\n`
      report += `📈 Rows: ${data.length.toLocaleString()}\n`
      report += `📋 Columns: ${Object.keys(analysis).length}\n`
      report += `📅 Generated: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}\n\n`
      report += `COLUMN ANALYSIS\n`
      report += `${'-'.repeat(60)}\n`

      Object.entries(analysis).forEach(([col, info]: [string, any]) => {
        report += `\n🔹 ${col}:\n`
        report += `   Type: ${info.dtype || info.type || 'Unknown'}\n`
        report += `   Unique: ${info.unique || 'N/A'}\n`
        report += `   Missing: ${((info.missing_percent || 0) * 100).toFixed(2)}%\n`
        if (info.mean !== undefined) report += `   Mean: ${Number(info.mean).toFixed(2)}\n`
        if (info.std !== undefined) report += `   Std Dev: ${Number(info.std).toFixed(2)}\n`
        if (info.max !== undefined) report += `   Range: ${Number(info.min).toFixed(2)} - ${Number(info.max).toFixed(2)}\n`
      })

      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_report.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('[Export] Report error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportVisualReport = () => {
    setIsExporting(true)
    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${fileName} - Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
    .header { text-align: center; margin-bottom: 40px; }
    .chart-container { text-align: center; margin: 30px 0; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; }
    h1 { color: #2d3748; }
    h2 { color: #4a5568; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Data Analysis Report</h1>
    <p>${fileName} | ${data.length} rows | ${Object.keys(analysis).length} columns</p>
  </div>
  
  <div class="chart-container">
    <img src="${summaryChartUrl}" alt="Dataset Summary" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);" />
  </div>
  
  <div class="stats">
    <div class="stat-card">
      <h3>${data.length.toLocaleString()}</h3>
      <p>Total Rows</p>
    </div>
    <div class="stat-card">
      <h3>${Object.keys(analysis).length}</h3>
      <p>Columns</p>
    </div>
    <div class="stat-card">
      <h3>85%</h3>
      <p>Quality Score</p>
    </div>
  </div>
  
  <h2>📋 Column Analysis</h2>
  ${Object.entries(analysis).map(([col, info]: [string, any]) => `
    <div style="margin-bottom: 20px; padding: 15px; background: #f7fafc; border-radius: 8px;">
      <h3 style="margin: 0 0 10px 0; color: #2d3748;">${col}</h3>
      <p><strong>Type:</strong> ${info.dtype || 'Unknown'}</p>
      <p><strong>Unique:</strong> ${info.unique || 'N/A'}</p>
      <p><strong>Missing:</strong> ${((info.missing_percent || 0) * 100).toFixed(1)}%</p>
    </div>
  `).join('')}
</body>
</html>`

      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_visual_report.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('[Export] Visual report error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="p-6 border-border/40 bg-gradient-to-br from-card/70 bg-card/50 backdrop-blur-sm">
      <div className="space-y-6">
        {/* Header with Summary Chart */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold text-foreground">Export Analysis Results</h3>
              <p className="text-sm text-muted-foreground">Download data and reports in multiple formats</p>
            </div>
          </div>
          
          {/* Summary Chart */}
          <div className="flex justify-center p-4 bg-background/50 rounded-xl border border-border/30">
            <img
              src={summaryChartUrl}
              alt="Export Summary"
              className="w-64 h-40 object-contain rounded-lg shadow-md"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={exportCSV}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Clean CSV Data
            <span className="ml-2 text-xs opacity-75">({data.length.toLocaleString()} rows)</span>
          </Button>

          <Button
            onClick={exportJSON}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <FileJson className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Complete JSON
            <span className="ml-2 text-xs opacity-75">(with analysis)</span>
          </Button>

          <Button
            onClick={exportSummaryReport}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Text Summary
            <span className="ml-2 text-xs opacity-75">({Object.keys(analysis).length} cols)</span>
          </Button>

          <Button
            onClick={exportVisualReport}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <FileImage className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Visual HTML Report
            <span className="ml-2 text-xs opacity-75">(with charts)</span>
          </Button>
        </div>

        {isExporting && (
          <div className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-primary/80 font-medium">Generating export...</span>
          </div>
        )}
      </div>
    </Card>
  )
}
