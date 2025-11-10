'use client'

import { Link } from '@/i18n/routing'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useTranslations } from 'next-intl'

interface SearchStatsCardProps {
  average: number
  submissionCount: number
  filterName: string | null
}

export function SearchStatsCard({
  average,
  submissionCount,
  filterName,
}: SearchStatsCardProps) {
  const t = useTranslations()
  const { formatAmount } = useCurrency()

  const formatStat = (amount: number) => {
    return formatAmount(amount, 'XOF')
  }

  return (
    <section className="bg-gray-50 rounded-lg p-8 mb-8">
      <div className="flex items-center justify-between">
        {/* Left Side - Salary Info */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{t('search.averageBaseSalary')}</p>
          <p className="text-4xl font-bold text-black mb-4">
            {formatStat(average)}
          </p>
          <Link
            href="/contribute"
            className="inline-block bg-brand-secondary hover:bg-brand-accent text-white font-medium px-6 py-2 rounded-md transition-colors"
          >
            {t('search.shareYourSalary')}
          </Link>
        </div>

        {/* Right Side - Illustration */}
        <div className="flex-shrink-0 ml-8 hidden md:block">
          <svg width="120" height="80" viewBox="0 0 120 80" className="text-brand-secondary">
            {/* Coins */}
            <circle cx="90" cy="25" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="100" cy="35" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="80" cy="35" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            {/* Job Papers */}
            <rect x="20" y="15" width="50" height="35" rx="4" fill="currentColor" opacity="0.1" />
            <rect x="25" y="20" width="40" height="3" fill="currentColor" opacity="0.3" />
            <rect x="25" y="26" width="30" height="2" fill="currentColor" opacity="0.2" />
            <rect x="25" y="30" width="35" height="2" fill="currentColor" opacity="0.2" />
            <rect x="15" y="25" width="50" height="35" rx="4" fill="currentColor" opacity="0.15" />
            <rect x="20" y="30" width="40" height="3" fill="currentColor" opacity="0.4" />
            <rect x="20" y="36" width="30" height="2" fill="currentColor" opacity="0.3" />
            <rect x="20" y="40" width="35" height="2" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* Bottom: Fine Print */}
      <div className="text-sm text-gray-500 mt-6">
        <p>
          {t('search.basedOn', { count: submissionCount })}{' '}
          {submissionCount === 1 ? t('location.submission') : t('location.submissions')}. {t('search.lastUpdated')}{' '}
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </section>
  )
}
