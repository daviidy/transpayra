'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SalaryResult } from '@/app/actions/search-salaries'
import { checkUserHasAccess } from '@/app/actions/check-access'
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Currency } from '@/lib/currency'

interface SalaryResultsListProps {
  results: SalaryResult[]
}

export function SalaryResultsList({ results }: SalaryResultsListProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const router = useRouter()
  const { token } = useAnonymousToken()
  const { user } = useAuth()
  const { formatAmount } = useCurrency()

  // Check if user has access on mount
  useEffect(() => {
    async function verifyAccess() {
      const hasAccess = await checkUserHasAccess(token, user?.id)
      setUnlocked(hasAccess)
      setCheckingAccess(false)
    }

    verifyAccess()
  }, [token, user])

  const formatCurrencyWithConversion = (
    amount: string | number | undefined,
    fromCurrency: string
  ) => {
    if (!amount) return 'N/A'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return formatAmount(num, fromCurrency as Currency)
  }

  const formatShortCurrencyWithConversion = (
    amount: string | number | undefined,
    fromCurrency: string
  ) => {
    if (!amount) return 'N/A'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return formatAmount(num, fromCurrency as Currency, { compact: true })
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

  const visibleSubmissions = unlocked ? results : results.slice(0, 2)
  const lockedSubmissions = unlocked ? [] : results.slice(2)

  return (
    <div className="space-y-4">
      {/* Visible Cards */}
      {visibleSubmissions.map((submission) => (
        <Link
          key={submission.submissionId}
          href={`/submission/${submission.submissionId}`}
          className="block"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-brand-secondary cursor-pointer">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Company Info */}
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Company</p>
                <h3 className="text-xl font-bold text-brand-secondary hover:text-brand-accent mb-2">
                  {submission.company}
                </h3>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1 mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {submission.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {getTimeAgo(submission.submissionDate)}
                  </div>
                </div>
              </div>

              {/* Role & Level */}
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Role & Level</p>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {submission.level || 'Not specified'}
                </h3>
                <div className="text-sm text-gray-600">{submission.jobTitle}</div>
              </div>

              {/* Experience */}
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Experience</p>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {submission.yearsOfExperience}
                    </div>
                    <div className="text-sm text-gray-500">Years Total</div>
                  </div>
                  <div className="h-12 w-px bg-gray-300"></div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {submission.yearsAtCompany}
                    </div>
                    <div className="text-sm text-gray-500">At Company</div>
                  </div>
                </div>
              </div>

              {/* Total Compensation */}
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Compensation</p>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrencyWithConversion(submission.totalCompensation, submission.currency)}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Base:</span>
                    <span className="font-medium">
                      {formatShortCurrencyWithConversion(submission.baseSalary, submission.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span className="font-medium">
                      {formatShortCurrencyWithConversion(submission.stockCompensation, submission.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus:</span>
                    <span className="font-medium">
                      {formatShortCurrencyWithConversion(submission.bonus, submission.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}

      {/* Locked Content */}
      {lockedSubmissions.length > 0 && !unlocked && (
        <div className="relative">
          {/* Blurred Cards */}
          <div className="blur-[3px] pointer-events-none space-y-4">
            {lockedSubmissions.slice(0, 3).map((submission, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-brand-secondary"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Company Info */}
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Company</p>
                    <h3 className="text-xl font-bold text-brand-secondary mb-2">
                      {submission.company}
                    </h3>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {submission.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {getTimeAgo(submission.submissionDate)}
                      </div>
                    </div>
                  </div>

                  {/* Role & Level */}
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Role & Level</p>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {submission.level || 'Not specified'}
                    </h3>
                    <div className="text-sm text-gray-600">{submission.jobTitle}</div>
                  </div>

                  {/* Experience */}
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Experience</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-800">
                          {submission.yearsOfExperience}
                        </div>
                        <div className="text-sm text-gray-500">Years Total</div>
                      </div>
                      <div className="h-12 w-px bg-gray-300"></div>
                      <div>
                        <div className="text-2xl font-bold text-gray-800">
                          {submission.yearsAtCompany}
                        </div>
                        <div className="text-sm text-gray-500">At Company</div>
                      </div>
                    </div>
                  </div>

                  {/* Total Compensation */}
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Compensation</p>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                      {formatCurrencyWithConversion(submission.totalCompensation, submission.currency)}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Base:</span>
                        <span className="font-medium">
                          {formatShortCurrencyWithConversion(submission.baseSalary, submission.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock:</span>
                        <span className="font-medium">
                          {formatShortCurrencyWithConversion(submission.stockCompensation, submission.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus:</span>
                        <span className="font-medium">
                          {formatShortCurrencyWithConversion(submission.bonus, submission.currency)}
                        </span>
                      </div>
                    </div>
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
                  id="already-added"
                  checked={unlocked}
                  onChange={(e) => setUnlocked(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
                />
                <label htmlFor="already-added" className="cursor-pointer">
                  Added mine already within last 1 year
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
