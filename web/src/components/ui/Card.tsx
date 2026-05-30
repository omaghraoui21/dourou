import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card rounded-xl border border-white/5 p-4',
        onClick && 'cursor-pointer hover:border-white/10 transition-colors',
        className
      )}
    >
      {children}
    </div>
  )
}
