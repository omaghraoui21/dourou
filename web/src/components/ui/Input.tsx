'use client'

import { cn } from '@/lib/utils'

interface InputProps {
  label?: string
  error?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  prefix?: string
}

export function Input({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  className,
  prefix,
}: InputProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white',
            'placeholder:text-slate-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold',
            'transition-colors duration-200',
            prefix && 'pl-14',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
