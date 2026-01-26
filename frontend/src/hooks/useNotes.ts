import { useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesApi, Note as ApiNote, NoteCreate, NoteUpdate } from '@/api'
import type { Note, NoteType } from '../types'

interface UseNotesOptions {
  searchQuery?: string
  filterType?: NoteType | 'all'
  filterCategoryId?: string | null
}

// Convert API Note to frontend Note format
function toFrontendNote(apiNote: ApiNote): Note {
  return {
    id: apiNote.id,
    title: apiNote.title,
    content: apiNote.content || '',
    type: apiNote.type,
    categoryIds: apiNote.categories.map(c => c.id),
    linkedNoteIds: apiNote.linked_notes.map(n => n.id),
    isPinned: apiNote.is_pinned,
    color: apiNote.color || undefined,
    createdAt: apiNote.created_at,
    updatedAt: apiNote.updated_at,
  }
}

export function useNotes(options: UseNotesOptions = {}) {
  const { searchQuery = '', filterType = 'all', filterCategoryId = null } = options
  const queryClient = useQueryClient()

  // Build filters for API call
  const filters = useMemo(() => ({
    type: filterType !== 'all' ? filterType : undefined,
    category_id: filterCategoryId || undefined,
    search: searchQuery || undefined,
  }), [filterType, filterCategoryId, searchQuery])

  // Fetch filtered notes for display
  const { data: apiNotes = [], isLoading, error } = useQuery({
    queryKey: ['notes', filters],
    queryFn: () => notesApi.list(filters),
  })

  // Fetch ALL notes (unfiltered) for accurate stats
  const { data: allApiNotes = [] } = useQuery({
    queryKey: ['notes', {}],
    queryFn: () => notesApi.list({}),
  })

  // Convert to frontend format
  const filteredNotes = useMemo(() => apiNotes.map(toFrontendNote), [apiNotes])
  const allNotes = useMemo(() => allApiNotes.map(toFrontendNote), [allApiNotes])

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: (data: NoteCreate) => notesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoteUpdate }) => notesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: (id: string) => notesApi.togglePin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  // Link notes mutation
  const linkMutation = useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      notesApi.linkNotes(sourceId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  // Unlink notes mutation
  const unlinkMutation = useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      notesApi.unlinkNotes(sourceId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  const createNote = useCallback((noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const data: NoteCreate = {
      title: noteData.title || 'Sin título',
      content: noteData.content,
      type: noteData.type || 'note',
      is_pinned: noteData.isPinned || false,
      color: noteData.color,
      category_ids: noteData.categoryIds || [],
    }
    return createMutation.mutateAsync(data)
  }, [createMutation])

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    const data: NoteUpdate = {}
    if (updates.title !== undefined) data.title = updates.title
    if (updates.content !== undefined) data.content = updates.content
    if (updates.type !== undefined) data.type = updates.type
    if (updates.isPinned !== undefined) data.is_pinned = updates.isPinned
    if (updates.color !== undefined) data.color = updates.color
    if (updates.categoryIds !== undefined) data.category_ids = updates.categoryIds
    return updateMutation.mutateAsync({ id, data })
  }, [updateMutation])

  const deleteNote = useCallback((id: string) => {
    return deleteMutation.mutateAsync(id)
  }, [deleteMutation])

  const togglePin = useCallback((id: string) => {
    return togglePinMutation.mutateAsync(id)
  }, [togglePinMutation])

  const linkNotes = useCallback((noteId: string, linkedNoteId: string) => {
    return linkMutation.mutateAsync({ sourceId: noteId, targetId: linkedNoteId })
  }, [linkMutation])

  const unlinkNotes = useCallback((noteId: string, linkedNoteId: string) => {
    return unlinkMutation.mutateAsync({ sourceId: noteId, targetId: linkedNoteId })
  }, [unlinkMutation])

  const getNoteById = useCallback((id: string): Note | undefined => {
    return allNotes.find((note) => note.id === id)
  }, [allNotes])

  const getLinkedNotes = useCallback((noteId: string): Note[] => {
    const note = getNoteById(noteId)
    if (!note) return []
    return allNotes.filter((n) => note.linkedNoteIds.includes(n.id))
  }, [allNotes, getNoteById])

  return {
    notes: allNotes,        // All notes (unfiltered) - for stats calculation
    filteredNotes,          // Filtered notes - for display
    isLoading,
    error,
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
