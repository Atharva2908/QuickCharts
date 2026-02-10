'use client'

import { Card } from '@/components/ui/card'
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react'

interface InsightsPanelProps {
  insights: any[]
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  if (!insights || insights.length === 0) {
    return (
      <Card className="border-border/40 bg-card/50 p-12 text-center">
        <Lightbulb className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No Insights Generated Yet</h3>
        <p className="text-sm text-muted-foreground/70 mt-2">
          Insights will be generated based on your data patterns and trends
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        Auto-Generated Insights
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => {
          const insightType = insight.type || 'general'
          
          const getIcon = () => {
            if (insightType === 'trend') return <TrendingUp className="w-5 h-5" />
            if (insightType === 'alert') return <AlertCircle className="w-5 h-5" />
            return <Lightbulb className="w-5 h-5" />
          }

          const getIconColor = () => {
            if (insightType === 'alert') return 'text-amber-500'
            return 'text-primary'
          }

          return (
            <Card 
              key={idx}
              className={`border-border/40 bg-card/50 p-6 ${
                insightType === 'alert' 
                  ? 'border-amber-500/30 bg-amber-500/5' 
                  : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${getIconColor()}`}>
                    {getIcon()}
                  </div>
                  <div className="flex-1">
                    {insight.title && (
                      <h4 className="font-semibold text-foreground mb-1">{insight.title}</h4>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description || insight.message || 'Analysis in progress'}
                    </p>
                  </div>
                </div>

                {insight.metrics && (
                  <div className="bg-primary/5 rounded p-3 mt-2">
                    <div className="text-xs space-y-1">
                      {Object.entries(insight.metrics).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between text-muted-foreground">
                          <span>{key}:</span>
                          <span className="font-mono font-semibold text-foreground">
                            {typeof value === 'number' ? value.toFixed(2) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {insight.recommendation && (
                  <div className="bg-emerald-500/10 rounded p-3 mt-2 border border-emerald-500/20">
                    <p className="text-xs text-emerald-500/90">
                      <span className="font-semibold">💡 Recommendation: </span>
                      {insight.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      <Card className="border-border/40 bg-card/50 p-6 mt-6">
        <h4 className="font-semibold text-foreground mb-4">Key Findings Summary</h4>
        <div className="space-y-3">
          {insights.slice(0, 3).map((insight, idx) => (
            <div key={idx} className="flex gap-3 text-sm">
              <span className="text-primary font-bold">•</span>
              <span className="text-muted-foreground">{insight.summary || insight.title || insight.message}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
