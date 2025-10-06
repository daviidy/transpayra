import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { searchSalaries, SearchFilters } from '@/app/actions/search-salaries'
import { SalaryResultsTable } from '@/components/search/SalaryResultsTable'
import { db } from '@/lib/db'
import { company, jobTitle, location } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface SearchPageProps {
  searchParams: {
    type?: 'job' | 'company' | 'location' | 'level'
    id?: string
  }
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
  if (type === 'level') filters.levelId = id

  // Fetch data
  const [results, filterName] = await Promise.all([
    searchSalaries(filters),
    getFilterInfo(type, id),
  ])

  // Calculate statistics
  const totalCompensations = results.map((r) => r.totalCompensation)
  const avgCompensation =
    totalCompensations.length > 0
      ? totalCompensations.reduce((a, b) => a + b, 0) / totalCompensations.length
      : 0
  const minCompensation = totalCompensations.length > 0 ? Math.min(...totalCompensations) : 0
  const maxCompensation = totalCompensations.length > 0 ? Math.max(...totalCompensations) : 0

  const typeLabels = {
    job: 'Job Title',
    company: 'Company',
    location: 'Location',
    level: 'Level',
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>Search Results</span>
              <span>›</span>
              <span className="text-brand-secondary font-medium">{typeLabels[type]}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {filterName || 'Results'}
            </h1>
            <p className="text-gray-600">
              {results.length} salary {results.length === 1 ? 'submission' : 'submissions'} found
            </p>
          </div>

          {/* Statistics Cards */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Average Total Comp</p>
                <p className="text-3xl font-bold text-brand-secondary">
                  ${Math.round(avgCompensation).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Minimum</p>
                <p className="text-3xl font-bold text-gray-700">
                  ${Math.round(minCompensation).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Maximum</p>
                <p className="text-3xl font-bold text-gray-700">
                  ${Math.round(maxCompensation).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 ? (
            <SalaryResultsTable results={results} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">
                No salary data found for this search.
              </p>
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
