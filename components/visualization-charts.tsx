'use client'

import { useState, useMemo } from 'react'
import { Download, FileImage, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { API_BASE_URL } from '@/lib/constants'
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  AreaChart, Area, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts'
import { 
  FileDown, 
  Table as TableIcon, 
  FileSpreadsheet, 
  FileJson,
  Maximize2,
  PieChart as PieIcon,
  Activity,
  BarChart2,
  FileText
} from 'lucide-react'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

interface VisualizationChartsProps {
  data: any[]
  columns: string[]
  analysis: Record<string, any>
  uploadId?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function VisualizationCharts({
  data,
  columns,
  analysis,
  uploadId
}: VisualizationChartsProps) {
  const [selectedX, setSelectedX] = useState<string>(columns[0] || '')
  const [selectedY, setSelectedY] = useState<string>(columns[1] || columns[0] || '')
  const [chartMode, setChartMode] = useState<'standard' | 'wide'>('standard')

  const numericColumns = useMemo(() => {
    return columns.filter(col => {
      const dtype = analysis[col]?.dtype || ''
      return dtype.includes('int') || dtype.includes('float')
    })
  }, [columns, analysis])

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

  const pieData = useMemo(() => {
    if (!selectedX || !selectedY) return []
    const grouped: Record<string, number> = {}
    data.slice(0, 100).forEach(row => {
      const key = String(row[selectedX])
      const val = typeof row[selectedY] === 'number' ? row[selectedY] : 1
      grouped[key] = (grouped[key] || 0) + val
    })
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [data, selectedX, selectedY])

  const downloadData = (fmt: string) => {
    if (!uploadId) return toast.error("File mapping lost")
    window.open(`${API_BASE_URL}/api/export/${uploadId}/${fmt}`, '_blank')
  }

  const downloadChart = async (type: string, format: 'png' | 'jpeg' | 'pdf') => {
    const isPie = type === 'pie' || type === 'doughnut';
    const baseConfig: any = {
      type: type === 'scatter' ? 'scatter' : (type === 'histogram' ? 'bar' : type),
      data: {
        labels: isPie ? pieData.map(d => d.name) : barChartData.map((d: any) => d.name),
        datasets: [{
          label: selectedY,
          data: isPie ? pieData.map(d => d.value) : barChartData.map((d: any) => d.count),
          backgroundColor: isPie ? COLORS : '#3b82f6',
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' },
          title: { display: true, text: `${type.toUpperCase()} Analysis: ${selectedY} by ${selectedX}` }
        }
      }
    }

    if (type === 'scatter') {
      baseConfig.data.datasets[0].data = scatterData.map((d: any) => ({ x: d[selectedX], y: d[selectedY] }))
    }

    const url = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(baseConfig))}&w=1200&h=800&f=${format}`
    
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Chart service error")
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `chart_${type}_${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (e) {
      console.error("Download failed", e)
      toast.error("Download failed. API reported an error.")
    }
  }

  const downloadAllChartsPDF = async () => {
    toast.info("Generating multi-page PDF report...")
    const pdf = new jsPDF('l', 'mm', 'a4')
    const chartTypes = ['bar', 'line', 'area', 'pie', 'scatter']
    
    for (let i = 0; i < chartTypes.length; i++) {
        const type = chartTypes[i]
        const isPie = type === 'pie'
        const baseConfig: any = {
            type: type === 'scatter' ? 'scatter' : type,
            data: {
                labels: isPie ? pieData.map(d => d.name) : barChartData.map((d: any) => d.name),
                datasets: [{
                    label: selectedY,
                    data: isPie ? pieData.map(d => d.value) : barChartData.map((d: any) => d.count),
                    backgroundColor: isPie ? COLORS : '#3b82f6',
                }]
            },
            options: { title: { display: true, text: `${type.toUpperCase()} Analysis` } }
        }

        if (type === 'scatter') {
           (baseConfig as any).data.datasets[0].data = scatterData.map((d: any) => ({ x: d[selectedX], y: d[selectedY] }))
        }

        try {
            const url = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(baseConfig))}&w=1200&h=800&f=png`
            const res = await fetch(url)
            const blob = await res.blob()
            const imgData = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(blob)
            })
            
            if (i > 0) pdf.addPage()
            pdf.text(`${type.toUpperCase()} REPORT: ${selectedY} by ${selectedX}`, 10, 10)
            pdf.addImage(imgData, 'PNG', 10, 20, 280, 160)
        } catch (e) {
            console.error(`Failed to add ${type} to PDF`, e)
        }
    }
    
    pdf.save(`QuickCharts_Full_Report_${Date.now()}.pdf`)
    toast.success("Report downloaded!")
  }

  const downloadChartData = (type: string, format: 'csv' | 'xlsx') => {
    let exportData: any[] = []
    let fileName = `chart_data_${type}_${Date.now()}`

    if (type === 'bar' || type === 'line' || type === 'area') {
      exportData = barChartData.map(d => ({ [selectedX]: d.name, [selectedY]: d.count }))
    } else if (type === 'pie') {
      exportData = pieData.map(d => ({ [selectedX]: d.name, [selectedY]: d.value }))
    } else if (type === 'scatter') {
      exportData = scatterData.map(d => ({ [selectedX]: d[selectedX], [selectedY]: d[selectedY] }))
    } else if (type === 'histogram') {
      exportData = histogramData.map(d => ({ "Range": d.name, "Frequency": d.frequency }))
    }

    if (exportData.length === 0) return toast.error("No data available to export")

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Chart Data")

    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${fileName}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      XLSX.writeFile(wb, `${fileName}.xlsx`)
    }
    toast.success(`${format.toUpperCase()} Downloaded!`)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bar" className="w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
           <TabsList className="bg-white border border-gray-200 shadow-sm rounded-xl p-1 h-auto flex flex-wrap gap-1">
            <TabsTrigger value="bar" className="gap-2"><BarChart2 className="w-4 h-4" /> Bar</TabsTrigger>
            <TabsTrigger value="line" className="gap-2"><Activity className="w-4 h-4" /> Line</TabsTrigger>
            <TabsTrigger value="area" className="gap-2"><Activity className="w-4 h-4 rotate-45" /> Area</TabsTrigger>
            <TabsTrigger value="pie" className="gap-2"><PieIcon className="w-4 h-4" /> Pie</TabsTrigger>
            <TabsTrigger value="scatter" className="gap-2">Scatter</TabsTrigger>
            <TabsTrigger value="histogram" className="gap-2">Histogram</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadAllChartsPDF}
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
                <FileText className="w-4 h-4 mr-2" />
                Full PDF Report
            </Button>
            <div className="h-6 w-px bg-gray-200 mx-1 hidden lg:block" />
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setChartMode(chartMode === 'standard' ? 'wide' : 'standard')}
                className="bg-white"
            >
                <Maximize2 className="w-4 h-4 mr-2" />
                {chartMode === 'standard' ? "Expand View" : "Contract View"}
            </Button>
            <div className="h-6 w-px bg-gray-200 mx-1 hidden lg:block" />
            <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                <Button variant="ghost" size="sm" onClick={() => downloadData('csv')} title="Download CSV" className="h-8 w-8 p-0">
                    <TableIcon className="w-4 h-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => downloadData('excel')} title="Download Excel" className="h-8 w-8 p-0">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </Button>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <TabsContent value="bar" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">X Axis</label>
                    <Select value={selectedX} onValueChange={setSelectedX}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Y Axis</label>
                    <Select value={selectedY} onValueChange={setSelectedY}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex bg-slate-100 rounded-md p-0.5">
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('bar', 'xlsx')} title="Download Excel" className="h-8 px-2 text-[10px] font-bold">
                        XLSX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('bar', 'csv')} title="Download CSV" className="h-8 px-2 text-[10px] font-bold border-l border-slate-200">
                        CSV
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('bar', 'pdf')} className="bg-white border-red-100 text-red-700 hover:bg-red-50 h-9">
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('bar', 'jpeg')} className="bg-white h-9">
                    JPEG
                  </Button>
                </div>
              </div>

              {barChartData.length > 0 && (
                <div className={`${chartMode === 'wide' ? 'h-[500px]' : 'h-80'} w-full mt-6 transition-all duration-500`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" stroke="#666" fontSize={11} />
                      <YAxis stroke="#666" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Line Chart */}
        <TabsContent value="line" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">X Axis</label>
                    <Select value={selectedX} onValueChange={setSelectedX}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Y Axis</label>
                    <Select value={selectedY} onValueChange={setSelectedY}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex bg-slate-100 rounded-md p-0.5">
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('line', 'xlsx')} title="Download Excel" className="h-8 px-2 text-[10px] font-bold">
                        XLSX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('line', 'csv')} title="Download CSV" className="h-8 px-2 text-[10px] font-bold border-l border-slate-200">
                        CSV
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('line', 'pdf')} className="bg-white border-red-100 text-red-700 hover:bg-red-50 h-9">
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('line', 'jpeg')} className="bg-white h-9">
                    JPEG
                  </Button>
                </div>
              </div>

              {barChartData.length > 0 && (
                <div className={`${chartMode === 'wide' ? 'h-[500px]' : 'h-80'} w-full mt-6 transition-all duration-500`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" stroke="#666" fontSize={11} />
                      <YAxis stroke="#666" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Area Chart */}
        <TabsContent value="area" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">X Axis</label>
                    <Select value={selectedX} onValueChange={setSelectedX}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Y Axis</label>
                    <Select value={selectedY} onValueChange={setSelectedY}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex bg-slate-100 rounded-md p-0.5">
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('area', 'xlsx')} title="Download Excel" className="h-8 px-2 text-[10px] font-bold">
                        XLSX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('area', 'csv')} title="Download CSV" className="h-8 px-2 text-[10px] font-bold border-l border-slate-200">
                        CSV
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('area', 'pdf')} className="bg-white border-red-100 text-red-700 hover:bg-red-50 h-9">PDF</Button>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('area', 'jpeg')} className="bg-white h-9">JPEG</Button>
                </div>
              </div>

              {barChartData.length > 0 && (
                <div className={`${chartMode === 'wide' ? 'h-[500px]' : 'h-80'} w-full mt-6 transition-all duration-500`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={barChartData}>
                      <defs>
                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" stroke="#666" fontSize={11} />
                      <YAxis stroke="#666" fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorArea)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Pie Chart */}
        <TabsContent value="pie" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Legend</label>
                    <Select value={selectedX} onValueChange={setSelectedX}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Value</label>
                    <Select value={selectedY} onValueChange={setSelectedY}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {columns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex bg-slate-100 rounded-md p-0.5">
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('pie', 'xlsx')} title="Download Excel" className="h-8 px-2 text-[10px] font-bold">
                        XLSX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('pie', 'csv')} title="Download CSV" className="h-8 px-2 text-[10px] font-bold border-l border-slate-200">
                        CSV
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('pie', 'pdf')} className="bg-white border-red-100 text-red-700 hover:bg-red-50 h-9">PDF</Button>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('pie', 'jpeg')} className="bg-white h-9">JPEG</Button>
                </div>
              </div>

              {pieData.length > 0 && (
                <div className={`${chartMode === 'wide' ? 'h-[500px]' : 'h-80'} w-full mt-6 flex justify-center`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={chartMode === 'wide' ? 100 : 70}
                        outerRadius={chartMode === 'wide' ? 180 : 120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Scatter Plot */}
        <TabsContent value="scatter" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">X Axis (Numeric)</label>
                    <Select value={selectedX} onValueChange={setSelectedX}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {numericColumns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Y Axis (Numeric)</label>
                    <Select value={selectedY} onValueChange={setSelectedY}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {numericColumns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex bg-slate-100 rounded-md p-0.5">
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('scatter', 'xlsx')} title="Download Excel" className="h-8 px-2 text-[10px] font-bold">
                        XLSX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadChartData('scatter', 'csv')} title="Download CSV" className="h-8 px-2 text-[10px] font-bold border-l border-slate-200">
                        CSV
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('scatter', 'pdf')} className="bg-white border-red-100 text-red-700 hover:bg-red-50 h-9">
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('scatter', 'jpeg')} className="bg-white h-9">
                    JPEG
                  </Button>
                </div>
              </div>

              {scatterData.length > 0 && (
                <div className={`${chartMode === 'wide' ? 'h-[500px]' : 'h-80'} w-full mt-6 transition-all duration-500`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey={selectedX} type="number" stroke="#666" />
                      <YAxis dataKey={selectedY} type="number" stroke="#666" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      />
                      <Scatter name={`${selectedY} vs ${selectedX}`} data={scatterData} fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Histogram */}
        <TabsContent value="histogram" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadChart('histogram', 'pdf')} className="bg-white border-red-100 text-red-700 hover:bg-red-50">
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadChart('histogram', 'jpeg')} className="bg-white">
                    JPEG
                  </Button>
                </div>
              </div>
              {numericColumns.length > 0 && histogramData.length > 0 && (
                <div className={`${chartMode === 'wide' ? 'h-[500px]' : 'h-80'} w-full transition-all duration-500`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogramData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      />
                      <Bar dataKey="frequency" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
