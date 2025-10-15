'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WhatsAppBanner } from './WhatsAppBanner'
import { getIndustriesWithSubmissions } from '@/app/actions/directories'
import type { IndustryWithSubmissions } from '@/app/actions/directories'

export function TitleDirectory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [industries, setIndustries] = useState<IndustryWithSubmissions[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchIndustries() {
      setLoading(true)
      const data = await getIndustriesWithSubmissions()
      setIndustries(data)
      setLoading(false)
    }

    fetchIndustries()
  }, [])

  const filteredIndustries = industries.filter((ind) =>
    ind.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Search by Industry</h1>
        <p className="text-gray-600 text-lg">
          Explore salaries across different industries.
        </p>
      </div>

      {/* Search Input and Promotional Banner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Search Input (Left Side - 2/3 width) */}
        <div className="lg:col-span-2">
          <label htmlFor="industrySearch" className="block text-sm font-medium text-gray-700 mb-3">
            Industry Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="industrySearch"
              placeholder="Search industries..."
              className="w-full px-6 py-4 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* WhatsApp Community Banner (Right Side - 1/3 width) */}
        <WhatsAppBanner />
      </div>

      {/* Industries Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading industries...</div>
      ) : filteredIndustries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No industries found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredIndustries.map((industry) => (
            <Link
              key={industry.industryId}
              href={`/salaries/industry/${industry.slug}`}
              className="bg-white hover:bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors duration-200 hover:shadow-md min-h-[140px] border border-gray-200"
            >
              {industry.icon && (
                <span className="text-4xl" role="img" aria-label={industry.name}>
                  {industry.icon}
                </span>
              )}
              <span className="text-brand-secondary hover:underline font-medium text-center">
                {industry.name}
              </span>
              <span className="text-sm text-gray-500">
                {industry.submissionCount} {industry.submissionCount === 1 ? 'submission' : 'submissions'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
