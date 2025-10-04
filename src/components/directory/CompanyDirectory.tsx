'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CompanyLogo } from '../CompanyLogo'
import { getCompaniesWithSubmissions } from '@/app/actions/directories'
import type { CompanyWithSubmissions } from '@/app/actions/directories'

export function CompanyDirectory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [companies, setCompanies] = useState<CompanyWithSubmissions[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true)
      const data = await getCompaniesWithSubmissions()
      setCompanies(data)
      setLoading(false)
    }

    fetchCompanies()
  }, [])

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Search for Company</h1>
        <p className="text-gray-600 text-lg">
          Search companies to explore salaries, benefits, and more.
        </p>
      </div>

      {/* Search Input and Promotional Banner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Search Input (Left Side - 2/3 width) */}
        <div className="lg:col-span-2">
          <label htmlFor="companySearch" className="block text-sm font-medium text-gray-700 mb-3">
            Company Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="companySearch"
              placeholder="Search companies..."
              className="w-full px-6 py-4 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Promotional Banner (Right Side - 1/3 width) */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          {/* Visual Cue: Numbered Circles */}
          <div className="flex space-x-2 mb-4">
            <div className="w-8 h-8 bg-brand-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="w-8 h-8 bg-brand-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="w-8 h-8 bg-brand-secondary text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Looking for the highest paying companies?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Check out our live leaderboard of top paying companies.
          </p>

          <Link
            href="/leaderboard"
            className="bg-brand-secondary hover:bg-brand-accent text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2 w-fit"
          >
            <span>View Now</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading companies...</div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No companies found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCompanies.map((company) => (
            <Link
              key={company.companyId}
              href={`/company/${company.companyId}?tab=salaries`}
              className="bg-gray-100 hover:bg-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-colors duration-200 hover:shadow-md min-h-[120px]"
            >
              <CompanyLogo
                companyName={company.name}
                logoUrl={company.logoUrl}
                size="md"
              />
              <span className="text-brand-secondary hover:underline font-medium text-center">
                {company.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
