export function LegalDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-slate-500 leading-relaxed ${className}`}>
      Dourou est un outil de suivi et de transparence pour les tontines entre particuliers.
      Nous ne sommes ni une banque, ni un portefeuille électronique, ni un service de paiement
      réglementé. Les fonds circulent directement entre les membres ; Dourou ne détient ni ne
      transfère aucune somme d&apos;argent.
    </p>
  )
}
