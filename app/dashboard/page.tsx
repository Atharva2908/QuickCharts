'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import FileUploadSection from '@/components/file-upload'
import DataDashboard from '@/components/data-dashboard'
import { BarChart3, LogOut, FileText, Loader2, Settings } from 'lucide-react'
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
    const token = localStorage.getItem('quickcharts_token')
    if (token) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
        fetchRecentUploads(token)
      } catch (e) {
        console.error("Auth failed")
        localStorage.removeItem('quickcharts_token')
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }

  const fetchRecentUploads = async (token?: string) => {
    try {
      // NOTE: Normally pass token here for secure fetching
      const response = await axios.get(`${API_BASE_URL}/api/uploads`)
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
    try {
      const response = await axios.get(`${API_BASE_URL}/api/uploads/${uploadId}`)
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans">
      {/* Modern Dashboard Header */}
      <header className="border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-50">Quick<span className="text-blue-600 dark:text-blue-400">Charts</span></h1>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Dashboard</p>
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
                      localStorage.removeItem('quickcharts_token');
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex gap-8">

        {/* Sidebar for Persistent History */}
        {!uploadedData && (
          <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 hidden md:block">
            <h3 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">Recent Files</h3>
            {isLoadingHistory ? (
              <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
            ) : recentUploads.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No recent uploads</p>
            ) : (
              <ul className="space-y-2">
                {recentUploads.map((file) => (
                  <li key={file._id}>
                    <button
                      onClick={() => loadPreviousFile(file._id, file.filename)}
                      className="w-full text-left p-2 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors border border-transparent hover:border-blue-100"
                    >
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="truncate text-sm text-gray-700 font-medium whitespace-nowrap overflow-hidden">
                        {file.filename}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {isLoadingFile ? (
            <div className="w-full h-96 flex flex-col items-center justify-center gap-4 animate-pulse">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-gray-500 font-medium">Restoring your workspace...</p>
            </div>
          ) : !uploadedData ? (
            <div className="w-full max-w-3xl mx-auto">
              <FileUploadSection onDataUpload={handleDataUpload} />
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
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">QuickCharts Dashboard</span>
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
