'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import FileUploadSection from '@/components/file-upload'
import DataDashboard from '@/components/data-dashboard'
import { LogOut, Loader2, Settings, BarChart3, Plus, User as UserIcon, LayoutDashboard, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [fileName, setFileName] = useState('')
  const [recentUploads, setRecentUploads] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isLoadingFile, setIsLoadingFile] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

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
        fetchRecentUploads(token)
      } catch (e) {
        console.error("Auth failed")
        localStorage.removeItem('datagraphy_token')
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }

  const fetchRecentUploads = async (tokenParam?: string) => {
    const token = tokenParam || localStorage.getItem('datagraphy_token')
    if (!token) {
      setIsLoadingHistory(false)
      return
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/uploads`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data && response.data.uploads) {
        setRecentUploads(response.data.uploads)
      }
    } catch (e) {
      console.error("Failed to fetch uploads", e)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const loadPreviousFile = async (uploadId: string, name: string) => {
    setIsLoadingFile(true)
    const token = localStorage.getItem('datagraphy_token')
    try {
      const response = await axios.get(`${API_BASE_URL}/api/uploads/${uploadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUploadedData(response.data)
      setFileName(name)
    } catch (e) {
      console.error("Failed to load file", e)
      alert("Failed to load file from server.")
    } finally {
      setIsLoadingFile(false)
    }
  }

  const handleDataUpload = (data: any, name: string) => {
    setUploadedData(data)
    setFileName(name)
    fetchRecentUploads() // Refresh history
  }

  const handleReset = () => {
    setUploadedData(null)
    setFileName('')
  }

  const handleLogout = () => {
    localStorage.removeItem('datagraphy_token');
    setUser(null);
    router.push('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b1121] text-slate-900 dark:text-slate-100 font-outfit transition-colors duration-300 relative overflow-x-hidden" style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent dark:from-blue-950/20 dark:to-transparent pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Dashboard Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-50 bg-white/80 dark:bg-[#0b1121]/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
            <div className="relative overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 group-hover:shadow-md transition-all">
              <Image
                src="/logo.png"
                alt="DataGraphy"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                Data<span className="text-blue-600 dark:text-blue-500">Graphy</span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                Workspace
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {uploadedData && (
              <Button 
                onClick={handleReset} 
                variant="outline" 
                size="sm"
                className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all hidden sm:flex gap-2"
              >
                <Plus className="w-4 h-4" />
                New Analysis
              </Button>
            )}
            
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              <ThemeToggle />
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 flex items-center gap-2 rounded-full pl-2 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-xs shadow-inner">
                        {user.name?.charAt(0).toUpperCase() || <UserIcon className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-medium hidden sm:block truncate max-w-[100px]">
                        {user.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-xl border-slate-200 dark:border-slate-800 font-outfit">
                    <DropdownMenuLabel className="font-normal p-3 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-50">{user.name}</p>
                        <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1.5">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                    <DropdownMenuItem asChild className="cursor-pointer py-2 focus:bg-slate-100 dark:focus:bg-slate-800">
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2 focus:bg-slate-100 dark:focus:bg-slate-800">
                      <Link href="/dashboard/settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400">
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm px-4">
                    Log In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col">
        <div className="flex-1 min-w-0 w-full flex flex-col">
          {isLoadingFile ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 min-h-[50vh] animate-in fade-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse" />
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 relative z-10">
                  <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Restoring Workspace</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Loading your previous configuration...</p>
              </div>
            </div>
          ) : !uploadedData ? (
            <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
              
              <div className="mb-8 md:mb-12 text-center animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4 border border-blue-100 dark:border-blue-800/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Workspace Ready
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                  Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
                  Upload your dataset to start exploring. We automatically clean, analyze, and visualize your data to help you uncover insights.
                </p>
              </div>

              <div className="flex-1 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-both">
                <FileUploadSection
                  onDataUpload={handleDataUpload}
                  recentUploads={recentUploads}
                  isLoadingHistory={isLoadingHistory}
                  onLoadFile={loadPreviousFile}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 animate-in zoom-in-95 fade-in duration-500 flex flex-col">
              <DataDashboard
                data={uploadedData}
                fileName={fileName}
                onDataUpdate={(newData: any) => {
                  setUploadedData(newData);
                  alert("Data Cleaned Successfully!");
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Simplified Dashboard Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 mt-auto bg-white/50 dark:bg-[#0b1121]/50 backdrop-blur-md py-5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <BarChart3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">DataGraphy</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Pro Analytics Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
