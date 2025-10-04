'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { LocationSalaryData } from '@/app/actions/salary-breakdown'

interface LocationSalaryBreakdownProps {
  data: LocationSalaryData
  initialRole?: string
  initialLevel?: string
}

export function LocationSalaryBreakdown({ data, initialRole, initialLevel }: LocationSalaryBreakdownProps) {
  const router = useRouter()
  const [selectedLevel, setSelectedLevel] = useState(initialLevel || 'all')

  const formatCurrency = (amount: number) => {
    return `$${Math.round(amount / 1000)}K`
  }

  const formatCurrencyLong = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level)
    // TODO: Implement level filtering
    // For now, just update the URL
    const params = new URLSearchParams()
    if (initialRole) params.set('role', initialRole)
    if (level !== 'all') params.set('level', level)
    router.push(`/salaries/location/${data.locationSlug}?${params.toString()}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">
          {data.jobTitleName} Salary in {data.locationName}
        </h1>
      </div>

      {/* Hero Stats Card */}
      <div className="bg-white rounded-2xl shadow-lg mb-12 overflow-hidden">
        {/* Top Section */}
        <div className="p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
            {/* Left: Main Salary */}
            <div className="mb-6 lg:mb-0">
              <div className="text-5xl font-bold mb-2" style={{ color: '#00b1fe' }}>
                {formatCurrencyLong(data.stats.median)}
              </div>
              <div className="text-gray-600 text-lg">Median Total Comp</div>
            </div>

            {/* Center: Percentile Stats */}
            <div className="flex flex-wrap gap-6 mb-6 lg:mb-0">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#66d1ff' }}>
                  {formatCurrency(data.stats.p25)}
                </div>
                <div className="text-gray-500 text-sm">25th percentile</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#00b1fe' }}>
                  {formatCurrency(data.stats.p75)}
                </div>
                <div className="text-gray-500 text-sm">75th percentile</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#0080c0' }}>
                  {formatCurrency(data.stats.p90)}
                </div>
                <div className="text-gray-500 text-sm">90th percentile</div>
              </div>
            </div>

            {/* Right: Level Dropdown */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent shadow-sm"
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="staff">Staff Level</option>
                <option value="principal">Principal Level</option>
              </select>
            </div>
          </div>

          {/* Middle Row: CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/contribute"
              className="text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              style={{ backgroundColor: '#00b1fe' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0099e0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00b1fe')}
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
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Contribute Your Salary</span>
            </Link>
            <button className="bg-brand-secondary hover:bg-brand-accent text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200">
              View Jobs
            </button>
          </div>

          {/* Bottom Row: Fine Print */}
          <div className="text-center text-gray-500 text-sm mb-6">
            <p>
              Salary ranges are based on {data.stats.count} anonymous submissions from verified
              employees. Last updated: {formatDate(data.stats.lastUpdated)}
            </p>
          </div>
        </div>
      </div>

      {/* Compensation Distribution Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Compensation Distribution
        </h2>

        {/* Chart Container */}
        <div className="relative">
          {/* Percentile Markers */}
          <div className="flex justify-between mb-4 text-sm px-4">
            <div className="text-center">
              <div className="font-semibold" style={{ color: '#00b1fe' }}>25th</div>
              <div className="w-px h-4 mx-auto" style={{ backgroundColor: '#00b1fe' }}></div>
            </div>
            <div className="text-center">
              <div className="font-semibold" style={{ color: '#00b1fe' }}>Median</div>
              <div className="w-px h-4 mx-auto" style={{ backgroundColor: '#00b1fe' }}></div>
            </div>
            <div className="text-center">
              <div className="font-semibold" style={{ color: '#00b1fe' }}>75th</div>
              <div className="w-px h-4 mx-auto" style={{ backgroundColor: '#00b1fe' }}></div>
            </div>
            <div className="text-center">
              <div className="font-semibold" style={{ color: '#0080c0' }}>90th</div>
              <div className="w-px h-4 mx-auto" style={{ backgroundColor: '#0080c0' }}></div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-64 bg-gray-50 rounded-lg p-4 gap-1">
            {/* Simple visualization bars - in production, use a chart library */}
            <div className="flex-1 rounded-t" style={{ height: '20%', backgroundColor: '#66d1ff' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '35%', backgroundColor: '#66d1ff' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '50%', backgroundColor: '#33c1ff' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '70%', backgroundColor: '#33c1ff' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '85%', backgroundColor: '#33c1ff' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '100%', backgroundColor: '#00b1fe' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '95%', backgroundColor: '#00b1fe' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '80%', backgroundColor: '#00b1fe' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '65%', backgroundColor: '#0099e0' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '50%', backgroundColor: '#0099e0' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '35%', backgroundColor: '#0099e0' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '25%', backgroundColor: '#0080c0' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '15%', backgroundColor: '#0080c0' }}></div>
            <div className="flex-1 rounded-t" style={{ height: '10%', backgroundColor: '#0080c0' }}></div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between mt-4 text-sm text-gray-600 px-4">
            <span>{formatCurrency(data.stats.p25 * 0.6)}</span>
            <span>{formatCurrency(data.stats.p25 * 0.8)}</span>
            <span>{formatCurrency(data.stats.p25)}</span>
            <span>{formatCurrency(data.stats.median)}</span>
            <span>{formatCurrency(data.stats.p75)}</span>
            <span>{formatCurrency(data.stats.p90)}</span>
            <span>{formatCurrency(data.stats.p90 * 1.2)}</span>
            <span>{formatCurrency(data.stats.p90 * 1.3)}</span>
          </div>

          {/* Y-Axis Label */}
          <div className="absolute left-0 top-1/2 transform -rotate-90 -translate-y-1/2 -translate-x-8 text-sm text-gray-600 font-medium">
            Number of Reports
          </div>
        </div>

        {/* Chart Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Total Annual Compensation includes base salary, bonuses, and equity</p>
        </div>
      </div>
    </div>
  )
}
