'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getProfile, createTontine } from '@/lib/data'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

type Frequency = 'weekly' | 'monthly'
type Distribution = 'fixed' | 'random' | 'trust'

export default function CreateTontinePage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [totalMembers, setTotalMembers] = useState('')
  const [distribution, setDistribution] = useState<Distribution>('fixed')

  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      setError('Veuillez entrer un nom pour la tontine')
      return false
    }
    const parsedAmount = parseFloat(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Le montant doit etre un nombre positif')
      return false
    }
    if (!Number.isFinite(parsedAmount)) {
      setError('Le montant entre est invalide')
      return false
    }
    return true
  }

  const validateStep2 = (): boolean => {
    const members = parseInt(totalMembers)
    if (!totalMembers || isNaN(members)) {
      setError('Veuillez entrer un nombre de membres valide')
      return false
    }
    if (members < 3) {
      setError('Une tontine doit avoir au minimum 3 membres')
      return false
    }
    if (members > 50) {
      setError('Une tontine ne peut pas depasser 50 membres')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    setError('')
    if (step > 1) setStep(step - 1)
  }

  const handleCreate = async () => {
    setLoading(true)
    setError('')

    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const profile = await getProfile(user.id)

      const { id, error: createError } = await createTontine({
        user,
        profile,
        title: name.trim(),
        amount: parseInt(amount),
        frequency,
        totalMembers: parseInt(totalMembers),
        distribution,
      })

      if (createError) {
        setError(createError)
        return
      }

      if (id) {
        router.push(`/dashboard/tontine/${id}`)
      }
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }

  const frequencyLabel = frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuel'
  const distributionLabels: Record<Distribution, string> = {
    fixed: 'Ordre fixe',
    random: 'Tirage aleatoire',
    trust: 'Basee sur la confiance',
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => step > 1 ? handleBack() : router.back()}
          className="w-10 h-10 rounded-xl bg-card border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Creer une tontine</h1>
          <p className="text-slate-400 text-sm">Etape {step} sur 3</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              s <= step ? 'bg-gold' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      <Card className="p-6">
        {/* Step 1: Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Informations de base
            </h2>

            <Input
              label="Nom de la tontine"
              placeholder="Ex: Collegues Startup"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Montant de la cotisation (TND)"
              type="number"
              placeholder="200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Frequence
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFrequency('weekly')}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    frequency === 'weekly'
                      ? 'bg-gold/10 border-gold text-gold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  Hebdomadaire
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    frequency === 'monthly'
                      ? 'bg-gold/10 border-gold text-gold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  Mensuel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Members */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Membres et distribution
            </h2>

            <Input
              label="Nombre total de membres (3-50)"
              type="number"
              placeholder="4"
              value={totalMembers}
              onChange={(e) => setTotalMembers(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Logique de distribution
              </label>
              <div className="space-y-2">
                {(['fixed', 'random', 'trust'] as Distribution[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDistribution(d)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                      distribution === d
                        ? 'bg-gold/10 border-gold text-gold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-medium">{distributionLabels[d]}</span>
                    <p className="text-xs mt-0.5 opacity-70">
                      {d === 'fixed' && 'Les beneficiaires suivent un ordre predetermine'}
                      {d === 'random' && 'Tirage au sort pour chaque nouveau tour'}
                      {d === 'trust' && 'Priorite aux membres avec le meilleur score de confiance'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Recapitulatif
            </h2>

            <div className="space-y-3 bg-slate-800/50 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Nom</span>
                <span className="text-white text-sm font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Cotisation</span>
                <span className="text-white text-sm font-medium">{formatCurrency(parseInt(amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Frequence</span>
                <span className="text-white text-sm font-medium">{frequencyLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Membres</span>
                <span className="text-white text-sm font-medium">{totalMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Distribution</span>
                <span className="text-white text-sm font-medium">{distributionLabels[distribution]}</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between">
                <span className="text-slate-400 text-sm">Cagnotte totale</span>
                <span className="text-gold text-sm font-bold">
                  {formatCurrency(parseInt(amount) * parseInt(totalMembers))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm mt-4">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              Retour
            </Button>
          )}
          {step < 3 ? (
            <Button variant="primary" onClick={handleNext} className="flex-1">
              Suivant
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCreate}
              loading={loading}
              className="flex-1"
            >
              <Check className="w-4 h-4" />
              Creer
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
