export type NoteType = 'note' | 'thought' | 'idea'

export interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  categoryIds: string[]
  linkedNoteIds: string[]
  createdAt: string
  updatedAt: string
  isPinned: boolean
  color?: string
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface AppState {
  notes: Note[]
  categories: Category[]
  selectedNoteId: string | null
  searchQuery: string
  filterType: NoteType | 'all'
  filterCategoryId: string | null
}

export const NOTE_COLORS = [
  { name: 'Default', value: undefined },
  { name: 'Rose', value: 'rgba(244, 63, 94, 0.15)' },
  { name: 'Orange', value: 'rgba(249, 115, 22, 0.15)' },
  { name: 'Amber', value: 'rgba(245, 158, 11, 0.15)' },
  { name: 'Emerald', value: 'rgba(16, 185, 129, 0.15)' },
  { name: 'Cyan', value: 'rgba(6, 182, 212, 0.15)' },
  { name: 'Blue', value: 'rgba(59, 130, 246, 0.15)' },
  { name: 'Violet', value: 'rgba(139, 92, 246, 0.15)' },
  { name: 'Pink', value: 'rgba(236, 72, 153, 0.15)' },
] as const

export const CATEGORY_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
] as const

export const NOTE_TYPE_CONFIG: Record<NoteType, { label: string; icon: string; color: string }> = {
  note: { label: 'Nota', icon: 'FileText', color: 'blue' },
  thought: { label: 'Pensamiento', icon: 'Brain', color: 'purple' },
  idea: { label: 'Idea', icon: 'Lightbulb', color: 'amber' },
}
