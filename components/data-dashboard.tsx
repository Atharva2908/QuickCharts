'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DataPreviewTable from './data-preview-table'
import ColumnSummaries from './column-summaries'
import VisualizationCharts from './visualization-charts'
import DataQualityReport from './data-quality-report'
import AutoInsights from './auto-insights'
import CorrelationAnalysis from './correlation-analysis'
import FileMetadata from './file-metadata'
import VisualizationControl from './visualization-control'
import DataLaboratory from './data-laboratory'
import AIChat from './ai-chat'
import PredictiveAnalytics from './predictive-analytics'
import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { 
  BarChart3, 
  Table2, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Settings, 
  Activity, 
  Loader2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  MessageSquare,
  Maximize2,
  FileDown,
  Sparkles,
  Brain
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'
import axios from 'axios'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { toast } from 'sonner'

interface DataDashboardProps {
  data: any
  fileName: string
  onDataUpdate?: (newData: any) => void
}

interface TransformationStep {
  id: string
  action: string
  timestamp: string
  status: 'success' | 'pending' | 'error'
}

export default function DataDashboard({ data, fileName, onDataUpdate }: DataDashboardProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [currentTab, setCurrentTab] = useState('overview')
  const [isCleaning, setIsCleaning] = useState(false)
  const [history, setHistory] = useState<TransformationStep[]>([])

  const handleCleanData = async (action: string) => {
    if (!data.upload_id) {
      alert("Persistence mapping missing. Please re-upload your file.")
      return
    }

    const newStep: TransformationStep = {
      id: Math.random().toString(36).substr(2, 9),
      action: action.replace('_', ' '),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending'
    }

    setHistory(prev => [newStep, ...prev])
    setIsCleaning(true)
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/clean/${data.upload_id}`, { action })
      if (onDataUpdate) {
        onDataUpdate(response.data)
      }
      setHistory(prev => prev.map(step => 
        step.id === newStep.id ? { ...step, status: 'success' } : step
      ))
    } catch (e) {
      console.error(e)
      setHistory(prev => prev.map(step => 
        step.id === newStep.id ? { ...step, status: 'error' } : step
      ))
      alert("Data transformation failed. Check the server console.")
      alert("Data transformation failed. Check the server console.")
    } finally {
      setIsCleaning(false)
    }
  }

  const handleExportPDF = async () => {
    const dashboard = document.getElementById('dashboard-content')
    if (!dashboard) return
    try {
      const canvas = await html2canvas(dashboard, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`QuickCharts_Report_${fileName}.pdf`)
    } catch (e) {
      console.error("PDF Export failed", e)
      alert("Failed to export PDF.")
    }
  }

  const [isSharing, setIsSharing] = useState(false)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)

  const handlePresentationMode = () => {
    const dashboard = document.getElementById('dashboard-content')
    if (dashboard) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        dashboard.requestFullscreen().catch(err => {
          console.error("Error attempting to enable fullscreen:", err)
        })
      }
    }
  }

  const columns = useMemo(() => {
    if (data.columns && Array.isArray(data.columns)) {
      return data.columns
    }
    return []
  }, [data])

  const rows = useMemo(() => {
    if (data.data && Array.isArray(data.data)) {
      return data.data
    }
    return []
  }, [data])

  const analysis = useMemo(() => {
    return data.analysis || {}
  }, [data])

  const dataQuality = useMemo(() => {
    return data.data_quality || {}
  }, [data])

  // QuickChart overview charts for dashboard metrics
  const overviewCharts = useMemo(() => {
    const qualityScore = dataQuality.quality_score || 0
    const missingPercent = dataQuality.missing_count ?
      Math.round((dataQuality.missing_count / (rows.length * columns.length)) * 100) : 0

    const qualityChart = {
      type: 'doughnut',
      data: {
        labels: ['Quality', 'Issues'],
        datasets: [{
          data: [qualityScore * 100, 100 - (qualityScore * 100)],
          backgroundColor: ['#10b981', '#ef4444']
        }]
      },
      options: {
        legend: { display: false },
        cutoutPercentage: 65
      }
    }

    const missingChart = {
      type: 'bar',
      data: {
        labels: ['Complete', 'Missing'],
        datasets: [{
          label: 'Values',
          data: [100 - missingPercent, missingPercent],
          backgroundColor: ['#3b82f6', '#f59e0b']
        }]
      },
      options: {
        legend: { display: false },
        scales: {
          xAxes: [{ display: false }],
          yAxes: [{ display: false }]
        }
      }
    }

    return {
      qualityUrl: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(qualityChart))}&w=200&h=200&f=png`,
      missingUrl: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(missingChart))}&w=200&h=200&f=png`
    }
  }, [dataQuality, rows.length, columns.length])

  // Enhanced AI Data Story
  const dataStory = useMemo(() => {
    const qScore = dataQuality.quality_score || 0
    const health = qScore > 0.8 ? 'Excellent' : qScore > 0.5 ? 'Moderate' : 'Poor'
    
    return {
      title: `Dataset ${health}`,
      summary: `Your dataset contains ${rows.length.toLocaleString()} records. The overall data integrity is rated as ${health.toLowerCase()} with a ${Math.round(qScore * 100)}% quality score.`,
      highlight: columns.length > 5 ? "High dimensionality detected." : "Compact dataset structure.",
      readiness: qScore > 0.7 ? "Ready for final visualization." : "Cleaning recommended for better accuracy."
    }
  }, [dataQuality, rows.length, columns.length])

  const handleShare = async () => {
    if (!data.upload_id) return
    setIsSharing(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/share/${data.upload_id}`)
      setPublicUrl(window.location.origin + response.data.public_url)
      toast.success("Public link generated!")
    } catch (e) {
      toast.error("Sharing failed")
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div id="dashboard-content" className="space-y-6 bg-gray-50 p-2 sm:p-4 rounded-xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Data Analysis Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare} 
                disabled={isSharing}
                className="gap-2 font-semibold bg-white border-primary/20 hover:bg-primary/5"
            >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 text-emerald-600" />}
                {publicUrl ? "Link Ready" : "Share"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2 font-semibold bg-white">
              <FileDown className="w-4 h-4 text-blue-600" />
              Report
            </Button>
            <Button variant="outline" size="sm" onClick={handlePresentationMode} className="gap-2 font-semibold bg-white">
              <Maximize2 className="w-4 h-4 text-indigo-600" />
              {document.fullscreenElement ? "Exit" : "Full Screen"}
            </Button>
          </div>
        </div>

        {publicUrl && (
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
               <Globe className="w-4 h-4 text-emerald-600" />
               <span className="text-sm font-medium text-emerald-900">Public Link:</span>
               <code className="text-xs bg-white px-2 py-1 rounded border border-emerald-200">{publicUrl}</code>
            </div>
            <Button size="sm" variant="ghost" className="text-emerald-700 h-8" onClick={() => {
                navigator.clipboard.writeText(publicUrl)
                toast.success("Copied to clipboard")
            }}>Copy</Button>
          </div>
        )}

        {/* File Metadata Module */}
        <FileMetadata
          fileName={fileName}
          fileSize={data.file_size}
          uploadedAt={data.uploaded_at}
          rowCount={rows.length}
          columnCount={columns.length}
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full bg-white border border-gray-200 shadow-sm rounded-xl p-1 gap-1 h-auto select-none">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Table2 className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
          <TabsTrigger value="controls" className="gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Controls</span>
          </TabsTrigger>
          <TabsTrigger value="visualizations" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Charts</span>
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Quality</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2 py-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden lg:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="laboratory" className="gap-2 py-2">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="hidden lg:inline">Laboratory</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2 py-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span className="hidden lg:inline">AI Chat</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="gap-2 py-2">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/10" />
            <span className="hidden lg:inline">Intelligence</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Executive Data Story Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-primary/5 via-background to-background border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Globe className="w-32 h-32 rotate-12 transition-transform group-hover:rotate-45 duration-700" />
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30 py-1.5 px-3">
                    <Zap className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    Global AI Summary
                  </Badge>
                  <h3 className="text-2xl font-black tracking-tight text-foreground">{dataStory.title}</h3>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl font-medium italic">
                  "{dataStory.summary}"
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 bg-background/50 border border-border/40 rounded-full px-4 py-2 text-sm font-bold shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {dataStory.readiness}
                  </div>
                  <div className="flex items-center gap-2 bg-background/50 border border-border/40 rounded-full px-4 py-2 text-sm font-bold shadow-sm">
                    <Activity className="w-4 h-4 text-blue-500" />
                    {dataStory.highlight}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-border/40 shadow-xl shadow-primary/5 flex flex-col items-center justify-center text-center space-y-4">
               <div className="relative w-32 h-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black text-primary">{Math.round((dataQuality.quality_score || 0) * 100)}%</span>
                  </div>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-primary/10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={Math.PI * 2 * 58}
                      strokeDashoffset={Math.PI * 2 * 58 * (1 - (dataQuality.quality_score || 0))}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-1000 ease-in-out"
                    />
                  </svg>
               </div>
               <div className="space-y-1">
                 <h4 className="font-black text-foreground uppercase tracking-widest text-xs">Integrity Score</h4>
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Verified Dataset Health</p>
               </div>
            </Card>
          </div>

          {/* Enhanced Metrics with Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-gray-200 shadow-sm p-6 relative overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 opacity-75">
                <img
                  src={overviewCharts.qualityUrl}
                  alt="Quality"
                  className="w-16 h-16 rounded-full shadow-lg"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Data Quality</p>
                <p className="text-3xl font-bold text-primary">
                  {dataQuality.quality_score ? Math.round(dataQuality.quality_score * 100) : 'N/A'}%
                </p>
              </div>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm p-6 relative overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 opacity-75">
                <img
                  src={overviewCharts.missingUrl}
                  alt="Missing"
                  className="w-16 h-16 rounded-full shadow-lg"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Missing Values</p>
                <p className="text-3xl font-bold text-primary">
                  {dataQuality.missing_count || 0}
                </p>
              </div>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm p-6 md:col-span-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Dataset Dimensions</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{rows.length.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Rows</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{columns.length}</p>
                    <p className="text-xs text-muted-foreground">Columns</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <ColumnSummaries analysis={analysis} columns={columns} />
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-6">
          <Card className="bg-white border-gray-200 shadow-sm overflow-hidden rounded-xl">
            <DataPreviewTable rows={rows} columns={columns} />
          </Card>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="mt-6">
          <VisualizationControl
            columns={columns}
            analysis={analysis}
            data={rows}
            onVisualize={(xCol, yCol, chartType) => {
              console.log(`[Dashboard] Visualize ${chartType}: ${xCol} vs ${yCol}`)
              setCurrentTab('visualizations')
            }}
          />
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations" className="mt-6">
          <VisualizationCharts
            data={rows}
            columns={columns}
            analysis={analysis}
            uploadId={data.upload_id}
          />
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataQualityReport
              quality={dataQuality}
              analysis={analysis}
            />
            <CorrelationAnalysis
              data={rows}
              columns={columns}
            />
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AutoInsights
              data={rows}
              analysis={analysis}
              quality={dataQuality}
            />
            <Card className="bg-white border-border/40 shadow-sm p-6 rounded-xl flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Interactive Data Cleaning</h3>
              </div>
              <div className="space-y-3 flex-1">
                <button
                  onClick={() => handleCleanData('drop_na')}
                  disabled={isCleaning}
                  className="w-full flex justify-between items-center p-4 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all text-left group"
                >
                  <div>
                    <div className="font-bold text-blue-900">Drop Missing Values</div>
                    <p className="text-xs text-blue-700/80">Remove rows with any NA data</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => handleCleanData('fill_mean')}
                  disabled={isCleaning}
                  className="w-full flex justify-between items-center p-4 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all text-left group"
                >
                  <div className="flex-1">
                    <div className="font-bold text-indigo-900">Fill with Mean</div>
                    <p className="text-xs text-indigo-700/80">Replace missing numeric values with column average</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => handleCleanData('drop_duplicates')}
                  disabled={isCleaning}
                  className="w-full flex justify-between items-center p-4 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all text-left group"
                >
                  <div className="flex-1">
                    <div className="font-bold text-emerald-900">Remove Duplicates</div>
                    <p className="text-xs text-emerald-700/80">Drop identical overlapping rows</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Transformation History Section */}
              <div className="mt-8 border-t border-border/40 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-muted-foreground mr-1" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Session History</h4>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {history.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic py-4 text-center">No transformations applied in this session</p>
                  ) : (
                    history.map((step) => (
                      <div key={step.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-border/20">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            step.status === 'success' ? 'bg-emerald-500' : 
                            step.status === 'error' ? 'bg-destructive' : 'bg-primary animate-pulse'
                          }`} />
                          <span className="text-[11px] font-bold text-foreground capitalize">{step.action}</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono">{step.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Laboratory Tab */}
        <TabsContent value="laboratory" className="mt-6">
          <DataLaboratory 
            uploadId={data.upload_id} 
            columns={columns} 
            analysis={analysis} 
            onDataUpdateAction={onDataUpdate || (() => {})} 
          />
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="mt-6">
          <AIChat uploadId={data.upload_id} />
        </TabsContent>

        {/* Intelligence Tab */}
        <TabsContent value="intelligence" className="mt-6">
           <PredictiveAnalytics uploadId={data.upload_id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
