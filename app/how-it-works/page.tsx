'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { BarChart3, Upload, Brain, TrendingUp, Sparkles, LayoutDashboard, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'

const steps = [
  {
    icon: <Upload className="w-8 h-8" />,
    title: "1. Upload Your Data",
    description: "Simply drag and drop your CSV or Excel files. We handle any row count and instantly parse the structure.",
    color: "blue"
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "2. AI Analysis",
    description: "Our AI engine scans for data quality, missing values, and high-level trends automatically.",
    color: "purple"
  },
  {
    icon: <LayoutDashboard className="w-8 h-8" />,
    title: "3. Choose Visuals",
    description: "Select from Bar, Line, Area, or Pie charts. We automatically recommend the best chart for your columns.",
    color: "indigo"
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "4. Insight Report",
    description: "Get a full correlation heatmap and AI-generated summaries to help you make data-driven decisions.",
    color: "emerald"
  }
]

export default function HowItWorksPage() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('quickcharts_token')
            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    setUser(response.data)
                } catch (e) {
                    localStorage.removeItem('quickcharts_token')
                }
            }
        }
        checkAuth()
    }, [])

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">Quick<span className="text-blue-600">Charts</span></span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <Link href="/#features" className="hover:text-blue-600 transition-colors">Features</Link>
                        <Link href="/how-it-works" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">How it Works</Link>
                        <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href="/dashboard">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all font-medium rounded-full px-6">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all font-medium rounded-full px-6">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 py-16 md:py-24 px-6 max-w-5xl mx-auto w-full">
                <div className="text-center mb-20 text-balance">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight"
                    >
                        From <span className="text-blue-600">Spreadsheets</span> to <br /> Superpowers in Seconds
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed"
                    >
                        QuickCharts is the bridge between raw, messy data and professional insights. Here's exactly how our platform works.
                    </motion.p>
                </div>

                <div className="space-y-24 relative">
                    {/* Connecting line for desktop */}
                    <div className="hidden md:block absolute left-[50%] top-20 bottom-20 w-px bg-slate-100" />

                    {steps.map((step, idx) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className={`flex flex-col md:flex-row items-center gap-12 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                        >
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div className={`inline-flex p-4 rounded-3xl bg-${step.color}-50 text-${step.color}-600 mb-2 border border-${step.color}-100`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-bold">{step.title}</h3>
                                <p className="text-gray-500 leading-relaxed max-w-md mx-auto md:mx-0">
                                    {step.description}
                                </p>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className={`w-full aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center p-8 overflow-hidden group`}>
                                     {/* Mock visual element */}
                                     {idx === 0 && <Upload className="w-16 h-16 text-slate-300 animate-bounce" />}
                                     {idx === 1 && <Brain className="w-16 h-16 text-slate-300 group-hover:scale-125 transition-transform" />}
                                     {idx === 2 && <BarChart3 className="w-16 h-16 text-slate-300 group-hover:rotate-12 transition-transform" />}
                                     {idx === 3 && <Sparkles className="w-16 h-16 text-slate-300 animate-pulse" />}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 p-12 rounded-[3rem] bg-slate-900 text-white text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 pointer-events-none" />
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to try it yourself?</h2>
                    <p className="text-slate-400 mb-10 text-lg relative z-10 max-w-xl mx-auto">Join over 10,000 data analysts who have ditched manual graphing for QuickCharts.</p>
                    <Link href="/signup" className="relative z-10">
                        <Button size="lg" className="h-16 px-10 text-xl bg-blue-600 hover:bg-blue-700 rounded-full font-bold shadow-2xl shadow-blue-500/40 border-none transition-transform hover:scale-105">
                            Get Started Now <ArrowRight className="ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-gray-50 mt-12">
                <div className="max-w-7xl mx-auto px-6 py-12 text-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} QuickCharts. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
