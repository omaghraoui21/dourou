import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency } from '@/lib/utils'
import type { Payment } from '@/lib/database.types'

interface PaymentRowProps {
  payment: Payment
  memberName: string
  action?: React.ReactNode
}

const methodLabels: Record<string, string> = {
  cash: 'Especes',
  bank: 'Virement',
  d17: 'D17',
  flouci: 'Flouci',
}

export function PaymentRow({ payment, memberName, action }: PaymentRowProps) {
  const statusBadge = () => {
    switch (payment.status) {
      case 'paid':
        return <Badge variant="paid">Paye</Badge>
      case 'declared':
        return <Badge variant="declared">Declare</Badge>
      case 'late':
        return <Badge variant="late">En retard</Badge>
      default:
        return <Badge variant="unpaid">Non paye</Badge>
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar name={memberName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {memberName}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-slate-400">
              {formatCurrency(payment.amount)}
            </span>
            {payment.method && (
              <span className="text-xs text-slate-500">
                {methodLabels[payment.method] || payment.method}
              </span>
            )}
            {payment.reference && (
              <span className="text-xs text-slate-600 font-mono truncate max-w-[120px]">
                {payment.reference}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge()}
          {action}
        </div>
      </div>
    </Card>
  )
}
