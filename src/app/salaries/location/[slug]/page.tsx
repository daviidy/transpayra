import { getLocationSalaryStats } from '@/app/actions/salary-breakdown'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { LocationSalaryBreakdown } from '@/components/salary-breakdown/LocationSalaryBreakdown'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ role?: string; level?: string }>
}

export default async function LocationSalaryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { role = 'Software Engineer', level } = await searchParams

  const data = await getLocationSalaryStats(slug, role, level)

  if (!data) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <LocationSalaryBreakdown data={data} initialRole={role} initialLevel={level} />
      </main>
      <Footer />
    </>
  )
}
