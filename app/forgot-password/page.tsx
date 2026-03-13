'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, BarChart3, Mail, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email })
            setIsSent(true)
            toast.success("Reset link sent!")
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to send reset link')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
            <Link href="/login" className="absolute top-10 left-10 flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back to Login
            </Link>

            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 lg:p-14 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>

                {!isSent ? (
                    <>
                        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Forgot Password?</h1>
                        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                            No worries, it happens! Enter your email and we'll send you instructions to reset your password.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-semibold">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'SEND RESET LINK'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Check Your Inbox</h1>
                        <p className="text-gray-500 font-medium leading-relaxed mb-10">
                            We've sent a password reset link to <span className="text-gray-900 font-bold">{email}</span>. Click the link in that email to continue.
                        </p>
                        <Link href="/login" className="text-blue-600 font-black hover:underline underline-offset-4 decoration-2">
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>
            
            <p className="mt-10 text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">
                QuickCharts Secure Authentication Protocol
            </p>
        </div>
    )
}
