import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { searchSalaries, SearchFilters } from '@/app/actions/search-salaries'
import { SalaryResultsList } from '@/components/search/SalaryResultsList'
import { SearchStatsCard } from '@/components/search/SearchStatsCard'
import { db } from '@/lib/db'
import { company, jobTitle, location, industry } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

interface SearchPageProps {
  searchParams: {
    type?: 'job' | 'company' | 'location' | 'industry' | 'level'
    id?: string
  }
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
  if (!type) return null

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
    console.error('Error fetching filter info:', error)
    return null
  }
}

export default async function SearchResultsPage({ searchParams }: SearchPageProps) {
  const type = searchParams.type
  const id = searchParams.id ? parseInt(searchParams.id) : undefined

  if (!type || !id) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Search</h1>
              <p className="text-gray-600">Please use the search bar to find salaries.</p>
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

  // Calculate statistics
  const totalCompensations = results.map((r) => r.totalCompensation)
  const medianCompensation = calculatePercentile(totalCompensations, 50)
  const p25 = calculatePercentile(totalCompensations, 25)
  const p75 = calculatePercentile(totalCompensations, 75)
  const p90 = calculatePercentile(totalCompensations, 90)

  const typeLabels = {
    job: 'Job Title',
    company: 'Company',
    location: 'Location',
    industry: 'Industry',
    level: 'Level',
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">
              {filterName || 'Search Results'}
            </h1>
          </div>

          {/* Hero Stats Card */}
          {results.length > 0 ? (
            <>
              <SearchStatsCard
                median={medianCompensation}
                p25={p25}
                p75={p75}
                p90={p90}
                submissionCount={results.length}
                filterName={filterName}
              />

              {/* Salary Submissions List */}
              <SalaryResultsList results={results} />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">No salary data found for this search.</p>
              <p className="text-gray-500 mt-2">
                Try searching for a different job title, company, or location.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
