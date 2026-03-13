'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { 
  BarChart3, 
  AlertCircle, 
  TrendingUp, 
  LineChart as LineChartIcon, 
  ScatterChart as ScatterChartIcon, 
  PieChart as PieChartIcon, 
  AreaChart as AreaChartIcon, 
  Sparkles,
  Database,
  Type,
  Hash,
  Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface VisualizationControlProps {
  columns: string[]
  analysis: Record<string, any>
  data?: any[]
  onVisualize: (xColumn: string, yColumn: string, chartType: string) => void
  isLoading?: boolean
}

type ChartType = 'bar' | 'line' | 'scatter' | 'histogram' | 'pie' | 'area'

interface ChartCompatibility {
  compatible: boolean
  reason?: string
  insight?: string
}

// Internal Mini Chart Preview Component
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip as RechartsTooltip, ScatterChart, Scatter 
} from 'recharts'

function LiveMiniPreview({ data, xCol, yCol, type }: { data: any[], xCol: string, yCol: string, type: string }) {
  const previewData = useMemo(() => {
    if (!data || !data.length) return []
    return data.slice(0, 5).map(row => ({
      name: String(row[xCol] || '').substring(0, 6),
      value: Number(row[yCol]) || 0,
    }))
  }, [data, xCol, yCol])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 gap-2">
        <Database className="w-8 h-8" />
        <p className="text-[10px] font-medium uppercase tracking-tighter">No data available for preview</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {type === 'bar' ? (
        <BarChart data={previewData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      ) : type === 'line' ? (
        <LineChart data={previewData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      ) : type === 'area' ? (
        <AreaChart data={previewData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
        </AreaChart>
      ) : type === 'pie' ? (
        <PieChart>
          <Pie data={previewData} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2}>
            {previewData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
        </PieChart>
      ) : type === 'scatter' ? (
        <ScatterChart margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" name="category" hide />
          <YAxis dataKey="value" name="value" hide />
          <Scatter data={previewData} fill="#ef4444" />
        </ScatterChart>
      ) : (
        <BarChart data={previewData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Bar dataKey="value" fill="#f59e0b" />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}

export default function VisualizationControl({
  columns,
  analysis,
  data = [],
  onVisualize,
  isLoading = false,
}: VisualizationControlProps) {
  const [xColumn, setXColumn] = useState<string>(columns[0] || '')
  const [yColumn, setYColumn] = useState<string>(columns[1] || columns[0] || '')
  const [chartType, setChartType] = useState<ChartType>('bar')

  // Column categorization with rich indicators
  const getColInfo = (col: string) => {
    const colAnalysis = analysis[col]
    if (!colAnalysis) return { isNumeric: false, isDate: false, dtype: 'unknown' }
    const dtype = (colAnalysis.dtype || '').toLowerCase()
    const isNumeric = dtype.includes('int') || dtype.includes('float') || dtype.includes('number')
    const isDate = dtype.includes('date') || dtype.includes('time') || /date|time/i.test(col)
    return { isNumeric, isDate, dtype }
  }

  // Smart Recommendations Engine
  useEffect(() => {
    if (!xColumn || !yColumn) return

    const xInfo = getColInfo(xColumn)
    const yInfo = getColInfo(yColumn)

    if (xInfo.isDate && yInfo.isNumeric) {
      setChartType('line')
    } else if (xInfo.isNumeric && yInfo.isNumeric) {
      setChartType('scatter')
    } else if (!xInfo.isNumeric && yInfo.isNumeric) {
      setChartType('bar')
    }
  }, [xColumn, yColumn])

  // Chart Compatibility & Insights
  const chartProps = useMemo((): ChartCompatibility => {
    const xInfo = getColInfo(xColumn)
    const yInfo = getColInfo(yColumn)

    switch (chartType) {
      case 'line':
        return {
          compatible: yInfo.isNumeric,
          reason: !yInfo.isNumeric ? 'Line charts require a numeric Y-axis to plot trends.' : undefined,
          insight: xInfo.isDate ? 'Perfect for visualizing time-series trends.' : 'Good for continuous data relationships.'
        }
      case 'scatter':
        return {
          compatible: xInfo.isNumeric && yInfo.isNumeric,
          reason: (!xInfo.isNumeric || !yInfo.isNumeric) ? 'Scatter plots require numeric values on both axes.' : undefined,
          insight: 'Best for identifying correlations between two variables.'
        }
      case 'pie':
        return {
          compatible: yInfo.isNumeric,
          reason: !yInfo.isNumeric ? 'Pie charts require numeric values for slice proportions.' : undefined,
          insight: 'Effective for showing parts-of-a-whole distribution.'
        }
      case 'area':
        return {
          compatible: yInfo.isNumeric,
          reason: !yInfo.isNumeric ? 'Area charts require a numeric Y-axis.' : undefined,
          insight: 'Excellent for showing cumulative totals or trends with volume.'
        }
      case 'histogram':
        return {
          compatible: xInfo.isNumeric,
          reason: !xInfo.isNumeric ? 'Histograms require numeric data on the X-axis.' : undefined,
          insight: 'Used to show frequency distribution of data ranges.'
        }
      default:
        return { compatible: true, insight: 'Versatile for categorical comparisons.' }
    }
  }, [chartType, xColumn, yColumn, analysis])

  return (
    <Card className="bg-white border-border shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Chart Studio
          </h3>
        </div>
        <Badge variant="secondary" className="gap-1 px-2 py-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] uppercase font-bold tracking-tighter">Smart Assist</span>
        </Badge>
      </div>

      {/* Interactive Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Live Preview
          </label>
        </div>
        <div className="relative group border border-border/40 rounded-xl overflow-hidden bg-slate-50 h-52 flex items-center justify-center transition-all hover:border-primary/30">
          {xColumn && yColumn ? (
            <div className="w-full h-full p-6">
              <LiveMiniPreview data={data} xCol={xColumn} yCol={yColumn} type={chartType} />
            </div>
          ) : (
            <div className="text-center p-6 space-y-2">
              <Database className="w-8 h-8 text-muted-foreground/30 mx-auto" />
              <p className="text-xs text-muted-foreground">Select columns to preview</p>
            </div>
          )}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Dimensions Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/70">
                X-AXIS (CATEGORY/TIME)
              </label>
              <Select value={xColumn} onValueChange={setXColumn}>
                <SelectTrigger className="h-10 bg-background border-border/60 hover:border-primary/50 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => {
                    const { isNumeric } = getColInfo(col)
                    return (
                      <SelectItem key={col} value={col}>
                        <div className="flex items-center gap-2">
                          {isNumeric ? <Hash className="w-3 h-3 text-blue-500" /> : <Type className="w-3 h-3 text-slate-400" />}
                          <span className="truncate">{col}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/70">
                Y-AXIS (VALUE)
              </label>
              <Select value={yColumn} onValueChange={setYColumn}>
                <SelectTrigger className="h-10 bg-background border-border/60 hover:border-primary/50 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => {
                    const { isNumeric } = getColInfo(col)
                    return (
                      <SelectItem key={col} value={col}>
                        <div className="flex items-center gap-2">
                          {isNumeric ? <Hash className="w-3 h-3 text-blue-500" /> : <Type className="w-3 h-3 text-slate-400" />}
                          <span className="truncate">{col}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold flex items-center gap-1.5 text-foreground/70">
              CHART VISUAL
            </label>
            <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
              <SelectTrigger className="h-10 bg-background border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar" className="gap-2"><div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Bar Chart</div></SelectItem>
                <SelectItem value="line" className="gap-2"><div className="flex items-center gap-2"><LineChartIcon className="w-4 h-4" /> Line Chart</div></SelectItem>
                <SelectItem value="area" className="gap-2"><div className="flex items-center gap-2"><AreaChartIcon className="w-4 h-4" /> Area Chart</div></SelectItem>
                <SelectItem value="pie" className="gap-2"><div className="flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Pie Chart</div></SelectItem>
                <SelectItem value="scatter" className="gap-2"><div className="flex items-center gap-2"><ScatterChartIcon className="w-4 h-4" /> Scatter Plot</div></SelectItem>
                <SelectItem value="histogram" className="gap-2"><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Histogram</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dynamic Insights & Alerts */}
        <div className="min-h-[60px]">
          {!chartProps.compatible ? (
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">
                {chartProps.reason}
              </AlertDescription>
            </Alert>
          ) : chartProps.insight ? (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3 items-start animate-in fade-in">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
                {chartProps.insight}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={() => onVisualize(xColumn, yColumn, chartType)}
          disabled={isLoading || !chartProps.compatible || !xColumn || !yColumn}
          className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            'Generate Visualization'
          )}
        </Button>
      </div>
    </Card>
  )
}

