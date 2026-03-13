'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { BarChart3, Check, Zap, LogOut } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for students and small projects.",
    features: [
      "Up to 5MB file uploads",
      "Basic Chart Types (Bar, Line, Pie)",
      "Standard AI Analysis",
      "CSV Exports",
      "Public Share Links"
    ],
    cta: "Get Started",
    popular: false,
    color: "blue"
  },
  {
    name: "Professional",
    price: "$19",
    period: "/month",
    description: "Built for data analysts and business users.",
    features: [
      "Up to 100MB file uploads",
      "Advanced Charts (Scatter, Area, Radar)",
      "Full AI Insight Reports",
      "Multi-page PDF Reports",
      "Excel & JSON Exports",
      "Priority Email Support"
    ],
    cta: "Try Pro Free",
    popular: true,
    color: "indigo"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Secure, scalable data for large teams.",
    features: [
      "Unlimited file storage",
      "Custom ML Prediction Models",
      "SSO & Advanced Security",
      "API Access for automation",
      "Dedicated Account Manager",
      "24/7 Phone Support"
    ],
    cta: "Contact Sales",
    popular: false,
    color: "purple"
  }
]

export default function PricingPage() {
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
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
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
                        <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
                        <Link href="/pricing" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Pricing</Link>
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

            <main className="flex-1 py-12 md:py-24 px-6 max-w-7xl mx-auto w-full">
                <div className="text-center mb-16">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
                    >
                        Simple, <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Transparent</span> Pricing
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        Get all the power of QuickCharts with plans designed to scale with your data needs.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {pricingPlans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            className={`relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border ${plan.popular ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'} flex flex-col hover:scale-[1.02] transition-transform duration-300`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-5xl font-extrabold">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className={`mt-0.5 p-0.5 rounded-full ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/login" className="w-full">
                                <Button 
                                    className={`w-full h-12 rounded-2xl font-bold transition-all ${
                                        plan.popular 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20' 
                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto space-y-12 mb-20">
                    <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
                    <div className="grid gap-8">
                        <div>
                            <h4 className="font-bold text-lg mb-2">Is there really a free version?</h4>
                            <p className="text-slate-600 leading-relaxed text-sm">Yes! You can use QuickCharts for free forever with datasets up to 5MB. You'll get access to all basic charts and our AI insight engine.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-2">Can I cancel my subscription?</h4>
                            <p className="text-slate-600 leading-relaxed text-sm">Of course. You can cancel your Professional plan at any time with one click from your account dashboard. No questions asked.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-2">Do you offer a student discount?</h4>
                            <p className="text-slate-600 leading-relaxed text-sm">Yes, students can get 50% off the Professional plan. Contact our support with your university email to get a coupon code.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 py-12 text-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} QuickCharts. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
