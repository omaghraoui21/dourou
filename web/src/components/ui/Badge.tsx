import { cn } from '@/lib/utils'

type BadgeVariant = 'paid' | 'declared' | 'unpaid' | 'late' | 'active' | 'draft' | 'completed'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  declared: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  unpaid: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  late: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  active: 'bg-gold/20 text-gold border-gold/30',
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
