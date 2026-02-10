'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Lightbulb, TrendingUp, AlertCircle, Info } from 'lucide-react'

interface AutoInsightsProps {
  data: any[]
  analysis: Record<string, any>
  quality: Record<string, any>
}

export default function AutoInsights({ data, analysis, quality }: AutoInsightsProps) {
  const insights = useMemo(() => {
    const allInsights: any[] = []

    if (!data || data.length === 0) return allInsights

    // Dataset size insight
    allInsights.push({
      type: 'info',
      title: 'Dataset Overview',
      message: `Your dataset contains ${data.length} rows across multiple columns. This is a ${
        data.length < 100 ? 'small' : data.length < 1000 ? 'medium' : 'large'
      } dataset.`,
    })

    // Quality insight
    const qualityScore = quality.quality_score || 0
    if (qualityScore < 0.7) {
      allInsights.push({
        type: 'warning',
        title: 'Data Quality Issues',
        message: `Data quality score is ${(qualityScore * 100).toFixed(0)}%. Consider cleaning missing values and duplicates.`,
      })
    }

    // Column analysis insights
    Object.entries(analysis).forEach(([col, colData]: [string, any]) => {
      const colValues = data.map((row) => row[col]).filter((val) => val !== null && val !== undefined)

      if (colValues.length === 0) return

      // For numeric columns
      if (typeof colValues[0] === 'number' || !isNaN(Number(colValues[0]))) {
        const numericValues = colValues.map((v) => Number(v)).filter((v) => !isNaN(v))
        if (numericValues.length > 0) {
          const max = Math.max(...numericValues)
          const min = Math.min(...numericValues)
          const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
          const range = max - min

          if (range > avg * 2) {
            allInsights.push({
              type: 'trend',
              title: `High Variability in ${col}`,
              message: `${col} has a wide range (${min.toFixed(2)} to ${max.toFixed(2)}). Consider log transformation for visualization.`,
            })
          }

          if (max / min > 10 && min > 0) {
            allInsights.push({
              type: 'trend',
              title: `Exponential Pattern in ${col}`,
              message: `${col} shows a ${(max / min).toFixed(1)}x difference between max and min values, suggesting exponential growth.`,
            })
          }
        }
      }

      // For categorical columns
      const uniqueCount = new Set(colValues).size
      const uniqueRatio = uniqueCount / colValues.length
      if (uniqueRatio > 0.8) {
        allInsights.push({
          type: 'info',
          title: `High Cardinality in ${col}`,
          message: `${col} has ${uniqueCount} unique values. Consider grouping for better visualization.`,
        })
      }
    })

    // Completeness insight
    const completeness = quality.completeness || 0
    if (completeness < 1.0) {
      const missingPercent = ((1 - completeness) * 100).toFixed(1)
      allInsights.push({
        type: 'warning',
        title: 'Missing Data',
        message: `${missingPercent}% of values are missing. This may affect analysis accuracy.`,
      })
    }

    // Duplicate insight
    const duplicateCount = quality.duplicate_count || 0
    if (duplicateCount > 0) {
      allInsights.push({
        type: 'warning',
        title: 'Duplicate Records Found',
        message: `${duplicateCount} duplicate rows detected. Remove them for accurate analysis.`,
      })
    }

    return allInsights
  }, [data, analysis, quality])

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-cyan-500" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20'
      case 'trend':
        return 'bg-blue-500/10 border-blue-500/20'
      default:
        return 'bg-cyan-500/10 border-cyan-500/20'
    }
  }

  if (insights.length === 0) {
    return (
      <Card className="p-8 border-border/40 bg-card/50 text-center">
        <Lightbulb className="w-8 h-8 text-primary mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No specific insights available yet</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Auto-Generated Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <Card key={idx} className={`border-border/40 p-4 border ${getColor(insight.type)}`}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 pt-0.5">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.message}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
