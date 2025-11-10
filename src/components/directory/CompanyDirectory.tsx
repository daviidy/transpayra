'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { CompanyLogo } from '../CompanyLogo'
import { WhatsAppBanner } from './WhatsAppBanner'
import { getCompaniesWithSubmissions } from '@/app/actions/directories'
import type { CompanyWithSubmissions } from '@/app/actions/directories'
import { useTranslations } from 'next-intl'

export function CompanyDirectory() {
  const t = useTranslations()
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
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{t('directory.company.title')}</h1>
        <p className="text-gray-600 text-lg">
          {t('directory.company.subtitle')}
        </p>
      </div>

      {/* Search Input and Promotional Banner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Search Input (Left Side - 2/3 width) */}
        <div className="lg:col-span-2">
          <label htmlFor="companySearch" className="block text-sm font-medium text-gray-700 mb-3">
            {t('directory.company.companyName')}
          </label>
          <div className="relative">
            <input
              type="text"
              id="companySearch"
              placeholder={t('directory.company.searchPlaceholder')}
              className="w-full px-6 py-4 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* WhatsApp Community Banner (Right Side - 1/3 width) */}
        <div className="hidden lg:block">
          <WhatsAppBanner />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">{t('directory.company.loading')}</div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('directory.company.noResults', { query: searchQuery })}
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
