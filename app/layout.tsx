import React from "react"
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'

import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DataGraphy - AI-Powered Data Visualization Platform',
  description: 'Upload any CSV or Excel file and instantly generate AI-powered charts, correlations, and insights — no code required.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from '@/components/theme-provider'

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body className="font-outfit antialiased bg-gray-50 text-gray-900 border-gray-200" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
        <GoogleOAuthProvider clientId="639901685795-m9fanibglpjnaeebfjj4q0camicn32va.apps.googleusercontent.com">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
