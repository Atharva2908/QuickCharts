'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  User, 
  Shield, 
  Bell, 
  ChevronLeft,
  Loader2,
  CreditCard,
  Zap,
  CheckCircle2,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'

export default function BillingSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [billing, setBilling] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('quickcharts_token')
    if (token) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
        fetchBillingInfo(token)
      } catch (e) {
        localStorage.removeItem('quickcharts_token')
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }

  const fetchBillingInfo = async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/billing`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBilling(response.data)
    } catch (e) {
      console.error("Failed to fetch billing info")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    )
  }

  const navItems = [
    { label: 'General Profile', icon: <User className="w-4 h-4" />, href: '/dashboard/settings', active: pathname === '/dashboard/settings' },
    { label: 'Security', icon: <Shield className="w-4 h-4" />, href: '/dashboard/settings/security', active: pathname === '/dashboard/settings/security' },
    { label: 'Notifications', icon: <Bell className="w-4 h-4" />, href: '/dashboard/settings/notifications', active: pathname === '/dashboard/settings/notifications' },
    { label: 'Plan & Billing', icon: <CreditCard className="w-4 h-4" />, href: '/dashboard/settings/billing', active: pathname === '/dashboard/settings/billing' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans">
      <header className="border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-50">Quick<span className="text-blue-600 dark:text-blue-400">Charts</span></h1>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Plan & Billing</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 space-y-1">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <Button 
                  variant={item.active ? 'secondary' : 'ghost'} 
                  className={`w-full justify-start gap-3 h-11 transition-all ${
                    item.active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'text-gray-500'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </aside>

          <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Current Plan Card */}
            <Card className="p-8 bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Zap className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="inline-flex px-3 py-1 bg-blue-500 text-xs font-bold rounded-full mb-4">CURRENT PLAN</div>
                        <h2 className="text-4xl font-black mb-2 tracking-tight">{billing?.plan || "Standard Plan"}</h2>
                        <p className="text-slate-400 max-w-md">You're currently on our {billing?.plan || "Standard"} tier, enjoying advanced AI insights and unlimited exports.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-4xl font-extrabold mb-1">${billing?.price || 0} <span className="text-lg text-slate-500 font-medium">/mo</span></div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Next Renewal: {billing?.renewal_date ? new Date(billing.renewal_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
            </Card>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Storage Usage
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-700">{billing?.storage_used || 0} MB <span className="text-gray-400 font-normal">of {billing?.storage_limit || 0} MB used</span></span>
                            <span className="text-blue-600 font-bold">{Math.round((billing?.storage_used / billing?.storage_limit) * 100) || 0}%</span>
                        </div>
                        <Progress value={(billing?.storage_used / billing?.storage_limit) * 100 || 0} className="h-2 bg-slate-100" />
                    </div>
                </Card>
                <Card className="p-6 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                        <Download className="w-4 h-4" /> PDF Exports
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-700">{billing?.export_used || 0} <span className="text-gray-400 font-normal">of {billing?.export_limit || 0} reports this month</span></span>
                            <span className="text-blue-600 font-bold">{Math.round((billing?.export_used / billing?.export_limit) * 100) || 0}%</span>
                        </div>
                        <Progress value={(billing?.export_used / billing?.export_limit) * 100 || 0} className="h-2 bg-slate-100" />
                    </div>
                </Card>
            </div>

            {/* Payment Method */}
            <Card className="p-8 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-50 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Payment Method</h3>
                            <p className="text-sm text-gray-500">Your default card used for monthly billing.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold">Update Card</Button>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-4 rounded-2xl transition-all">
                    <div className="w-12 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-xs">{billing?.card_brand || 'VISA'}</div>
                    <div className="flex-1">
                        <p className="font-bold">{billing?.card_brand || 'Visa'} ending in •••• {billing?.card_last4 || '4242'}</p>
                        <p className="text-xs text-gray-400 font-medium">Expires {billing?.card_expiry || 'N/A'} • Default Payment</p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
            </Card>

            <div className="flex justify-center pt-6">
                <Link href="/pricing">
                    <Button variant="link" className="text-gray-400 hover:text-blue-600 font-bold flex items-center gap-2">
                        View All Plans & Features <ExternalLink className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
