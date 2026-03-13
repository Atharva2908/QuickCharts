'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, BarChart3, Mail, Lock } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'sonner'

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [otpRequired, setOtpRequired] = useState(false)
    const [otp, setOtp] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
                credential: credentialResponse.credential
            })
            localStorage.setItem('quickcharts_token', response.data.access_token)
            router.push('/dashboard')
        } catch (err: any) {
            setError('Google login failed. Please try again.')
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email: formData.email,
                password: formData.password,
                remember_me: rememberMe
            })

            if (response.data.otp_required) {
                setOtpRequired(true)
                toast.success("OTP sent to your email")
            } else {
                localStorage.setItem('quickcharts_token', response.data.access_token)
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
                email: formData.email,
                otp: otp,
                remember_me: rememberMe
            })

            localStorage.setItem('quickcharts_token', response.data.access_token)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid OTP')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50 font-sans selection:bg-blue-100">
            {/* Left Column: Form */}
            <div className="flex flex-col px-6 py-10 lg:px-20 xl:px-28 justify-between bg-white shadow-2xl z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 mb-8 group">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
                       <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-gray-900 italic">QUICK<span className="text-blue-600">CHARTS</span></span>
                </Link>

                {/* Form Content */}
                <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto py-10">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                            {otpRequired ? "Verify Identity" : "Welcome Back"}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {otpRequired ? "Enter the 6-digit code sent to your email." : "Manage your data operations with ease."}
                        </p>
                    </div>

                    {!otpRequired ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-semibold">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-14 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="hidden" 
                                        />
                                        {rememberMe && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors">Remember Me</span>
                                </label>
                                <Link href="/forgot-password" size="sm" className="text-sm font-bold text-blue-600 hover:text-blue-800 underline decoration-2 decoration-blue-100 underline-offset-4">
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'SIGN IN NOW'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-semibold">
                                    {error}
                                </div>
                            )}
                            
                            <div className="flex justify-between gap-2">
                                {[...Array(6)].map((_, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        maxLength={1}
                                        className="w-12 h-14 text-center text-2xl font-black bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all shadow-inner"
                                        onChange={(e) => {
                                            const val = e.target.value
                                            const newOtp = otp.split('')
                                            newOtp[i] = val
                                            setOtp(newOtp.join(''))
                                            if (val && e.target.nextSibling) {
                                                (e.target.nextSibling as HTMLInputElement).focus()
                                            }
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.length < 6}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'VERIFY CODE'}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setOtpRequired(false)}
                                className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Go Back to Login
                            </button>
                        </form>
                    )}

                    {!otpRequired && (
                        <>
                            <div className="mt-10 flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-100"></div>
                                <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">OR PROVIDER</p>
                                <div className="flex-1 h-px bg-gray-100"></div>
                            </div>

                            <div className="mt-8 flex justify-center w-full [&>div]:w-full transition-all hover:brightness-95">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google sign-in was unsuccessful')}
                                    theme="filled_blue"
                                    shape="pill"
                                    size="large"
                                />
                            </div>
                        </>
                    )}

                    <p className="mt-10 text-center text-gray-400 text-sm font-medium">
                        New to QuickCharts? <Link href="/signup" className="font-black text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-blue-100 decoration-2 transition-all">Create Account</Link>
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                    <p>© 2026 QUICKCHARTS LTD.</p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-blue-500 transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-blue-500 transition-colors">Privacy</Link>
                    </div>
                </div>
            </div>

            {/* Right Column: Hero / Graphic */}
            <div className="hidden md:flex bg-blue-600 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>

                <div className="max-w-md w-full z-10 space-y-8">
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                            Effortlessly manage your data operations.
                        </h2>
                        <p className="text-blue-100 text-lg">
                            Log in to access your QuickCharts dashboard, clean bad data, and extract ML insights instantly.
                        </p>
                    </div>

                    <div className="w-full aspect-[4/3] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 relative">
                        <div className="flex justify-between items-center">
                            <div className="w-32 h-6 bg-white/20 rounded animate-pulse"></div>
                            <div className="w-16 h-6 bg-white/20 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-24 bg-white/10 rounded-xl border border-white/10 flex flex-col justify-between p-4">
                                <div className="w-20 h-4 bg-white/20 rounded"></div>
                                <div className="w-24 h-8 bg-white/30 rounded mt-auto"></div>
                            </div>
                            <div className="h-24 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center justify-center p-4">
                                <BarChart3 className="w-10 h-10 text-white/40 mb-2" />
                                <div className="w-24 h-2 bg-white/20 rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex-1 bg-white/10 rounded-xl border border-white/10 mt-2 flex items-end p-4">
                            <div className="w-full flex justify-between items-end gap-2 h-20">
                                <div className="w-1/6 bg-white/30 h-[40%] rounded-t-sm"></div>
                                <div className="w-1/6 bg-white/40 h-[70%] rounded-t-sm"></div>
                                <div className="w-1/6 bg-white/50 h-[30%] rounded-t-sm"></div>
                                <div className="w-1/6 bg-blue-300 h-[90%] rounded-t-sm"></div>
                                <div className="w-1/6 bg-white/20 h-[50%] rounded-t-sm"></div>
                            </div>
                        </div>

                        <div className="absolute -bottom-6 -right-6 w-3/4 bg-white rounded-xl shadow-2xl p-4 text-gray-800 transform rotate-[-2deg]">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm font-bold">Total Sales</div>
                                <div className="text-xs text-gray-400 font-medium">Monthly ▼</div>
                            </div>
                            <div className="flex justify-center my-6">
                                <div className="w-32 h-16 border-t-8 border-l-8 border-r-8 border-blue-600 rounded-t-full border-b-0 relative flex items-end justify-center">
                                    <span className="absolute -bottom-2 font-bold text-xl">10.2M</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
