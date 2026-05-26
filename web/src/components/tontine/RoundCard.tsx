import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import type { Round } from '@/lib/database.types'

interface RoundCardProps {
  round: Round
  beneficiaryName: string
  onClick?: () => void
}

export function RoundCard({ round, beneficiaryName, onClick }: RoundCardProps) {
  const statusBadge = () => {
    switch (round.status) {
      case 'current':
        return <Badge variant="active">En cours</Badge>
      case 'completed':
        return <Badge variant="completed">Termine</Badge>
      default:
        return <Badge variant="draft">A venir</Badge>
    }
  }

  return (
    <Card onClick={onClick} className="p-4">
      <div className="flex items-center gap-3">
        <Avatar name={beneficiaryName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white">
              Tour {round.round_number}
            </p>
            {statusBadge()}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {beneficiaryName}
          </p>
          {round.scheduled_date && (
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDate(round.scheduled_date)}
            </p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </div>
    </Card>
  )
}
