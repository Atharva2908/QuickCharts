'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { API_BASE_URL } from '@/lib/constants'
import { BarChart3, AlertCircle, TrendingUp, LineChart, ChartScatter, BarChart2 } from 'lucide-react'

interface VisualizationControlProps {
  columns: string[]
  analysis: Record<string, any>
  onVisualize: (xColumn: string, yColumn: string, chartType: string) => void
  isLoading?: boolean
}

type ChartType = 'bar' | 'line' | 'scatter' | 'histogram'

interface ChartCompatibility {
  compatible: boolean
  reason?: string
}

export default function VisualizationControl({
  columns,
  analysis,
  onVisualize,
  isLoading = false,
}: VisualizationControlProps) {
  const [xColumn, setXColumn] = useState<string>(columns[0] || '')
  const [yColumn, setYColumn] = useState<string>(columns[1] || columns[0] || '')
  const [chartType, setChartType] = useState<ChartType>('bar')

  // Determine numeric and categorical columns
  const numericColumns = useMemo(() => {
    return columns.filter(col => {
      const colAnalysis = analysis[col]
      if (!colAnalysis) return false
      const dtype = colAnalysis.dtype || ''
      return dtype.includes('int') || dtype.includes('float')
    })
  }, [columns, analysis])

  const categoricalColumns = useMemo(() => {
    return columns.filter(col => {
      const colAnalysis = analysis[col]
      if (!colAnalysis) return false
      const dtype = colAnalysis.dtype || ''
      return dtype.includes('object') || dtype.includes('str')
    })
  }, [columns, analysis])

  // LIVE QuickChart preview URL - MINIMAL CHANGE
  const previewChartUrl = useMemo(() => {
    if (!xColumn || !yColumn) return null

    const baseConfig = {
      type: chartType === 'scatter' ? 'scatter' : chartType,
      data: {
        labels: ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4', 'Sample 5']
      },
      options: {
        responsive: true,
        backgroundColor: '#FFFFFF',
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      }
    }

    // Simple dataset based on chart type
    if (chartType === 'bar') {
      baseConfig.data.datasets = [{
        label: `${yColumn}`,
        data: [12, 19, 3, 5, 2],
        backgroundColor: '#3b82f6'
      }]
    } else if (chartType === 'line') {
      baseConfig.data.datasets = [{
        label: `${yColumn}`,
        data: [10, 20, 15, 35, 25],
        borderColor: '#10b981',
        fill: false
      }]
    } else if (chartType === 'scatter') {
      delete baseConfig.data.labels
      baseConfig.data.datasets = [{
        label: `${yColumn}`,
        data: [{x: 1, y: 2}, {x: 2, y: 4}, {x: 3, y: 3}, {x: 4, y: 5}, {x: 5, y: 6}],
        backgroundColor: '#ef4444'
      }]
    } else if (chartType === 'histogram') {
      baseConfig.data.datasets = [{
        label: `${xColumn}`,
        data: [12, 25, 18, 8, 15],
        backgroundColor: '#f59e0b'
      }]
    }

    return `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(baseConfig))}&w=400&h=300&f=png`
  }, [chartType, xColumn, yColumn])

  // Validate chart type compatibility
  const validateChartType = (type: ChartType, xCol: string, yCol: string): ChartCompatibility => {
    const xAnalysis = analysis[xCol]
    const yAnalysis = analysis[yCol]
    const xIsNumeric = xAnalysis?.dtype?.includes('int') || xAnalysis?.dtype?.includes('float')
    const yIsNumeric = yAnalysis?.dtype?.includes('int') || yAnalysis?.dtype?.includes('float')

    switch (type) {
      case 'bar':
        return { compatible: true, reason: 'Works with any column types' }
      case 'line':
        if (!yIsNumeric) {
          return {
            compatible: false,
            reason: 'Y-axis must be numeric for line charts',
          }
        }
        return { compatible: true }
      case 'scatter':
        if (!xIsNumeric || !yIsNumeric) {
          return {
            compatible: false,
            reason: 'Both X and Y axes must be numeric for scatter plots',
          }
        }
        return { compatible: true }
      case 'histogram':
        if (!yIsNumeric) {
          return {
            compatible: false,
            reason: 'Histogram requires numeric data',
          }
        }
        return { compatible: true }
      default:
        return { compatible: true }
    }
  }

  const chartCompatibility = validateChartType(chartType, xColumn, yColumn)

  const handleVisualize = () => {
    if (chartCompatibility.compatible) {
      onVisualize(xColumn, yColumn, chartType)
    }
  }

  return (
    <Card className="border-border/40 bg-card/50 p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Visualization Settings
        </h3>
      </div>

      {/* LIVE Preview - NEW */}
      {previewChartUrl && (
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</label>
          <div className="border border-border/50 rounded-lg overflow-hidden bg-background/50 h-48 flex items-center justify-center">
            <img 
              src={previewChartUrl} 
              alt="Live preview" 
              className="w-full h-full object-contain rounded"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
        </div>
      )}

      {/* Chart Type Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Chart Type</label>
        <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
          <SelectTrigger className="bg-background/50 border-border/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">📊 Bar Chart</SelectItem>
            <SelectItem value="line">📈 Line Chart</SelectItem>
            <SelectItem value="scatter">🔗 Scatter Plot</SelectItem>
            <SelectItem value="histogram">📉 Histogram</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* X-Axis Column Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">X-Axis Column</label>
        <Select value={xColumn} onValueChange={setXColumn}>
          <SelectTrigger className="bg-background/50 border-border/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map(col => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Y-Axis Column Selector */}
      {chartType !== 'histogram' && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Y-Axis Column</label>
          <Select value={yColumn} onValueChange={setYColumn}>
            <SelectTrigger className="bg-background/50 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {columns.map(col => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Compatibility Warning */}
      {!chartCompatibility.compatible && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-500 text-sm">
            {chartCompatibility.reason}
          </AlertDescription>
        </Alert>
      )}

      {/* Recommendations */}
      {chartCompatibility.compatible && previewChartUrl && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-primary mt-1" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-foreground">Chart Configuration</p>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>✓ Live preview connected via QuickChart API</li>
                <li>✓ Ready to generate full visualization</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleVisualize}
        disabled={isLoading || !chartCompatibility.compatible || !xColumn || !yColumn}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? 'Generating...' : 'Generate Visualization'}
      </Button>
    </Card>
  )
}
