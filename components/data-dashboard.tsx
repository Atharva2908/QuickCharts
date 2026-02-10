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
import { BarChart3, Table2, TrendingUp, AlertTriangle, Lightbulb, Settings, Activity } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'

interface DataDashboardProps {
  data: any
  fileName: string
}

export default function DataDashboard({ data, fileName }: DataDashboardProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [currentTab, setCurrentTab] = useState('overview')

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
      }
    }

    return {
      qualityUrl: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(qualityChart))}&w=200&h=200&f=png`,
      missingUrl: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(missingChart))}&w=200&h=200&f=png`
    }
  }, [dataQuality, rows.length, columns.length, API_BASE_URL])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Data Analysis Dashboard</h2>
          </div>
        </div>
        
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
        <TabsList className="grid grid-cols-6 w-full bg-card/50 border border-border/40">
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
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enhanced with QuickChart */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Enhanced Metrics with Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/40 bg-card/50 p-6 relative overflow-hidden">
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

            <Card className="border-border/40 bg-card/50 p-6 relative overflow-hidden">
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

            <Card className="border-border/40 bg-card/50 p-6 md:col-span-2">
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
          <Card className="border-border/40 bg-card/50 overflow-hidden">
            <DataPreviewTable rows={rows} columns={columns} />
          </Card>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="mt-6">
          <VisualizationControl
            columns={columns}
            analysis={analysis}
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
            <Card className="border-border/40 bg-card/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full p-4 border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all text-left">
                  <div className="font-medium text-foreground">Export Analysis</div>
                  <p className="text-sm text-muted-foreground">Download PDF report</p>
                </button>
                <button className="w-full p-4 border border-secondary/20 bg-secondary/5 hover:bg-secondary/10 rounded-xl transition-all text-left">
                  <div className="font-medium text-foreground">Clean Data</div>
                  <p className="text-sm text-muted-foreground">Remove duplicates & missing</p>
                </button>
                <button className="w-full p-4 border border-accent/20 bg-accent/5 hover:bg-accent/10 rounded-xl transition-all text-left">
                  <div className="font-medium text-foreground">Share Dashboard</div>
                  <p className="text-sm text-muted-foreground">Generate shareable link</p>
                </button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
