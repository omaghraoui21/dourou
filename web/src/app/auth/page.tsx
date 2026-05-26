'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const validatePhone = (value: string): boolean => {
    const digits = value.replace(/\s/g, '')
    return /^\d{8}$/.test(digits)
  }

  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      setError('Veuillez entrer un numero de telephone valide (8 chiffres)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: `+216${phone.replace(/\s/g, '')}`,
      })

      if (authError) {
        setError(authError.message)
      } else {
        setStep('otp')
        setCountdown(60)
      }
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const code = newOtp.join('')
      if (code.length === 6) {
        handleVerifyOtp(code)
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (code?: string) => {
    const token = code || otp.join('')
    if (token.length !== 6) {
      setError('Veuillez entrer le code a 6 chiffres')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.verifyOtp({
        phone: `+216${phone.replace(/\s/g, '')}`,
        token,
        type: 'sms',
      })

      if (authError) {
        setError(authError.message)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: `+216${phone.replace(/\s/g, '')}`,
      })

      if (authError) {
        setError(authError.message)
      } else {
        setCountdown(60)
        setOtp(['', '', '', '', '', ''])
      }
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }

  const maskedPhone = phone
    ? `+216 ${phone.slice(0, 2)} *** ${phone.slice(-3)}`
    : ''

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold">Dourou</h1>
          <p className="text-slate-400 text-sm mt-1">دورو</p>
        </div>

        <Card className="p-6">
          {step === 'phone' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">
                Connectez-vous
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Nous vous enverrons un code de verification par SMS
              </p>

              <Input
                label="Numero de telephone"
                prefix="+216"
                type="tel"
                placeholder="98 000 001"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setError('')
                }}
              />

              {error && (
                <p className="text-red-400 text-sm mt-3">{error}</p>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-6"
                onClick={handleSendOtp}
                loading={loading}
              >
                Envoyer le code
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">
                Verification
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Code envoye au {maskedPhone}
              </p>

              {/* OTP Input */}
              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-semibold bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => handleVerifyOtp()}
                loading={loading}
              >
                Verifier
              </Button>

              {/* Resend */}
              <div className="text-center mt-4">
                {countdown > 0 ? (
                  <p className="text-slate-500 text-sm">
                    Renvoyer le code dans {countdown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-gold text-sm hover:underline"
                  >
                    Renvoyer le code
                  </button>
                )}
              </div>

              {/* Back to phone */}
              <button
                onClick={() => {
                  setStep('phone')
                  setOtp(['', '', '', '', '', ''])
                  setError('')
                }}
                className="text-slate-400 text-sm mt-4 hover:text-white transition-colors block mx-auto"
              >
                Modifier le numero
              </button>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
