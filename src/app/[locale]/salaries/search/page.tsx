import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { searchSalaries, SearchFilters } from '@/app/actions/search-salaries'
import { SalaryResultsList } from '@/components/search/SalaryResultsList'
import { SearchStatsCard } from '@/components/search/SearchStatsCard'
import { db } from '@/lib/db'
import { company, jobTitle, location, industry } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'

interface SearchPageProps {
  searchParams: Promise<{
    type?: 'job' | 'company' | 'location' | 'industry' | 'level'
    id?: string
    jobId?: string
    locationId?: string
  }>
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (percentile / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower

  if (lower === upper) return sorted[lower]
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

async function getFilterInfo(type: string | undefined, id: number) {
  if (!type || !id) return null

  try {
    switch (type) {
      case 'job': {
        const [result] = await db
          .select({ title: jobTitle.title })
          .from(jobTitle)
          .where(eq(jobTitle.jobTitleId, id))
          .limit(1)
        return result?.title || null
      }
      case 'company': {
        const [result] = await db
          .select({ name: company.name })
          .from(company)
          .where(eq(company.companyId, id))
          .limit(1)
        return result?.name || null
      }
      case 'location': {
        const [result] = await db
          .select({ city: location.city, state: location.state, country: location.country })
          .from(location)
          .where(eq(location.locationId, id))
          .limit(1)
        return result
          ? `${result.city}${result.state ? `, ${result.state}` : ''}, ${result.country}`
          : null
      }
      case 'industry': {
        const [result] = await db
          .select({ name: industry.name })
          .from(industry)
          .where(eq(industry.industryId, id))
          .limit(1)
        return result?.name || null
      }
      default:
        return null
    }
  } catch (error) {
    console.error(`Error fetching ${type} info for ID ${id}:`, error)
    return null
  }
}

export default async function SearchResultsPage({ searchParams }: SearchPageProps) {
  const t = await getTranslations()
  const params = await searchParams
  const type = params.type
  const id = params.id ? parseInt(params.id) : undefined
  const jobId = params.jobId ? parseInt(params.jobId) : undefined
  const locationId = params.locationId ? parseInt(params.locationId) : undefined

  // Handle multiple filters (job + location)
  if (jobId && locationId) {
    try {
      // Build filters for job + location
      const filters: SearchFilters = {
        jobTitleId: jobId,
        locationId: locationId,
      }

      // Fetch data
      const [results, jobName, locationName] = await Promise.all([
        searchSalaries(filters),
        getFilterInfo('job', jobId),
        getFilterInfo('location', locationId),
      ])

      console.log('Search results:', { jobId, locationId, jobName, locationName, resultCount: results.length })

      // Check if both names were found
      if (!jobName) {
        console.error(`Job title not found for ID: ${jobId}`)
        return (
          <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
              <div className="container mx-auto px-6 py-12">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('search.jobTitleNotFound')}</h1>
                  <p className="text-gray-600">{t('search.jobTitleNotFoundDesc', { jobId })}</p>
                  <Link
                    href="/"
                    className="inline-block mt-6 px-6 py-3 bg-brand-secondary text-white font-medium rounded-lg hover:bg-brand-accent transition-colors"
                  >
                    {t('search.goHome')}
                  </Link>
                </div>
              </div>
            </main>
            <Footer />
          </>
        )
      }

      if (!locationName) {
        console.error(`Location not found for ID: ${locationId}`)
        return (
          <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
              <div className="container mx-auto px-6 py-12">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('search.locationNotFound')}</h1>
                  <p className="text-gray-600">{t('search.locationNotFoundDesc', { locationId })}</p>
                  <p className="text-gray-500 mt-2">
                    {t('search.outdatedLink')}
                  </p>
                  <Link
                    href="/"
                    className="inline-block mt-6 px-6 py-3 bg-brand-secondary text-white font-medium rounded-lg hover:bg-brand-accent transition-colors"
                  >
                    {t('search.goHome')}
                  </Link>
                </div>
              </div>
            </main>
            <Footer />
          </>
        )
      }

      // Calculate average base salary
      const baseSalaries = results.map((r) => parseFloat(r.baseSalary))
      const averageBaseSalary = baseSalaries.length > 0
        ? baseSalaries.reduce((sum, salary) => sum + salary, 0) / baseSalaries.length
        : 0

      const filterName = `${jobName} ${t('search.in')} ${locationName}`

    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900">
                {filterName}
              </h1>
            </div>

            {/* Hero Stats Card */}
            {results.length > 0 ? (
              <>
                <SearchStatsCard
                  average={averageBaseSalary}
                  submissionCount={results.length}
                  filterName={filterName}
                />

                {/* Salary Submissions List */}
                <SalaryResultsList results={results} />
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">{t('search.noDataFound')}</p>
                <p className="text-gray-500 mt-2">
                  {t('search.tryDifferentSearch')}
                </p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    )
    } catch (error) {
      console.error('Error fetching combined search results:', error)
      return (
        <>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-6 py-12">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('search.error')}</h1>
                <p className="text-gray-600">{t('search.errorLoadingData')}</p>
                <Link
                  href="/"
                  className="inline-block mt-6 px-6 py-3 bg-brand-secondary text-white font-medium rounded-lg hover:bg-brand-accent transition-colors"
                >
                  {t('search.goHome')}
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </>
      )
    }
  }

  if (!type || !id) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('search.invalidSearch')}</h1>
              <p className="text-gray-600">{t('search.useSearchBar')}</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Build filters based on search type
  const filters: SearchFilters = {}
  if (type === 'job') filters.jobTitleId = id
  if (type === 'company') filters.companyId = id
  if (type === 'location') filters.locationId = id
  if (type === 'industry') filters.industryId = id
  if (type === 'level') filters.levelId = id

  // Fetch data
  const [results, filterName] = await Promise.all([
    searchSalaries(filters),
    getFilterInfo(type, id),
  ])

  // Calculate average base salary
  const baseSalaries = results.map((r) => parseFloat(r.baseSalary))
  const averageBaseSalary = baseSalaries.length > 0
    ? baseSalaries.reduce((sum, salary) => sum + salary, 0) / baseSalaries.length
    : 0

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">
              {filterName || t('search.searchResults')}
            </h1>
          </div>

          {/* Hero Stats Card */}
          {results.length > 0 ? (
            <>
              <SearchStatsCard
                average={averageBaseSalary}
                submissionCount={results.length}
                filterName={filterName}
              />

              {/* Salary Submissions List */}
              <SalaryResultsList results={results} />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">{t('search.noDataFound')}</p>
              <p className="text-gray-500 mt-2">
                {t('search.tryDifferentSearch')}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
