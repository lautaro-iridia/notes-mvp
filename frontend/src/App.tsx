// CopilotKit temporalmente deshabilitado — bug dict_repr en copilotkit<=0.1.83
// Ver: backend/app/agent/runtime.py — _IrisAgent subclass workaround pendiente de validación
// Para rehabilitar: descomentar imports, hooks useCopilotReadable/useCopilotAction, CopilotSidebar y wrapper <CopilotKit>
import { useState, useCallback, useEffect, useRef } from 'react'
import { Layout } from './components/Layout'
import { Sidebar, SidebarToggle } from './components/Sidebar'
import { SearchBar } from './components/SearchBar'
import { NotesList } from './components/NotesList'
import { NoteEditor } from './components/NoteEditor'
import { QuickCapture } from './components/QuickCapture'
import { CategoryManager } from './components/CategoryManager'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { AuthPage } from './components/auth'
import { MigrationBanner } from './components/MigrationBanner'
import { useAuth } from './hooks/useAuth'
import { useNotes } from './hooks/useNotes'
import { useCategories } from './hooks/useCategories'
import { useTheme } from './contexts/ThemeContext'
import { getNotesStats, cn } from './utils/helpers'
import type { Note, NoteType } from './types'
import { Loader2 } from 'lucide-react'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-iridia-cream dark:bg-iridia-black">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-iridia-indigo dark:text-iridia-lavender mx-auto mb-4" />
        <p className="text-iridia-indigo/60 dark:text-iridia-lavender/60 font-body">Cargando...</p>
      </div>
    </div>
  )
}

function AuthenticatedApp() {
  const { isDark } = useTheme()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all')
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  const [showMigrationBanner, setShowMigrationBanner] = useState(true)
  const quickCaptureRef = useRef<HTMLInputElement>(null)

  // Global keyboard shortcut for new note (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open full editor
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        e.stopPropagation()
        setEditingNote(null)
        setEditorOpen(true)
      }
    }
    // Use capture phase to intercept before browser
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [])

  const {
    notes,
    filteredNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    getLinkedNotes,
  } = useNotes({
    searchQuery,
    filterType,
    filterCategoryId,
  })

  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()

  const notesStats = getNotesStats(notes)

  const handleNewNote = useCallback(() => {
    setEditingNote(null)
    setEditorOpen(true)
  }, [])

  const handleEditNote = useCallback((note: Note) => {
    setEditingNote(note)
    setEditorOpen(true)
  }, [])

  const handleSaveNote = useCallback(
    (noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => {
      if (editingNote) {
        updateNote(editingNote.id, noteData)
      } else {
        createNote(noteData)
      }
    },
    [editingNote, createNote, updateNote]
  )

  const handleDeleteNote = useCallback((noteId: string) => {
    const note = notes.find((n) => n.id === noteId)
    if (note) {
      setDeleteConfirm({ id: noteId, title: note.title })
    }
  }, [notes])

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      deleteNote(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }, [deleteConfirm, deleteNote])

  const handleQuickCapture = useCallback(
    (content: string) => {
      createNote({
        title: content.slice(0, 50),
        content,
        type: 'thought',
      })
    },
    [createNote]
  )

  const getLinkedNotesCount = useCallback(
    (noteId: string) => getLinkedNotes(noteId).length,
    [getLinkedNotes]
  )

  const getFilterTitle = () => {
    if (filterCategoryId) {
      const category = categories.find((c) => c.id === filterCategoryId)
      return category?.name || 'Categoria'
    }
    switch (filterType) {
      case 'note':
        return 'Notas'
      case 'thought':
        return 'Pensamientos'
      case 'idea':
        return 'Ideas'
      default:
        return 'Todas las notas'
    }
  }

  return (
    <Layout>
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterCategoryId={filterCategoryId}
          onFilterCategoryChange={setFilterCategoryId}
          categories={categories}
          onNewNote={handleNewNote}
          onManageCategories={() => setCategoryManagerOpen(true)}
          notesCount={notesStats}
          user={user}
          onLogout={logout}
        />

        <main className="flex-1 min-w-0 p-4 lg:p-8 pb-24">
          <SidebarToggle onClick={() => setSidebarOpen(true)} />

          <div className="max-w-6xl mx-auto">
            <header className="mb-8 pt-12 lg:pt-0">
              <h1 className={cn(
                'text-3xl lg:text-4xl font-display font-bold mb-2',
                isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
              )}>
                {getFilterTitle()}
              </h1>
              <p className={cn(
                'font-body',
                isDark ? 'text-iridia-lavender/70' : 'text-iridia-indigo/60'
              )}>
                {filteredNotes.length} {filteredNotes.length === 1 ? 'nota' : 'notas'}
              </p>
            </header>

            {showMigrationBanner && (
              <MigrationBanner
                onMigrationComplete={() => setShowMigrationBanner(false)}
                onDismiss={() => setShowMigrationBanner(false)}
              />
            )}

            <div className="mb-6">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar notas..."
              />
            </div>

            <NotesList
              notes={filteredNotes}
              categories={categories}
              getLinkedNotesCount={getLinkedNotesCount}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              onTogglePin={togglePin}
              searchQuery={searchQuery}
            />
          </div>
        </main>
      </div>

      <QuickCapture
        inputRef={quickCaptureRef}
        onCapture={handleQuickCapture}
        onExpand={handleNewNote}
      />

      {editorOpen && (
        <NoteEditor
          note={editingNote}
          notes={notes}
          categories={categories}
          onSave={handleSaveNote}
          onClose={() => {
            setEditorOpen(false)
            setEditingNote(null)
          }}
          onCreateCategory={createCategory}
        />
      )}

      {categoryManagerOpen && (
        <CategoryManager
          categories={categories}
          onClose={() => setCategoryManagerOpen(false)}
          onCreate={createCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          title="Eliminar nota"
          message={`Estas seguro de que quieres eliminar "${deleteConfirm.title}"? Esta accion no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* <CopilotSidebar> deshabilitado — rehabilitar cuando se resuelva el bug del agente */}
    </Layout>
  )
}

// const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'  // usado por CopilotKit

export default function App() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  // CopilotKit deshabilitado — pendiente resolver bug dict_repr en copilotkit<=0.1.83
  // Para rehabilitar: envolver <AuthenticatedApp /> en <CopilotKit runtimeUrl={...} agent="iris" threadId={user?.id}>
  return <AuthenticatedApp />
}
