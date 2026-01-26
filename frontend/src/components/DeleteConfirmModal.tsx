import { AlertTriangle, X } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/helpers'

interface DeleteConfirmModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const { isDark } = useTheme()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          'absolute inset-0 backdrop-blur-sm',
          isDark ? 'bg-iridia-black/80' : 'bg-iridia-indigo/30'
        )}
        onClick={onCancel}
      />

      <div className="relative w-full max-w-sm glass-card overflow-hidden animate-scale-in">
        <div className={cn(
          'flex items-center justify-between p-4 border-b',
          isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className={cn(
              'text-lg font-display font-semibold',
              isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
            )}>{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark
                ? 'hover:bg-iridia-indigo/30 text-iridia-lavender/70'
                : 'hover:bg-iridia-indigo/10 text-iridia-indigo/70'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className={cn(
            'font-body',
            isDark ? 'text-iridia-cream/80' : 'text-iridia-indigo/80'
          )}>{message}</p>
        </div>

        <div className={cn(
          'flex gap-3 p-4 border-t',
          isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
        )}>
          <button
            onClick={onCancel}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl transition-colors font-display',
              isDark
                ? 'text-iridia-lavender/80 hover:bg-iridia-indigo/20'
                : 'text-iridia-indigo/70 hover:bg-iridia-indigo/10'
            )}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-display font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
