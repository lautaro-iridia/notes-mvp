import { useState, useEffect } from 'react'
import {
  X,
  FileText,
  Brain,
  Lightbulb,
  Check,
  Link2,
  Tag,
  Palette,
} from 'lucide-react'
import type { Note, NoteType, Category } from '../types'
import { NOTE_TYPE_CONFIG, NOTE_COLORS, CATEGORY_COLORS } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/helpers'

interface NoteEditorProps {
  note?: Note | null
  notes: Note[]
  categories: Category[]
  onSave: (noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => void
  onClose: () => void
  onCreateCategory: (name: string, color: string) => Category
}

const iconMap = {
  FileText,
  Brain,
  Lightbulb,
}

export function NoteEditor({
  note,
  notes,
  categories,
  onSave,
  onClose,
  onCreateCategory,
}: NoteEditorProps) {
  const { isDark } = useTheme()
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [type, setType] = useState<NoteType>(note?.type || 'note')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    note?.categoryIds || []
  )
  const [linkedNoteIds, setLinkedNoteIds] = useState<string[]>(
    note?.linkedNoteIds || []
  )
  const [color, setColor] = useState<string | undefined>(note?.color)
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState<string>(CATEGORY_COLORS[0])
  const [showLinkSelector, setShowLinkSelector] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return
    onSave({
      title: title.trim() || 'Sin titulo',
      content,
      type,
      categoryIds: selectedCategoryIds,
      linkedNoteIds,
      color,
      isPinned: note?.isPinned || false,
    })
    onClose()
  }

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return
    const newCategory = onCreateCategory(newCategoryName.trim(), newCategoryColor)
    setSelectedCategoryIds([...selectedCategoryIds, newCategory.id])
    setNewCategoryName('')
    setShowCategoryInput(false)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleLinkedNote = (noteId: string) => {
    setLinkedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    )
  }

  const availableNotes = notes.filter((n) => n.id !== note?.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          'absolute inset-0 backdrop-blur-sm',
          isDark ? 'bg-iridia-black/80' : 'bg-iridia-indigo/30'
        )}
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] glass-card overflow-hidden animate-scale-in">
        {/* Header with type selector */}
        <div className={cn(
          'flex items-center justify-between p-4 border-b',
          isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
        )}>
          <div className="flex items-center gap-2">
            {(Object.keys(NOTE_TYPE_CONFIG) as NoteType[]).map((t) => {
              const config = NOTE_TYPE_CONFIG[t]
              const Icon = iconMap[config.icon as keyof typeof iconMap]
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 font-display',
                    type === t
                      ? 'nav-item-active'
                      : '',
                    type === t
                      ? isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
                      : isDark
                        ? 'text-iridia-lavender/70 hover:bg-iridia-indigo/20 hover:text-iridia-cream'
                        : 'text-iridia-indigo/60 hover:bg-iridia-indigo/10 hover:text-iridia-indigo'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{config.label}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={onClose}
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

        {/* Editor content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo"
            className={cn(
              'w-full bg-transparent text-2xl font-display font-bold outline-none mb-4',
              isDark
                ? 'text-iridia-cream placeholder-iridia-lavender/50'
                : 'text-iridia-indigo placeholder-iridia-indigo/40'
            )}
            autoFocus
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu nota aqui..."
            className={cn(
              'w-full bg-transparent outline-none resize-none min-h-[200px] font-body',
              isDark
                ? 'text-iridia-cream/90 placeholder-iridia-lavender/50'
                : 'text-iridia-indigo/90 placeholder-iridia-indigo/40'
            )}
          />

          <div className="mt-6 space-y-4">
            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  'flex items-center gap-2',
                  isDark ? 'text-iridia-lavender/70' : 'text-iridia-indigo/60'
                )}>
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-display font-medium">Categorias</span>
                </div>
                <button
                  onClick={() => setShowCategoryInput(!showCategoryInput)}
                  className="text-xs text-iridia-orange hover:text-iridia-orange/80 transition-colors font-display"
                >
                  + Nueva
                </button>
              </div>

              {showCategoryInput && (
                <div className="flex items-center gap-2 mb-3 animate-fade-in">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nombre"
                    className="flex-1 glass-input py-2 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                  />
                  <div className="flex gap-1">
                    {CATEGORY_COLORS.slice(0, 5).map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewCategoryColor(c)}
                        className={cn(
                          'w-6 h-6 rounded-full transition-transform',
                          newCategoryColor === c && 'scale-125 ring-2 ring-iridia-orange/60'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleCreateCategory}
                    className="p-2 rounded-lg bg-iridia-orange hover:bg-iridia-orange/90 transition-colors"
                  >
                    <Check className="w-4 h-4 text-iridia-black" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-display font-medium border transition-all duration-200',
                      selectedCategoryIds.includes(category.id)
                        ? 'scale-105'
                        : 'opacity-60 hover:opacity-100'
                    )}
                    style={{
                      backgroundColor: selectedCategoryIds.includes(category.id)
                        ? `${category.color}30`
                        : 'transparent',
                      borderColor: category.color,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Link notes */}
            <div>
              <button
                onClick={() => setShowLinkSelector(!showLinkSelector)}
                className={cn(
                  'flex items-center gap-2 transition-colors mb-2',
                  isDark
                    ? 'text-iridia-lavender/70 hover:text-iridia-cream'
                    : 'text-iridia-indigo/60 hover:text-iridia-indigo'
                )}
              >
                <Link2 className="w-4 h-4" />
                <span className="text-sm font-display font-medium">
                  Vincular notas {linkedNoteIds.length > 0 && <span className="text-iridia-orange">({linkedNoteIds.length})</span>}
                </span>
              </button>

              {showLinkSelector && (
                <div className="glass rounded-xl p-3 max-h-40 overflow-y-auto animate-fade-in">
                  {availableNotes.length === 0 ? (
                    <p className={cn(
                      'text-sm text-center py-2 font-body italic',
                      isDark ? 'text-iridia-lavender/50' : 'text-iridia-indigo/40'
                    )}>
                      No hay otras notas para vincular
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {availableNotes.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => toggleLinkedNote(n.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors font-display',
                            linkedNoteIds.includes(n.id)
                              ? 'nav-item-active'
                              : '',
                            linkedNoteIds.includes(n.id)
                              ? isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
                              : isDark
                                ? 'text-iridia-lavender/70 hover:bg-iridia-indigo/20'
                                : 'text-iridia-indigo/60 hover:bg-iridia-indigo/10'
                          )}
                        >
                          {linkedNoteIds.includes(n.id) && (
                            <Check className="w-4 h-4 flex-shrink-0 text-iridia-orange" />
                          )}
                          <span className="truncate text-sm">{n.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Color picker */}
            <div>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={cn(
                  'flex items-center gap-2 transition-colors mb-2',
                  isDark
                    ? 'text-iridia-lavender/70 hover:text-iridia-cream'
                    : 'text-iridia-indigo/60 hover:text-iridia-indigo'
                )}
              >
                <Palette className="w-4 h-4" />
                <span className="text-sm font-display font-medium">Color de fondo</span>
              </button>

              {showColorPicker && (
                <div className="flex gap-2 animate-fade-in">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.value)}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 transition-transform',
                        color === c.value
                          ? 'scale-110 border-iridia-orange'
                          : isDark
                            ? 'border-iridia-lavender/20 hover:border-iridia-lavender/40'
                            : 'border-iridia-indigo/20 hover:border-iridia-indigo/40'
                      )}
                      style={{
                        backgroundColor: c.value || 'rgba(75, 0, 130, 0.2)',
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className={cn(
          'flex justify-end gap-3 p-4 border-t',
          isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
        )}>
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2 rounded-xl transition-colors font-display',
              isDark
                ? 'text-iridia-lavender/80 hover:bg-iridia-indigo/20'
                : 'text-iridia-indigo/70 hover:bg-iridia-indigo/10'
            )}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="btn-accent px-6 py-2"
          >
            {note ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}
