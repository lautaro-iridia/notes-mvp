import { Search, X } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/helpers'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Buscar notas...' }: SearchBarProps) {
  const { isDark } = useTheme()

  return (
    <div className="relative">
      <Search className={cn(
        'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5',
        isDark ? 'text-iridia-lavender/60' : 'text-iridia-indigo/50'
      )} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full glass-input pl-12 pr-10 font-body"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors',
            isDark
              ? 'hover:bg-iridia-indigo/30 text-iridia-lavender/60'
              : 'hover:bg-iridia-indigo/10 text-iridia-indigo/50'
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
