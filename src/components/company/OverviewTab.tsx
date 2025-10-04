'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, MapPin } from 'lucide-react'
import { SalaryCard } from '../SalaryCard'
import { getCompanySalaries, getCompanyLocations } from '@/app/actions/companies'
import type { CompanyDetails, CompanySalarySubmission, CompanyLocation } from '@/app/actions/companies'

interface OverviewTabProps {
  companyId: number
  company: CompanyDetails
  onViewAllSalaries: () => void
}

export function OverviewTab({ companyId, company, onViewAllSalaries }: OverviewTabProps) {
  const [recentSubmissions, setRecentSubmissions] = useState<CompanySalarySubmission[]>([])
  const [locations, setLocations] = useState<CompanyLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [submissions, locs] = await Promise.all([
        getCompanySalaries(companyId, 6),
        getCompanyLocations(companyId),
      ])
      setRecentSubmissions(submissions)
      setLocations(locs)
      setLoading(false)
    }

    fetchData()
  }, [companyId])

  const description = company.description || ''
  const isLongDescription = description.length > 200

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* About Section */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-black mb-4">About</h2>
        {description ? (
          <>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {showFullDescription || !isLongDescription
                ? description
                : `${description.slice(0, 200)}...`}
            </p>
            {isLongDescription && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-brand-secondary hover:text-brand-accent font-medium mt-3"
              >
                {showFullDescription ? 'Show less' : 'Read more'}
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">
            No description available yet.
          </p>
        )}
      </section>

      {/* Quick Facts */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Quick Facts</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {company.headquarters && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Headquarters</div>
              <div className="font-medium text-black">{company.headquarters}</div>
            </div>
          )}
          {company.founded && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Founded</div>
              <div className="font-medium text-black">{company.founded}</div>
            </div>
          )}
          {company.companyType && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Type</div>
              <div className="font-medium text-black">{company.companyType}</div>
            </div>
          )}
          {company.website && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Website</div>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-secondary hover:text-brand-accent flex items-center gap-1"
              >
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {company.industry && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Industry</div>
              <div className="font-medium text-black">{company.industry}</div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Submissions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">Recent Salary Submissions</h2>
          <button
            onClick={onViewAllSalaries}
            className="text-sm font-medium text-brand-secondary hover:text-brand-accent"
          >
            View all →
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : recentSubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No salary submissions yet. <Link href="/contribute" className="text-brand-secondary hover:underline">Be the first to contribute!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSubmissions.map((submission) => (
              <SalaryCard
                key={submission.submissionId}
                id={submission.submissionId}
                company={company.name}
                companyLogoUrl={company.logoUrl}
                jobTitle={submission.jobTitle}
                location={`${submission.city}, ${submission.country}`}
                baseSalary={submission.baseSalary}
                bonus={submission.bonus || '0'}
                stockCompensation={submission.stockCompensation || '0'}
                yearsOfExperience={submission.yearsOfExperience}
                level={submission.levelName}
              />
            ))}
          </div>
        )}
      </section>

      {/* Locations */}
      {locations.length > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Locations</h2>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc, index) => {
              const locationString = loc.state
                ? `${loc.city}, ${loc.state}, ${loc.country}`
                : `${loc.city}, ${loc.country}`
              return (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary rounded-full text-sm"
                >
                  <MapPin className="w-4 h-4 text-brand-secondary" />
                  <span className="font-medium text-brand-secondary">{locationString}</span>
                  <span className="text-gray-600">({loc.submissionCount})</span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
