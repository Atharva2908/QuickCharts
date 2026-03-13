'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, BarChart3, Mail, Lock, User, Phone as PhoneIcon } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'sonner'

export default function SignupPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        confirm_password: ''
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                email: formData.email,
                password: formData.password
            })

            localStorage.setItem('quickcharts_token', response.data.access_token)
            toast.success("Account created successfully!")
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed')
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

                <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto py-10">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Create Account</h1>
                        <p className="text-gray-500 font-medium">Join us to start cleaning and automating your data.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        name="first_name"
                                        required
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                                        placeholder="John"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    required
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <PhoneIcon className="h-5 w-5" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
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
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                        minLength={6}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirm_password"
                                        required
                                        minLength={6}
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner outline-none text-gray-900 font-medium"
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
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'CREATE ACCOUNT'}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-100"></div>
                        <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">OR SIGN UP WITH</p>
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

                    <p className="mt-10 text-center text-gray-400 text-sm font-medium">
                        Already have an account? <Link href="/login" className="font-black text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-blue-100 decoration-2 transition-all">Sign In.</Link>
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
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-4 tracking-tighter italic">
                            REVOLUTIONIZING DATA ANALYSIS.
                        </h2>
                        <p className="text-blue-100 text-lg font-medium">
                            Join the global community of data scientists and business analysts using QuickCharts.
                        </p>
                    </div>

                    <div className="w-full aspect-[4/3] bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center relative overflow-hidden">
                        <BarChart3 className="w-40 h-40 text-white/20 animate-pulse" />
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4/5 h-1 bg-white/10 relative overflow-hidden rounded-full">
                                <div className="absolute inset-0 bg-blue-300 w-1/2 animate-[progress_3s_infinite]"></div>
                            </div>
                        </div>

                        <div className="absolute top-10 left-10 p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm transform -rotate-12">
                             <div className="w-12 h-2 bg-blue-300 rounded-full mb-2"></div>
                             <div className="w-8 h-2 bg-white/40 rounded-full"></div>
                        </div>

                        <div className="absolute bottom-10 right-10 p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm transform rotate-6">
                             <div className="text-xs font-bold text-white mb-1">Global Scale</div>
                             <div className="text-[10px] text-blue-200 uppercase tracking-widest">Active nodes: 1,024</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
