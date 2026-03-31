'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import FileUploadSection from '@/components/file-upload'
import DataDashboard from '@/components/data-dashboard'
import { LogOut, Loader2, Settings, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { ThemeToggle } from '@/components/theme-toggle'

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

  const fetchRecentUploads = async (token?: string) => {
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

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fc] dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-outfit transition-colors duration-300" style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>
      {/* Dashboard Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="DataGraphy"
              width={36}
              height={36}
              className="rounded-xl shadow-sm"
            />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Data<span className="text-blue-600">Graphy</span></h1>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Dashboard</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {uploadedData && (
              <Button onClick={handleReset} variant="outline" className="bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-all hidden sm:flex">
                Upload New File
              </Button>
            )}
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-gray-200 dark:border-slate-800">
              {user ? (
                <>
                  <div className="hidden sm:flex w-8 h-8 rounded-full bg-blue-100 items-center justify-center text-blue-700 font-semibold text-sm border border-blue-200" title={user.name}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <Link href="/dashboard/settings">
                    <Button variant="ghost" size="sm" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 px-2 sm:px-3"
                    onClick={() => {
                      localStorage.removeItem('datagraphy_token');
                      setUser(null);
                      router.push('/');
                    }}
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-4">
                    Log In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex-1 min-w-0">
          {isLoadingFile ? (
            <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-slate-500 font-medium">Restoring your workspace…</p>
            </div>
          ) : !uploadedData ? (
            <div className="w-full max-w-2xl mx-auto">
              <FileUploadSection
                onDataUpload={handleDataUpload}
                recentUploads={recentUploads}
                isLoadingHistory={isLoadingHistory}
                onLoadFile={loadPreviousFile}
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
      <footer className="border-t border-gray-200 dark:border-slate-800 mt-auto bg-white dark:bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BarChart3 className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">DataGraphy Dashboard</span>
          </div>
          <div className="text-center md:text-right text-sm text-gray-500 flex justify-center gap-4">
            <p className="flex items-center justify-center md:justify-end gap-2">
              Persistence Storage: <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
