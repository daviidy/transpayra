'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CompanyLogo } from '../CompanyLogo'
import type { IndustryOverviewData } from '@/app/actions/industry-overview'
import { useCurrency } from '@/contexts/CurrencyContext'

interface IndustryOverviewProps {
  data: IndustryOverviewData
}

export function IndustryOverview({ data }: IndustryOverviewProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const { formatAmount } = useCurrency()

  // Assume aggregated stats are in XOF (base currency)
  const formatCurrency = (amount: number) => {
    return formatAmount(amount, 'XOF')
  }

  const formatShortCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return formatAmount(num, 'XOF', { compact: true })
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    if (days < 14) return '1 week ago'
    return `${Math.floor(days / 7)} weeks ago`
  }

  // Filter submissions by search query
  const filteredSubmissions = data.submissions.filter((submission) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      submission.companyName.toLowerCase().includes(search) ||
      submission.jobTitle.toLowerCase().includes(search) ||
      submission.city.toLowerCase().includes(search) ||
      submission.country.toLowerCase().includes(search) ||
      (submission.state && submission.state.toLowerCase().includes(search)) ||
      (submission.levelName && submission.levelName.toLowerCase().includes(search))
    )
  })

  // Show only first 3 submissions unless unlocked
  const visibleSubmissions = unlocked ? filteredSubmissions : filteredSubmissions.slice(0, 3)
  const lockedSubmissions = unlocked ? [] : filteredSubmissions.slice(3)

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            {/* Industry Icon */}
            {data.industryIcon && (
              <div className="mb-4">
                <span className="text-5xl" role="img" aria-label={data.industryName}>
                  {data.industryIcon}
                </span>
              </div>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-8">{data.industryName} Industry</h1>
          </div>
        </div>
      </div>

      {/* Top Salary Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4">
          {data.topRoles.map((role) => (
            <div key={role.jobTitleId} className="bg-white rounded-lg shadow-md p-6 min-w-[200px]">
              <h3 className="text-gray-700 font-medium mb-2">{role.jobTitle}</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(role.medianSalary)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Explore Salaries Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Salaries</h2>

          {/* Search and Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <input
              type="text"
              placeholder="Search City, Company, Job Title, Etc"
              className="flex-1 max-w-md bg-white border border-gray-300 rounded-full px-6 py-3 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="flex gap-3">
              <Link
                href="/contribute"
                className="bg-brand-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-accent transition-colors"
              >
                Add Compensation
              </Link>
            </div>
          </div>
        </div>

        {/* Salary Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="text-left py-4 px-6 font-semibold">Company</th>
                <th className="text-left py-4 px-6 font-semibold">Job Family</th>
                <th className="text-left py-4 px-6 font-semibold">Experience</th>
                <th className="text-left py-4 px-6 font-semibold">Base Salary</th>
              </tr>
            </thead>
            <tbody>
              {/* Visible Rows */}
              {visibleSubmissions.map((submission, index) => (
                <tr
                  key={submission.submissionId}
                  className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        companyName={submission.companyName}
                        logoUrl={submission.companyLogo}
                        size="sm"
                      />
                      <div>
                        <Link
                          href={`/company/${submission.companyId}?tab=salaries`}
                          className="text-blue-600 font-medium hover:underline"
                        >
                          {submission.companyName}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {submission.city}
                          {submission.state && `, ${submission.state}`}, {submission.country} •{' '}
                          {getTimeAgo(submission.submissionDate)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-black">{submission.jobTitle}</p>
                      <p className="text-sm text-gray-500">{submission.levelName || '–'}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-black font-medium">{submission.yearsOfExperience} yrs total</p>
                      <p className="text-sm text-gray-500">{submission.yearsAtCompany} yrs at company</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-lg text-black">{formatShortCurrency(submission.baseSalary)}</p>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Blurred Rows */}
              {lockedSubmissions.length > 0 && (
                <>
                  {lockedSubmissions.slice(0, 2).map((submission, index) => (
                    <tr
                      key={`locked-${submission.submissionId}`}
                      className={`border-b border-gray-200 blur-sm ${
                        (visibleSubmissions.length + index) % 2 === 1 ? 'bg-gray-50' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <CompanyLogo
                            companyName={submission.companyName}
                            logoUrl={submission.companyLogo}
                            size="sm"
                          />
                          <div>
                            <a href="#" className="text-blue-600 font-medium">
                              {submission.companyName}
                            </a>
                            <p className="text-sm text-gray-500">
                              {submission.city}, {submission.country} • {getTimeAgo(submission.submissionDate)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-black">{submission.jobTitle}</p>
                          <p className="text-sm text-gray-500">{submission.levelName || '–'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-black font-medium">{submission.yearsOfExperience} yrs total</p>
                          <p className="text-sm text-gray-500">{submission.yearsAtCompany} yrs at company</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-lg text-black">{formatShortCurrency(submission.baseSalary)}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>

          {/* Unlock Gate Overlay */}
          {lockedSubmissions.length > 0 && (
            <div className="relative bg-white border-t border-gray-200 p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock by Adding Your Salary!</h3>
                <p className="text-gray-600 mb-6">
                  Help the community by anonymously sharing your compensation. Takes under 60 seconds.
                </p>
                <button
                  onClick={() => router.push('/contribute')}
                  className="bg-brand-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-accent transition-colors mb-4"
                >
                  + Add Salary
                </button>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    id="already-added"
                    className="rounded"
                    checked={unlocked}
                    onChange={(e) => setUnlocked(e.target.checked)}
                  />
                  <label htmlFor="already-added" className="text-sm text-gray-600">
                    Added mine already within last 1 year
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
