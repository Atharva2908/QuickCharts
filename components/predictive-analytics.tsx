'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { 
  TrendingUp, 
  Lightbulb, 
  Target, 
  BrainCircuit, 
  ArrowUpRight, 
  ShieldCheck,
  Loader2,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface PredictiveAnalyticsProps {
  uploadId: string
}

export default function PredictiveAnalytics({ uploadId }: PredictiveAnalyticsProps) {
  const [predictionData, setPredictionData] = useState<any>(null)
  const [adviceData, setAdviceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [prevRes, adviceRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/predict/${uploadId}`),
          axios.get(`${API_BASE_URL}/api/advice/${uploadId}`)
        ])
        setPredictionData(prevRes.data)
        setAdviceData(adviceRes.data)
      } catch (err) {
        console.error("Failed to fetch advanced analytics", err)
      } finally {
        setLoading(false)
      }
    }

    if (uploadId) fetchData()
  }, [uploadId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <Sparkles className="w-5 h-5 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="text-gray-500 font-bold animate-pulse text-sm uppercase tracking-widest">
            AI is identifying trends & generating advice...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Prediction Card */}
        <Card className="p-8 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100 shadow-xl shadow-indigo-50/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Predictions</h3>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Beta Forecasting</Badge>
            </div>

            {predictionData?.error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic">
                    {predictionData.error}
                </div>
            ) : (
                <>
                <div className="space-y-4">
                    <div className="p-5 bg-white border border-indigo-50 rounded-2xl shadow-sm">
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Identified Trend</p>
                        <h4 className="text-lg font-bold text-gray-900 leading-tight">{predictionData?.trend || "Analyzing trends..."}</h4>
                    </div>

                    <div className="p-5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
                        <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">Prediction Engine Output</p>
                        <p className="text-md font-medium leading-relaxed italic">"{predictionData?.prediction}"</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter">
                            <span className="text-gray-400">Confidence</span>
                            <span className="text-indigo-600">{predictionData?.confidence || 0}%</span>
                        </div>
                        <Progress value={predictionData?.confidence || 0} className="h-2 bg-indigo-100" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Key Drivers</p>
                        <div className="flex flex-wrap gap-1">
                            {predictionData?.drivers?.map((d: string, i: number) => (
                                <Badge key={i} variant="secondary" className="bg-white border-indigo-100 text-[10px] text-gray-600 py-0.5">{d}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
                </>
            )}
          </div>
        </Card>

        {/* Advice Card */}
        <Card className="p-8 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100 shadow-xl shadow-emerald-50/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lightbulb className="w-32 h-32 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Causes & Advice</h3>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Strategic Insights</Badge>
            </div>

            {adviceData?.error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic">
                    {adviceData.error}
                </div>
            ) : (
                <>
                <div className="space-y-4">
                    <div className="p-5 bg-white border border-emerald-50 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                           <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                           <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Primary Finding</p>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 leading-tight">{adviceData?.finding}</h4>
                        <div className="mt-3 pt-3 border-t border-emerald-50">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Root Cause Analysis</p>
                            <p className="text-sm text-gray-600 font-medium italic">"{adviceData?.root_cause}"</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Strategic Advice</p>
                        {adviceData?.advice?.map((a: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-white border border-emerald-50 rounded-xl hover:shadow-md transition-all">
                                <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                </div>
                                <p className="text-sm font-bold text-gray-700 leading-snug">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
                </>
            )}
          </div>
        </Card>

      </div>

      {/* Trust & Methodology footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Assurance</p>
                <p className="text-xs font-bold text-gray-600">Llama-3.3-70b Advanced Cognitive Analysis</p>
            </div>
         </div>
         <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            Advice is based on statistical patterns & heuristics
         </div>
      </div>
    </div>
  )
}
