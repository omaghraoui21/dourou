import { cn } from '@/lib/utils'
import { Button } from './Button'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, action, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>
      )}
      {action && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  )
}
