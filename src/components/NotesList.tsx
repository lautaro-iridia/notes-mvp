import type { Note, Category } from '../types'
import { NoteCard } from './NoteCard'
import { EmptyState } from './EmptyState'

interface NotesListProps {
  notes: Note[]
  categories: Category[]
  getLinkedNotesCount: (noteId: string) => number
  onEditNote: (note: Note) => void
  onDeleteNote: (noteId: string) => void
  onTogglePin: (noteId: string) => void
  searchQuery: string
}

export function NotesList({
  notes,
  categories,
  getLinkedNotesCount,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  searchQuery,
}: NotesListProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        title={searchQuery ? 'Sin resultados' : 'No hay notas'}
        description={
          searchQuery
            ? `No se encontraron notas para "${searchQuery}"`
            : 'Crea tu primera nota o captura un pensamiento rápido'
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          categories={categories}
          linkedNotesCount={getLinkedNotesCount(note.id)}
          onEdit={() => onEditNote(note)}
          onDelete={() => onDeleteNote(note.id)}
          onTogglePin={() => onTogglePin(note.id)}
        />
      ))}
    </div>
  )
}
