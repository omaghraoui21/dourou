import Link from 'next/link'
import { Eye, BarChart3, Shield, Users, Send, CreditCard, Trophy } from 'lucide-react'
import { DemoButton } from '@/components/demo/DemoButton'

const features = [
  {
    icon: Eye,
    title: 'Transparence totale',
    description: 'Chaque membre voit tous les paiements et statuts en temps reel',
  },
  {
    icon: BarChart3,
    title: 'Suivi intelligent',
    description: 'Suivez les contributions, tours et echeances automatiquement',
  },
  {
    icon: Shield,
    title: 'Score de confiance',
    description: 'Gagnez en reputation grace a votre ponctualite',
  },
]

const steps = [
  {
    number: 1,
    title: 'Creez votre tontine',
    description: 'Definissez le nom, le montant et la frequence des cotisations',
    icon: Users,
  },
  {
    number: 2,
    title: 'Invitez vos membres',
    description: 'Partagez le code d\'invitation avec vos proches',
    icon: Send,
  },
  {
    number: 3,
    title: 'Suivez les paiements',
    description: 'Declarez et confirmez les contributions en toute transparence',
    icon: CreditCard,
  },
  {
    number: 4,
    title: 'Recevez votre tour',
    description: 'Rotation automatique des beneficiaires selon votre logique choisie',
    icon: Trophy,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold">Dourou</span>
            <span className="text-lg text-slate-400">دورو</span>
          </div>
          <Link
            href="/auth"
            className="px-4 py-2 bg-gold text-slate-900 rounded-xl font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            Connexion
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Dourou <span className="text-gold">دورو</span>
          </h1>
          <p className="text-xl md:text-2xl text-gold-light mb-6">
            La confiance numerisee pour les tontines tunisiennes
          </p>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Digitalisez la gestion de vos tontines (جمعية) en Tunisie. Suivez les
            contributions, gerez les tours et renforcez la confiance entre membres
            grace a une plateforme transparente et moderne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="px-8 py-3 bg-gold text-slate-900 rounded-xl font-semibold text-base hover:bg-gold-light transition-colors inline-flex items-center justify-center"
            >
              Commencer
            </Link>
            <DemoButton label="Essayer la demo (sans compte)" />
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Testez l&apos;application immediatement, sans inscription ni configuration.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Pourquoi Dourou ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Comment ca marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                  <span className="text-gold font-bold text-sm">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Pret a digitaliser votre tontine ?
          </h2>
          <p className="text-slate-400 mb-8">
            Rejoignez des centaines de Tunisiens qui gerent deja leurs tontines
            avec Dourou.
          </p>
          <Link
            href="/auth"
            className="px-8 py-3 bg-gold text-slate-900 rounded-xl font-semibold text-base hover:bg-gold-light transition-colors inline-flex items-center justify-center"
          >
            Commencer gratuitement
          </Link>
          <div className="mt-4">
            <DemoButton label="Ou explorer la demo" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gold font-bold">Dourou</span>
            <span className="text-slate-500 text-sm">2024 - Fabrique en Tunisie 🇹🇳</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">
              Mentions legales
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Confidentialite
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
