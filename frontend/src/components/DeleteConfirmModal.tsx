import { AlertTriangle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteConfirmModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  open?: boolean
}

export function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  open = true,
}: DeleteConfirmModalProps) {
  const { isDark } = useTheme()

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent
        className={cn(
          'glass-card border-0 max-w-sm',
          isDark ? 'bg-iridia-indigo/20' : 'bg-white/95'
        )}
      >
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <AlertDialogTitle
              className={cn(
                'font-display font-semibold',
                isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
              )}
            >
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription
            className={cn(
              'font-body pt-2',
              isDark ? 'text-iridia-cream/80' : 'text-iridia-indigo/80'
            )}
          >
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 sm:gap-3">
          <AlertDialogCancel
            onClick={onCancel}
            className={cn(
              'flex-1 rounded-xl border-0 font-display',
              isDark
                ? 'bg-iridia-indigo/20 text-iridia-lavender/80 hover:bg-iridia-indigo/30'
                : 'bg-iridia-indigo/10 text-iridia-indigo/70 hover:bg-iridia-indigo/20'
            )}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-display font-medium border-0"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
