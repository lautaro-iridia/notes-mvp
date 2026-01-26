import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Category } from '../types'
import { CATEGORY_COLORS } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/helpers'

interface CategoryManagerProps {
  categories: Category[]
  onClose: () => void
  onCreate: (name: string, color: string) => void
  onUpdate: (id: string, updates: Partial<Omit<Category, 'id'>>) => void
  onDelete: (id: string) => void
}

export function CategoryManager({
  categories,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const { isDark } = useTheme()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<string>(CATEGORY_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreate = () => {
    if (!newName.trim()) return
    onCreate(newName.trim(), newColor)
    setNewName('')
    setNewColor(CATEGORY_COLORS[0])
  }

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
  }

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return
    onUpdate(id, { name: editName.trim() })
    setEditingId(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          'absolute inset-0 backdrop-blur-sm',
          isDark ? 'bg-iridia-black/80' : 'bg-iridia-indigo/30'
        )}
        onClick={onClose}
      />

      <div className="relative w-full max-w-md glass-card overflow-hidden animate-scale-in">
        <div className={cn(
          'flex items-center justify-between p-4 border-b',
          isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
        )}>
          <h2 className={cn(
            'text-lg font-display font-semibold',
            isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
          )}>Gestionar Categorias</h2>
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

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nueva categoria"
              className="flex-1 glass-input py-2"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex gap-1">
              {CATEGORY_COLORS.slice(0, 5).map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-lg transition-transform',
                    newColor === color && 'scale-110 ring-2 ring-iridia-orange/60'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className={cn(
                'p-2 rounded-lg transition-colors',
                newName.trim()
                  ? 'bg-iridia-orange hover:bg-iridia-orange/90 text-iridia-black'
                  : isDark
                    ? 'text-iridia-lavender/30 cursor-not-allowed'
                    : 'text-iridia-indigo/30 cursor-not-allowed'
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl group',
                  isDark ? 'glass' : 'glass'
                )}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />

                {editingId === category.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={cn(
                      'flex-1 rounded px-2 py-1 outline-none border',
                      isDark
                        ? 'bg-iridia-indigo/20 text-iridia-cream border-iridia-lavender/30'
                        : 'bg-white text-iridia-indigo border-iridia-indigo/20'
                    )}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(category.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    onBlur={() => handleSaveEdit(category.id)}
                  />
                ) : (
                  <span
                    className={cn(
                      'flex-1 cursor-pointer font-display',
                      isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
                    )}
                    onClick={() => handleStartEdit(category)}
                  >
                    {category.name}
                  </span>
                )}

                <div className="flex gap-1">
                  {CATEGORY_COLORS.slice(0, 5).map((color) => (
                    <button
                      key={color}
                      onClick={() => onUpdate(category.id, { color })}
                      className={cn(
                        'w-5 h-5 rounded-full transition-transform opacity-0 group-hover:opacity-100',
                        category.color === color && 'opacity-100 scale-110 ring-1 ring-iridia-orange/60'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => onDelete(category.id)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100',
                    isDark
                      ? 'hover:bg-red-500/20 text-iridia-lavender/50 hover:text-red-400'
                      : 'hover:bg-red-500/10 text-iridia-indigo/40 hover:text-red-500'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {categories.length === 0 && (
              <p className={cn(
                'text-center py-8 font-body italic',
                isDark ? 'text-iridia-lavender/50' : 'text-iridia-indigo/40'
              )}>
                No hay categorias. Crea una arriba.
              </p>
            )}
          </div>
        </div>

        <div className={cn(
          'p-4 border-t',
          isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
        )}>
          <button
            onClick={onClose}
            className="w-full glass-button py-2.5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
