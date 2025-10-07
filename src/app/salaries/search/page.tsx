import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { searchSalaries, SearchFilters } from '@/app/actions/search-salaries'
import { SalaryResultsList } from '@/components/search/SalaryResultsList'
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
              <div className="bg-white rounded-2xl shadow-lg mb-12 overflow-hidden">
                {/* Top Section */}
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
                    {/* Left: Main Salary */}
                    <div className="mb-6 lg:mb-0">
                      <div className="text-5xl font-bold text-green-600 mb-2">
                        ${Math.round(medianCompensation).toLocaleString()}
                      </div>
                      <div className="text-gray-600 text-lg">Median Total Comp</div>
                    </div>

                    {/* Center: Percentile Stats */}
                    <div className="flex flex-wrap gap-6 mb-6 lg:mb-0">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          ${Math.round(p25 / 1000)}K
                        </div>
                        <div className="text-gray-500 text-sm">25th percentile</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${Math.round(p75 / 1000)}K
                        </div>
                        <div className="text-gray-500 text-sm">75th percentile</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-800">
                          ${Math.round(p90 / 1000)}K
                        </div>
                        <div className="text-gray-500 text-sm">90th percentile</div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link
                      href="/contribute"
                      className="bg-brand-secondary hover:bg-brand-accent text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                      </svg>
                      <span>Contribute Your Salary</span>
                    </Link>
                  </div>

                  {/* Bottom Row: Fine Print */}
                  <div className="text-center text-gray-500 text-sm mb-6">
                    <p>
                      Based on {results.length} anonymous{' '}
                      {results.length === 1 ? 'submission' : 'submissions'}. Last updated:{' '}
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

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
