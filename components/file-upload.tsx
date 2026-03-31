'use client'

import React, { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  Upload, FileUp, AlertCircle, Loader2, CheckCircle2,
  Clock, FileSpreadsheet, ChevronRight, CloudUpload,
  Database, Sparkles, X, TrendingUp, BarChart2, Shield,
  Zap, ArrowUpRight, Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'

interface FileUploadProps {
  onDataUpload: (data: any, fileName: string) => void
  recentUploads?: any[]
  isLoadingHistory?: boolean
  onLoadFile?: (id: string, name: string) => void
}

/* ───────────────── helpers ───────────────── */
function formatBytes(b: number) {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(2)} MB`
}
function formatDate(s?: string) {
  if (!s) return '—'
  try {
    const d = new Date(s), now = new Date(), ms = now.getTime() - d.getTime()
    const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), day = Math.floor(ms / 86400000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    if (h < 24) return `${h}h ago`
    if (day === 1) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return '—' }
}
function extMeta(filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'csv') return { label: 'CSV', cls: 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20', dot: 'bg-emerald-500', icon: 'text-emerald-500' }
  if (ext === 'xlsx') return { label: 'XLSX', cls: 'bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20', dot: 'bg-blue-500', icon: 'text-blue-500' }
  return { label: 'XLS', cls: 'bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20', dot: 'bg-violet-500', icon: 'text-violet-500' }
}

/* ─── Animated upload rings ─── */
function PulseRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-blue-400/20"
          animate={{ scale: [1, 2.2 + i * 0.4], opacity: [0.5, 0] }}
          transition={{ duration: 2.5, delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }}
          style={{ width: 80, height: 80 }}
        />
      ))}
    </div>
  )
}

/* ─── Drop Zone ─── */
function DropZone({ isDragging, isLoading, progress, onDragOver, onDragLeave, onDrop, onBrowse, fileInputRef, onFileInput }: any) {
  const pctLabel = progress < 30 ? 'Uploading' : progress < 65 ? 'Parsing' : progress < 90 ? 'Analysing' : 'Almost done'

  return (
    <div
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      onClick={() => !isLoading && onBrowse()}
      className={`relative flex flex-col items-center justify-center gap-6 rounded-2xl
                overflow-hidden min-h-[340px] px-10 py-14 text-center cursor-pointer
                transition-all duration-300 select-none group
                ${isLoading
          ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 cursor-default'
          : isDragging
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-2xl shadow-blue-100'
            : 'bg-gradient-to-br from-slate-50 to-blue-50/40 border-2 border-dashed border-slate-200 hover:border-blue-300 hover:from-blue-50/60 hover:to-indigo-50/40 hover:shadow-xl hover:shadow-blue-100/60'
        }`}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="upload-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" className="text-slate-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#upload-grid)" />
        </svg>
      </div>

      {/* Corner accents */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-blue-300/60 rounded-tl-lg" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-blue-300/60 rounded-tr-lg" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-blue-300/60 rounded-bl-lg" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-blue-300/60 rounded-br-lg" />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center gap-5 w-full max-w-[280px]">
            {/* Ring progress */}
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="5" fill="none" className="text-indigo-100" />
                <motion.circle cx="40" cy="40" r="34" stroke="url(#grad)" strokeWidth="5" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 34 * (1 - progress / 100)}` }}
                  transition={{ duration: 0.4 }}
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-700">{progress}%</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">{pctLabel}…</p>
              <p className="text-xs text-slate-400 mt-0.5">Hang tight — don't close this tab</p>
            </div>

            {/* Step track */}
            <div className="w-full flex items-center gap-0">
              {[{ l: 'Upload', t: 30 }, { l: 'Parse', t: 65 }, { l: 'Analyse', t: 90 }, { l: 'Done', t: 100 }].map(({ l, t }, i, arr) => {
                const done = progress >= t
                const active = !done && progress >= (arr[i - 1]?.t ?? 0)
                return (
                  <React.Fragment key={l}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${done ? 'bg-indigo-600 border-indigo-600 text-white' : active ? 'border-indigo-400 bg-white text-indigo-500' : 'border-slate-200 bg-white text-slate-300'}`}>
                        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : active ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>{i + 1}</span>}
                      </div>
                      <span className={`text-[10px] font-semibold whitespace-nowrap ${done ? 'text-indigo-600' : active ? 'text-slate-700' : 'text-slate-300'}`}>{l}</span>
                    </div>
                    {i < arr.length - 1 && <div className={`flex-1 h-0.5 mb-4 mx-1 rounded-full transition-all ${done ? 'bg-indigo-400' : 'bg-slate-200'}`} />}
                  </React.Fragment>
                )
              })}
            </div>
          </motion.div>

        ) : isDragging ? (
          <motion.div key="drag" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center gap-3">
            <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <FileUp className="w-8 h-8 text-white" />
            </motion.div>
            <p className="text-lg font-extrabold text-blue-700 tracking-tight">Release to upload</p>
            <p className="text-sm text-blue-500">We'll take it from here</p>
          </motion.div>

        ) : (
          <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center gap-6">
            {/* Icon with pulse rings */}
            <div className="relative">
              <PulseRings />
              <motion.div
                whileHover={{ scale: 1.07 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/30"
              >
                <CloudUpload className="w-9 h-9 text-white" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-800">
                Drop your file here,{' '}
                <span className="text-blue-600 group-hover:underline underline-offset-2">or browse</span>
              </p>
              <p className="text-sm text-slate-400">CSV · XLSX · XLS &nbsp;·&nbsp; Up to 100 MB per file</p>
            </div>

            <Button
              size="default"
              onClick={(e) => { e.stopPropagation(); onBrowse() }}
              className="h-11 px-8 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Select File
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileInput} className="sr-only" disabled={isLoading} />
    </div>
  )
}

/* ─── History Row ─── */
function HistoryRow({ file, onLoad, isLoadingId, index }: { file: any; onLoad: (id: string, name: string) => void; isLoadingId: string | null; index: number }) {
  const meta = extMeta(file.filename)
  const isActive = isLoadingId === file._id

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      onClick={() => !isLoadingId && onLoad(file._id, file.filename)}
      className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
                ${isActive
          ? 'border-blue-200 bg-blue-50 shadow-sm'
          : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/30 hover:shadow-md'
        }`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all ${isActive ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-300'}`} />

      {/* File icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${isActive ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'}`}>
        <FileSpreadsheet className={`w-6 h-6 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-bold text-slate-800 truncate">{file.filename}</p>
          <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${meta.cls}`}>{meta.label}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {file.file_size && <span>{formatBytes(file.file_size)}</span>}
          {file.row_count && (
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {file.row_count.toLocaleString()} rows
            </span>
          )}
          {file.column_count && <span>{file.column_count} cols</span>}
        </div>
      </div>

      {/* Time */}
      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-slate-400 tabular-nums">{formatDate(file.created_at || file.uploaded_at)}</p>
      </div>

      {/* Action */}
      <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-transparent group-hover:bg-blue-100">
        {isActive
          ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          : <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
        }
      </div>
    </motion.div>
  )
}

/* ──────────────────── Main ──────────────────── */
export default function FileUploadSection({
  onDataUpload,
  recentUploads = [],
  isLoadingHistory = false,
  onLoadFile,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File) => {
    if (!['.csv', '.xlsx', '.xls'].some(e => file.name.toLowerCase().endsWith(e))) {
      setError('Unsupported type. Upload a CSV, XLSX, or XLS file.'); return false
    }
    if (file.size > 100 * 1048576) { setError('File exceeds 100 MB.'); return false }
    return true
  }, [])

  const processFile = async (file: File) => {
    if (!validateFile(file)) return
    setIsLoading(true); setError(null); setProgress(0)
    try {
      const fd = new FormData(); fd.append('file', file)
      const token = localStorage.getItem('datagraphy_token')
      const res = await axios.post(`${API_BASE_URL}/api/upload`, fd, {
        timeout: 120000,
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (e) => { if (e.total) setProgress(Math.round(e.loaded * 100 / e.total)) },
      })
      onDataUpload(res.data, file.name)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Upload failed. Please try again.')
    } finally { setIsLoading(false); setProgress(0) }
  }

  const handleLoadFile = async (id: string, name: string) => {
    if (!onLoadFile) return
    setLoadingId(id)
    try { await onLoadFile(id, name) } finally { setLoadingId(null) }
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    const f = e.dataTransfer.files[0]; if (f) processFile(f)
  }
  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) { processFile(f); e.target.value = '' }
  }

  return (
    <div className="w-full space-y-5 font-outfit" style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}>

      {/* ── Page Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-2"
      >
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Workspace</h2>
          <p className="text-sm text-slate-400 mt-0.5">Upload a dataset or reload a previous session to get started</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <Image src="/logo.png" alt="DataGraphy" width={24} height={24} className="rounded-lg" />
          <span className="text-sm font-bold text-slate-700">Data<span className="text-blue-600">Graphy</span></span>
        </div>
      </motion.div>

      {/* ═══ Upload Card ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/60 overflow-hidden"
      >
        {/* Gradient top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/25">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Upload Dataset</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">CSV · XLSX · XLS &nbsp;·&nbsp; Max 100 MB</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-green-500"
            />
            <span className="text-[11px] font-bold text-green-700">Ready</span>
          </div>
        </div>

        {/* Drop zone */}
        <div className="px-5 pb-4">
          <DropZone
            isDragging={isDragging} isLoading={isLoading} progress={progress}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onBrowse={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef} onFileInput={onFileInput}
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mx-5 mb-4">
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium flex-1 leading-snug">{error}</p>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/60">
          {[
            { icon: Zap, label: 'Any Format', sub: 'CSV · XLSX · XLS', color: 'text-amber-500' },
            { icon: Sparkles, label: 'AI Insights', sub: 'Auto-generated', color: 'text-violet-500' },
            { icon: Lock, label: 'Secure', sub: 'Session-only data', color: 'text-emerald-500' },
          ].map(({ icon: Icon, label, sub, color }) => (
            <div key={label} className="flex items-center gap-2.5 px-4 py-3">
              <div className={`w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700">{label}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ History Card ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/60 overflow-hidden"
      >
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-200 via-indigo-300 to-slate-200" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Recent Uploads</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Click any file to restore it instantly</p>
            </div>
          </div>
          {recentUploads.length > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold">
              {recentUploads.length}
            </span>
          )}
        </div>

        {/* List */}
        <div className="px-3 pb-3">
          {isLoadingHistory ? (
            <div className="space-y-2.5 p-2">
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="h-[58px] rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : recentUploads.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-500">No uploads yet</p>
                <p className="text-xs text-slate-400 mt-1">Your analyzed files will appear here</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-1.5">
              {recentUploads.map((file, i) => (
                <HistoryRow key={file._id} file={file} onLoad={handleLoadFile} isLoadingId={loadingId} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {recentUploads.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            <p className="text-[11px] text-slate-400">
              {recentUploads.length} file{recentUploads.length !== 1 ? 's' : ''} in history
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Shield className="w-3 h-3 text-emerald-400" />
              Stored securely
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
