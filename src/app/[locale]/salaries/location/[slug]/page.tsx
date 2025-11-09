import { getLocationJobTitles } from '@/app/actions/location-job-titles'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { LocationJobTitles } from '@/components/location/LocationJobTitles'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params

  const data = await getLocationJobTitles(slug)

  if (!data) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <LocationJobTitles data={data} />
      <Footer />
    </>
  )
}
