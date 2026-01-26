import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/helpers'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-iridia-orange focus:ring-offset-2',
        isDark
          ? 'bg-iridia-gray-dark focus:ring-offset-iridia-black'
          : 'bg-iridia-lavender/30 focus:ring-offset-iridia-cream',
        className
      )}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      title={`Modo ${isDark ? 'oscuro' : 'claro'}`}
    >
      {/* Track background */}
      <span
        className={cn(
          'absolute inset-0.5 rounded-full transition-colors duration-300',
          isDark ? 'bg-iridia-indigo/40' : 'bg-iridia-orange/20'
        )}
      />

      {/* Sliding circle */}
      <span
        className={cn(
          'absolute w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center',
          isDark
            ? 'left-1 bg-iridia-indigo'
            : 'left-7 bg-iridia-orange'
        )}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-iridia-cream" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-white" />
        )}
      </span>
    </button>
  )
}
