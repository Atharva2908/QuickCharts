'use client'

import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  Brush,
  ReferenceLine,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { 
  AlertCircle, 
  Download, 
  Settings2, 
  TrendingUp, 
  Maximize2, 
  Copy,
  LayoutGrid,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  ScatterChart as ScatterIcon,
  Info
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ChartGeneratorProps {
  data: any[]
  xColumn: string
  yColumn: string
  chartType: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram' | 'area'
  title?: string
}

const THEMES = {
  modern: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  vibrant: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
  pastel: ['#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa'],
  mono: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'],
}

export default function ChartGenerator({
  data,
  xColumn,
  yColumn,
  chartType: initialChartType,
  title,
}: ChartGeneratorProps) {
  // State
  const [chartType, setChartType] = useState(initialChartType)
  const [theme, setTheme] = useState<keyof typeof THEMES>('modern')
  const [showGrid, setShowGrid] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [showBrush, setShowBrush] = useState(data.length > 20)
  const [showAvgLine, setShowAvgLine] = useState(false)

  const activeColors = THEMES[theme]

  // Data Preparation
  const { chartData, stats } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], stats: null }

    try {
      let preparedData = []
      let numericValues: number[] = []

      if (chartType === 'pie') {
        preparedData = data.map((row) => ({
          name: String(row[xColumn]),
          value: Number(row[yColumn]) || 0,
        }))
      } else if (chartType === 'histogram') {
        const vals = data.map(r => Number(r[yColumn])).filter(v => !isNaN(v))
        const min = Math.min(...vals)
        const max = Math.max(...vals)
        const binCount = 10
        const binSize = (max - min) / binCount
        
        const bins = Array.from({ length: binCount }, (_, i) => ({
          range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
          count: 0
        }))

        vals.forEach(v => {
          const binIdx = Math.min(Math.floor((v - min) / binSize), binCount - 1)
          bins[binIdx].count++
        })
        preparedData = bins.map(b => ({ name: b.range, value: b.count }))
      } else {
        preparedData = data.map((row) => {
          const val = Number(row[yColumn]) || 0
          numericValues.push(val)
          return {
            [xColumn]: String(row[xColumn]),
            [yColumn]: val,
          }
        })
      }

      // Calculate Stats
      const validVals = numericValues.length > 0 ? numericValues : preparedData.map(d => (typeof d.value === 'number' ? d.value : 0))
      const sum = validVals.reduce((a, b) => a + b, 0)
      const avg = sum / (validVals.length || 1)
      const min = validVals.length > 0 ? Math.min(...validVals) : 0
      const max = validVals.length > 0 ? Math.max(...validVals) : 0

      return {
        chartData: preparedData,
        stats: { avg, min, max, total: sum }
      }
    } catch (error) {
      console.error('[ChartGenerator] Error preparing data:', error)
      return { chartData: [], stats: null }
    }
  }, [data, xColumn, yColumn, chartType])

  const exportAsImage = () => {
    const config = {
      type: chartType === 'pie' ? 'doughnut' : chartType === 'area' ? 'line' : (chartType as string),
      data: {
        labels: chartData.map((d: any) => String(d.name || d[xColumn] || 'N/A')),
        datasets: [{
          label: yColumn,
          data: chartData.map((d: any) => Number(d.value || d[yColumn] || 0)),
          backgroundColor: chartType === 'pie' ? activeColors : activeColors[0],
          fill: chartType === 'area'
        }]
      }
    }
    const url = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(config))}&w=800&h=600&f=png`
    window.open(url, '_blank')
  }

  const copyData = () => {
    navigator.clipboard.writeText(JSON.stringify(chartData, null, 2))
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="p-8 bg-card border-border shadow-sm text-center">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No data available for {chartType} chart</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            {title || `${yColumn} by ${xColumn}`}
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visualizing {data.length} records</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </h3>
          <p className="text-xs text-muted-foreground">Generated from {xColumn} and {yColumn} columns</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <LayoutGrid className="w-4 h-4" />
                Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setChartType('bar')} className="gap-2">
                <BarChart3 className="w-4 h-4" /> Bar Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType('line')} className="gap-2">
                <LineChartIcon className="w-4 h-4" /> Line Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType('area')} className="gap-2">
                <TrendingUp className="w-4 h-4" /> Area Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType('pie')} className="gap-2">
                <PieChartIcon className="w-4 h-4" /> Pie Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType('scatter')} className="gap-2">
                <ScatterIcon className="w-4 h-4" /> Scatter Plot
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Settings2 className="w-4 h-4" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
                Show Grid
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showLegend} onCheckedChange={setShowLegend}>
                Show Legend
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showBrush} onCheckedChange={setShowBrush}>
                Show Scroll/Brush
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showAvgLine} onCheckedChange={setShowAvgLine}>
                Average Line
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(t => (
                <DropdownMenuItem key={t} onClick={() => setTheme(t)} className="capitalize">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: THEMES[t][0] }} />
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" className="h-9 w-9" onClick={copyData}>
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button variant="default" size="sm" className="h-9 gap-2 bg-primary text-primary-foreground" onClick={exportAsImage}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3 bg-muted/30 border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Average</p>
            <p className="text-lg font-mono font-bold">{stats.avg.toFixed(2)}</p>
          </Card>
          <Card className="p-3 bg-muted/30 border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Maximum</p>
            <p className="text-lg font-mono font-bold text-blue-600">{stats.max.toFixed(1)}</p>
          </Card>
          <Card className="p-3 bg-muted/30 border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Minimum</p>
            <p className="text-lg font-mono font-bold text-orange-600">{stats.min.toFixed(1)}</p>
          </Card>
          <Card className="p-3 bg-muted/30 border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Sum</p>
            <p className="text-lg font-mono font-bold text-green-600">
              {stats.total > 1000 ? (Number(stats.total) / 1000).toFixed(1) + 'k' : Number(stats.total).toFixed(0)}
            </p>
          </Card>
        </div>
      )}

      {/* Chart Canvas */}
      <Card className="p-6 bg-white border-border shadow-md relative overflow-hidden group">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                {showLegend && <Legend verticalAlign="bottom" height={36}/>}
              </PieChart>
            ) : chartType === 'scatter' ? (
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
                <XAxis type="category" dataKey={xColumn} name={xColumn} stroke="#94a3b8" fontSize={12} />
                <YAxis type="number" dataKey={yColumn} name={yColumn} stroke="#94a3b8" fontSize={12} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name={title} data={chartData} fill={activeColors[0]} />
              </ScatterChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeColors[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={activeColors[0]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
                <XAxis dataKey={xColumn} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
                {showLegend && <Legend />}
                <Area type="monotone" dataKey={yColumn} stroke={activeColors[0]} fillOpacity={1} fill="url(#colorVal)" />
                {showBrush && <Brush dataKey={xColumn} height={30} stroke={activeColors[0]} fill="#f8fafc" />}
                {showAvgLine && stats && <ReferenceLine y={stats.avg} label="Avg" stroke="#ef4444" strokeDasharray="3 3" />}
              </AreaChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
                <XAxis dataKey={xColumn} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
                {showLegend && <Legend />}
                <Line 
                  type="monotone" 
                  dataKey={yColumn} 
                  stroke={activeColors[0]} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: activeColors[0], strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                {showBrush && <Brush dataKey={xColumn} height={30} stroke={activeColors[0]} fill="#f8fafc" />}
                {showAvgLine && stats && <ReferenceLine y={stats.avg} label="Avg" stroke="#ef4444" strokeDasharray="3 3" />}
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />}
                <XAxis dataKey={chartType === 'histogram' ? 'name' : xColumn} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
                {showLegend && <Legend />}
                <Bar 
                  dataKey={chartType === 'histogram' ? 'value' : yColumn} 
                  fill={activeColors[0]} 
                  radius={[4, 4, 0, 0]}
                  barSize={chartType === 'histogram' ? undefined : 40}
                />
                {showBrush && <Brush dataKey={chartType === 'histogram' ? 'name' : xColumn} height={30} stroke={activeColors[0]} fill="#f8fafc" />}
                {showAvgLine && stats && <ReferenceLine y={stats.avg} label="Avg" stroke="#ef4444" strokeDasharray="3 3" />}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Floating Info */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm border-border/50">
            {chartData.length} Points
          </Badge>
        </div>
      </Card>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
        <div className="flex items-center gap-4">
          <span>Engine: Recharts v2.x</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Theme: {theme}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span>Intelligent Charting Active</span>
        </div>
      </div>
    </div>
  )
}

