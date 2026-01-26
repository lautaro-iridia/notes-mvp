import type { Note, NoteType } from '../types'

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days}d`

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function filterNotes(
  notes: Note[],
  searchQuery: string,
  filterType: NoteType | 'all',
  filterCategoryId: string | null
): Note[] {
  return notes.filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || note.type === filterType

    const matchesCategory =
      !filterCategoryId || note.categoryIds.includes(filterCategoryId)

    return matchesSearch && matchesType && matchesCategory
  })
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

export function stripMarkdown(text: string): string {
  return text
    // Remove code blocks FIRST (before other patterns interfere)
    .replace(/```[\s\S]*?```/g, '')
    // Remove horizontal rules BEFORE bold/italic (*** could be confused with bold)
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

export function generateExcerpt(content: string, maxLength: number = 150): string {
  const stripped = stripMarkdown(content)
  const cleaned = stripped.replace(/\n+/g, ' ').trim()
  return truncateText(cleaned, maxLength)
}

export function getNotesStats(notes: Note[]): { total: number; notes: number; thoughts: number; ideas: number } {
  return {
    total: notes.length,
    notes: notes.filter((n) => n.type === 'note').length,
    thoughts: notes.filter((n) => n.type === 'thought').length,
    ideas: notes.filter((n) => n.type === 'idea').length,
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
