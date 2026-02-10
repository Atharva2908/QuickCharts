'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'

interface DataQualityReportProps {
  quality: Record<string, any>
  analysis: Record<string, any>
}

export default function DataQualityReport({ quality, analysis }: DataQualityReportProps) {
  const qualityScore = quality.quality_score || 0
  const missingCount = quality.missing_count || 0
  const duplicateCount = quality.duplicate_count || 0
  const issues = quality.issues || []

  const getQualityColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-500'
    if (score >= 0.7) return 'text-amber-500'
    return 'text-red-500'
  }

  const getQualityLabel = (score: number) => {
    if (score >= 0.9) return 'Excellent'
    if (score >= 0.7) return 'Good'
    if (score >= 0.5) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="space-y-6">
      {/* Overall Quality Score */}
      <Card className="border-border/40 bg-card/50 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Overall Data Quality</h3>
              <p className="text-sm text-muted-foreground">Assessment of your dataset completeness and consistency</p>
            </div>
            <div className={`text-5xl font-bold ${getQualityColor(qualityScore)}`}>
              {Math.round(qualityScore * 100)}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-foreground">Quality Score</span>
              <span className={`text-sm font-semibold ${getQualityColor(qualityScore)}`}>
                {getQualityLabel(qualityScore)}
              </span>
            </div>
            <Progress 
              value={qualityScore * 100} 
              className="h-2"
            />
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/40 bg-card/50 p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Missing Values</p>
            <p className="text-3xl font-bold text-amber-500">{missingCount}</p>
            <p className="text-xs text-muted-foreground">Null or empty cells</p>
          </div>
        </Card>

        <Card className="border-border/40 bg-card/50 p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Duplicate Rows</p>
            <p className="text-3xl font-bold text-amber-500">{duplicateCount}</p>
            <p className="text-xs text-muted-foreground">Exact row duplicates</p>
          </div>
        </Card>

        <Card className="border-border/40 bg-card/50 p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Completeness</p>
            <p className="text-3xl font-bold text-emerald-500">
              {quality.completeness !== undefined 
                ? `${Math.round(quality.completeness * 100)}%`
                : 'N/A'
              }
            </p>
            <p className="text-xs text-muted-foreground">Data presence rate</p>
          </div>
        </Card>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Data Quality Issues
          </h3>
          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <Alert key={idx} className="border-amber-500/50 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-500/90">
                  {issue}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Column Quality Details */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Column Quality Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(analysis).map(([col, colData]: [string, any]) => {
            const missingPercent = colData.missing_percent || 0
            const hasIssues = missingPercent > 0.1
            
            return (
              <Card key={col} className="border-border/40 bg-card/50 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground text-sm">{col}</h4>
                    {hasIssues ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Missing:</span>
                      <span className={hasIssues ? 'text-amber-500 font-semibold' : 'text-foreground'}>
                        {(missingPercent * 100).toFixed(1)}%
                      </span>
                    </div>
                    {colData.unique !== undefined && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Unique values:</span>
                        <span className="text-foreground">{colData.unique}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recommendations */}
      {(missingCount > 0 || duplicateCount > 0) && (
        <Card className="border-border/40 bg-card/50 p-6 border-emerald-500/20 bg-emerald-500/5">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {missingCount > 0 && (
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Consider handling missing values through imputation or removal for better analysis</span>
              </li>
            )}
            {duplicateCount > 0 && (
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Remove duplicate rows to improve data integrity and analysis accuracy</span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Validate data types and ranges to ensure consistency</span>
            </li>
          </ul>
        </Card>
      )}
    </div>
  )
}
