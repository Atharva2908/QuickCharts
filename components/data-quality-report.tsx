'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'

interface DataQualityReportProps {
  quality: Record<string, any>
  analysis: Record<string, any>
}

export default function DataQualityReport({ quality, analysis }: DataQualityReportProps) {
  const qualityScore = quality.quality_score || 0
  const missingCount = quality.missing_count || 0
  const duplicateCount = quality.duplicate_count || 0
  const issues = quality.issues || []

  // Generate quality overview charts
  const qualityCharts = {
    scoreChart: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify({
      type: 'doughnut',
      data: {
        labels: ['Quality', 'Issues'],
        datasets: [{
          data: [qualityScore * 100, 100 - (qualityScore * 100)],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        cutout: '70%'
      }
    }))}&w=120&h=120&f=png`,

    completenessChart: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify({
      type: 'doughnut',
      data: {
        labels: ['Complete', 'Missing'],
        datasets: [{
          data: [
            quality.completeness ? quality.completeness * 100 : 100,
            quality.completeness ? (1 - quality.completeness) * 100 : 0
          ],
          backgroundColor: ['#3b82f6', '#f59e0b']
        }]
      }
    }))}&w=100&h=100&f=png`,

    issuesChart: `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify({
      type: 'bar',
      data: {
        labels: ['Missing', 'Duplicates'],
        datasets: [{
          label: 'Issues',
          data: [missingCount, duplicateCount],
          backgroundColor: ['#f59e0b', '#ef4444']
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } }
      }
    }))}&w=140&h=80&f=png`
  }

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
      {/* Overall Quality Score with Chart */}
      <Card className="border-border/40 bg-card/50 p-8 relative overflow-hidden">
        <div 
          className="absolute top-8 right-8 w-32 h-32 bg-gradient-to-br from-background/50 to-transparent rounded-full"
        />
        <img
          src={qualityCharts.scoreChart}
          alt="Quality Score"
          className="absolute top-12 right-12 w-24 h-24 shadow-lg rounded-full"
          onError={(e) => e.currentTarget.style.display = 'none'}
        />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Overall Data Quality</h3>
              <p className="text-sm text-muted-foreground">Assessment of dataset completeness and consistency</p>
            </div>
            <div className={`text-5xl font-black ${getQualityColor(qualityScore)} drop-shadow-lg`}>
              {Math.round(qualityScore * 100)}%
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-muted-foreground">Progress</span>
              <span className={`text-sm font-bold ${getQualityColor(qualityScore)}`}>
                {getQualityLabel(qualityScore)}
              </span>
            </div>
            <Progress 
              value={qualityScore * 100} 
              className="h-3 [&>div]:!bg-gradient-to-r [&>div]:from-primary/80 [&>div]:to-primary/40"
            />
          </div>
        </div>
      </Card>

      {/* Key Metrics with Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/40 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6 relative">
          <div className="absolute top-4 right-4 w-20 h-20">
            <img
              src={qualityCharts.issuesChart}
              alt="Issues"
              className="w-full h-full object-contain rounded-lg shadow-md"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
          <div className="space-y-3 relative z-10">
            <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
              Missing Values
            </p>
            <p className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {missingCount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Null or empty cells</p>
          </div>
        </Card>

        <Card className="border-border/40 bg-gradient-to-br from-orange-500/5 to-red-500/5 p-6 relative">
          <div className="absolute top-4 right-4 w-16 h-16">
            <img
              src={qualityCharts.completenessChart}
              alt="Completeness"
              className="w-full h-full object-contain rounded-lg shadow-md"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          </div>
          <div className="space-y-3 relative z-10">
            <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
              Duplicate Rows
            </p>
            <p className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {duplicateCount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Exact duplicates</p>
          </div>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 p-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-semibold">Completeness</p>
            <p className="text-3xl font-black text-emerald-500">
              {quality.completeness !== undefined 
                ? `${Math.round(quality.completeness * 100)}%`
                : 'N/A'
              }
            </p>
            <p className="text-xs text-muted-foreground">Data presence rate</p>
          </div>
        </Card>
      </div>

      {/* Issues List */}
      {issues.length > 0 && (
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Data Quality Issues ({issues.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {issues.map((issue, idx) => (
              <Alert key={idx} className="border-amber-400/50 bg-amber-500/10 border-l-4">
                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-amber-800/90 font-medium">
                  {issue}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </Card>
      )}

      {/* Column Quality Summary */}
      <Card className="border-border/40 bg-card/50 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Column Quality Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analysis).slice(0, 9).map(([col, colData]: [string, any]) => {
            const missingPercent = colData.missing_percent || 0
            const hasIssues = missingPercent > 0.1
            const colScore = Math.max(0, 1 - missingPercent)
            
            return (
              <Card 
                key={col} 
                className={`border p-4 h-full transition-all hover:shadow-md ${
                  hasIssues 
                    ? 'border-amber-500/30 bg-amber-500/5' 
                    : 'border-emerald-500/20 bg-emerald-500/5'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground text-sm truncate max-w-[80%]">
                      {col}
                    </h4>
                    {hasIssues ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Missing</span>
                      <span className={hasIssues ? 'text-amber-500 font-bold' : 'text-emerald-500 font-bold'}>
                        {(missingPercent * 100).toFixed(1)}%
                      </span>
                    </div>
                    {colData.unique !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unique</span>
                        <span className="text-foreground font-mono">{colData.unique}</span>
                      </div>
                    )}
                    <Progress 
                      value={colScore * 100} 
                      className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary/60"
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </Card>

      {/* Actionable Recommendations */}
      {(missingCount > 0 || duplicateCount > 0) && (
        <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border-l-4 border-emerald-500 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Actionable Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {missingCount > 0 && (
              <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-emerald-200/50">
                <div className="font-semibold text-emerald-600 mb-2">Handle Missing Values</div>
                <ul className="text-emerald-700/90 space-y-1 list-disc list-inside text-sm">
                  <li>Impute with mean/median for numeric columns</li>
                  <li>Use forward-fill for time series</li>
                  jsx
<li>Remove rows if less than 5% missing</li>
                </ul>
              </div>
            )}
            {duplicateCount > 0 && (
              <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-emerald-200/50">
                <div className="font-semibold text-emerald-600 mb-2">Remove Duplicates</div>
                <ul className="text-emerald-700/90 space-y-1 list-disc list-inside text-sm">
                  <li>Keep first occurrence</li>
                  <li>Check for near-duplicates</li>
                  <li>Validate unique keys</li>
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
