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
      const hasAccess = await checkUserHasAccess(token ?? undefined, user?.id)
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
    <div>
      {/* Table Section */}
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
            {visibleSubmissions.map((submission, index) => (
              <tr
                key={submission.submissionId}
                className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <Link
                        href={`/submission/${submission.submissionId}`}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {submission.company}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {submission.location} • {getTimeAgo(submission.submissionDate)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className="font-medium text-black">{submission.jobTitle}</p>
                    <p className="text-sm text-gray-500">{submission.level || '–'}</p>
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
                    <p className="font-bold text-lg text-black">
                      {formatCurrencyWithConversion(submission.baseSalary, submission.currency)}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Locked Content */}
      {lockedSubmissions.length > 0 && !unlocked && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-4">
          <table className="w-full">
            <tbody>
              {lockedSubmissions.slice(0, 2).map((submission, index) => (
                <tr
                  key={`locked-${submission.submissionId}`}
                  className={`border-b border-gray-200 blur-sm ${
                    (visibleSubmissions.length + index) % 2 === 1 ? 'bg-gray-50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <a href="#" className="text-blue-600 font-medium">
                          {submission.company}
                        </a>
                        <p className="text-sm text-gray-500">
                          {submission.location} • {getTimeAgo(submission.submissionDate)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-black">{submission.jobTitle}</p>
                      <p className="text-sm text-gray-500">{submission.level || '–'}</p>
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
                      <p className="font-bold text-lg text-black">
                        {formatCurrencyWithConversion(submission.baseSalary, submission.currency)}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Unlock Gate Overlay */}
          <div className="relative bg-white border-t border-gray-200 p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
        </div>
      )}
    </div>
  )
}
