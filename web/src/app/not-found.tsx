import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gold mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-2">
        Page introuvable
      </h2>
      <p className="text-slate-400 text-sm mb-8 max-w-md">
        La page que vous recherchez n&apos;existe pas ou a ete deplacee.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-slate-900 rounded-xl font-medium transition-colors"
      >
        <Home className="w-5 h-5" />
        Retour a l&apos;accueil
      </Link>
    </div>
  )
}
