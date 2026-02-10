'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Lightbulb, TrendingUp, AlertCircle, Info } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'

interface AutoInsightsProps {
  data: any[]
  analysis: Record<string, any>
  quality: Record<string, any>
}

interface Insight {
  type: string
  title: string
  message: string
  chartUrl?: string
}

export default function AutoInsights({ data, analysis, quality }: AutoInsightsProps) {
  const insights = useMemo(() => {
    const allInsights: Insight[] = []

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

    // Column analysis insights with QuickChart integration
    Object.entries(analysis).forEach(([col, colData]: [string, any]) => {
      const colValues = data.map((row) => row[col]).filter((val) => val !== null && val !== undefined)

      if (colValues.length === 0) return

      // Numeric columns with charts
      if (typeof colValues[0] === 'number' || !isNaN(Number(colValues[0]))) {
        const numericValues = colValues.map((v) => Number(v)).filter((v) => !isNaN(v))
        if (numericValues.length > 0) {
          const max = Math.max(...numericValues)
          const min = Math.min(...numericValues)
          const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
          const range = max - min

          // High variability - Bar chart
          if (range > avg * 2) {
            const chartConfig = {
              type: 'bar',
              data: {
                labels: ['Min', 'Avg', 'Max'],
                datasets: [{
                  label: `${col}`,
                  data: [min, avg, max],
                  backgroundColor: ['#ef4444', '#10b981', '#3b82f6']
                }]
              },
              options: {
                plugins: { 
                  title: { 
                    display: true, 
                    text: `${col} Distribution`,
                    font: { size: 14 }
                  }
                }
              }
            }
            
            const chartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=320&h=200&f=png`
            
            allInsights.push({
              type: 'trend',
              title: `High Variability in ${col}`,
              message: `${col} has a wide range (${min.toFixed(2)} to ${max.toFixed(2)}). Consider log transformation.`,
              chartUrl
            })
          }

          // Exponential pattern - Line chart
          if (max / min > 10 && min > 0) {
            const chartConfig = {
              type: 'line',
              data: {
                labels: ['Min', 'Q1', 'Median', 'Q3', 'Max'],
                datasets: [{
                  label: `${col} Trend`,
                  data: [min, min * 2, avg, max * 0.8, max],
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              },
              options: {
                plugins: { 
                  title: { 
                    display: true, 
                    text: `${col} Exponential Pattern`
                  }
                }
              }
            }
            
            const chartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=320&h=200&f=png`
            
            allInsights.push({
              type: 'trend',
              title: `Exponential Pattern in ${col}`,
              message: `${col} shows ${(max / min).toFixed(1)}x range, suggesting exponential growth.`,
              chartUrl
            })
          }
        }
      }

      // Categorical high cardinality - Pie chart
      const uniqueCount = new Set(colValues).size
      const uniqueRatio = uniqueCount / colValues.length
      if (uniqueRatio > 0.8) {
        const top5Values = Array.from(new Set(colValues.slice(0, 50))).slice(0, 5)
        const chartConfig = {
          type: 'doughnut',
          data: {
            labels: top5Values.map(v => String(v).slice(0, 12)),
            datasets: [{
              data: top5Values.map(() => 1),
              backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
            }]
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: `${col} - Top Categories`
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        }
        
        const chartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=280&h=280&f=png`
        
        allInsights.push({
          type: 'info',
          title: `High Cardinality in ${col}`,
          message: `${col} has ${uniqueCount} unique values (${Math.round(uniqueRatio*100)}% unique). Consider grouping.`,
          chartUrl
        })
      }
    })

    // Quality insights
    const completeness = quality.completeness || 0
    if (completeness < 1.0) {
      const missingPercent = ((1 - completeness) * 100).toFixed(1)
      
      const chartConfig = {
        type: 'doughnut',
        data: {
          labels: ['Complete', 'Missing'],
          datasets: [{
            data: [completeness * 100, (1 - completeness) * 100],
            backgroundColor: ['#10b981', '#ef4444']
          }]
        },
        options: {
          plugins: {
            title: { display: true, text: 'Data Completeness' },
            legend: { position: 'bottom' }
          }
        }
      }
      
      const chartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=250&h=250&f=png`
      
      allInsights.push({
        type: 'warning',
        title: 'Missing Data Detected',
        message: `${missingPercent}% of values missing across dataset.`,
        chartUrl
      })
    }

    const duplicateCount = quality.duplicate_count || 0
    if (duplicateCount > 0) {
      const chartConfig = {
        type: 'bar',
        data: {
          labels: ['Unique', 'Duplicates'],
          datasets: [{
            label: 'Rows',
            data: [data.length - duplicateCount, duplicateCount],
            backgroundColor: ['#10b981', '#ef4444']
          }]
        }
      }
      
      const chartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=300&h=200&f=png`
      
      allInsights.push({
        type: 'warning',
        title: 'Duplicate Records',
        message: `${duplicateCount} duplicate rows (${Math.round((duplicateCount/data.length)*100)}% of total).`,
        chartUrl
      })
    }

    return allInsights
  }, [data, analysis, quality, API_BASE_URL])

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
          <Card key={idx} className={`border-border/40 p-6 border ${getColor(insight.type)}`}>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 pt-0.5">{getIcon(insight.type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm mb-1 truncate">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.message}</p>
                </div>
              </div>
              
              {insight.chartUrl && (
                <div className="flex justify-center pt-3">
                  <div className="bg-background/50 rounded-lg p-2 shadow-sm border border-border/50">
                    <img 
                      src={insight.chartUrl} 
                      alt={`${insight.title} visualization`}
                      className="rounded-md shadow-sm max-w-full h-auto"
                      style={{ maxHeight: '220px', width: '100%' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
