import {
  Brain,
  FileText,
  Lightbulb,
  LayoutGrid,
  Plus,
  Tag,
  Settings,
  X,
  Menu,
  LogOut,
  User as UserIcon
} from 'lucide-react'
import type { NoteType, Category } from '../types'
import { NOTE_TYPE_CONFIG } from '../types'
import { cn } from '../utils/helpers'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../contexts/ThemeContext'
import type { User } from '@/api'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  filterType: NoteType | 'all'
  onFilterTypeChange: (type: NoteType | 'all') => void
  filterCategoryId: string | null
  onFilterCategoryChange: (categoryId: string | null) => void
  categories: Category[]
  onNewNote: () => void
  onManageCategories: () => void
  notesCount: { total: number; notes: number; thoughts: number; ideas: number }
  user?: User | null
  onLogout?: () => void
}

// Iridia Labs Logo Component
function IridiaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Outer circle - eyeball */}
      <circle cx="50" cy="50" r="45" fill="#0D0E0E" stroke="#B2A5FF" strokeWidth="2"/>
      {/* Iris - indigo */}
      <circle cx="50" cy="50" r="30" fill="#4B0082"/>
      {/* Pupil */}
      <circle cx="50" cy="50" r="12" fill="#0D0E0E"/>
      {/* Highlight/brillo - orange */}
      <circle cx="62" cy="38" r="6" fill="#FF9B00"/>
    </svg>
  )
}

