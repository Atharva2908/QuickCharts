'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DataPreviewTable from './data-preview-table'
import ColumnSummaries from './column-summaries'
import VisualizationCharts from './visualization-charts'
import DataQualityReport from './data-quality-report'
import InsightsPanel from './insights-panel'
import FileMetadata from './file-metadata'
import VisualizationControl from './visualization-control'
import { BarChart3, Table2, TrendingUp, AlertTriangle, Lightbulb, Settings } from 'lucide-react'

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

  const insights = useMemo(() => {
    return data.insights || []
  }, [data])

  const dataQuality = useMemo(() => {
    return data.data_quality || {}
  }, [data])

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

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border/40 bg-card/50 p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Total Rows</p>
                <p className="text-3xl font-bold text-primary">{rows.length.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="border-border/40 bg-card/50 p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Total Columns</p>
                <p className="text-3xl font-bold text-primary">{columns.length}</p>
              </div>
            </Card>
            <Card className="border-border/40 bg-card/50 p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Data Quality</p>
                <p className="text-3xl font-bold text-primary">
                  {dataQuality.quality_score ? Math.round(dataQuality.quality_score * 100) : 'N/A'}%
                </p>
              </div>
            </Card>
            <Card className="border-border/40 bg-card/50 p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Missing Values</p>
                <p className="text-3xl font-bold text-primary">
                  {dataQuality.missing_count || 0}
                </p>
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

        {/* Visualization Control Tab */}
        <TabsContent value="controls" className="mt-6">
          <VisualizationControl
            columns={columns}
            analysis={analysis}
            onVisualize={(xCol, yCol, chartType) => {
              console.log(`[v0] Visualization control: ${chartType} with ${xCol} vs ${yCol}`)
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
          <DataQualityReport 
            quality={dataQuality}
            analysis={analysis}
          />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <InsightsPanel insights={insights} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
