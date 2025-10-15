'use client'

import Link from 'next/link'
import { useCurrency } from '@/contexts/CurrencyContext'

interface SearchStatsCardProps {
  median: number
  p25: number
  p75: number
  p90: number
  submissionCount: number
  filterName: string | null
}

export function SearchStatsCard({
  median,
  p25,
  p75,
  p90,
  submissionCount,
  filterName,
}: SearchStatsCardProps) {
  const { selectedCurrency, formatAmount } = useCurrency()

  // For aggregated stats, we assume they're in XOF (the default currency)
  // In a production app, you'd want to convert all salaries to a common currency before aggregating
  const formatStat = (amount: number) => {
    return formatAmount(amount, 'XOF')
  }

  const formatStatCompact = (amount: number) => {
    return formatAmount(amount, 'XOF', { compact: true })
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg mb-12 overflow-hidden">
      {/* Top Section */}
      <div className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          {/* Left: Main Salary */}
          <div className="mb-6 lg:mb-0">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {formatStat(median)}
            </div>
            <div className="text-gray-600 text-lg">Median Total Comp</div>
          </div>

          {/* Center: Percentile Stats */}
          <div className="flex flex-wrap gap-6 mb-6 lg:mb-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatStatCompact(p25)}
              </div>
              <div className="text-gray-500 text-sm">25th percentile</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatStatCompact(p75)}
              </div>
              <div className="text-gray-500 text-sm">75th percentile</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">
                {formatStatCompact(p90)}
              </div>
              <div className="text-gray-500 text-sm">90th percentile</div>
            </div>
          </div>
        </div>

        {/* Middle Row: CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/contribute"
            className="bg-brand-secondary hover:bg-brand-accent text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <span>Contribute Your Salary</span>
          </Link>
        </div>

        {/* Bottom Row: Fine Print */}
        <div className="text-center text-gray-500 text-sm mb-6">
          <p>
            Based on {submissionCount} anonymous{' '}
            {submissionCount === 1 ? 'submission' : 'submissions'}. Last updated:{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
