'use client'

import { useCurrency } from '@/contexts/CurrencyContext'
import { Currency } from '@/lib/currency'
import { SubmissionDetails } from '@/app/actions/submissions'
import { CompanyLogo } from '@/components/CompanyLogo'
import Link from 'next/link'

interface SubmissionDetailsClientProps {
  submission: SubmissionDetails
  similarSubmissions?: SubmissionDetails[]
}

export function SubmissionDetailsClient({ submission, similarSubmissions = [] }: SubmissionDetailsClientProps) {
  const { formatAmount } = useCurrency()

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return formatAmount(num, submission.currency as Currency)
  }

  const locationString = `${submission.city}${submission.state ? `, ${submission.state}` : ''}, ${submission.country}`

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-6xl px-4 py-10">
        {/* Top row: title */}
        <div className="mb-8">
          <div className="flex min-w-0 items-start gap-4">
            {/* Company logo */}
            <Link href={`/company/${submission.companyId}`} className="mt-1 hover:opacity-80 transition-opacity">
              <CompanyLogo
                companyName={submission.companyName}
                logoUrl={submission.companyLogoUrl}
                size="md"
              />
            </Link>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">{submission.jobTitle}</h1>
              <p className="text-lg text-gray-600 mt-1">{submission.companyName}</p>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT: Compensation */}
          <div>
            {/* Base Salary Card */}
            <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-800 mb-4">
                Annual Base Salary
              </h2>
              <div className="rounded-xl bg-white px-6 py-6 text-4xl font-bold tabular-nums text-brand-secondary shadow-sm border-2 border-gray-200">
                {formatCurrency(submission.baseSalary)}
              </div>
            </div>
          </div>

          {/* RIGHT: Details */}
          <aside>
            <h2 className="text-base font-bold text-gray-800 mb-4">Details</h2>
            <ul className="space-y-3">
              <li className="rounded-xl border-2 border-gray-200 bg-white px-5 py-4 hover:border-gray-300 transition-all">
                <div className="text-sm font-semibold text-gray-600 mb-1">Company</div>
                <Link
                  href={`/company/${submission.companyId}`}
                  className="text-brand-secondary hover:text-brand-accent font-semibold"
                >
                  {submission.companyName}
                </Link>
              </li>
              <li className="rounded-xl border-2 border-gray-200 bg-white px-5 py-4">
                <div className="text-sm font-semibold text-gray-600 mb-1">Location</div>
                <div className="text-gray-900 font-semibold">{locationString}</div>
              </li>
              <li className="rounded-xl border-2 border-gray-200 bg-white px-5 py-4">
                <div className="text-sm font-semibold text-gray-600 mb-1">Experience</div>
                <div className="text-gray-900 font-semibold">
                  {submission.yearsOfExperience} years total
                </div>
              </li>
              <li className="rounded-xl border-2 border-gray-200 bg-white px-5 py-4">
                <div className="text-sm font-semibold text-gray-600 mb-1">Tenure</div>
                <div className="text-gray-900 font-semibold">
                  {submission.yearsAtCompany} years at company
                </div>
              </li>
            </ul>
          </aside>
        </div>

        {/* Similar Submissions Section */}
        {similarSubmissions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Similar {submission.jobTitle} Submissions
            </h2>
            <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Location</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Base Salary</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Experience</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {similarSubmissions.map((sub) => {
                      const subLocation = `${sub.city}${sub.state ? `, ${sub.state}` : ''}, ${sub.country}`
                      return (
                        <tr key={sub.submissionId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <Link
                              href={`/company/${sub.companyId}`}
                              className="font-semibold text-brand-secondary hover:text-brand-accent"
                            >
                              {sub.companyName}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{subLocation}</td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900 tabular-nums">
                            {formatCurrency(sub.baseSalary)}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-700">
                            {sub.yearsOfExperience} yrs
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link
                              href={`/submission/${sub.submissionId}`}
                              className="inline-block px-4 py-2 text-sm font-semibold text-brand-secondary border-2 border-brand-secondary rounded-xl hover:bg-brand-secondary hover:text-white transition-all"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
