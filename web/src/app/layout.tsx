import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dourou.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dourou — Gestion transparente de tontines',
    template: '%s | Dourou',
  },
  description:
    'Plateforme tunisienne de suivi et transparence pour les tontines (جمعية). Suivez les cotisations, gérez les tours et renforcez la confiance entre membres.',
  keywords: [
    'tontine',
    'جمعية',
    'Tunisie',
    'gestion tontine',
    'transparence',
    'cotisation',
  ],
  authors: [{ name: 'Dourou' }],
  creator: 'Dourou',
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    url: siteUrl,
    siteName: 'Dourou',
    title: 'Dourou — Gestion transparente de tontines',
    description:
      'Suivez vos tontines en toute transparence. Dourou facilite le suivi des cotisations et des tours entre membres, sans détenir vos fonds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dourou — Gestion transparente de tontines',
    description:
      'Plateforme tunisienne de suivi et transparence pour les tontines entre particuliers.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-background text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