export function Sidebar({
  isOpen,
  onClose,
  filterType,
  onFilterTypeChange,
  filterCategoryId,
  onFilterCategoryChange,
  categories,
  onNewNote,
  onManageCategories,
  notesCount,
  user,
  onLogout,
}: SidebarProps) {
  const { isDark } = useTheme()

  const navItems: { type: NoteType | 'all'; label: string; icon: typeof LayoutGrid; count: number }[] = [
    { type: 'all', label: 'Todas', icon: LayoutGrid, count: notesCount.total },
    { type: 'note', label: NOTE_TYPE_CONFIG.note.label + 's', icon: FileText, count: notesCount.notes },
    { type: 'thought', label: NOTE_TYPE_CONFIG.thought.label + 's', icon: Brain, count: notesCount.thoughts },
    { type: 'idea', label: NOTE_TYPE_CONFIG.idea.label + 's', icon: Lightbulb, count: notesCount.ideas },
  ]

  return (
    <>
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 backdrop-blur-sm z-40 lg:hidden',
            isDark ? 'bg-iridia-black/70' : 'bg-iridia-indigo/30'
          )}
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-72 z-50',
          'sidebar-bg',
          'flex flex-col',
          'transform transition-transform duration-300 ease-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header with Iridia Labs branding */}
        <div className={cn(
          'p-6 border-b',
          isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl iridia-glow flex items-center justify-center overflow-hidden">
                <IridiaLogo className="w-10 h-10" />
              </div>
              <div>
                <h1 className={cn(
                  'text-xl font-display font-bold',
                  isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
                )}>
                  Iridia <span className="text-iridia-orange">Notes</span>
                </h1>
                <p className={cn(
                  'text-xs font-body',
                  isDark ? 'text-iridia-lavender/70' : 'text-iridia-indigo/60'
                )}>by Iridia Labs</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors',
                isDark
                  ? 'hover:bg-iridia-indigo/30 text-iridia-lavender/70'
                  : 'hover:bg-iridia-indigo/10 text-iridia-indigo/70'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Note Button */}
        <div className="p-4">
          <button
            onClick={onNewNote}
            className="w-full btn-accent flex items-center justify-center gap-2 py-3"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Nueva Nota</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            {navItems.map(({ type, label, icon: Icon, count }) => (
              <button
                key={type}
                onClick={() => {
                  onFilterTypeChange(type)
                  onFilterCategoryChange(null)
                  onClose()
                }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-display',
                  filterType === type && !filterCategoryId
                    ? 'nav-item-active'
                    : '',
                  filterType === type && !filterCategoryId
                    ? isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
                    : isDark
                      ? 'text-iridia-lavender/80 hover:bg-iridia-indigo/20 hover:text-iridia-cream'
                      : 'text-iridia-indigo/70 hover:bg-iridia-indigo/10 hover:text-iridia-indigo'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </div>
                <span className="text-sm font-semibold text-iridia-orange">{count}</span>
              </button>
            ))}
          </div>

          {/* Categories */}
          <div className="mt-8">
            <div className="flex items-center justify-between px-4 mb-2">
              <span className={cn(
                'text-xs font-display font-semibold uppercase tracking-wider',
                isDark ? 'text-iridia-lavender/60' : 'text-iridia-indigo/50'
              )}>
                Categorias
              </span>
              <button
                onClick={onManageCategories}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isDark
                    ? 'hover:bg-iridia-indigo/20 text-iridia-lavender/60'
                    : 'hover:bg-iridia-indigo/10 text-iridia-indigo/50'
                )}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onFilterCategoryChange(
                      filterCategoryId === category.id ? null : category.id
                    )
                    onFilterTypeChange('all')
                    onClose()
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-display',
                    filterCategoryId === category.id
                      ? 'nav-item-active'
                      : '',
                    filterCategoryId === category.id
                      ? isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
                      : isDark
                        ? 'text-iridia-lavender/80 hover:bg-iridia-indigo/20 hover:text-iridia-cream'
                        : 'text-iridia-indigo/70 hover:bg-iridia-indigo/10 hover:text-iridia-indigo'
                  )}
                >
                  <Tag
                    className="w-4 h-4"
                    style={{ color: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
              {categories.length === 0 && (
                <p className={cn(
                  'text-sm px-4 py-2 font-body italic',
                  isDark ? 'text-iridia-lavender/50' : 'text-iridia-indigo/40'
                )}>
                  No hay categorias
                </p>
              )}
            </div>
          </div>
        </nav>

        {/* Footer with User Info and Theme Toggle */}
        <div className={cn(
          'p-4 border-t',
          isDark ? 'border-iridia-lavender/15' : 'border-iridia-indigo/10'
        )}>
          {user && (
            <div className={cn(
              'flex items-center gap-3 mb-4 p-3 rounded-xl',
              isDark ? 'bg-iridia-indigo/20' : 'bg-iridia-indigo/5'
            )}>
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center',
                isDark ? 'bg-iridia-indigo/40' : 'bg-iridia-indigo/10'
              )}>
                <UserIcon className={cn(
                  'w-5 h-5',
                  isDark ? 'text-iridia-lavender' : 'text-iridia-indigo'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium truncate',
                  isDark ? 'text-iridia-cream' : 'text-iridia-indigo'
                )}>
                  {user.display_name || user.email.split('@')[0]}
                </p>
                <p className={cn(
                  'text-xs truncate',
                  isDark ? 'text-iridia-lavender/60' : 'text-iridia-indigo/50'
                )}>
                  {user.email}
                </p>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isDark
                      ? 'hover:bg-red-500/20 text-iridia-lavender/60 hover:text-red-400'
                      : 'hover:bg-red-500/10 text-iridia-indigo/50 hover:text-red-500'
                  )}
                  title="Cerrar sesion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <span className={cn(
              'text-sm font-display',
              isDark ? 'text-iridia-lavender/70' : 'text-iridia-indigo/60'
            )}>
              {isDark ? 'Modo Oscuro' : 'Modo Claro'}
            </span>
            <ThemeToggle />
          </div>
          <p className={cn(
            'text-xs text-center font-body',
            isDark ? 'text-iridia-lavender/50' : 'text-iridia-indigo/40'
          )}>
            Soluciones Inteligentes
          </p>
        </div>
      </aside>
    </>
  )
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  const { isDark } = useTheme()

  return (
    <button
      onClick={onClick}
      className={cn(
        'lg:hidden fixed top-4 left-4 z-30 p-3 rounded-xl transition-colors',
        isDark
          ? 'glass hover:bg-iridia-indigo/30 text-iridia-cream'
          : 'glass hover:bg-iridia-indigo/10 text-iridia-indigo'
      )}
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}
