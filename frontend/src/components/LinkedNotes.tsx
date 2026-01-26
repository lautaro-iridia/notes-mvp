import { Link2, X, ExternalLink } from 'lucide-react'
import type { Note } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/helpers'

interface LinkedNotesProps {
  linkedNotes: Note[]
  onNavigate: (note: Note) => void
  onUnlink?: (noteId: string) => void
  compact?: boolean
}

export function LinkedNotes({
  linkedNotes,
  onNavigate,
  onUnlink,
  compact = false,
}: LinkedNotesProps) {
  const { isDark } = useTheme()

  if (linkedNotes.length === 0) return null

  return (
    <div className={cn('space-y-2', compact && 'space-y-1')}>
      <div className={cn(
        'flex items-center gap-2',
        isDark ? 'text-iridia-lavender/70' : 'text-iridia-indigo/60'
      )}>
        <Link2 className="w-4 h-4" />
        <span className="text-sm font-display font-medium">
          Notas vinculadas ({linkedNotes.length})
        </span>
      </div>

      <div className={cn('flex flex-wrap gap-2', compact && 'gap-1')}>
        {linkedNotes.map((note) => (
          <div
            key={note.id}
            className={cn(
              'group flex items-center gap-1.5 glass rounded-lg transition-colors cursor-pointer',
              isDark ? 'hover:bg-iridia-indigo/30' : 'hover:bg-iridia-indigo/10',
              compact ? 'px-2 py-1' : 'px-3 py-1.5'
            )}
            onClick={() => onNavigate(note)}
          >
            <span className={cn(
              'font-display',
              isDark ? 'text-iridia-cream/80' : 'text-iridia-indigo/80',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {note.title}
            </span>
            <ExternalLink className={cn(
              isDark ? 'text-iridia-lavender/50' : 'text-iridia-indigo/40',
              compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
            )} />
            {onUnlink && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUnlink(note.id)
                }}
                className={cn(
                  'opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all',
                  isDark
                    ? 'hover:bg-iridia-indigo/30 text-iridia-lavender/60'
                    : 'hover:bg-iridia-indigo/10 text-iridia-indigo/50'
                )}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
