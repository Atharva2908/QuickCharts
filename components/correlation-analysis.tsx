'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

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

    return { correlationMatrix: matrix, strongPairs: pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)) }
  }, [data, columns])

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
      {/* Heatmap */}
      <Card className="p-6 border-border/40 bg-card/50 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Correlation Heatmap</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-2 text-muted-foreground">Column</th>
                {correlationMatrix[0] &&
                  Object.keys(correlationMatrix[0])
                    .filter((k) => k !== 'column')
                    .map((col) => (
                      <th key={col} className="text-center p-2 text-muted-foreground min-w-20">
                        {col.substring(0, 10)}
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody>
              {correlationMatrix.map((row, idx) => (
                <tr key={idx} className="border-b border-border/40 hover:bg-card/70">
                  <td className="p-2 text-foreground font-medium">{row.column}</td>
                  {Object.entries(row)
                    .filter(([key]) => key !== 'column')
                    .map(([col, value]: any) => {
                      const intensity = Math.abs(value)
                      const bgColor = value > 0 ? `rgba(0, 136, 254, ${intensity * 0.7})` : `rgba(255, 68, 68, ${intensity * 0.7})`
                      return (
                        <td
                          key={col}
                          className="text-center p-2 text-white rounded"
                          style={{ backgroundColor: bgColor }}
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
          <h3 className="text-lg font-semibold mb-4 text-foreground">Strong Correlations Found</h3>
          <div className="space-y-3">
            {strongPairs.map((pair, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">
                      {pair.col1} ↔ {pair.col2}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{pair.strength} correlation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">{pair.correlation.toFixed(3)}</p>
                  </div>
                </div>
              </div>
            ))}
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
