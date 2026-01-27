import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Category } from '../types'
import { CATEGORY_COLORS } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface CategoryManagerProps {
  categories: Category[]
  onClose: () => void
  onCreate: (name: string, color: string) => void
  onUpdate: (id: string, updates: Partial<Omit<Category, 'id'>>) => void
  onDelete: (id: string) => void
  open?: boolean
}

export function CategoryManager({
  categories,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  open = true,
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          'glass-card border-0 max-w-md p-0 gap-0',
          isDark ? 'bg-iridia-indigo/20' : 'bg-white/95'
        )}
      >
        <DialogHeader
          className={cn(
            'p-4 border-b',
            isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
          )}
        >
          <DialogTitle
            className={cn(
              'font-display font-semibold',
              isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
            )}
          >
            Gestionar Categorias
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* New category form - stacked layout */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nueva categoria"
                className="flex-1 glass-input py-2"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {CATEGORY_COLORS.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={cn(
                      'w-7 h-7 rounded-full transition-all duration-200',
                      newColor === color
                        ? 'scale-110 ring-2 ring-offset-2 ring-iridia-orange/60'
                        : 'hover:scale-105',
                      isDark ? 'ring-offset-iridia-black' : 'ring-offset-white'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim()}
                size="sm"
                className={cn(
                  'gap-1.5 font-display',
                  newName.trim()
                    ? 'bg-iridia-orange hover:bg-iridia-orange/90 text-iridia-black'
                    : isDark
                      ? 'bg-iridia-indigo/20 text-iridia-lavender/30 cursor-not-allowed'
                      : 'bg-iridia-indigo/5 text-iridia-indigo/30 cursor-not-allowed'
                )}
              >
                <Plus className="w-4 h-4" />
                Crear
              </Button>
            </div>
          </div>

          {/* Categories list with ScrollArea */}
          <ScrollArea className="h-60">
            <div className="space-y-2 pr-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl group',
                    'glass'
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

                  <div className="flex gap-1 flex-shrink-0">
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
                      'p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0',
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
          </ScrollArea>
        </div>

        <DialogFooter
          className={cn(
            'p-4 border-t',
            isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
          )}
        >
          <Button
            onClick={onClose}
            variant="outline"
            className={cn(
              'w-full glass-button border-0',
              isDark
                ? 'bg-iridia-indigo/30 hover:bg-iridia-indigo/40'
                : 'bg-iridia-indigo/10 hover:bg-iridia-indigo/20'
            )}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
