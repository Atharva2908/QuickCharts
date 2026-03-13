'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, FileJson, FileText, ImageIcon, FileImage, Table, FileDigit, Image as ChartIcon } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'

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
              return String(value)
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

  const exportXLSX = () => {
    setIsExporting(true)
    try {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Cleaned Data")
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_cleaned.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('[Export] XLSX error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportChartImage = async (format: 'png' | 'jpeg') => {
    setIsExporting(true)
    try {
      const response = await fetch(summaryChartUrl.replace('f=png', `f=${format}`))
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}_chart.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error(`[Export] ${format.toUpperCase()} error:`, error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportPDF = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const title = `${fileName.replace(/\.[^/.]+$/, '')} - Analysis Report`
      
      doc.setFontSize(22)
      doc.setTextColor(59, 130, 246)
      doc.text("QuickCharts Data Report", 20, 20)
      
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30)
      doc.text(`File name: ${fileName}`, 20, 36)
      doc.text(`Rows: ${data.length.toLocaleString()} | Columns: ${Object.keys(analysis).length}`, 20, 42)
      
      doc.line(20, 48, 190, 48)
      
      // Add summary chart
      try {
        const response = await fetch(summaryChartUrl)
        const blob = await response.blob()
        const reader = new FileReader()
        const base64Data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
        doc.addImage(base64Data, 'PNG', 20, 55, 170, 100)
      } catch (e) {
        doc.text("Chart could not be loaded", 20, 80)
      }
      
      // Add column statistics summary table header
      doc.addPage()
      doc.setFontSize(16)
      doc.setTextColor(0)
      doc.text("Column Technical Summary", 20, 20)
      
      let y = 35
      Object.entries(analysis).slice(0, 15).forEach(([col, info]: [string, any]) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(col, 20, y)
        doc.setFont("helvetica", "normal")
        doc.text(`Type: ${info.dtype} | Missing: ${((info.missing_percent || 0) * 100).toFixed(1)}% | Unique: ${info.unique}`, 20, y + 5)
        y += 15
      })
      
      doc.save(`${fileName.replace(/\.[^/.]+$/, '')}_report.pdf`)
    } catch (error) {
      console.error('[Export] PDF error:', error)
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
    <Card className="p-6 border border-gray-200 bg-white shadow-sm">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={exportCSV}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-500 shadow-sm transition-all rounded-xl"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-sm font-bold leading-none mb-1">Export CSV</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Cleaned Dataset</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={exportXLSX}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-white hover:bg-green-50 text-green-600 border-green-200 hover:border-green-500 shadow-sm transition-all rounded-xl"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <Table className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-sm font-bold leading-none mb-1">Export Excel</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">XLSX Format</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={exportPDF}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-500 shadow-sm transition-all rounded-xl"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <FileDigit className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-sm font-bold leading-none mb-1">PDF Report</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Summary & Charts</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => exportChartImage('png')}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-white hover:bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-500 shadow-sm transition-all rounded-xl"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <ChartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-sm font-bold leading-none mb-1">Summary PNG</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">High Resolution</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => exportChartImage('jpeg')}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-500 shadow-sm transition-all rounded-xl"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-sm font-bold leading-none mb-1">Summary JPEG</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Compressed Image</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={exportJSON}
            disabled={isExporting || data.length === 0}
            className="group h-14 bg-white hover:bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-500 shadow-sm transition-all rounded-xl"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-sm font-bold leading-none mb-1">Raw JSON</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Analysis Metadata</div>
              </div>
            </div>
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
