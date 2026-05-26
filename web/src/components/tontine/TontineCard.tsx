import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, Calendar } from 'lucide-react'
import type { Tontine } from '@/lib/database.types'

interface TontineCardProps {
  tontine: Tontine
  onClick?: () => void
}

export function TontineCard({ tontine, onClick }: TontineCardProps) {
  const frequencyLabel = tontine.frequency === 'weekly' ? 'semaine' : 'mois'

  const statusBadge = () => {
    switch (tontine.status) {
      case 'active':
        return <Badge variant="active">Active</Badge>
      case 'completed':
        return <Badge variant="completed">Terminee</Badge>
      default:
        return <Badge variant="draft">Brouillon</Badge>
    }
  }

  return (
    <Card
      onClick={onClick}
      className={`p-4 ${tontine.status === 'active' ? 'border-l-2 border-l-gold' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-white truncate">
          {tontine.title}
        </h3>
        {statusBadge()}
      </div>

      <p className="text-gold font-medium text-sm mb-3">
        {formatCurrency(tontine.amount)} / {frequencyLabel}
      </p>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {tontine.total_members} membres
        </span>
        {tontine.next_deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(tontine.next_deadline)}
          </span>
        )}
      </div>
    </Card>
  )
}
