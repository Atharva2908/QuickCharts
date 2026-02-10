'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  HistogramChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, Heatmap
} from 'recharts'

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

  // Prepare bar chart data
  const barChartData = useMemo(() => {
    if (!selectedX || !selectedY) return []
    
    const grouped: Record<string, any> = {}
    data.forEach(row => {
      const key = String(row[selectedX])
      if (!grouped[key]) grouped[key] = { name: key, count: 0, sum: 0, values: [] }
      grouped[key].count++
      if (typeof row[selectedY] === 'number') {
        grouped[key].sum += row[selectedY]
        grouped[key].values.push(row[selectedY])
      }
    })

    return Object.values(grouped).slice(0, 20)
  }, [data, selectedX, selectedY])

  // Prepare scatter chart data
  const scatterData = useMemo(() => {
    if (!selectedX || !selectedY || !numericColumns.includes(selectedX) || !numericColumns.includes(selectedY)) {
      return []
    }
    
    return data
      .filter(row => 
        row[selectedX] !== null && 
        row[selectedY] !== null && 
        typeof row[selectedX] === 'number' && 
        typeof row[selectedY] === 'number'
      )
      .slice(0, 100)
  }, [data, selectedX, selectedY, numericColumns])

  // Prepare histogram data
  const histogramData = useMemo(() => {
    if (!numericColumns.length) return []
    
    const col = numericColumns[0]
    const values = data
      .map(row => row[col])
      .filter(v => typeof v === 'number')
    
    if (values.length === 0) return []

    const min = Math.min(...values)
    const max = Math.max(...values)
    const binCount = Math.min(20, Math.ceil(Math.sqrt(values.length)))
    const binSize = (max - min) / binCount

    const bins: Record<string, number> = {}
    for (let i = 0; i < binCount; i++) {
      const start = min + i * binSize
      const label = `${Number(start).toFixed(1)}-${Number(start + binSize).toFixed(1)}`
      bins[label] = 0
    }

    values.forEach(v => {
      const binIndex = Math.min(binCount - 1, Math.floor((v - min) / binSize))
      const start = min + binIndex * binSize
      const label = `${Number(start).toFixed(1)}-${Number(start + binSize).toFixed(1)}`
      bins[label]++
    })

    return Object.entries(bins).map(([label, count]) => ({ name: label, frequency: count }))
  }, [data, numericColumns])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bar" className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-card/50 border border-border/40">
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          <TabsTrigger value="line">Line Chart</TabsTrigger>
          <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
          <TabsTrigger value="histogram">Histogram</TabsTrigger>
        </TabsList>

        {/* Bar Chart */}
        <TabsContent value="bar" className="mt-6">
          <Card className="border-border/40 bg-card/50 p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">X Axis</label>
                  <Select value={selectedX} onValueChange={setSelectedX}>
                    <SelectTrigger className="border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Y Axis</label>
                  <Select value={selectedY} onValueChange={setSelectedY}>
                    <SelectTrigger className="border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {barChartData.length > 0 && (
                <div className="h-80 w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      />
                      <Bar dataKey="count" fill="#0088FE" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Line Chart */}
        <TabsContent value="line" className="mt-6">
          <Card className="border-border/40 bg-card/50 p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">X Axis</label>
                  <Select value={selectedX} onValueChange={setSelectedX}>
                    <SelectTrigger className="border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Y Axis</label>
                  <Select value={selectedY} onValueChange={setSelectedY}>
                    <SelectTrigger className="border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {barChartData.length > 0 && (
                <div className="h-80 w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#0088FE" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Scatter Plot */}
        <TabsContent value="scatter" className="mt-6">
          <Card className="border-border/40 bg-card/50 p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">X Axis (Numeric)</label>
                  <Select value={selectedX} onValueChange={setSelectedX}>
                    <SelectTrigger className="border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Y Axis (Numeric)</label>
                  <Select value={selectedY} onValueChange={setSelectedY}>
                    <SelectTrigger className="border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {scatterData.length > 0 && (
                <div className="h-80 w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey={selectedX} type="number" stroke="#999" />
                      <YAxis dataKey={selectedY} type="number" stroke="#999" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      />
                      <Scatter name={`${selectedY} vs ${selectedX}`} data={scatterData} fill="#0088FE" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Histogram */}
        <TabsContent value="histogram" className="mt-6">
          <Card className="border-border/40 bg-card/50 p-6">
            {numericColumns.length > 0 && histogramData.length > 0 && (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    />
                    <Bar dataKey="frequency" fill="#0088FE" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
