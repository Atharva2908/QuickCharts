'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  BarChart3, 
  User, 
  Shield, 
  Bell, 
  ChevronLeft,
  Loader2,
  Lock,
  Key,
  ShieldCheck,
  Smartphone,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SecuritySettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isToggling2FA, setIsToggling2FA] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('datagraphy_token')
    if (token) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
      } catch (e) {
        localStorage.removeItem('datagraphy_token')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    } else {
      router.push('/login')
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("New passwords do not match")
    }
    
    setIsSaving(true)
    const token = localStorage.getItem('datagraphy_token')
    try {
      await axios.put(`${API_BASE_URL}/api/auth/password`, {
        old_password: passData.oldPassword,
        new_password: passData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success("Password updated successfully!")
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update password")
    } finally {
      setIsSaving(false)
    }
  }
  const handleToggle2FA = async () => {
    setIsToggling2FA(true)
    const token = localStorage.getItem('datagraphy_token')
    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/2fa`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(response.data.message)
      checkAuth() // Refresh user data to get updated 2FA status
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to toggle 2FA")
    } finally {
      setIsToggling2FA(false)
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <header className="border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="DataGraphy Logo"
              width={36}
              height={36}
              className="rounded-xl shadow-sm"
            />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-slate-50 leading-none">Data<span className="text-blue-600 dark:text-blue-400">Graphy</span></h1>
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">Security Panel</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2 px-3">
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
            <Card className="p-6 md:p-8 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
                    <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Change Password</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Update your account password regularly to stay secure.</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-300" />
                    <Input 
                      type="password" 
                      value={passData.oldPassword} 
                      onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                      className="pl-10 h-12 bg-gray-50/50 dark:bg-slate-950/50" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-300" />
                    <Input 
                      type="password" 
                      value={passData.newPassword} 
                      onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                      className="pl-10 h-12 bg-gray-50/50 dark:bg-slate-950/50" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Confirm New Password</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-300" />
                    <Input 
                      type="password" 
                      value={passData.confirmPassword} 
                      onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                      className="pl-10 h-12 bg-gray-50/50 dark:bg-slate-950/50" 
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full h-12 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xl transition-all">
                  {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : "Update Password"}
                </Button>
              </form>
            </Card>

            <Card className="p-8 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Two-Factor Authentication (2FA)</h3>
                            <p className="text-sm text-gray-500">Protect your account with an extra layer of security.</p>
                        </div>
                    </div>
                    <Button 
                      variant={user?.two_factor_enabled ? "destructive" : "outline"}
                      onClick={handleToggle2FA}
                      disabled={isToggling2FA}
                      className="rounded-xl font-semibold border-blue-200"
                    >
                      {isToggling2FA ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {user?.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"}
                    </Button>
                </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
