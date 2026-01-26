import { FileText, Brain, Lightbulb, Pin, Trash2, Link2, Edit3 } from 'lucide-react'
import type { Note, Category } from '../types'
import { NOTE_TYPE_CONFIG } from '../types'
import { formatDate, generateExcerpt, cn } from '../utils/helpers'
import { CategoryBadge } from './CategoryBadge'
import { useTheme } from '../contexts/ThemeContext'

interface NoteCardProps {
  note: Note
  categories: Category[]
  linkedNotesCount: number
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
}

const iconMap = {
  FileText,
  Brain,
  Lightbulb,
}

export function NoteCard({
  note,
  categories,
  linkedNotesCount,
  onEdit,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const { isDark } = useTheme()
  const typeConfig = NOTE_TYPE_CONFIG[note.type]
  const TypeIcon = iconMap[typeConfig.icon as keyof typeof iconMap]
  const noteCategories = categories.filter((c) => note.categoryIds.includes(c.id))

  return (
    <div
      className={cn(
        'glass-card p-5 cursor-pointer group animate-fade-in relative',
        'hover:scale-[1.02] transition-all duration-200',
        isDark
          ? 'hover:bg-iridia-indigo/25'
          : 'hover:bg-iridia-indigo/10',
        `note-type-${note.type}`
      )}
      style={note.color ? { backgroundColor: note.color } : undefined}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              'p-1.5 rounded-lg flex-shrink-0',
              note.type === 'note' && (isDark
                ? 'bg-iridia-lavender/20 text-iridia-lavender'
                : 'bg-iridia-lavender/30 text-iridia-indigo'),
              note.type === 'thought' && (isDark
                ? 'bg-iridia-indigo/40 text-iridia-lavender'
                : 'bg-iridia-indigo/20 text-iridia-indigo'),
              note.type === 'idea' && 'bg-iridia-orange/20 text-iridia-orange'
            )}
          >
            <TypeIcon className="w-4 h-4" />
          </div>
          <h3 className={cn(
            'font-display font-semibold truncate',
            isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
          )}>{note.title}</h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin()
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              note.isPinned
                ? 'bg-iridia-orange/20 text-iridia-orange'
                : isDark
                  ? 'hover:bg-iridia-indigo/30 text-iridia-lavender/70'
                  : 'hover:bg-iridia-indigo/10 text-iridia-indigo/60'
            )}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isDark
                ? 'hover:bg-iridia-indigo/30 text-iridia-lavender/70'
                : 'hover:bg-iridia-indigo/10 text-iridia-indigo/60'
            )}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isDark
                ? 'hover:bg-red-500/20 text-iridia-lavender/70 hover:text-red-400'
                : 'hover:bg-red-500/10 text-iridia-indigo/60 hover:text-red-500'
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {note.content && (
        <p className={cn(
          'text-sm mb-3 line-clamp-3 font-body',
          isDark ? 'text-iridia-cream/80' : 'text-iridia-indigo/70'
        )}>
          {generateExcerpt(note.content)}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {noteCategories.slice(0, 3).map((category) => (
            <CategoryBadge key={category.id} category={category} size="sm" />
          ))}
          {noteCategories.length > 3 && (
            <span className={cn(
              'text-xs',
              isDark ? 'text-iridia-lavender/60' : 'text-iridia-indigo/50'
            )}>
              +{noteCategories.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {linkedNotesCount > 0 && (
            <div className={cn(
              'flex items-center gap-1',
              isDark ? 'text-iridia-lavender/60' : 'text-iridia-indigo/50'
            )}>
              <Link2 className="w-3.5 h-3.5" />
              <span className="text-xs">{linkedNotesCount}</span>
            </div>
          )}
          <span className={cn(
            'text-xs',
            isDark ? 'text-iridia-lavender/60' : 'text-iridia-indigo/50'
          )}>{formatDate(note.updatedAt)}</span>
        </div>
      </div>

      {note.isPinned && (
        <div className="absolute top-2 right-2">
          <Pin className="w-3.5 h-3.5 text-iridia-orange fill-iridia-orange" />
        </div>
      )}
    </div>
  )
}
