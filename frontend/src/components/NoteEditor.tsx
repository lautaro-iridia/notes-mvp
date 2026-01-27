import { useState, useEffect, useRef } from 'react'
import {
  FileText,
  Brain,
  Lightbulb,
  Check,
  Link2,
  Tag,
  Palette,
  Bold,
  Italic,
  Link as LinkIcon,
  Image,
  List,
  Code,
  Eye,
  Edit3,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Note, NoteType, Category } from '../types'
import { NOTE_TYPE_CONFIG, NOTE_COLORS, CATEGORY_COLORS } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NoteEditorProps {
  note?: Note | null
  notes: Note[]
  categories: Category[]
  onSave: (noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => void
  onClose: () => void
  onCreateCategory: (name: string, color: string) => Promise<{ id: string; name: string; color: string }>
  open?: boolean
}

const iconMap = {
  FileText,
  Brain,
  Lightbulb,
}

export function NoteEditor({
  note,
  notes,
  categories,
  onSave,
  onClose,
  onCreateCategory,
  open = true,
}: NoteEditorProps) {
  const { isDark } = useTheme()
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [type, setType] = useState<NoteType>(note?.type || 'note')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    note?.categoryIds || []
  )
  const [linkedNoteIds, setLinkedNoteIds] = useState<string[]>(
    note?.linkedNoteIds || []
  )
  const [color, setColor] = useState<string | undefined>(note?.color)
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState<string>(CATEGORY_COLORS[0])
  const [showLinkSelector, setShowLinkSelector] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editorTab, setEditorTab] = useState<string>('edit')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setType(note.type || 'note')
      setSelectedCategoryIds(note.categoryIds || [])
      setLinkedNoteIds(note.linkedNoteIds || [])
      setColor(note.color)
    }
  }, [note])

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return
    onSave({
      title: title.trim() || 'Sin titulo',
      content,
      type,
      categoryIds: selectedCategoryIds,
      linkedNoteIds,
      color,
      isPinned: note?.isPinned || false,
    })
    onClose()
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    const newCategory = await onCreateCategory(newCategoryName.trim(), newCategoryColor)
    setSelectedCategoryIds([...selectedCategoryIds, newCategory.id])
    setNewCategoryName('')
    setShowCategoryInput(false)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleLinkedNote = (noteId: string) => {
    setLinkedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    )
  }

  const insertMarkdown = (before: string, after: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    const newContent =
      content.substring(0, start) +
      before + selectedText + after +
      content.substring(end)

    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      const newPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const availableNotes = notes.filter((n) => n.id !== note?.id)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          'glass-card border-0 max-w-2xl max-h-[90vh] p-0 gap-0',
          isDark ? 'bg-iridia-indigo/20' : 'bg-white/95'
        )}
      >
        {/* Header with type selector */}
        <DialogHeader
          className={cn(
            'flex flex-row items-center justify-between p-4 border-b space-y-0',
            isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
          )}
        >
          <div className="flex items-center gap-2">
            {(Object.keys(NOTE_TYPE_CONFIG) as NoteType[]).map((t) => {
              const config = NOTE_TYPE_CONFIG[t]
              const Icon = iconMap[config.icon as keyof typeof iconMap]
              return (
                <Button
                  key={t}
                  variant="ghost"
                  size="sm"
                  onClick={() => setType(t)}
                  className={cn(
                    'gap-2 font-display',
                    type === t
                      ? 'nav-item-active'
                      : '',
                    type === t
                      ? isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
                      : isDark
                        ? 'text-iridia-lavender/70 hover:bg-iridia-indigo/20 hover:text-iridia-cream'
                        : 'text-iridia-indigo/60 hover:bg-iridia-indigo/10 hover:text-iridia-indigo'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{config.label}</span>
                </Button>
              )
            })}
          </div>
        </DialogHeader>

        {/* Editor content */}
        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo"
              className={cn(
                'w-full bg-transparent text-2xl font-display font-bold outline-none mb-4',
                isDark
                  ? 'text-iridia-cream placeholder-iridia-lavender/50'
                  : 'text-iridia-indigo placeholder-iridia-indigo/40'
              )}
              autoFocus
            />

            {/* Editor/Preview Tabs using shadcn */}
            <Tabs value={editorTab} onValueChange={setEditorTab} className="w-full">
              <TabsList
                className={cn(
                  'w-auto mb-3',
                  isDark ? 'bg-iridia-indigo/20' : 'bg-iridia-indigo/5'
                )}
              >
                <TabsTrigger
                  value="edit"
                  className={cn(
                    'gap-1.5 font-display',
                    isDark
                      ? 'data-[state=active]:bg-iridia-indigo/40 data-[state=active]:text-iridia-cream'
                      : 'data-[state=active]:bg-white data-[state=active]:text-iridia-indigo'
                  )}
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className={cn(
                    'gap-1.5 font-display',
                    isDark
                      ? 'data-[state=active]:bg-iridia-indigo/40 data-[state=active]:text-iridia-cream'
                      : 'data-[state=active]:bg-white data-[state=active]:text-iridia-indigo'
                  )}
                >
                  <Eye className="w-4 h-4" />
                  Vista previa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-0">
                {/* Markdown Toolbar */}
                <div className={cn(
                  'flex flex-wrap gap-1 mb-3 p-2 rounded-lg',
                  isDark ? 'bg-iridia-indigo/20' : 'bg-iridia-indigo/5'
                )}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertMarkdown('**', '**')}
                    title="Negrita"
                    className={cn(
                      'h-8 w-8',
                      isDark
                        ? 'hover:bg-iridia-indigo/40 text-iridia-lavender/80'
                        : 'hover:bg-iridia-indigo/10 text-iridia-indigo/70'
                    )}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertMarkdown('*', '*')}
                    title="Italica"
                    className={cn(
                      'h-8 w-8',
                      isDark
                        ? 'hover:bg-iridia-indigo/40 text-iridia-lavender/80'
                        : 'hover:bg-iridia-indigo/10 text-iridia-indigo/70'
                    )}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertMarkdown('[', '](url)')}
                    title="Link"
                    className={cn(
                      'h-8 w-8',
                      isDark
                        ? 'hover:bg-iridia-indigo/40 text-iridia-lavender/80'
                        : 'hover:bg-iridia-indigo/10 text-iridia-indigo/70'
                    )}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertMarkdown('![alt](', ')')}
                    title="Imagen (URL)"
                    className={cn(
                      'h-8 w-8',
                      isDark
                        ? 'hover:bg-iridia-indigo/40 text-iridia-lavender/80'
                        : 'hover:bg-iridia-indigo/10 text-iridia-indigo/70'
                    )}
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertMarkdown('- ', '')}
                    title="Lista"
                    className={cn(
                      'h-8 w-8',
                      isDark
                        ? 'hover:bg-iridia-indigo/40 text-iridia-lavender/80'
                        : 'hover:bg-iridia-indigo/10 text-iridia-indigo/70'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertMarkdown('`', '`')}
                    title="Codigo"
                    className={cn(
                      'h-8 w-8',
                      isDark
                        ? 'hover:bg-iridia-indigo/40 text-iridia-lavender/80'
                        : 'hover:bg-iridia-indigo/10 text-iridia-indigo/70'
                    )}
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe tu nota aqui... (soporta Markdown)"
                  className={cn(
                    'w-full bg-transparent outline-none resize-none min-h-[200px] font-body',
                    isDark
                      ? 'text-iridia-cream/90 placeholder-iridia-lavender/50'
                      : 'text-iridia-indigo/90 placeholder-iridia-indigo/40'
                  )}
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className={cn(
                  'prose max-w-none min-h-[200px] font-body',
                  isDark ? 'prose-invert' : '',
                  isDark
                    ? 'prose-headings:text-iridia-cream prose-p:text-iridia-cream/90 prose-a:text-iridia-orange prose-strong:text-iridia-cream prose-code:text-iridia-lavender prose-code:bg-iridia-indigo/30'
                    : 'prose-headings:text-iridia-indigo prose-p:text-iridia-indigo/90 prose-a:text-iridia-orange prose-strong:text-iridia-indigo prose-code:text-iridia-indigo prose-code:bg-iridia-indigo/10'
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || '*Sin contenido*'}
                  </ReactMarkdown>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4">
              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    'flex items-center gap-2',
                    isDark ? 'text-iridia-lavender/70' : 'text-iridia-indigo/60'
                  )}>
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-display font-medium">Categorias</span>
                  </div>
                  <button
                    onClick={() => setShowCategoryInput(!showCategoryInput)}
                    className="text-xs text-iridia-orange hover:text-iridia-orange/80 transition-colors font-display"
                  >
                    + Nueva
                  </button>
                </div>

                {showCategoryInput && (
                  <div className="flex items-center gap-2 mb-3 animate-fade-in">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nombre"
                      className="flex-1 glass-input py-2 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                    />
                    <div className="flex gap-1 flex-shrink-0">
                      {CATEGORY_COLORS.slice(0, 5).map((c) => (
                        <button
                          key={c}
                          onClick={() => setNewCategoryColor(c)}
                          className={cn(
                            'w-6 h-6 rounded-full transition-transform',
                            newCategoryColor === c && 'scale-125 ring-2 ring-iridia-orange/60'
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <Button
                      size="icon"
                      onClick={handleCreateCategory}
                      className="bg-iridia-orange hover:bg-iridia-orange/90 h-8 w-8"
                    >
                      <Check className="w-4 h-4 text-iridia-black" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-display font-medium border transition-all duration-200',
                        selectedCategoryIds.includes(category.id)
                          ? 'scale-105'
                          : 'opacity-60 hover:opacity-100'
                      )}
                      style={{
                        backgroundColor: selectedCategoryIds.includes(category.id)
                          ? `${category.color}30`
                          : 'transparent',
                        borderColor: category.color,
                        color: category.color,
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link notes */}
              <div>
                <button
                  onClick={() => setShowLinkSelector(!showLinkSelector)}
                  className={cn(
                    'flex items-center gap-2 transition-colors mb-2',
                    isDark
                      ? 'text-iridia-lavender/70 hover:text-iridia-cream'
                      : 'text-iridia-indigo/60 hover:text-iridia-indigo'
                  )}
                >
                  <Link2 className="w-4 h-4" />
                  <span className="text-sm font-display font-medium">
                    Vincular notas {linkedNoteIds.length > 0 && <span className="text-iridia-orange">({linkedNoteIds.length})</span>}
                  </span>
                </button>

                {showLinkSelector && (
                  <div className="glass rounded-xl p-3 max-h-40 overflow-y-auto animate-fade-in">
                    {availableNotes.length === 0 ? (
                      <p className={cn(
                        'text-sm text-center py-2 font-body italic',
                        isDark ? 'text-iridia-lavender/50' : 'text-iridia-indigo/40'
                      )}>
                        No hay otras notas para vincular
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {availableNotes.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => toggleLinkedNote(n.id)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors font-display',
                              linkedNoteIds.includes(n.id)
                                ? 'nav-item-active'
                                : '',
                              linkedNoteIds.includes(n.id)
                                ? isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
                                : isDark
                                  ? 'text-iridia-lavender/70 hover:bg-iridia-indigo/20'
                                  : 'text-iridia-indigo/60 hover:bg-iridia-indigo/10'
                            )}
                          >
                            {linkedNoteIds.includes(n.id) && (
                              <Check className="w-4 h-4 flex-shrink-0 text-iridia-orange" />
                            )}
                            <span className="truncate text-sm">{n.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Color picker */}
              <div>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={cn(
                    'flex items-center gap-2 transition-colors mb-2',
                    isDark
                      ? 'text-iridia-lavender/70 hover:text-iridia-cream'
                      : 'text-iridia-indigo/60 hover:text-iridia-indigo'
                  )}
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-sm font-display font-medium">Color de fondo</span>
                </button>

                {showColorPicker && (
                  <div className="flex gap-2 animate-fade-in">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setColor(c.value)}
                        className={cn(
                          'w-8 h-8 rounded-lg border-2 transition-transform',
                          color === c.value
                            ? 'scale-110 border-iridia-orange'
                            : isDark
                              ? 'border-iridia-lavender/20 hover:border-iridia-lavender/40'
                              : 'border-iridia-indigo/20 hover:border-iridia-indigo/40'
                        )}
                        style={{
                          backgroundColor: c.value || 'rgba(75, 0, 130, 0.2)',
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <DialogFooter
          className={cn(
            'flex justify-end gap-3 p-4 border-t',
            isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
          )}
        >
          <Button
            variant="ghost"
            onClick={onClose}
            className={cn(
              'font-display',
              isDark
                ? 'text-iridia-lavender/80 hover:bg-iridia-indigo/20'
                : 'text-iridia-indigo/70 hover:bg-iridia-indigo/10'
            )}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="btn-accent border-0"
          >
            {note ? 'Guardar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
