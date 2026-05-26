'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { Banknote, Building, Smartphone, Wallet } from 'lucide-react'

interface DeclarePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  onSubmit: (method: string, reference: string) => Promise<void>
}

const methods = [
  { id: 'cash', label: 'Especes', icon: Banknote },
  { id: 'bank', label: 'Virement bancaire', icon: Building },
  { id: 'd17', label: 'D17', icon: Smartphone },
  { id: 'flouci', label: 'Flouci', icon: Wallet },
]

export function DeclarePaymentModal({
  isOpen,
  onClose,
  amount,
  onSubmit,
}: DeclarePaymentModalProps) {
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!method) return
    setLoading(true)
    try {
      await onSubmit(method, reference)
      setMethod('')
      setReference('')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMethod('')
    setReference('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Declarer un paiement">
      <div className="space-y-4">
        {/* Amount display */}
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400">Montant</p>
          <p className="text-xl font-bold text-gold">{formatCurrency(amount)}</p>
        </div>

        {/* Method selection */}
        <div>
          <p className="text-sm font-medium text-slate-300 mb-2">
            Methode de paiement
          </p>
          <div className="grid grid-cols-2 gap-2">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
                  method === m.id
                    ? 'bg-gold/10 border-gold text-gold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <m.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reference */}
        <Input
          label="Reference (optionnel)"
          placeholder="Ex: REF-2024-001"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            loading={loading}
            disabled={!method}
          >
            Confirmer la declaration
          </Button>
        </div>
      </div>
    </Modal>
  )
}
