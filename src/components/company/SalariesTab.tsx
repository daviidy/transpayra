'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getCompanySalaries } from '@/app/actions/companies'
import type { CompanySalarySubmission } from '@/app/actions/companies'

interface SalariesTabProps {
  companyId: number
  companyName: string
}

interface GroupedSubmissions {
  jobTitle: string
  submissions: CompanySalarySubmission[]
}

export function SalariesTab({ companyId, companyName }: SalariesTabProps) {
  const [submissions, setSubmissions] = useState<CompanySalarySubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getCompanySalaries(companyId)
      setSubmissions(data)
      setLoading(false)
    }

    fetchData()
  }, [companyId])

  const formatCurrency = (amount: string | number | undefined) => {
    if (!amount) return 'N/A'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `$${Math.round(num).toLocaleString('en-US')}`
  }

  const formatShortCurrency = (amount: string | number | undefined) => {
    if (!amount) return 'N/A'
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
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  const toggleSection = (jobTitle: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(jobTitle)) {
      newExpanded.delete(jobTitle)
    } else {
      newExpanded.add(jobTitle)
    }
    setExpandedSections(newExpanded)
  }

  // Group submissions by job title
  const groupedSubmissions: GroupedSubmissions[] = submissions.reduce((acc, submission) => {
    const existing = acc.find((g) => g.jobTitle === submission.jobTitle)
    if (existing) {
      existing.submissions.push(submission)
    } else {
      acc.push({
        jobTitle: submission.jobTitle,
        submissions: [submission],
      })
    }
    return acc
  }, [] as GroupedSubmissions[])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading salaries...</div>
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No salary data available for {companyName} yet.</p>
        <Link
          href="/contribute"
          className="inline-block px-6 py-3 bg-brand-secondary text-white font-medium rounded-lg hover:bg-brand-accent transition-colors"
        >
          + Add Salary
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-4">
        {groupedSubmissions.map((group) => {
          const isExpanded = expandedSections.has(group.jobTitle)
          const visibleSubmissions = unlocked ? group.submissions : group.submissions.slice(0, 3)
          const lockedSubmissions = unlocked ? [] : group.submissions.slice(3)

          return (
            <div key={group.jobTitle} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Job Title Header - Clickable */}
              <button
                onClick={() => toggleSection(group.jobTitle)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-black">{group.jobTitle}</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    {group.submissions.length} {group.submissions.length === 1 ? 'submission' : 'submissions'}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div>
                  {/* Table Header */}
                  <div className="bg-gray-50 border-t border-b border-gray-200">
                    <div className="grid grid-cols-4 gap-4 px-6 py-4 text-sm font-semibold text-gray-700">
                      <div>Company</div>
                      <div>Level Name</div>
                      <div>Years of Experience</div>
                      <div>Total Compensation (USD)</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {/* Visible Rows */}
                    {visibleSubmissions.map((submission) => (
                      <Link
                        key={submission.submissionId}
                        href={`/submission/${submission.submissionId}`}
                        className="grid grid-cols-4 gap-4 px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-brand-secondary font-bold hover:text-brand-accent">
                            {companyName}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>
                              {submission.city}
                              {submission.state && `, ${submission.state}`}, {submission.country}
                            </div>
                            <div>{getTimeAgo(submission.submissionDate)}</div>
                          </div>
                        </div>
                        <div>
                          <div className={submission.levelName ? 'font-medium' : 'text-gray-500'}>
                            {submission.levelName || '–'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{submission.jobTitle}</div>
                        </div>
                        <div>
                          <div className="font-medium">{submission.yearsOfExperience} yrs</div>
                          <div className="text-sm text-gray-600 mt-1">{submission.yearsAtCompany} yrs</div>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-black">
                            {formatCurrency(submission.totalCompensation)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {formatShortCurrency(submission.baseSalary)} |{' '}
                            {formatShortCurrency(submission.stockCompensation)} |{' '}
                            {formatShortCurrency(submission.bonus)}
                          </div>
                        </div>
                      </Link>
                    ))}

                    {/* Locked Content */}
                    {lockedSubmissions.length > 0 && !unlocked && (
                      <div className="relative">
                        {/* Blurred Rows */}
                        <div className="blur-[3px] pointer-events-none">
                          {lockedSubmissions.slice(0, 3).map((submission, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-4 gap-4 px-6 py-5 hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <div className="text-brand-secondary font-bold">{companyName}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <div>
                                    {submission.city}, {submission.country}
                                  </div>
                                  <div>{getTimeAgo(submission.submissionDate)}</div>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">{submission.levelName || '–'}</div>
                                <div className="text-sm text-gray-600 mt-1">{submission.jobTitle}</div>
                              </div>
                              <div>
                                <div className="font-medium">{submission.yearsOfExperience} yrs</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {submission.yearsAtCompany} yrs
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-lg text-black">
                                  {formatCurrency(submission.totalCompensation)}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {formatShortCurrency(submission.baseSalary)} |{' '}
                                  {formatShortCurrency(submission.stockCompensation)} |{' '}
                                  {formatShortCurrency(submission.bonus)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Paywall Overlay */}
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background:
                              'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,1) 100%)',
                          }}
                        >
                          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md mx-4 text-center">
                            <div className="mb-4">
                              <svg
                                className="w-12 h-12 text-brand-secondary mx-auto mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">
                              Unlock by Adding Your Salary!
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Add your salary anonymously in less than 60 seconds and continue exploring all
                              the data.
                            </p>

                            <button
                              onClick={() => router.push('/contribute')}
                              className="w-full bg-brand-secondary hover:bg-brand-accent text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
                            >
                              + Add Salary
                            </button>

                            <div className="flex items-center justify-center text-sm text-gray-600">
                              <input
                                type="checkbox"
                                id={`already-added-${group.jobTitle}`}
                                checked={unlocked}
                                onChange={(e) => setUnlocked(e.target.checked)}
                                className="mr-2 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
                              />
                              <label htmlFor={`already-added-${group.jobTitle}`} className="cursor-pointer">
                                Added mine already within last 1 year
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
