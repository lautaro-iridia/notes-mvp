import { X } from 'lucide-react'
import type { Category } from '../types'
import { cn } from '@/lib/utils'
import { badgeVariants } from '@/components/ui/badge'

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md'
  onRemove?: () => void
  onClick?: () => void
}

export function CategoryBadge({
  category,
  size = 'sm',
  onRemove,
  onClick,
}: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        badgeVariants({ variant: 'outline' }),
        'rounded-full font-medium transition-all duration-200',
        onClick && 'cursor-pointer hover:scale-105',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
      style={{
        backgroundColor: `${category.color}20`,
        borderColor: `${category.color}40`,
        color: category.color,
      }}
      onClick={onClick}
    >
      {category.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
