import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Loader2 } from 'lucide-react'
import { replyFor, PROMPT_SUGGESTIONS } from '@/lib/aerobot-replies'

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  time: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-init',
    sender: 'bot',
    text: 'Halo! Saya AERO-BOT. Saya bisa membantu menjelaskan kondisi udara dengan bahasa yang mudah. Mau mulai dari mana?',
    time: 'Contoh',
  },
]

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = (textToSend?: string) => {
    const raw = textToSend ?? input
    const clean = raw.trim()
    if (!clean || isTyping) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: clean,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setShowSuggestions(false)
    setIsTyping(true)

    // Simulate 450ms response time
    setTimeout(() => {
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyFor(clean),
        time: 'Contoh',
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 450)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <section
      className="card h-[600px] flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm"
      aria-label="Percakapan AERO-BOT"
    >
      {/* Header */}
      <div className="h-[68px] border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 px-5 shrink-0 bg-white dark:bg-slate-900">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0a72ec] to-[#4ac4ff] grid place-items-center shadow-md shrink-0 overflow-hidden">
          <img
            src="/assets/aerobot.svg"
            alt="AERO-BOT"
            className="w-7 h-7 object-contain"
          />
        </span>
        <div className="flex-1 min-w-0">
          <strong className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
            AERO-BOT
          </strong>
          <small className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Asisten kualitas udara AEROSENSE
          </small>
        </div>
        <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Mode contoh
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/40 flex flex-col gap-4"
        role="log"
        aria-live="polite"
        aria-label="Pesan percakapan"
      >
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot'
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                isBot ? '' : 'self-end flex-row-reverse'
              }`}
            >
              {isBot && (
                <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/60 grid place-items-center shrink-0 overflow-hidden">
                  <img
                    src="/assets/aerobot.svg"
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                </span>
              )}
              <div className="space-y-1">
                <div
                  className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs whitespace-pre-wrap ${
                    isBot
                      ? 'bg-[#edf6ff] dark:bg-slate-800 text-[#365b7c] dark:text-slate-200 rounded-tl-xs'
                      : 'bg-[#0b77ef] text-white rounded-tr-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <small
                  className={`block text-[9px] text-slate-400 ${
                    isBot ? 'text-left' : 'text-right'
                  }`}
                >
                  {msg.time}
                </small>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex items-start gap-2.5 max-w-[85%] animate-fade-in">
            <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/60 grid place-items-center shrink-0 overflow-hidden">
              <img
                src="/assets/aerobot.svg"
                alt=""
                className="w-5 h-5 object-contain"
              />
            </span>
            <div className="bg-[#edf6ff] dark:bg-slate-800 px-4 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[11px] font-medium">AERO-BOT sedang mengetik...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      {showSuggestions && (
        <div className="flex gap-2 px-4 sm:px-5 py-2 overflow-x-auto shrink-0 border-t border-slate-100 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs">
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSend(suggestion)}
              className="shrink-0 border border-sky-200 dark:border-sky-800/60 rounded-full bg-sky-50/70 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-primary-600 dark:text-primary-300 text-[11px] font-bold px-3 py-1.5 transition-colors cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 m-3 sm:mx-5 mb-2 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 pl-3.5 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 dark:focus-within:ring-primary-950/50 bg-white dark:bg-slate-800/80 transition-all"
      >
        <label htmlFor="chatInput" className="sr-only">
          Tulis pertanyaan untuk AERO-BOT
        </label>
        <input
          id="chatInput"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan Anda tentang kualitas udara..."
          maxLength={300}
          autoComplete="off"
          disabled={isTyping}
          className="flex-1 min-w-0 bg-transparent text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          aria-label="Kirim pesan"
          className="w-8 h-8 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white grid place-items-center transition-colors cursor-pointer shrink-0"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </form>

      {/* Footnote Disclaimer */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center px-4 pb-2.5 leading-normal shrink-0">
        Jawaban pada demo ini sudah disiapkan untuk menunjukkan pengalaman chat. Belum terhubung ke Gemini API dan bukan saran medis.
      </p>
    </section>
  )
}
