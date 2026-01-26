import { useState } from 'react'
import { Zap, Send, ChevronUp } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/helpers'

interface QuickCaptureProps {
  inputRef: React.Ref<HTMLInputElement>
  onCapture: (content: string) => void
  onExpand: () => void
}

export function QuickCapture({ inputRef, onCapture, onExpand }: QuickCaptureProps) {
  const { isDark } = useTheme()
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = () => {
    if (!value.trim()) return
    onCapture(value.trim())
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-30">
      <div
        className={cn(
          'glass-card flex items-center gap-3 p-2 pr-3 transition-all duration-300 iridia-glow',
          isFocused && (isDark
            ? 'ring-2 ring-iridia-orange/50'
            : 'ring-2 ring-iridia-orange/60'
          )
        )}
      >
        {/* Iridia eye icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-iridia-orange">
          <Zap className="w-5 h-5 text-iridia-black" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Captura un pensamiento rapido... (Ctrl+K)"
          className={cn(
            'flex-1 bg-transparent outline-none font-body',
            isDark
              ? 'text-iridia-cream placeholder-iridia-lavender/60'
              : 'text-iridia-black placeholder-iridia-indigo/50'
          )}
        />

        <div className="flex items-center gap-1">
          <button
            onClick={onExpand}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark
                ? 'hover:bg-iridia-indigo/30 text-iridia-lavender/70 hover:text-iridia-cream'
                : 'hover:bg-iridia-indigo/10 text-iridia-indigo/60 hover:text-iridia-indigo'
            )}
            title="Expandir"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              value.trim()
                ? 'bg-iridia-orange hover:bg-iridia-orange/90 text-iridia-black'
                : isDark
                  ? 'text-iridia-lavender/30 cursor-not-allowed'
                  : 'text-iridia-indigo/30 cursor-not-allowed'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
