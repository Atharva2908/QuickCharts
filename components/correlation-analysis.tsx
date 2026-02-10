'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { AlertCircle, BarChart3 } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'

interface CorrelationAnalysisProps {
  data: any[]
  columns: string[]
}

export default function CorrelationAnalysis({ data, columns }: CorrelationAnalysisProps) {
  const { correlationMatrix, strongPairs } = useMemo(() => {
    if (!data || data.length === 0) return { correlationMatrix: [], strongPairs: [] }

    // Get numeric columns
    const numericCols = columns.filter((col) => {
      return data.some((row) => !isNaN(Number(row[col])))
    })

    if (numericCols.length < 2) {
      return { correlationMatrix: [], strongPairs: [] }
    }

    // Calculate correlation matrix
    const matrix: any[] = []
    const pairs: any[] = []

    numericCols.forEach((col1, i) => {
      const row: any = { column: col1 }
      numericCols.forEach((col2, j) => {
        const corr = calculatePearsonCorrelation(data, col1, col2)
        row[col2] = corr
        
        if (i < j && Math.abs(corr) > 0.7) {
          pairs.push({
            col1,
            col2,
            correlation: corr,
            strength: Math.abs(corr) > 0.9 ? 'Very Strong' : 'Strong',
          })
        }
      })
      matrix.push(row)
    })

    return { 
      correlationMatrix: matrix, 
      strongPairs: pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)) 
    }
  }, [data, columns])

  // Generate correlation heatmap with QuickChart
  const heatmapUrl = useMemo(() => {
    if (correlationMatrix.length === 0) return ''

    const numericCols = correlationMatrix.map(row => row.column)
    const matrixData = correlationMatrix.map(row => 
      numericCols.map(col => row[col] || 0)
    )

    const chartConfig = {
      type: 'scatter',
      data: {
        datasets: numericCols.map((col, i) => ({
          label: col.substring(0, 8),
          data: matrixData.map((row, j) => ({
            x: i,
            y: j,
            v: row[i]
          })),
          backgroundColor: matrixData[i].map((val: number) => {
            const intensity = Math.abs(val)
            return val > 0 
              ? `rgba(0, 136, 254, ${intensity * 0.8})`
              : `rgba(255, 68, 68, ${intensity * 0.8})`
          })
        }))
      },
      options: {
        plugins: {
          title: { display: true, text: 'Correlation Heatmap', font: { size: 16 } },
          legend: { display: false }
        },
        scales: {
          x: { type: 'linear', display: false },
          y: { type: 'linear', display: false }
        }
      }
    }

    return `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=500&h=400&f=png`
  }, [correlationMatrix, API_BASE_URL])

  if (correlationMatrix.length === 0) {
    return (
      <Card className="p-8 border-border/40 bg-card/50 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">Need at least 2 numeric columns for correlation analysis</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Heatmap with QuickChart */}
      <Card className="p-6 border-border/40 bg-card/50">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Correlation Heatmap</h3>
        </div>
        
        {heatmapUrl ? (
          <div className="bg-background/50 rounded-lg p-4 border border-border/50 shadow-sm">
            <img
              src={heatmapUrl}
              alt="Correlation Heatmap"
              className="w-full h-96 md:h-[400px] object-contain rounded-md shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Red = negative correlation | Blue = positive correlation
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Generating heatmap...</p>
          </div>
        )}
      </Card>

      {/* Enhanced Table View (Fallback) */}
      <Card className="p-6 border-border/40 bg-card/50 overflow-x-auto">
        <h4 className="text-md font-semibold mb-4 text-foreground">Correlation Matrix</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-3 text-muted-foreground font-medium">Column</th>
                {correlationMatrix[0] &&
                  Object.keys(correlationMatrix[0])
                    .filter((k) => k !== 'column')
                    .map((col) => (
                      <th key={col} className="text-center p-3 text-muted-foreground font-medium min-w-16">
                        {col.substring(0, 8)}
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody>
              {correlationMatrix.map((row, idx) => (
                <tr key={idx} className="border-b border-border/40 hover:bg-accent/50">
                  <td className="p-3 text-foreground font-medium">{row.column}</td>
                  {Object.entries(row)
                    .filter(([key]) => key !== 'column')
                    .map(([col, value]: any) => {
                      const intensity = Math.abs(value)
                      const bgColor = value > 0 
                        ? `rgba(0, 136, 254, ${intensity * 0.5})`
                        : `rgba(255, 68, 68, ${intensity * 0.5})`
                      return (
                        <td
                          key={col}
                          className="text-center p-3 font-mono"
                          style={{ 
                            backgroundColor: bgColor,
                            borderRadius: '4px',
                            minWidth: '60px'
                          }}
                        >
                          {value.toFixed(2)}
                        </td>
                      )
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Strong Correlations */}
      {strongPairs.length > 0 && (
        <Card className="p-6 border-border/40 bg-card/50">
          <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
            Strong Correlations ({strongPairs.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strongPairs.map((pair, idx) => {
              const chartConfig = {
                type: 'scatter',
                data: {
                  datasets: [{
                    label: `${pair.col1} vs ${pair.col2}`,
                    data: [{x: 0, y: 0}, {x: 10, y: pair.correlation * 10}],
                    showLine: true,
                    borderColor: pair.correlation > 0 ? '#3b82f6' : '#ef4444',
                    backgroundColor: pair.correlation > 0 ? '#3b82f6' : '#ef4444',
                    pointRadius: 0
                  }]
                },
                options: {
                  scales: { x: { display: false }, y: { display: false } },
                  plugins: { legend: { display: false } }
                }
              }
              
              const trendUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=200&h=100&f=png`
              
              return (
                <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-background/50 rounded-lg p-2 border border-border/50 flex-shrink-0">
                      <img 
                        src={trendUrl} 
                        alt={`${pair.col1} vs ${pair.col2}`}
                        className="w-20 h-16 object-contain rounded"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {pair.col1.substring(0, 15)} ↔ {pair.col2.substring(0, 15)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{pair.strength} ({Math.abs(pair.correlation).toFixed(3)})</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      pair.correlation > 0 
                        ? 'bg-blue-500/20 text-blue-600 border-blue-500/30' 
                        : 'bg-red-500/20 text-red-600 border-red-500/30'
                    } border`}>
                      {pair.correlation.toFixed(3)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

function calculatePearsonCorrelation(data: any[], col1: string, col2: string): number {
  const values1: number[] = []
  const values2: number[] = []

  data.forEach((row) => {
    const v1 = Number(row[col1])
    const v2 = Number(row[col2])
    if (!isNaN(v1) && !isNaN(v2)) {
      values1.push(v1)
      values2.push(v2)
    }
  })

  if (values1.length < 2) return 0

  const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length
  const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length

  let numerator = 0
  let denominator1 = 0
  let denominator2 = 0

  for (let i = 0; i < values1.length; i++) {
    const diff1 = values1[i] - mean1
    const diff2 = values2[i] - mean2
    numerator += diff1 * diff2
    denominator1 += diff1 * diff1
    denominator2 += diff2 * diff2
  }

  const denominator = Math.sqrt(denominator1 * denominator2)
  return denominator === 0 ? 0 : numerator / denominator
}
