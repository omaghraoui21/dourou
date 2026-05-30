'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AUTH_ERROR_INVALID_LINK } from '@/lib/auth/redirect'
import { createClient } from '@/lib/supabase/client'
import { formatMaskedEmail, isValidEmail, normalizeEmail } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { DemoButton } from '@/components/demo/DemoButton'
import { LegalDisclaimer } from '@/components/layout/LegalDisclaimer'
import { Mail, ArrowLeft } from 'lucide-react'

function AuthForm() {
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [step, setStep] = useState<'email' | 'sent'>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('error') === AUTH_ERROR_INVALID_LINK) {
      setError('Ce lien de connexion est invalide ou expire. Demandez un nouveau lien.')
      setStep('email')
    }
  }, [searchParams])

  const handleSendMagicLink = async () => {
    const normalized = normalizeEmail(email)
    if (!isValidEmail(normalized)) {
      setError('Veuillez entrer une adresse e-mail valide')
      return
    }

    setLoading(true)
    setError('')

    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      })

      if (authError) {
        setError(
          authError.message.includes('rate')
            ? 'Trop de tentatives. Patientez quelques minutes puis reessayez.'
            : 'Impossible d\'envoyer le lien. Verifiez l\'adresse e-mail et reessayez.'
        )
      } else {
        setEmail(normalized)
        setStep('sent')
      }
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }

  const maskedEmail = email ? formatMaskedEmail(email) : ''

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold">Dourou</h1>
          <p className="text-slate-400 text-sm mt-1">دورو</p>
        </div>

        <Card className="p-6">
          {step === 'email' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">
                Connectez-vous
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Nous vous enverrons un lien securise par e-mail — sans mot de passe
              </p>

              <Input
                label="Adresse e-mail"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                error={error || undefined}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
              />

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-6"
                onClick={handleSendMagicLink}
                loading={loading}
              >
                Envoyer le lien de connexion
              </Button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <DemoButton
                variant="outline"
                label="Essayer la démo (sans compte)"
                className="w-full"
              />
              <p className="text-slate-500 text-xs text-center mt-3">
                Explorez l&apos;application avec des données de démonstration,
                sans inscription.
              </p>
              <LegalDisclaimer className="mt-6 text-center" />
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-gold" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2 text-center">
                Consultez votre boite mail
              </h2>
              <p className="text-slate-400 text-sm mb-2 text-center">
                Un lien de connexion a ete envoye a
              </p>
              <p className="text-white text-sm font-medium text-center mb-6">
                {maskedEmail}
              </p>
              <p className="text-slate-500 text-xs text-center mb-6">
                Cliquez sur le lien dans l&apos;e-mail pour acceder a votre tableau de bord.
                Le lien expire apres quelques minutes.
              </p>

              {error && (
                <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
              )}

              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => {
                  setStep('email')
                  setError('')
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2 inline" />
                Utiliser une autre adresse
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  disabled={loading}
                  className="text-gold text-sm hover:underline disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : 'Renvoyer le lien'}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  )
}
