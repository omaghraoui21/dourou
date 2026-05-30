import { getTrustTier } from '@/lib/utils'

interface TrustScoreDisplayProps {
  score: number
}

export function TrustScoreDisplay({ score }: TrustScoreDisplayProps) {
  const tier = getTrustTier(score)
  const percentage = (score / 5) * 100
  // SVG circle parameters
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      {/* Circular display */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-gold"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score.toFixed(1)}</span>
          <span className="text-xs text-slate-400">/5.0</span>
        </div>
      </div>

      {/* Tier name */}
      <p className={`text-sm font-semibold mt-3 ${tier.color}`}>
        {tier.name}
      </p>
    </div>
  )
}
