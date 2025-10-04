import { getSubmissionDetails } from '@/app/actions/submissions'
import { Navbar } from '@/components/navbar/Navbar'
import { ContributeCTA } from '@/components/ContributeCTA'
import { Footer } from '@/components/Footer'
import { CompanyLogo } from '@/components/CompanyLogo'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SubmissionPage({ params }: PageProps) {
  const { id } = await params
  const submissionId = parseInt(id)

  if (isNaN(submissionId)) {
    notFound()
  }

  const submission = await getSubmissionDetails(submissionId)

  if (!submission) {
    notFound()
  }

  const totalComp =
    parseFloat(submission.baseSalary) +
    parseFloat(submission.bonus || '0') +
    parseFloat(submission.stockCompensation || '0')

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  const locationString = `${submission.city}${submission.state ? `, ${submission.state}` : ''}, ${submission.country}`

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-6xl px-4 py-10">
          {/* Top row: title + utilities */}
          <div className="flex items-start justify-between gap-6">
            {/* Title & meta */}
            <div className="flex min-w-0 items-start gap-3">
              {/* Company logo */}
              <Link href={`/company/${submission.companyId}`} className="mt-1 hover:opacity-80 transition-opacity">
                <CompanyLogo
                  companyName={submission.companyName}
                  logoUrl={submission.companyLogoUrl}
                  size="md"
                />
              </Link>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-slate-900">{submission.jobTitle}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-700">Level</span>
                    <span>•</span>
                    <span className="text-slate-900">
                      {submission.levelName || submission.levelDescription || '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-700">Focus Tag</span>
                    <span>•</span>
                    <span className="text-slate-900">—</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Utilities */}
            <div className="flex shrink-0 items-center gap-4">
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Report this entry
              </button>
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Share
              </button>
            </div>
          </div>

          {/* Main content grid */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* RIGHT: Total comp + breakdown */}
            <div>
              {/* Total Compensation */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-wide text-slate-700">
                    Average Annual Total Comp
                  </h2>
                  <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                    See Calculation ▾
                  </button>
                </div>
                <div className="mt-3 rounded-lg bg-white px-4 py-4 text-3xl font-semibold tabular-nums text-slate-900 shadow-sm ring-1 ring-slate-200">
                  {formatCurrency(totalComp)}
                </div>
              </div>

              {/* Breakdown */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Comp Breakdown</h3>
                  <button className="text-sm font-medium text-sky-700 hover:text-sky-800">
                    View Vesting Trends →
                  </button>
                </div>

                <dl className="divide-y divide-slate-200">
                  {/* Base Salary */}
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-sm font-medium text-slate-700">Base Salary</dt>
                    <dd className="text-sm font-semibold tabular-nums text-slate-900">
                      {formatCurrency(submission.baseSalary)}
                    </dd>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">Stock</div>
                      <dt className="text-sm font-medium text-slate-700">
                        Average Annual Stock
                      </dt>
                    </div>
                    <dd
                      className={`text-sm tabular-nums ${
                        submission.stockCompensation && parseFloat(submission.stockCompensation) > 0
                          ? 'font-semibold text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {submission.stockCompensation && parseFloat(submission.stockCompensation) > 0
                        ? formatCurrency(submission.stockCompensation)
                        : '—'}
                    </dd>
                  </div>

                  {/* Bonus (Target) */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400">Bonus</div>
                      <dt className="text-sm font-medium text-slate-700">Target Bonus</dt>
                    </div>
                    <dd className="text-sm tabular-nums text-slate-400">—</dd>
                  </div>

                  {/* Bonus (Average Annual Bonuses) */}
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-sm font-medium text-slate-700">Average Annual Bonuses</dt>
                    <dd
                      className={`text-sm tabular-nums ${
                        submission.bonus && parseFloat(submission.bonus) > 0
                          ? 'font-semibold text-slate-900'
                          : 'text-slate-900'
                      }`}
                    >
                      {submission.bonus && parseFloat(submission.bonus) > 0
                        ? formatCurrency(submission.bonus)
                        : '$0'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* CTA */}
              <div className="mt-6">
                <Link
                  href="/negotiate"
                  className="text-sm font-medium text-sky-700 hover:text-sky-800"
                >
                  Negotiate Your Salary →
                </Link>
              </div>
            </div>

            {/* LEFT: Details */}
            <aside className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wide text-slate-700">Details</h2>

              <ul className="space-y-3">
                <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <Link
                    href={`/company/${submission.companyId}`}
                    target="_blank"
                    className="text-sky-700 hover:text-sky-800"
                  >
                    {submission.companyName}
                  </Link>
                </li>
                <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <div className="text-slate-700">{locationString}</div>
                </li>
                <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <div className="text-slate-700">
                    Employee as of{' '}
                    {new Date(submission.submissionDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </li>
                <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <div className="text-slate-700">Full-Time Employee</div>
                </li>
                <li className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <div className="text-slate-700">Remote</div>
                </li>
              </ul>

              {/* Stats blocks */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Years at Company
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {submission.yearsAtCompany || 0} yrs
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Years of Experience
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {submission.yearsOfExperience} yrs
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Years at Level
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900">—</div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <ContributeCTA />
      <Footer />
    </>
  )
}