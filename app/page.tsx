'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import {
    PieChart, TrendingUp, Zap, ArrowRight, Github, Twitter, Linkedin,
    LogOut, Upload, Brain, Download, Shield, CheckCircle2, Star,
    ChevronRight, Database, Sparkles, LayoutDashboard, FlaskConical, Users, Play,
    SparkleIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { ThemeToggle } from '@/components/theme-toggle'

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true })
    const motionValue = useMotionValue(0)
    const spring = useSpring(motionValue, { duration: 2200, bounce: 0 })
    const [display, setDisplay] = useState(0)

    useEffect(() => { if (isInView) motionValue.set(target) }, [isInView, motionValue, target])
    useEffect(() => spring.on('change', (v) => setDisplay(Math.round(v))), [spring])

    return <span ref={ref}>{prefix}{display.toLocaleString('en-US')}{suffix}</span>
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, iconBg, delay }: {
    icon: React.ReactNode; title: string; description: string; iconBg: string; delay: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5 }}
            className="group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-300"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${iconBg} shadow-sm dark:bg-opacity-10`}>
                {icon}
            </div>
            <h3 className="text-base font-bold mb-2.5 text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
        </motion.div>
    )
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ name, role, company, text, rating, delay }: {
    name: string; role: string; company: string; text: string; rating: number; delay: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
        >
            <div className="flex gap-0.5 mb-5">
                {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
            </div>
            <p className="text-gray-700 dark:text-slate-300 text-[15px] leading-relaxed mb-6 flex-1">"{text}"</p>
            <div className="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {name.charAt(0)}
                </div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
                    <p className="text-gray-400 dark:text-slate-500 text-xs">{role} · {company}</p>
                </div>
            </div>
        </motion.div>
    )
}

// ─── Floating Chart Preview ───────────────────────────────────────────────────
function FloatingChartPreview() {
    const bars = [55, 80, 42, 95, 68, 52, 85, 72]
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            className="relative w-full max-w-2xl mx-auto mt-14"
        >
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-300/25 via-indigo-300/20 to-purple-300/25 blur-3xl rounded-3xl" />

            <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-black/8 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <span className="text-xs text-gray-400 font-medium ml-1">sales_data_2024.csv — DataGraphy</span>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </span>
                </div>

                <div className="p-6">
                    {/* Chart header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Monthly Revenue</h4>
                            <p className="text-gray-400 text-xs mt-0.5">8 months · auto-detected</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-200">
                            <TrendingUp className="w-3 h-3" />
                            +24.6%
                        </div>
                    </div>

                    {/* Bar chart */}
                    <div className="flex items-end gap-2.5 h-28 mb-3">
                        {bars.map((h, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 rounded-t-md relative group cursor-pointer"
                                style={{ background: `linear-gradient(to top, #2563eb, #7c3aed)`, opacity: 0.75 + (i / bars.length) * 0.25 }}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 0.85, delay: 0.65 + i * 0.07, ease: 'easeOut' }}
                                whileHover={{ opacity: 1, scaleX: 1.08 }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    ${(h * 1200).toLocaleString('en-US')}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Axis labels */}
                    <div className="flex gap-2.5 text-[11px] text-gray-400 font-medium mb-5">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m) => (
                            <div key={m} className="flex-1 text-center">{m}</div>
                        ))}
                    </div>

                    {/* AI Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2, duration: 0.5 }}
                        className="flex items-start gap-3 p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/80 rounded-xl"
                    >
                        <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600 shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-900">AI Insight</p>
                            <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">April spike correlates with Q2 marketing campaign — 94% confidence.</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Floating stat — left */}
            <motion.div
                initial={{ opacity: 0, x: -18, y: 6 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute -left-10 top-[30%] bg-white border border-gray-200/80 rounded-2xl shadow-xl p-3.5 hidden lg:flex items-center gap-2.5"
            >
                <div className="p-2 bg-green-50 rounded-xl text-green-600"><CheckCircle2 className="w-4 h-4" /></div>
                <div>
                    <p className="text-xs font-extrabold text-gray-900">98.7%</p>
                    <p className="text-[11px] text-gray-400">Data Quality</p>
                </div>
            </motion.div>

            {/* Floating stat — right */}
            <motion.div
                initial={{ opacity: 0, x: 18, y: 6 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.7, duration: 0.5 }}
                className="absolute -right-10 bottom-[28%] bg-white border border-gray-200/80 rounded-2xl shadow-xl p-3.5 hidden lg:flex items-center gap-2.5"
            >
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Database className="w-4 h-4" /></div>
                <div>
                    <p className="text-xs font-extrabold text-gray-900">12 cols</p>
                    <p className="text-[11px] text-gray-400">Detected</p>
                </div>
            </motion.div>
        </motion.div>
    )
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
    return (
        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border mb-6 ${color}`}>
            {children}
        </span>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const [user, setUser] = useState<any>(null)
    const [scrolled, setScrolled] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('datagraphy_token')
            if (token) {
                try {
                    const res = await axios.get(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
                    setUser(res.data)
                } catch { localStorage.removeItem('datagraphy_token') }
            }
        }
        checkAuth()
        const onScroll = () => setScrolled(window.scrollY > 24)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleLogout = () => { localStorage.removeItem('datagraphy_token'); setUser(null) }

    // ── Data ──────────────────────────────────────────────────────────────────
    const features = [
        { icon: <PieChart className="w-5 h-5 text-blue-600" />, title: 'Instant Visualizations', description: 'Auto-generate the perfect chart for your data with one click — bar, line, scatter, pie, and heatmaps.', iconBg: 'bg-blue-50', delay: 0 },
        { icon: <Brain className="w-5 h-5 text-violet-600" />, title: 'AI-Powered Insights', description: 'Detect anomalies, missing values, and statistical trends automatically. Get a full health score per dataset.', iconBg: 'bg-violet-50', delay: 0.08 },
        { icon: <TrendingUp className="w-5 h-5 text-purple-600" />, title: 'Correlation Analysis', description: 'Uncover hidden relationships across your dataset with beautiful heatmap correlation matrices.', iconBg: 'bg-purple-50', delay: 0.16 },
        { icon: <Upload className="w-5 h-5 text-teal-600" />, title: 'Any Format Upload', description: 'Drag-and-drop CSV, XLSX, JSON — we parse it instantly and detect column types automatically.', iconBg: 'bg-teal-50', delay: 0.24 },
        { icon: <Download className="w-5 h-5 text-orange-600" />, title: 'Export Anywhere', description: 'Download your charts as high-res PNG, PDF reports, or raw SVGs for complete creative freedom.', iconBg: 'bg-orange-50', delay: 0.32 },
        { icon: <Shield className="w-5 h-5 text-green-600" />, title: 'Secure & Private', description: 'Your data never leaves your session. All analysis runs in secure isolated environments, zero retention.', iconBg: 'bg-green-50', delay: 0.4 },
    ]

    const steps = [
        { icon: <Upload className="w-7 h-7 text-blue-600" />, title: 'Upload Your Data', description: 'Drop in any CSV or Excel file. DataGraphy instantly parses it, detects column types, and shows a live preview.', color: 'text-blue-600', ring: 'ring-blue-100' },
        { icon: <LayoutDashboard className="w-7 h-7 text-indigo-600" />, title: 'Explore & Visualize', description: 'Choose from dozens of chart types or let AI pick the best fit. Customize colours, labels, and axes in real-time.', color: 'text-indigo-600', ring: 'ring-indigo-100' },
        { icon: <Download className="w-7 h-7 text-violet-600" />, title: 'Export & Share', description: 'Download polished charts as PNG or PDF, or copy a shareable link to present your insights in seconds.', color: 'text-violet-600', ring: 'ring-violet-100' },
    ]

    const testimonials = [
        { name: 'Sarah K.', role: 'Product Manager', company: 'Stripe', text: 'DataGraphy turned a 2-hour Tableau session into a 5-minute flow. The AI caught trends I had completely missed — absolutely game-changing.', rating: 5, delay: 0 },
        { name: 'Marcus T.', role: 'Data Analyst', company: 'Notion', text: 'I use it daily for client presentations. The correlation heatmaps alone are worth the subscription — stunning visuals and genuinely actionable.', rating: 5, delay: 0.1 },
        { name: 'Priya N.', role: 'Startup Founder', company: 'YC W24', text: "We don't have a data team, so DataGraphy is our data team. It's ridiculously easy and the charts look like they were made by a designer.", rating: 5, delay: 0.2 },
    ]

    const stats = [
        { value: 12400, suffix: '+', label: 'Datasets Analyzed' },
        { value: 3200, suffix: '+', label: 'Active Users' },
        { value: 98, suffix: '%', label: 'Satisfaction Rate' },
        { value: 10, suffix: 's', label: 'Avg. Time to Insight' },
    ]

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex flex-col overflow-x-hidden transition-colors duration-300">

            {/* ── Ambient background ── */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-[140px]" />
                <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-[130px]" />
                <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-indigo-100/35 dark:bg-indigo-900/10 rounded-full blur-[110px]" />
            </div>

            {/* ── Navbar ── */}
            <header className={`relative z-50 sticky top-0 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-gray-200/70 dark:border-slate-800 shadow-sm' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
                        <Image
                            src="/logo.png"
                            alt="DataGraphy Logo"
                            width={36}
                            height={36}
                            className="rounded-xl shadow-sm"
                        />
                        <span className="text-lg font-extrabold tracking-tight text-gray-950 dark:text-white">Data<span className="text-blue-600 dark:text-blue-400">Graphy</span></span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {[['Home', '/'], ['Features', '#features'], ['How it Works', '#how-it-works'], ['Pricing', '/pricing']].map(([label, href]) => (
                            <Link key={label} href={href} className="hover:text-gray-950 dark:hover:text-white transition-colors">{label}</Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center gap-2.5">
                                <Link href="/dashboard">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 h-9 text-sm shadow-sm">
                                        Dashboard
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-800">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-2 h-8" onClick={handleLogout} title="Sign Out">
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="hidden sm:flex text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white font-medium text-sm h-9 px-4">Sign In</Button>
                                </Link>
                                <Link href="/login">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 h-9 text-sm shadow-sm transition-all shadow-blue-500/10 active:scale-95">
                                        Get Started Free
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative z-10 w-full flex-1 flex flex-col">

                {/* ── Hero ── */}
                <section className="max-w-5xl mx-auto w-full px-6 pt-20 pb-10 flex flex-col items-center text-center">

                    {/* Pill badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-8 shadow-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        AI-powered data analysis
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.1 }}
                        className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-gray-950 mb-6"
                    >
                        Turn Raw Data Into
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600">
                            Beautiful Insights
                        </span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed font-normal"
                    >
                        Upload any CSV or Excel file and get AI-powered charts, correlation maps, and statistical insights in under 10 seconds — <strong className="text-gray-700 font-semibold">no code, no configuration.</strong>
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-3 mb-7 w-full sm:w-auto"
                    >
                        <Link href={user ? '/dashboard' : '/login'} className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto h-[52px] px-8 text-[15px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-xl transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                            >
                                Start Visualizing Free
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full sm:w-auto h-[52px] px-7 text-[15px] font-semibold border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all shadow-sm flex items-center gap-2.5"
                        >
                            <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                            </span>
                            Watch Demo
                        </Button>
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-400"
                    >
                        {['No credit card required', 'Free forever plan', 'GDPR compliant'].map((item) => (
                            <span key={item} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                {item}
                            </span>
                        ))}
                    </motion.div>

                    {/* Chart preview */}
                    <FloatingChartPreview />
                </section>

                {/* ── Stats Bar ── */}
                <section className="border-y border-gray-100 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 py-14">
                    <div className="max-w-4xl mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-8"
                        >
                            {stats.map((s, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
                                        <AnimatedCounter target={s.value} suffix={s.suffix} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ── Features ── */}
                <section id="features" className="max-w-6xl mx-auto px-6 py-24 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <SectionLabel color="bg-indigo-50 text-indigo-700 border-indigo-200">
                            <Zap className="w-3.5 h-3.5" /> Everything you need
                        </SectionLabel>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight mb-4">
                            Powerful features,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">zero complexity</span>
                        </h2>
                        <p className="text-gray-500 text-lg max-w-lg mx-auto">All the tools a data team needs, wrapped in an interface anyone can use in minutes.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f) => <FeatureCard key={f.title} {...f} />)}
                    </div>
                </section>

                {/* ── How It Works ── */}
                <section id="how-it-works" className="w-full bg-gradient-to-b from-gray-50 to-white py-24">
                    <div className="max-w-5xl mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <SectionLabel color="bg-teal-50 text-teal-700 border-teal-200">
                                <FlaskConical className="w-3.5 h-3.5" /> Simple process
                            </SectionLabel>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight mb-4">
                                From file to insight{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">in 3 steps</span>
                            </h2>
                            <p className="text-gray-500 text-lg max-w-md mx-auto">No tutorials. No setup. Just upload and go.</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            {/* Connecting line */}
                            <div className="hidden md:block absolute top-10 left-[calc(16.66%+40px)] right-[calc(16.66%+40px)] h-px bg-gradient-to-r from-gray-200 via-blue-200 to-gray-200" />
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.15 }}
                                    className="relative flex flex-col items-center text-center px-4"
                                >
                                    <div className={`relative mb-6 w-20 h-20 rounded-2xl bg-white border-2 border-gray-100 shadow-lg flex items-center justify-center ring-4 ${step.ring}`}>
                                        {step.icon}
                                        <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-md shadow-blue-500/30">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-[240px]">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ── */}
                <section className="max-w-6xl mx-auto px-6 py-24 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <SectionLabel color="bg-amber-50 text-amber-700 border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Loved by users
                        </SectionLabel>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight mb-4">
                            Don't take our word for it
                        </h2>
                        <p className="text-gray-500 text-lg">Here's what teams say after switching to DataGraphy.</p>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => <TestimonialCard key={t.name} {...t} />)}
                    </div>
                </section>

                {/* ── CTA Banner ── */}
                <section className="max-w-6xl mx-auto px-6 pb-24 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 md:p-16 text-center"
                        style={{ boxShadow: '0 24px 80px -12px rgba(79, 70, 229, 0.45)' }}
                    >
                        {/* Decorative blobs */}
                        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-violet-900/30 rounded-full blur-2xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 bg-white/5 blur-2xl rounded-full" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-semibold border border-white/25 mb-8 backdrop-blur-sm">
                                <Users className="w-3.5 h-3.5" /> Join 3,200+ data-driven teams
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
                                Your data is waiting.<br />Start in 10 seconds.
                            </h2>
                            <p className="text-blue-100 text-[17px] mb-10 max-w-lg mx-auto leading-relaxed">
                                No setup. No code. No data team required. Just drop your file and watch the insights appear.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                                <Link href={user ? '/dashboard' : '/login'}>
                                    <Button
                                        size="lg"
                                        className="h-[52px] px-8 text-[15px] font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
                                    >
                                        Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link href="/pricing">
                                    <Button
                                        size="lg"
                                        className="h-[52px] px-8 text-[15px] font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl backdrop-blur-sm transition-all"
                                    >
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* ── Footer ── */}
            <footer className="border-t border-gray-100 bg-gray-50/60">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10">

                        {/* Brand column */}
                        <div className="md:col-span-2">
                            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 hover:opacity-90 transition-opacity">
                                <Image
                                    src="/logo.png"
                                    alt="DataGraphy Logo"
                                    width={32}
                                    height={32}
                                    className="rounded-xl shadow-sm"
                                />
                                <span className="text-lg font-extrabold tracking-tight">Data<span className="text-blue-600">Graphy</span></span>
                            </Link>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-[260px]">
                                Making data analysis beautiful, instant, and accessible to every team — no code required.
                            </p>
                            <div className="flex items-center gap-2.5">
                                {[
                                    { Icon: Twitter, cls: 'hover:text-sky-500 hover:border-sky-200' },
                                    { Icon: Github, cls: 'hover:text-gray-900 hover:border-gray-400' },
                                    { Icon: Linkedin, cls: 'hover:text-blue-600 hover:border-blue-300' },
                                ].map(({ Icon, cls }, i) => (
                                    <a key={i} href="#" className={`w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 ${cls} transition-all`}>
                                        <Icon className="w-[15px] h-[15px]" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Link columns */}
                        {[
                            { heading: 'Product', links: [['Features', '#features'], ['Pricing', '/pricing'], ['How it Works', '#how-it-works'], ['Changelog', '#']] },
                            { heading: 'Resources', links: [['Documentation', '#'], ['Blog', '#'], ['Community', '#'], ['Guides', '#']] },
                            { heading: 'Legal', links: [['Privacy Policy', '#'], ['Terms of Service', '#'], ['Cookie Policy', '#'], ['Contact', '#']] },
                        ].map(({ heading, links }) => (
                            <div key={heading}>
                                <h4 className="font-semibold text-gray-900 text-sm mb-4">{heading}</h4>
                                <ul className="space-y-3">
                                    {links.map(([label, href]) => (
                                        <li key={label}>
                                            <Link href={href} className="text-sm text-gray-400 hover:text-blue-600 transition-colors">{label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-400">
                        <p>© {new Date().getFullYear()} DataGraphy. All rights reserved.</p>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            <span>All systems operational</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
