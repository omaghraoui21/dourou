'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">
        Une erreur est survenue
      </h2>
      <p className="text-slate-400 text-sm mb-6 max-w-md">
        Nous n&apos;avons pas pu charger cette page. Veuillez reessayer.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-light text-slate-900 rounded-xl font-medium text-sm transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Reessayer
      </button>
    </div>
  )
}
