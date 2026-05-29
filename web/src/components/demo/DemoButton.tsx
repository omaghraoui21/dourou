'use client'

import { useRouter } from 'next/navigation'
import { enableDemoMode } from '@/lib/demo/mode'
import { FlaskConical } from 'lucide-react'

interface DemoButtonProps {
  className?: string
  variant?: 'primary' | 'outline'
  label?: string
}

export function DemoButton({
  className = '',
  variant = 'outline',
  label = 'Essayer la demo',
}: DemoButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    enableDemoMode()
    router.push('/dashboard?demo=1')
  }

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base transition-colors px-8 py-3'
  const styles =
    variant === 'primary'
      ? 'bg-gold text-slate-900 hover:bg-gold-light'
      : 'bg-transparent text-gold border border-gold/40 hover:bg-gold/10'

  return (
    <button type="button" onClick={handleClick} className={`${base} ${styles} ${className}`}>
      <FlaskConical className="w-4 h-4" />
      {label}
    </button>
  )
}
