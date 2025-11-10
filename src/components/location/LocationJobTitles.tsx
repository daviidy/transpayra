'use client'

import { Link } from '@/i18n/routing'
import { useCurrency } from '@/contexts/CurrencyContext'
import type { LocationJobTitlesData } from '@/app/actions/location-job-titles'
import { useTranslations } from 'next-intl'

interface LocationJobTitlesProps {
  data: LocationJobTitlesData
}

// Random background colors for cards
const bgColors = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-yellow-400 to-yellow-600',
  'bg-gradient-to-br from-red-400 to-red-600',
  'bg-gradient-to-br from-indigo-400 to-indigo-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
]

export function LocationJobTitles({ data }: LocationJobTitlesProps) {
  const t = useTranslations()
  const { formatAmount } = useCurrency()

  const formatCurrency = (amount: number) => {
    // Assume aggregated stats are in XOF (base currency)
    return formatAmount(amount, 'XOF')
  }

  const getRandomColor = (index: number) => {
    return bgColors[index % bgColors.length]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {data.locationName}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('location.selectJobTitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Job Title Cards */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {data.jobTitles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {t('location.noDataAvailable')}
            </p>
            <Link
              href="/contribute"
              className="inline-block mt-6 px-6 py-3 bg-brand-secondary text-white font-medium rounded-lg hover:bg-brand-accent transition-colors"
            >
              {t('location.addSalary')}
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('location.jobTitlesWithData')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.jobTitles.map((jobTitle, index) => (
                <Link
                  key={jobTitle.jobTitleId}
                  href={`/salaries/search?jobId=${jobTitle.jobTitleId}&locationId=${data.locationId}`}
                  className="block"
                >
                  <div className="w-full flex flex-col bg-white border border-gray-200 rounded-xl pb-4 hover:shadow-lg transition-shadow duration-200">
                    {/* Header with random gradient background */}
                    <div className={`h-[3.5rem] relative rounded-t-xl ${getRandomColor(index)}`}>
                      <div className="absolute -bottom-8 left-2 z-10 w-[3.5rem] h-[3.5rem] bg-white rounded-lg shadow-md flex items-center justify-center">
                        <span className="text-2xl">💻</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-10 pl-4 w-[88%] flex flex-col">
                      <h4 className="text-[14px] font-semibold text-gray-900 mb-1 line-clamp-2">
                        {jobTitle.jobTitleName}
                      </h4>

                      <p className="text-[13px] mt-1 text-gray-600 mb-4">
                        {data.locationName}
                      </p>

                      <hr className="border-[1.5px] w-12 mt-2 mb-2 border-gray-200 rounded" />

                      <div className="space-y-1">
                        <p className="text-[13px] text-gray-600">
                          {t('location.median')}: {formatCurrency(jobTitle.medianSalary)}
                        </p>
                        <p className="text-[13px] text-gray-600">
                          {jobTitle.submissionCount} {jobTitle.submissionCount !== 1 ? t('location.submissions') : t('location.submission')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
