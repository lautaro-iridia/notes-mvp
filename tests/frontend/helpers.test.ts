/**
 * Tests for frontend helper functions
 * Focus: edge cases, common scenarios, and the new stripMarkdown function
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Import helpers from frontend src
import {
  stripMarkdown,
  generateExcerpt,
  truncateText,
  formatDate,
  filterNotes,
  sortNotes,
  cn,
  getNotesStats,
} from '@/utils/helpers'

import type { Note } from '@/types'

// ============================================================================
// stripMarkdown tests - critical for the new markdown editor feature
// ============================================================================
describe('stripMarkdown', () => {
  it('removes bold syntax', () => {
    expect(stripMarkdown('**bold text**')).toBe('bold text')
    expect(stripMarkdown('__also bold__')).toBe('also bold')
  })

  it('removes italic syntax', () => {
    expect(stripMarkdown('*italic*')).toBe('italic')
    expect(stripMarkdown('_also italic_')).toBe('also italic')
  })

  it('removes links but keeps text', () => {
    expect(stripMarkdown('[link text](https://example.com)')).toBe('link text')
  })

  it('removes images', () => {
    expect(stripMarkdown('![alt text](https://example.com/img.png)')).toBe('alt text')
  })

  it('removes inline code', () => {
    expect(stripMarkdown('some `code` here')).toBe('some code here')
  })

  it('removes code blocks', () => {
    const input = '```javascript\nconst x = 1;\n```'
    expect(stripMarkdown(input)).toBe('')
  })

  it('removes headers', () => {
    expect(stripMarkdown('# Header 1')).toBe('Header 1')
    expect(stripMarkdown('## Header 2')).toBe('Header 2')
    expect(stripMarkdown('###### Header 6')).toBe('Header 6')
  })

  it('removes blockquotes', () => {
    expect(stripMarkdown('> quoted text')).toBe('quoted text')
  })

  it('removes list markers', () => {
    expect(stripMarkdown('- item 1')).toBe('item 1')
    expect(stripMarkdown('* item 2')).toBe('item 2')
    expect(stripMarkdown('1. numbered')).toBe('numbered')
  })

  it('removes horizontal rules', () => {
    expect(stripMarkdown('---')).toBe('')
    expect(stripMarkdown('***')).toBe('')
  })

  it('handles complex markdown documents', () => {
    const complex = `# Title
**Bold** and *italic* text.

[Link](https://example.com)

- List item

\`code\``
    const result = stripMarkdown(complex)
    expect(result).not.toContain('**')
    expect(result).not.toContain('[')
    expect(result).not.toContain('`')
    expect(result).toContain('Bold')
    expect(result).toContain('Link')
  })

  // Edge cases
  it('handles empty string', () => {
    expect(stripMarkdown('')).toBe('')
  })

  it('handles text without markdown', () => {
    expect(stripMarkdown('plain text')).toBe('plain text')
  })

  it('handles nested formatting', () => {
    // **_bold and italic_** - common edge case
    const result = stripMarkdown('**_nested_**')
    expect(result).not.toContain('*')
    expect(result).not.toContain('_')
  })
})

// ============================================================================
// generateExcerpt tests
// ============================================================================
describe('generateExcerpt', () => {
  it('generates excerpt from plain text', () => {
    const text = 'This is a simple note content.'
    expect(generateExcerpt(text)).toBe('This is a simple note content.')
  })

  it('strips markdown before truncating', () => {
    const markdown = '**Bold title** with some content'
    expect(generateExcerpt(markdown)).toBe('Bold title with some content')
  })

  it('respects maxLength parameter', () => {
    const longText = 'a'.repeat(200)
    expect(generateExcerpt(longText, 50).length).toBeLessThanOrEqual(53) // 50 + '...'
  })

  it('handles newlines', () => {
    const text = 'Line 1\n\nLine 2\nLine 3'
    expect(generateExcerpt(text)).not.toContain('\n')
  })

  it('handles empty content', () => {
    expect(generateExcerpt('')).toBe('')
  })
})

// ============================================================================
// truncateText tests
// ============================================================================
describe('truncateText', () => {
  it('does not truncate short text', () => {
    expect(truncateText('short', 10)).toBe('short')
  })

  it('truncates long text with ellipsis', () => {
    expect(truncateText('this is a long text', 10)).toBe('this is a...')
  })

  it('handles exact length', () => {
    expect(truncateText('exact', 5)).toBe('exact')
  })

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('')
  })
})

// ============================================================================
// formatDate tests
// ============================================================================
describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Ahora" for very recent dates', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const recent = new Date('2024-01-15T11:59:30Z').toISOString()
    expect(formatDate(recent)).toBe('Ahora')
  })

  it('returns minutes ago for dates within an hour', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const thirtyMinAgo = new Date('2024-01-15T11:30:00Z').toISOString()
    expect(formatDate(thirtyMinAgo)).toBe('Hace 30m')
  })

  it('returns hours ago for dates within a day', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const fiveHoursAgo = new Date('2024-01-15T07:00:00Z').toISOString()
    expect(formatDate(fiveHoursAgo)).toBe('Hace 5h')
  })

  it('returns days ago for dates within a week', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const threeDaysAgo = new Date('2024-01-12T12:00:00Z').toISOString()
    expect(formatDate(threeDaysAgo)).toBe('Hace 3d')
  })
})

// ============================================================================
// filterNotes tests
// ============================================================================
describe('filterNotes', () => {
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'React Tutorial',
      content: 'Learn React basics',
      type: 'note',
      isPinned: false,
      categoryIds: ['cat1'],
      linkedNoteIds: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Random Thought',
      content: 'Something interesting',
      type: 'thought',
      isPinned: true,
      categoryIds: ['cat2'],
      linkedNoteIds: [],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      title: 'App Idea',
      content: 'Build a React app',
      type: 'idea',
      isPinned: false,
      categoryIds: ['cat1', 'cat2'],
      linkedNoteIds: [],
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
  ]

  it('filters by search query in title', () => {
    const result = filterNotes(mockNotes, 'React', 'all', null)
    expect(result).toHaveLength(2)
    expect(result.map(n => n.id)).toContain('1')
    expect(result.map(n => n.id)).toContain('3')
  })

  it('filters by search query in content', () => {
    const result = filterNotes(mockNotes, 'interesting', 'all', null)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('filters by type', () => {
    const result = filterNotes(mockNotes, '', 'thought', null)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('thought')
  })

  it('filters by category', () => {
    const result = filterNotes(mockNotes, '', 'all', 'cat1')
    expect(result).toHaveLength(2)
  })

  it('combines multiple filters', () => {
    const result = filterNotes(mockNotes, 'React', 'idea', 'cat1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })

  it('returns all notes when no filters applied', () => {
    const result = filterNotes(mockNotes, '', 'all', null)
    expect(result).toHaveLength(3)
  })

  it('is case insensitive', () => {
    const result = filterNotes(mockNotes, 'REACT', 'all', null)
    expect(result).toHaveLength(2)
  })

  it('handles empty notes array', () => {
    const result = filterNotes([], 'test', 'all', null)
    expect(result).toHaveLength(0)
  })
})

// ============================================================================
// sortNotes tests
// ============================================================================
describe('sortNotes', () => {
  it('puts pinned notes first', () => {
    const notes: Note[] = [
      { id: '1', title: 'Not pinned', isPinned: false, updatedAt: '2024-01-02T00:00:00Z' } as Note,
      { id: '2', title: 'Pinned', isPinned: true, updatedAt: '2024-01-01T00:00:00Z' } as Note,
    ]
    const sorted = sortNotes(notes)
    expect(sorted[0].id).toBe('2')
  })

  it('sorts by updatedAt within pinned/unpinned groups', () => {
    const notes: Note[] = [
      { id: '1', title: 'Old', isPinned: false, updatedAt: '2024-01-01T00:00:00Z' } as Note,
      { id: '2', title: 'New', isPinned: false, updatedAt: '2024-01-03T00:00:00Z' } as Note,
      { id: '3', title: 'Mid', isPinned: false, updatedAt: '2024-01-02T00:00:00Z' } as Note,
    ]
    const sorted = sortNotes(notes)
    expect(sorted[0].id).toBe('2')
    expect(sorted[1].id).toBe('3')
    expect(sorted[2].id).toBe('1')
  })

  it('does not mutate original array', () => {
    const notes: Note[] = [
      { id: '1', title: 'First', isPinned: false, updatedAt: '2024-01-01T00:00:00Z' } as Note,
    ]
    const sorted = sortNotes(notes)
    expect(sorted).not.toBe(notes)
  })

  it('handles empty array', () => {
    expect(sortNotes([])).toEqual([])
  })
})

// ============================================================================
// cn (classnames) tests
// ============================================================================
describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', false, 'b', null, 'c', undefined)).toBe('a b c')
  })

  it('handles empty arguments', () => {
    expect(cn()).toBe('')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
  })
})

// ============================================================================
// getNotesStats tests
// ============================================================================
describe('getNotesStats', () => {
  it('counts notes by type', () => {
    const notes: Note[] = [
      { type: 'note' } as Note,
      { type: 'note' } as Note,
      { type: 'thought' } as Note,
      { type: 'idea' } as Note,
      { type: 'idea' } as Note,
      { type: 'idea' } as Note,
    ]
    const stats = getNotesStats(notes)
    expect(stats.total).toBe(6)
    expect(stats.notes).toBe(2)
    expect(stats.thoughts).toBe(1)
    expect(stats.ideas).toBe(3)
  })

  it('handles empty array', () => {
    const stats = getNotesStats([])
    expect(stats.total).toBe(0)
    expect(stats.notes).toBe(0)
    expect(stats.thoughts).toBe(0)
    expect(stats.ideas).toBe(0)
  })
})
