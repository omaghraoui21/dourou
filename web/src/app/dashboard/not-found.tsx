import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">
        Page introuvable
      </h2>
      <p className="text-slate-400 text-sm mb-6 max-w-md">
        La page que vous recherchez n&apos;existe pas ou a ete deplacee.
      </p>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-light text-slate-900 rounded-xl font-medium text-sm transition-colors"
      >
        <Home className="w-4 h-4" />
        Retour au tableau de bord
      </Link>
    </div>
  )
}
