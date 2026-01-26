import { useState } from 'react'
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { notesApi, ImportRequest, CategoryImport, NoteImport } from '@/api'
import { STORAGE_KEYS } from '@/utils/storage'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/utils/helpers'

interface LocalStorageNote {
  id: string
  title: string
  content: string
  type: 'note' | 'thought' | 'idea'
  categoryIds: string[]
  linkedNoteIds: string[]
  isPinned: boolean
  color?: string
  createdAt: string
  updatedAt: string
}

interface LocalStorageCategory {
  id: string
  name: string
  color: string
}

interface MigrationBannerProps {
  onMigrationComplete: () => void
  onDismiss: () => void
}

export function MigrationBanner({ onMigrationComplete, onDismiss }: MigrationBannerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()
  const { isDark } = useTheme()

  const getLocalStorageData = (): { notes: LocalStorageNote[]; categories: LocalStorageCategory[] } | null => {
    try {
      const notesJson = localStorage.getItem(STORAGE_KEYS.NOTES)
      const categoriesJson = localStorage.getItem(STORAGE_KEYS.CATEGORIES)

      const notes: LocalStorageNote[] = notesJson ? JSON.parse(notesJson) : []
      const categories: LocalStorageCategory[] = categoriesJson ? JSON.parse(categoriesJson) : []

      if (notes.length === 0 && categories.length === 0) {
        return null
      }

      return { notes, categories }
    } catch {
      return null
    }
  }

  const localData = getLocalStorageData()

  if (!localData) {
    return null
  }

  const handleMigrate = async () => {
    setStatus('loading')
    setMessage('Migrando datos...')

    try {
      const importData: ImportRequest = {
        notes: localData.notes.map((note): NoteImport => ({
          id: note.id,
          title: note.title,
          content: note.content || undefined,
          type: note.type,
          is_pinned: note.isPinned,
          color: note.color,
          category_ids: note.categoryIds,
          linked_note_ids: note.linkedNoteIds,
          created_at: note.createdAt,
          updated_at: note.updatedAt,
        })),
        categories: localData.categories.map((cat): CategoryImport => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
        })),
      }

      const result = await notesApi.importNotes(importData)

      // Clear localStorage after successful migration
      localStorage.removeItem(STORAGE_KEYS.NOTES)
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES)

      // Invalidate queries to refresh data from API
      await queryClient.invalidateQueries({ queryKey: ['notes'] })
      await queryClient.invalidateQueries({ queryKey: ['categories'] })

      setStatus('success')
      setMessage(`Migrados ${result.notes_imported} notas y ${result.categories_imported} categorias`)

      setTimeout(() => {
        onMigrationComplete()
      }, 2000)
    } catch (err) {
      console.error('Migration error:', err)
      setStatus('error')
      setMessage('Error al migrar datos. Intenta de nuevo.')
    }
  }

  if (status === 'success') {
    return (
      <div className={cn(
        "rounded-xl p-4 mb-6 border",
        isDark
          ? "bg-green-500/10 border-green-500/30"
          : "bg-green-50 border-green-200"
      )}>
        <div className="flex items-center gap-3">
          <CheckCircle className={cn(
            "w-5 h-5",
            isDark ? "text-green-400" : "text-green-600"
          )} />
          <p className={cn(
            "font-body",
            isDark ? "text-green-300" : "text-green-800"
          )}>{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "glass-card p-4 mb-6"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Upload className={cn(
            "w-5 h-5 mt-0.5",
            isDark ? "text-iridia-orange" : "text-iridia-indigo"
          )} />
          <div>
            <h3 className={cn(
              "font-display font-semibold",
              isDark ? "text-iridia-cream" : "text-iridia-indigo"
            )}>
              Datos locales encontrados
            </h3>
            <p className={cn(
              "text-sm font-body mt-1",
              isDark ? "text-iridia-lavender/70" : "text-iridia-indigo/60"
            )}>
              Tienes {localData.notes.length} notas y {localData.categories.length} categorias guardadas
              localmente. ¿Quieres migrarlas a tu cuenta?
            </p>
            {status === 'error' && (
              <div className="flex items-center gap-2 mt-2 text-red-500 text-sm font-body">
                <AlertCircle className="w-4 h-4" />
                {message}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className={cn(
            "p-1 rounded-lg transition-colors",
            isDark
              ? "text-iridia-lavender/50 hover:text-iridia-lavender hover:bg-iridia-indigo/20"
              : "text-iridia-indigo/50 hover:text-iridia-indigo hover:bg-iridia-indigo/10"
          )}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex gap-3 mt-4 ml-8">
        <button
          onClick={handleMigrate}
          disabled={status === 'loading'}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-display font-semibold",
            "bg-iridia-orange text-iridia-black",
            "hover:bg-iridia-orange-light",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2",
            "transition-all duration-200"
          )}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Migrando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Migrar datos
            </>
          )}
        </button>
        <button
          onClick={onDismiss}
          disabled={status === 'loading'}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-display font-medium",
            "glass-button",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Descartar
        </button>
      </div>
    </div>
  )
}

export default MigrationBanner
