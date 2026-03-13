'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, BarChart3, Lock, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { toast } from 'sonner'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                token,
                new_password: password
            })
            setIsSuccess(true)
            toast.success("Password reset successful!")
            setTimeout(() => router.push('/login'), 3000)
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Reset failed')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                   <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-4">Success!</h1>
                <p className="text-gray-500 font-medium mb-8">
                    Your password has been updated. Redirecting to login...
                </p>
                <Link href="/login" className="text-blue-600 font-bold hover:underline">
                    Click here if you aren't redirected
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-semibold">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock className="h-5 w-5" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock className="h-5 w-5" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'RESET PASSWORD'}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 lg:p-14 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">New Password</h1>
                <p className="text-gray-500 font-medium mb-10">Set a strong password to protect your account.</p>

                <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
