import { FileText } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/helpers'

interface EmptyStateProps {
  title: string
  description: string
  icon?: typeof FileText
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileText,
}: EmptyStateProps) {
  const { isDark } = useTheme()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4 iridia-glow">
        <Icon className={cn(
          'w-8 h-8',
          isDark ? 'text-iridia-lavender/70' : 'text-iridia-indigo/60'
        )} />
      </div>
      <h3 className={cn(
        'text-xl font-display font-semibold mb-2',
        isDark ? 'text-iridia-cream/90' : 'text-iridia-indigo'
      )}>
        {title}
      </h3>
      <p className={cn(
        'max-w-sm font-body',
        isDark ? 'text-iridia-lavender/60' : 'text-iridia-indigo/50'
      )}>
        {description}
      </p>
    </div>
  )
}
