import { useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'
import { filterNotes, sortNotes } from '../utils/helpers'
import type { Note, NoteType } from '../types'

interface UseNotesOptions {
  searchQuery?: string
  filterType?: NoteType | 'all'
  filterCategoryId?: string | null
}

export function useNotes(options: UseNotesOptions = {}) {
  const { searchQuery = '', filterType = 'all', filterCategoryId = null } = options
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEYS.NOTES, [])

  const createNote = useCallback((
    noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>
  ): Note => {
    const now = new Date().toISOString()
    const newNote: Note = {
      id: uuidv4(),
      title: noteData.title || 'Sin título',
      content: noteData.content || '',
      type: noteData.type || 'note',
      categoryIds: noteData.categoryIds || [],
      linkedNoteIds: noteData.linkedNoteIds || [],
      isPinned: noteData.isPinned || false,
      color: noteData.color,
      createdAt: now,
      updatedAt: now,
    }

    setNotes((prev) => [newNote, ...prev])
    return newNote
  }, [setNotes])

  const updateNote = useCallback((
    id: string,
    updates: Partial<Omit<Note, 'id' | 'createdAt'>>
  ): void => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
    )
  }, [setNotes])

  const deleteNote = useCallback((id: string): void => {
    setNotes((prev) => {
      const filtered = prev.filter((note) => note.id !== id)
      return filtered.map((note) => ({
        ...note,
        linkedNoteIds: note.linkedNoteIds.filter((linkedId) => linkedId !== id),
      }))
    })
  }, [setNotes])

  const togglePin = useCallback((id: string): void => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
          : note
      )
    )
  }, [setNotes])

  const linkNotes = useCallback((noteId: string, linkedNoteId: string): void => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId && !note.linkedNoteIds.includes(linkedNoteId)) {
          return {
            ...note,
            linkedNoteIds: [...note.linkedNoteIds, linkedNoteId],
            updatedAt: new Date().toISOString(),
          }
        }
        if (note.id === linkedNoteId && !note.linkedNoteIds.includes(noteId)) {
          return {
            ...note,
            linkedNoteIds: [...note.linkedNoteIds, noteId],
            updatedAt: new Date().toISOString(),
          }
        }
        return note
      })
    )
  }, [setNotes])

  const unlinkNotes = useCallback((noteId: string, linkedNoteId: string): void => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId || note.id === linkedNoteId) {
          const targetId = note.id === noteId ? linkedNoteId : noteId
          return {
            ...note,
            linkedNoteIds: note.linkedNoteIds.filter((id) => id !== targetId),
            updatedAt: new Date().toISOString(),
          }
        }
        return note
      })
    )
  }, [setNotes])

  const getNoteById = useCallback((id: string): Note | undefined => {
    return notes.find((note) => note.id === id)
  }, [notes])

  const getLinkedNotes = useCallback((noteId: string): Note[] => {
    const note = getNoteById(noteId)
    if (!note) return []
    return notes.filter((n) => note.linkedNoteIds.includes(n.id))
  }, [notes, getNoteById])

  const filteredNotes = useMemo(() => {
    const filtered = filterNotes(notes, searchQuery, filterType, filterCategoryId)
    return sortNotes(filtered)
  }, [notes, searchQuery, filterType, filterCategoryId])

  return {
    notes,
    filteredNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    linkNotes,
    unlinkNotes,
    getNoteById,
    getLinkedNotes,
  }
}
