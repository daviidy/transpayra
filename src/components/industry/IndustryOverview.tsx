'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CompanyLogo } from '../CompanyLogo'
import type { IndustryOverviewData } from '@/app/actions/industry-overview'

interface IndustryOverviewProps {
  data: IndustryOverviewData
  initialLocation?: string
}

export function IndustryOverview({ data, initialLocation }: IndustryOverviewProps) {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [unlocked, setUnlocked] = useState(false)

  const formatCurrency = (amount: number) => {
    return `$${Math.round(amount).toLocaleString('en-US')}`
  }

  const formatShortCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    const thousands = Math.round(num / 1000)
    return `${thousands}K`
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

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
    const params = new URLSearchParams()
    if (location !== 'all') params.set('location', location)
    router.push(`/salaries/industry/${data.industrySlug}?${params.toString()}`)
  }

  // Show only first 3 submissions unless unlocked
  const visibleSubmissions = unlocked ? data.submissions : data.submissions.slice(0, 3)
  const lockedSubmissions = unlocked ? [] : data.submissions.slice(3)

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
        <div className="flex flex-wrap gap-6 items-center justify-between">
          {/* Salary Cards */}
          <div className="flex flex-wrap gap-4 flex-1">
            {data.topRoles.map((role) => (
              <div key={role.jobTitleId} className="bg-white rounded-lg shadow-md p-6 min-w-[200px]">
                <h3 className="text-gray-700 font-medium mb-2">{role.jobTitle}</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(role.medianSalary)}</p>
              </div>
            ))}
          </div>

          {/* Location Dropdown */}
          <div className="flex-shrink-0">
            <select
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Choose Location</option>
              {data.topLocations.map((loc) => (
                <option key={loc.locationId} value={loc.slug}>
                  {loc.city}
                  {loc.state && `, ${loc.state}`}, {loc.country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contribution CTA */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center">
          <Link
            href="/contribute"
            className="inline-block bg-white border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            💪 Contribute Your Salary
          </Link>
        </div>
      </div>

      {/* Explore Salaries Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Salaries</h2>

          {/* Search and Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex gap-4 flex-1">
              <input
                type="text"
                placeholder="Search City, Tag, Etc"
                className="flex-1 max-w-md bg-white border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Filters</option>
                <option>Experience Level</option>
                <option>Company Size</option>
                <option>Job Family</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                🔔 Subscribe
              </button>
              <Link
                href="/contribute"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
                <th className="text-left py-4 px-6 font-semibold">Years of Experience</th>
                <th className="text-left py-4 px-6 font-semibold">Total Compensation (USD)</th>
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
                      <p className="font-medium">{submission.jobTitle}</p>
                      <p className="text-sm text-gray-500">{submission.levelName || '–'}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p>
                      {submission.yearsOfExperience} / {submission.yearsAtCompany}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-lg">{formatCurrency(submission.totalCompensation)}</p>
                      <p className="text-sm text-gray-500">
                        {formatShortCurrency(submission.baseSalary)} |{' '}
                        {formatShortCurrency(submission.stockCompensation)} |{' '}
                        {formatShortCurrency(submission.bonus)}
                      </p>
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
                          <p className="font-medium">{submission.jobTitle}</p>
                          <p className="text-sm text-gray-500">{submission.levelName || '–'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p>
                          {submission.yearsOfExperience} / {submission.yearsAtCompany}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-lg">{formatCurrency(submission.totalCompensation)}</p>
                          <p className="text-sm text-gray-500">
                            {formatShortCurrency(submission.baseSalary)} |{' '}
                            {formatShortCurrency(submission.stockCompensation)} |{' '}
                            {formatShortCurrency(submission.bonus)}
                          </p>
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock by Adding Your Salary!</h3>
                <p className="text-gray-600 mb-6">
                  Help the community by anonymously sharing your compensation. Takes under 60 seconds.
                </p>
                <button
                  onClick={() => router.push('/contribute')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
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

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Paying Companies */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Top Paying Companies</h3>
              <Link
                href="/leaderboard"
                className="bg-white border-2 border-blue-500 text-blue-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                🏆 See our Leaderboard
              </Link>
            </div>

            <div className="space-y-4">
              {data.topCompanies.map((company) => (
                <Link
                  key={company.companyId}
                  href={`/company/${company.companyId}?tab=salaries`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CompanyLogo companyName={company.companyName} logoUrl={company.companyLogo} size="sm" />
                    <span className="text-blue-600 font-medium hover:underline">{company.companyName}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(company.medianSalary)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Paying Locations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Top Paying Locations</h3>
              <Link
                href="/salaries/by-location"
                className="bg-white border-2 border-blue-500 text-blue-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                🌐 See all locations
              </Link>
            </div>

            <div className="space-y-4">
              {data.topLocations.map((location) => (
                <Link
                  key={location.locationId}
                  href={`/salaries/location/${location.slug}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-red-500">📍</span>
                    <span className="text-blue-600 font-medium hover:underline">
                      {location.city}
                      {location.state && `, ${location.state}`}, {location.country}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(location.medianSalary)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
