'use client'

import { Card } from '@/components/ui/card'
import { 
  BarChart3, Hash, Type, Calendar, Percent 
} from 'lucide-react'

interface ColumnSummariesProps {
  analysis: Record<string, any>
  columns: string[]
}

export default function ColumnSummaries({ analysis, columns }: ColumnSummariesProps) {
  const getTypeIcon = (dataType: string) => {
    if (dataType.includes('int') || dataType.includes('float')) {
      return <Hash className="w-4 h-4" />
    } else if (dataType.includes('date') || dataType.includes('datetime')) {
      return <Calendar className="w-4 h-4" />
    } else if (dataType.includes('bool')) {
      return <Percent className="w-4 h-4" />
    }
    return <Type className="w-4 h-4" />
  }

  const getTypeLabel = (dataType: string) => {
    if (dataType.includes('int64') || dataType.includes('int32')) return 'Integer'
    if (dataType.includes('float')) return 'Decimal'
    if (dataType.includes('object')) return 'Text'
    if (dataType.includes('bool')) return 'Boolean'
    if (dataType.includes('date')) return 'Date'
    return 'Other'
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Column Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colAnalysis = analysis[col] || {}
          
          return (
            <Card key={col} className="border-border/40 bg-card/50 p-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-foreground text-sm truncate flex-1">
                    {col}
                  </h4>
                  <div className="text-primary/70">
                    {getTypeIcon(colAnalysis.dtype || '')}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Type:</span>
                    <span className="font-mono text-xs bg-primary/10 px-2 py-1 rounded">
                      {getTypeLabel(colAnalysis.dtype || 'Unknown')}
                    </span>
                  </div>

                  {colAnalysis.unique !== undefined && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Unique:</span>
                      <span className="font-semibold text-foreground">{colAnalysis.unique}</span>
                    </div>
                  )}

                  {colAnalysis.missing !== undefined && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Missing:</span>
                      <span className={colAnalysis.missing > 0 ? 'text-amber-500 font-semibold' : 'text-foreground'}>
                        {colAnalysis.missing}
                      </span>
                    </div>
                  )}

                  {colAnalysis.missing_percent !== undefined && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Missing %:</span>
                      <span className={colAnalysis.missing_percent > 5 ? 'text-amber-500 font-semibold' : 'text-foreground'}>
                        {(colAnalysis.missing_percent * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {colAnalysis.mean !== undefined && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Mean:</span>
                      <span className="font-mono text-foreground">{Number(colAnalysis.mean).toFixed(2)}</span>
                    </div>
                  )}

                  {colAnalysis.median !== undefined && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Median:</span>
                      <span className="font-mono text-foreground">{Number(colAnalysis.median).toFixed(2)}</span>
                    </div>
                  )}

                  {colAnalysis.std !== undefined && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Std Dev:</span>
                      <span className="font-mono text-foreground">{Number(colAnalysis.std).toFixed(2)}</span>
                    </div>
                  )}

                  {colAnalysis.min !== undefined && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Min:</span>
                      <span className="font-mono text-foreground">{Number(colAnalysis.min).toFixed(2)}</span>
                    </div>
                  )}

                  {colAnalysis.max !== undefined && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Max:</span>
                      <span className="font-mono text-foreground">{Number(colAnalysis.max).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
