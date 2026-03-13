'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  BarChart3, 
  User, 
  Shield, 
  Bell, 
  ChevronLeft,
  Loader2,
  Mail,
  Smartphone,
  MessageCircle,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'

export default function NotificationsSettingsPage() {
  const [user, setUser] = useState<any>(null)
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
      } catch (e) {
        localStorage.removeItem('quickcharts_token')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    } else {
      router.push('/login')
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

  const notificationSections = [
    {
      title: "Direct Activity",
      desc: "Instant notifications about your direct actions and files.",
      items: [
        { id: "upload", label: "File Processing Ready", icon: <BarChart3 className="w-4 h-4" />, default: true },
        { id: "export", label: "Report Generation Complete", icon: <CreditCard className="w-4 h-4" />, default: true },
        { id: "security", label: "Security & Login Alerts", icon: <Shield className="w-4 h-4" />, default: true }
      ]
    },
    {
      title: "Marketing & Updates",
      desc: "Receive news about product updates and special features.",
      items: [
        { id: "news", label: "New Product Features", icon: <Smartphone className="w-4 h-4" />, default: false },
        { id: "newsletter", label: "Weekly Data Analytics Newsletter", icon: <Mail className="w-4 h-4" />, default: true }
      ]
    }
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
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Notifications</p>
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
            {notificationSections.map((section) => (
              <Card key={section.title} className="p-6 md:p-8 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.desc}</p>
                </div>
                <div className="space-y-6">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
                          {item.icon}
                        </div>
                        <div>
                          <Label htmlFor={item.id} className="text-sm font-bold block mb-1">{item.label}</Label>
                          <p className="text-xs text-gray-400">Manage how you receive updates for this category.</p>
                        </div>
                      </div>
                      <Switch 
                        id={item.id} 
                        checked={user?.notifications?.[item.id] ?? item.default} 
                        className="data-[state=checked]:bg-blue-600" 
                        onCheckedChange={async (checked) => {
                          const token = localStorage.getItem('quickcharts_token')
                          try {
                            const newPrefs = { ...(user?.notifications || {}), [item.id]: checked }
                            await axios.put(`${API_BASE_URL}/api/auth/notifications`, {
                              preferences: newPrefs
                            }, {
                              headers: { Authorization: `Bearer ${token}` }
                            })
                            toast.success(`Preference updated for ${item.label}`)
                            checkAuth()
                          } catch (err) {
                            toast.error("Failed to update preference")
                          }
                        }} 
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
