import { getIndustryOverviewData } from '@/app/actions/industry-overview'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { IndustryOverview } from '@/components/industry/IndustryOverview'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ location?: string }>
}

export default async function IndustryOverviewPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { location } = await searchParams

  const data = await getIndustryOverviewData(slug, location)

  if (!data) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <IndustryOverview data={data} />
      </main>
      <Footer />
    </>
  )
}
