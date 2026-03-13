'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp, Zap, ArrowRight, Github, Twitter, Linkedin, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'

export default function LandingPage() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

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
                    console.error("Auth failed")
                    localStorage.removeItem('quickcharts_token')
                }
            }
        }
        checkAuth()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('quickcharts_token')
        setUser(null)
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans overflow-hidden">

            {/* Dynamic Background Effects (Subtle for white bg) */}
            <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-100 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-100 rounded-full blur-[100px]" />
            </div>

            {/* Modern NavBar */}
            <header className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">Quick<span className="text-blue-600">Charts</span></span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
                        <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
                        <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all font-medium rounded-full px-6">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                                <Link href="/dashboard/settings">
                                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-gray-200">
                                    <div className="hidden sm:flex w-8 h-8 rounded-full bg-blue-100 items-center justify-center text-blue-700 font-semibold text-sm border border-blue-200" title={user.name}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 px-2 sm:px-3"
                                        onClick={handleLogout}
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="hidden sm:inline">Logout</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 hidden sm:flex font-medium">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all font-medium rounded-full px-6">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center px-6 pt-24 pb-20 max-w-6xl mx-auto text-center" id="home">

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold mb-8 shadow-sm"
                >
                    <Zap className="w-4 h-4" />
                    <span>V1.0 is now live — Analyze data in seconds</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.15] text-gray-900"
                >
                    Transform Your Raw Data Into <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                        Beautiful Insights
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    Upload your CSV or Excel files and instantly generate AI-powered insights, correlations, and stunning visual charts without writing a single line of code.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center"
                >
                    <Link href={user ? "/dashboard" : "/login"} className="w-full sm:w-auto">
                        <Button size="lg" className="w-full h-14 px-8 text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/30 font-semibold transition-all hover:scale-105 rounded-full">
                            Start Visualizing Free <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 bg-white transition-all rounded-full shadow-sm">
                        View Live Demo
                    </Button>
                </motion.div>

                {/* Feature Cards Showcase */}
                <motion.div
                    id="features"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full text-left"
                >
                    <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                            <PieChart className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">Instant Visualizations</h3>
                        <p className="text-gray-600 leading-relaxed">Automatically generate the perfect chart for your data type with one click. Explore bar, line, scatter, and pie charts instantly.</p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600">
                            <Zap className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">AI Insights</h3>
                        <p className="text-gray-600 leading-relaxed">Auto-detect anomalies, missing data, and highlight important statistical trends. Get a comprehensive data health score in seconds.</p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 text-purple-600">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">Correlation Analysis</h3>
                        <p className="text-gray-600 leading-relaxed">Discover hidden relationships in your datasets using powerful heatmap correlation logic and detailed summary statistics.</p>
                    </div>
                </motion.div>

            </main>

            {/* Comprehensive Footer */}
            <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">

                        {/* Brand Column */}
                        <div className="col-span-1 md:col-span-1">
                            <Link href="/" className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-gray-900">QuickCharts</span>
                            </Link>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                Making data analysis accessible, beautiful, and completely instant. No code required.
                            </p>
                            <div className="flex items-center gap-4 text-gray-400">
                                <a href="#" className="hover:text-blue-500 transition-colors"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="hover:text-gray-900 transition-colors"><Github className="w-5 h-5" /></a>
                                <a href="#" className="hover:text-blue-700 transition-colors"><Linkedin className="w-5 h-5" /></a>
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-5">Product</h4>
                            <ul className="space-y-4 text-sm text-gray-600">
                                <li><Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Integrations</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-5">Resources</h4>
                            <ul className="space-y-4 text-sm text-gray-600">
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Community</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Guides</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-5">Legal</h4>
                            <ul className="space-y-4 text-sm text-gray-600">
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                    </div>

                    <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
                        <p>© {new Date().getFullYear()} QuickCharts. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <span className="flex items-center gap-1.5"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></span> System Status: All good</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
