'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SalaryResult } from '@/app/actions/search-salaries'
import { checkUserHasAccess } from '@/app/actions/check-access'
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken'
import { useAuth } from '@/contexts/AuthContext'

interface SalaryResultsListProps {
  results: SalaryResult[]
}

export function SalaryResultsList({ results }: SalaryResultsListProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const router = useRouter()
  const { token } = useAnonymousToken()
  const { user } = useAuth()

  // Check if user has access on mount
  useEffect(() => {
    async function verifyAccess() {
      const hasAccess = await checkUserHasAccess(token, user?.id)
      setUnlocked(hasAccess)
      setCheckingAccess(false)
    }

    verifyAccess()
  }, [token, user])

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

  const visibleSubmissions = unlocked ? results : results.slice(0, 2)
  const lockedSubmissions = unlocked ? [] : results.slice(2)

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
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
                {submission.company}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <div>{submission.location}</div>
                <div>{getTimeAgo(submission.submissionDate)}</div>
              </div>
            </div>
            <div>
              <div className={submission.level ? 'font-medium' : 'text-gray-500'}>
                {submission.level || '–'}
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
                    <div className="text-brand-secondary font-bold">{submission.company}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>{submission.location}</div>
                      <div>{getTimeAgo(submission.submissionDate)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{submission.level || '–'}</div>
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
    </div>
  )
}
