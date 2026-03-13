'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/lib/constants'
import axios from 'axios'
import { MessageSquare, Send, Bot, User, Loader2, Volume2, VolumeX, Mic } from 'lucide-react'

import { toast } from 'sonner'

interface AIChatProps {
  uploadId: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  chartUrl?: string
}

export default function AIChat({ uploadId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your Data Analyst AI. You can ask me questions or say 'Show me a bar chart of [column]'. I also support voice input!" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const playTTS = async (text: string) => {
    if (!isSpeechEnabled) return
    try {
      // First check if the API is actually responsive for TTS
      const sanitizedText = text.substring(0, 250).replace(/[#`*]/g, '')
      const audioUrl = `${API_BASE_URL}/api/tts?text=${encodeURIComponent(sanitizedText)}`
      
      const audio = new Audio(audioUrl)
      audio.onerror = (e) => {
        console.error("Audio stream failed. Likely API Key issue.", e)
        toast.info("Voice synthesis unavailable. Check your 11Labs API permissions.")
      }
      audio.play()
    } catch (e) {
      console.error("TTS Playback failed", e)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input
    if (!textToSend.trim() || !uploadId) return
    
    setMessages(prev => [...prev, { role: 'user', content: textToSend }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat/${uploadId}`, {
        message: textToSend
      })
      
      let chartUrl = undefined
      if (response.data.chart_config) {
        chartUrl = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(response.data.chart_config))}&w=400&h=300`
      }

      const assistantMsg = response.data.response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMsg,
        chartUrl 
      }])

      // Trigger voice response
      playTTS(assistantMsg)

    } catch (e: any) {
      console.error(e)
      toast.error("AI analysis failed")
    } finally {
      setIsLoading(false)
    }
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser.")
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      handleSend(transcript)
    }
    recognition.start()
  }

  return (
    <Card className="bg-white border-border shadow-2xl flex flex-col h-[650px] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden mt-6 transition-all border">
      <div className="p-5 border-b border-border bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Pro Analyst AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-blue-100 font-medium uppercase tracking-widest">Global Insights Ready</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10" 
            onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
          >
            {isSpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={startVoice}>
            <div className={isListening ? "text-red-400 animate-pulse" : ""}>
              {isListening ? "●" : <Mic className="w-5 h-5" />}
            </div>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-blue-200">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm shadow-md transition-all ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm' 
                : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
            }`}>
              <p className="leading-relaxed">{msg.content}</p>
              
              {msg.chartUrl && (
                <div className="mt-4 p-2 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                   <img 
                    src={msg.chartUrl} 
                    alt="AI Generated Visualization" 
                    className="w-full h-auto rounded-md shadow-sm"
                    onLoad={() => scrollToBottom()}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-blue-200">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-5 py-3 text-sm flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-white">
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="E.g., What is the highest profit?"
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-700 h-10 px-4"
          />
          <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="rounded-full w-10 h-10 p-0 shrink-0 bg-blue-600 hover:bg-blue-700 shadow-lg transition-transform active:scale-90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
