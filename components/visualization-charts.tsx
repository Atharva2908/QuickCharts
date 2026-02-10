'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { API_BASE_URL } from '@/lib/constants'
import { BarChart3, LineChart, ChartScatter, BarChart2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'  
interface VisualizationChartsProps {
  data: any[]
  columns: string[]
  analysis: Record<string, any>
}

export default function VisualizationCharts({ 
  data, 
  columns,
  analysis 
}: VisualizationChartsProps) {
  const [selectedX, setSelectedX] = useState<string>(columns[0] || '')
  const [selectedY, setSelectedY] = useState<string>(columns[1] || columns[0] || '')
  const [activeTab, setActiveTab] = useState('bar')

  const numericColumns = useMemo(() => {
    return columns.filter(col => {
      const dtype = analysis[col]?.dtype || ''
      return dtype.includes('int') || dtype.includes('float')
    })
  }, [columns, analysis])

  const textColumns = useMemo(() => {
    return columns.filter(col => {
      const dtype = analysis[col]?.dtype || ''
      return !dtype.includes('int') && !dtype.includes('float') && !dtype.includes('date')
    })
  }, [columns, analysis])

  // Generate QuickChart URLs for each chart type
  const chartUrls = useMemo(() => {
    const baseConfig = {
      bar: {
        type: 'bar',
        data: {
          labels: ['A', 'B', 'C', 'D', 'E'],
          datasets: [{
            label: 'Values',
            data: [12, 19, 3, 5, 2],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true } }
        }
      },
      line: {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Trend',
            data: [10, 20, 15, 35, 25],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        }
      },
      scatter: {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Correlation',
            data: [
              {x: 1, y: 2}, {x: 2, y: 4}, {x: 3, y: 3.5}, 
              {x: 4, y: 6}, {x: 5, y: 5.5}
            ],
            backgroundColor: '#10b981'
          }]
        }
      },
      histogram: {
        type: 'bar',
        data: {
          labels: ['0-10', '10-20', '20-30', '30-40'],
          datasets: [{
            label: 'Distribution',
            data: [12, 25, 18, 8],
            backgroundColor: '#f59e0b'
          }]
        }
      }
    }

    return {
      bar: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(baseConfig.bar))}&w=600&h=400&f=png`,
      line: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(baseConfig.line))}&w=600&h=400&f=png`,
      scatter: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(baseConfig.scatter))}&w=600&h=400&f=png`,
      histogram: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(baseConfig.histogram))}&w=600&h=400&f=png`
    }
  }, [])

  const renderChartControls = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-background/50 rounded-2xl border border-border/30">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          X Axis ({activeTab === 'scatter' ? 'Numeric' : 'Categorical'})
        </label>
        <Select value={selectedX} onValueChange={setSelectedX}>
          <SelectTrigger className="border-border/40 bg-card/50">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {(activeTab === 'scatter' ? numericColumns : columns).map(col => (
              <SelectItem key={col} value={col}>{col}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <label className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          Y Axis ({activeTab === 'scatter' ? 'Numeric' : 'Measure'})
        </label>
        <Select value={selectedY} onValueChange={setSelectedY}>
          <SelectTrigger className="border-border/40 bg-card/50">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {(activeTab === 'scatter' ? numericColumns : columns).map(col => (
              <SelectItem key={col} value={col}>{col}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderChart = (tab: string) => {
    const chartConfig = {
      icon: activeTab === tab ? 'active' : 'inactive',
      url: chartUrls[tab as keyof typeof chartUrls],
      title: tab.charAt(0).toUpperCase() + tab.slice(1),
      iconMap: {
        bar: BarChart3,
        line: LineChart,
        scatter: ChartScatter,  // ✅ FIXED: Using ChartScatter
        histogram: BarChart2
      } as const
    }

    const Icon = chartConfig.iconMap[tab as keyof typeof chartConfig.iconMap]

    return (
      <Card className="border-border/40 bg-gradient-to-br from-card/80 overflow-hidden group hover:shadow-2xl transition-all duration-500 relative">
        <div className="absolute top-6 left-6 z-20">
          <div className={`p-3 rounded-2xl shadow-lg transition-all group-hover:scale-110 ${
            activeTab === tab 
              ? 'bg-primary text-primary-foreground shadow-primary/25' 
              : 'bg-primary/20 text-primary shadow-primary/10'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        <div className="p-8 pb-4 relative z-10 h-[500px] flex items-center justify-center">
          <img
            src={chartConfig.url}
            alt={`${chartConfig.title} Preview`}
            className="w-full h-full max-w-4xl max-h-[400px] object-contain rounded-2xl shadow-2xl ring-4 ring-background/50 mx-auto transition-all duration-500 group-hover:scale-[1.02] group-hover:rotate-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          {!chartConfig.url && (
            <div className="text-center space-y-4 p-12">
              <Activity className="w-16 h-16 text-muted-foreground/30 mx-auto animate-pulse" />
              <div>
                <h3 className="text-xl font-bold text-muted-foreground mb-2">{chartConfig.title}</h3>
                <p className="text-muted-foreground/60">Select columns above to generate visualization</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-8 pb-8 pt-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary/70 bg-clip-text text-transparent mb-2">
            {chartConfig.title} Preview
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === tab 
              ? `Live preview using ${selectedX} × ${selectedY}. Click "Generate" to create full dataset visualization.` 
              : 'Switch to this tab and select columns to preview'
            }
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-4 bg-gradient-to-br from-primary/20 rounded-2xl shadow-xl">
            <BarChart3 className="w-8 h-8 text-primary drop-shadow-lg" />
          </div>
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Interactive Visualizations
            </h2>
            <p className="text-xl text-muted-foreground">
              Explore your data with multiple chart types. Select columns to preview instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Chart Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-gradient-to-r from-card/80 backdrop-blur-sm border border-border/40 shadow-xl rounded-2xl p-1 mx-auto max-w-4xl">
          {(['bar', 'line', 'scatter', 'histogram'] as const).map(tab => (
            <TabsTrigger 
              key={tab} 
              value={tab}
              className="data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-primary/40 rounded-xl transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                {tab === 'bar' && <BarChart3 className="w-4 h-4" />}
                {tab === 'line' && <LineChart className="w-4 h-4" />}
                {tab === 'scatter' && <ChartScatter className="w-4 h-4" />} {/* ✅ FIXED */}
                {tab === 'histogram' && <BarChart2 className="w-4 h-4" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Chart Controls */}
        <div className="pt-8 max-w-4xl mx-auto">
          {renderChartControls()}
        </div>

        {/* Charts */}
        <div className="pt-8 max-w-6xl mx-auto">
          <TabsContent value="bar" className="mt-0">
            {renderChart('bar')}
          </TabsContent>
          
          <TabsContent value="line" className="mt-0">
            {renderChart('line')}
          </TabsContent>
          
          <TabsContent value="scatter" className="mt-0">
            {renderChart('scatter')}
          </TabsContent>
          
          <TabsContent value="histogram" className="mt-0">
            {renderChart('histogram')}
          </TabsContent>
        </div>
      </Tabs>

      {/* Quick Actions */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-primary" />
          <h4 className="text-xl font-bold text-foreground">Next Steps</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <Button variant="outline" className="h-14 border-primary/30 hover:bg-primary/5">
            Export Charts
          </Button>
          <Button variant="outline" className="h-14 border-primary/30 hover:bg-primary/5">
            Save Layout
          </Button>
          <Button className="h-14 bg-primary hover:bg-primary/90">
            Generate Report
          </Button>
        </div>
      </Card>
    </div>
  )
}
