'use client'

import { Card } from '@/components/ui/card'
import { 
  BarChart3, Hash, Type, Calendar, Percent 
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'

interface ColumnSummariesProps {
  analysis: Record<string, any>
  columns: string[]
}

interface ColumnSummary {
  name: string
  stats: {
    dtype?: string
    unique?: number
    missing?: number
    missing_percent?: number
    mean?: number
    median?: number
    std?: number
    min?: number
    max?: number
  }
  chartUrl?: string
}

export default function ColumnSummaries({ analysis, columns }: ColumnSummariesProps) {
  const summaries: ColumnSummary[] = columns.map(col => {
    const stats = analysis[col] || {}
    
    // Generate distribution chart for numeric columns
    let chartUrl = ''
    if (stats.mean && stats.min !== undefined && stats.max !== undefined) {
      const chartConfig = {
        type: 'bar',
        data: {
          labels: ['Min', 'Mean', 'Median', 'Max'],
          datasets: [{
            label: `${col} Distribution`,
            data: [
              stats.min || 0, 
              stats.mean || 0, 
              stats.median || stats.mean || 0,
              stats.max || 0
            ],
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `${col} Stats`,
              font: { size: 12 }
            }
          }
        }
      }
      
      chartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=300&h=200&f=png`
    }

    return {
      name: col,
      stats,
      chartUrl
    }
  })

  const getTypeIcon = (dataType: string) => {
    if (dataType?.includes('int') || dataType?.includes('float')) {
      return <Hash className="w-4 h-4" />
    } else if (dataType?.includes('date') || dataType?.includes('datetime')) {
      return <Calendar className="w-4 h-4" />
    } else if (dataType?.includes('bool')) {
      return <Percent className="w-4 h-4" />
    }
    return <Type className="w-4 h-4" />
  }

  const getTypeLabel = (dataType: string) => {
    if (dataType?.includes('int64') || dataType?.includes('int32')) return 'Integer'
    if (dataType?.includes('float')) return 'Decimal'
    if (dataType?.includes('object')) return 'Text'
    if (dataType?.includes('bool')) return 'Boolean'
    if (dataType?.includes('date')) return 'Date'
    return 'Other'
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Column Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map(({ name, stats, chartUrl }) => (
          <Card key={name} className="border-border/40 bg-card/50 p-5 h-full">
            <div className="space-y-4 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-foreground text-sm truncate flex-1">
                  {name}
                </h4>
                <div className="text-primary/70 ml-2">
                  {getTypeIcon(stats.dtype || '')}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 text-sm flex-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Type:</span>
                  <span className="font-mono text-xs bg-primary/10 px-2 py-1 rounded">
                    {getTypeLabel(stats.dtype || 'Unknown')}
                  </span>
                </div>

                {stats.unique !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Unique:</span>
                    <span className="font-semibold text-foreground">{stats.unique}</span>
                  </div>
                )}

                {stats.missing !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Missing:</span>
                    <span className={stats.missing > 0 ? 'text-amber-500 font-semibold' : 'text-foreground'}>
                      {stats.missing}
                    </span>
                  </div>
                )}

                {stats.missing_percent !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Missing %:</span>
                    <span className={stats.missing_percent > 5 ? 'text-amber-500 font-semibold' : 'text-foreground'}>
                      {(stats.missing_percent * 100).toFixed(1)}%
                    </span>
                  </div>
                )}

                {stats.mean !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Mean:</span>
                    <span className="font-mono text-foreground">{Number(stats.mean).toFixed(2)}</span>
                  </div>
                )}

                {stats.median !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Median:</span>
                    <span className="font-mono text-foreground">{Number(stats.median).toFixed(2)}</span>
                  </div>
                )}

                {stats.std !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Std Dev:</span>
                    <span className="font-mono text-foreground">{Number(stats.std).toFixed(2)}</span>
                  </div>
                )}

                {stats.min !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Min:</span>
                    <span className="font-mono text-foreground">{Number(stats.min).toFixed(2)}</span>
                  </div>
                )}

                {stats.max !== undefined && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Max:</span>
                    <span className="font-mono text-foreground">{Number(stats.max).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* QuickChart Visualization */}
              {chartUrl && (
                <div className="pt-3 mt-auto">
                  <div className="bg-background/50 rounded-lg p-2 border border-border/50">
                    <img 
                      src={chartUrl}
                      alt={`${name} distribution`}
                      className="w-full h-32 object-contain rounded-md shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Distribution</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
