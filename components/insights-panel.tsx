'use client'

import { Card } from '@/components/ui/card'
import { Lightbulb, TrendingUp, AlertCircle, BarChart3, Activity } from 'lucide-react'
import { API_BASE_URL } from '@/lib/constants'

interface InsightsPanelProps {
  insights: any[]
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  // Generate insights overview chart
  const insightsChartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify({
    type: 'doughnut',
    data: {
      labels: ['Trends', 'Alerts', 'General'],
      datasets: [{
        data: [
          insights.filter(i => i.type === 'trend').length,
          insights.filter(i => i.type === 'alert').length,
          insights.filter(i => !i.type || i.type === 'general').length
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#6b7280'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      plugins: {
        legend: { 
          position: 'bottom',
          labels: { 
            padding: 20, 
            usePointStyle: true,
            font: { size: 12 }
          }
        },
        title: { display: false }
      },
      cutout: '65%'
    }
  }))}&w=200&h=200&f=png`

  if (!insights || insights.length === 0) {
    return (
      <Card className="border-border/40 bg-gradient-to-br from-card/80 p-16 text-center relative overflow-hidden">
        <div className="absolute top-8 right-8 opacity-20">
          <img
            src={insightsChartUrl}
            alt="Insights preview"
            className="w-32 h-32"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
        <Lightbulb className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6 drop-shadow-lg" />
        <h3 className="text-2xl font-bold text-foreground/70 mb-3">No Insights Yet</h3>
        <p className="text-lg text-muted-foreground/60 max-w-md mx-auto leading-relaxed">
          Upload your data to unlock AI-powered insights, trends, 
          and actionable recommendations automatically generated from your dataset.
        </p>
      </Card>
    )
  }

  const getInsightCardStyle = (type: string) => {
    switch(type) {
      case 'trend': return 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 shadow-emerald-500/10'
      case 'alert': return 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 shadow-amber-500/20 animate-pulse'
      default: return 'border-primary/20 bg-gradient-to-br from-primary/5 shadow-primary/10'
    }
  }

  const getInsightIcon = (type: string) => {
    switch(type) {
      case 'trend': return <TrendingUp className="w-6 h-6" />
      case 'alert': return <AlertCircle className="w-6 h-6" />
      default: return <Lightbulb className="w-6 h-6" />
    }
  }

  const getInsightSeverity = (type: string) => {
    switch(type) {
      case 'trend': return 'success'
      case 'alert': return 'warning'
      default: return 'info'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Insights Chart */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 rounded-2xl shadow-lg">
            <Lightbulb className="w-8 h-8 text-primary drop-shadow-lg" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              AI-Generated Insights ({insights.length})
            </h3>
            <p className="text-sm text-muted-foreground">
              Automatically discovered patterns and recommendations
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <img
            src={insightsChartUrl}
            alt="Insights distribution"
            className="w-32 h-32 rounded-2xl shadow-xl ring-2 ring-background/50"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6">
        {insights.map((insight, idx) => {
          const insightType = insight.type || 'general'
          
          return (
            <Card 
              key={idx}
              className={`group relative overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 p-8 h-full ${
                getInsightCardStyle(insightType)
              }`}
            >
              {/* Priority Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  insightType === 'alert' ? 'bg-amber-500/90 text-white shadow-lg' :
                  insightType === 'trend' ? 'bg-emerald-500/90 text-white shadow-lg' :
                  'bg-primary/90 text-primary-foreground shadow-md'
                }`}>
                  {insightType.toUpperCase()}
                </span>
              </div>

              <div className="space-y-4 relative z-10">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-md transition-all group-hover:scale-110 group-hover:rotate-3 ${
                    insightType === 'alert' ? 'bg-amber-100/50' :
                    insightType === 'trend' ? 'bg-emerald-100/50' :
                    'bg-primary/20'
                  }`}>
                    {getInsightIcon(insightType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {insight.title && (
                      <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {insight.title}
                      </h4>
                    )}
                    <p className="text-base text-muted-foreground/90 leading-relaxed line-clamp-3 group-hover:text-foreground/95 transition-colors">
                      {insight.description || insight.message || insight.content || 'No description available'}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                {insight.metrics && Object.keys(insight.metrics).length > 0 && (
                  <div className="bg-gradient-to-r from-background/60 p-4 rounded-xl border border-border/30 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(insight.metrics).map(([key, value]: [string, any]) => (
                        <div key={key} className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {key.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-lg font-black text-foreground font-mono">
                            {typeof value === 'number' ? value.toLocaleString(value >= 1000 ? 'en-US' : undefined, { 
                              maximumFractionDigits: 1 
                            }) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                {insight.recommendation && (
                  <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 p-4 rounded-2xl border border-emerald-500/30 backdrop-blur-sm hover:shadow-emerald-500/20 transition-all group-hover:scale-[1.02]">
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-bold text-emerald-600 mb-1 block">💡 Recommendation</span>
                        <p className="text-sm text-emerald-700/95 leading-relaxed">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Executive Summary */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 p-8 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-7 h-7 text-primary" />
          <h4 className="text-xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Executive Summary ({insights.length} Insights)
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/20 backdrop-blur-sm rounded-2xl">
            <div className="text-3xl font-black text-emerald-500 mb-2">
              {insights.filter(i => i.type === 'trend').length}
            </div>
            <div className="text-sm text-emerald-600 font-semibold uppercase tracking-wider">Positive Trends</div>
          </div>
          <div className="text-center p-6 bg-white/20 backdrop-blur-sm rounded-2xl">
            <div className="text-3xl font-black text-amber-500 mb-2">
              {insights.filter(i => i.type === 'alert').length}
            </div>
            <div className="text-sm text-amber-600 font-semibold uppercase tracking-wider">Issues Found</div>
          </div>
          <div className="text-center p-6 bg-white/20 backdrop-blur-sm rounded-2xl">
            <div className="text-3xl font-black text-primary mb-2">{insights.length}</div>
            <div className="text-sm text-primary/90 font-semibold uppercase tracking-wider">Total Insights</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
