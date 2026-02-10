'use client'

import { ReactNode } from 'react'
import { BarChart3, Settings, FileText, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppLayoutProps {
  children: ReactNode
  headerTitle?: string
  showUploadButton?: boolean
  onReset?: () => void
  activeSection?: 'home' | 'upload' | 'analysis' | 'settings'
}

export default function AppLayout({
  children,
  headerTitle = 'QuickCharts',
  showUploadButton = false,
  onReset,
  activeSection = 'home',
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'hsl(10, 20%, 8%)', color: 'hsl(0, 0%, 95%)' }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-50 backdrop-blur-sm"
        style={{ borderColor: 'hsl(10, 20%, 20%)', backgroundColor: 'hsla(10, 20%, 8%, 0.95)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(200, 100%, 50%)', backgroundColor: 'rgba(0, 136, 254, 0.1)' }}>
                <BarChart3 className="w-6 h-6" style={{ color: 'hsl(200, 100%, 50%)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{headerTitle}</h1>
                <p className="text-sm opacity-70">Smart Data Analysis Platform</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {showUploadButton && onReset && (
                <Button
                  onClick={onReset}
                  className="border-border/40 hover:bg-card/50 bg-transparent text-foreground"
                  style={{ borderColor: 'hsl(10, 20%, 25%)', backgroundColor: 'transparent' }}
                >
                  Upload New File
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs (for analysis page) */}
      {activeSection === 'analysis' && (
        <nav
          className="border-b"
          style={{ borderColor: 'hsl(10, 20%, 20%)', backgroundColor: 'hsl(10, 20%, 10%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: Home },
                { id: 'preview', label: 'Preview', icon: FileText },
                { id: 'charts', label: 'Charts', icon: BarChart3 },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2"
                  style={{
                    borderColor: id === activeSection ? 'hsl(200, 100%, 50%)' : 'transparent',
                    color: id === activeSection ? 'hsl(0, 0%, 95%)' : 'hsl(0, 0%, 70%)',
                  }}
                  onMouseEnter={(e) => {
                    if (id !== activeSection) (e.currentTarget as HTMLElement).style.color = 'hsl(0, 0%, 95%)'
                  }}
                  onMouseLeave={(e) => {
                    if (id !== activeSection) (e.currentTarget as HTMLElement).style.color = 'hsl(0, 0%, 70%)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</main>

      {/* Footer */}
      <footer
        className="border-t mt-16"
        style={{ borderColor: 'hsl(10, 20%, 20%)', backgroundColor: 'hsl(10, 20%, 10%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm opacity-70">
            <p>QuickCharts • Smart Data Visualization for Everyone</p>
            <p className="mt-2">Powered by advanced analytics and interactive visualizations</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
