'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  BarChart3, 
  User, 
  Mail, 
  Settings, 
  Shield, 
  Bell, 
  Save, 
  ChevronLeft,
  Loader2,
  Camera,
  Briefcase,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'

export default function GeneralSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    designation: '',
    phone: '',
    address: '',
    email: ''
  })
  const [isSaving, setIsSaving] = useState(false)
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
        setFormData({
          firstName: response.data.first_name || '',
          lastName: response.data.last_name || '',
          designation: response.data.designation || 'Data Analyst',
          phone: response.data.phone || '+1 (555) 000-0000',
          address: response.data.address || 'San Francisco, CA',
          email: response.data.email || ''
        })
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    const token = localStorage.getItem('quickcharts_token')
    try {
      await axios.put(`${API_BASE_URL}/api/auth/profile`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        designation: formData.designation,
        phone: formData.phone,
        address: formData.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success("Profile updated successfully!")
      // Refresh user data locally
      checkAuth()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update profile")
    } finally {
      setIsSaving(false)
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
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Dashboard Settings</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
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
            <Card className="p-6 md:p-8 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-gray-100 dark:border-slate-800">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight mb-1">{formData.firstName} {formData.lastName}</h2>
                        <p className="text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center md:justify-start gap-2">
                             <Briefcase className="w-4 h-4" /> {formData.designation}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Personalize your public profile and contact information.</p>
                    </div>
                </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-300" />
                      <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="pl-10 h-12 bg-gray-50/50 dark:bg-slate-950/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-300" />
                      <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="pl-10 h-12 bg-gray-50/50 dark:bg-slate-950/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Designation / Role</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-300" />
                      <Input value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="pl-10 h-12 bg-gray-50/50 dark:bg-slate-950/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-300" />
                      <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="pl-10 h-12 bg-gray-50/50 dark:bg-slate-950/50" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Mailing Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-300" />
                      <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="pl-10 h-12 bg-gray-50/50 dark:bg-slate-950/50" placeholder="e.g. 123 Data Ave, Insight City" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 px-10 h-12 rounded-2xl font-bold">
                    {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Profile Details</>}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
