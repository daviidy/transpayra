import { getCompanyDetails } from '@/app/actions/companies'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { CompanyHeader } from '@/components/company/CompanyHeader'
import { CompanyTabs } from '@/components/company/CompanyTabs'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params
  const companyId = parseInt(id)

  if (isNaN(companyId)) {
    notFound()
  }

  const company = await getCompanyDetails(companyId)

  if (!company) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <CompanyHeader company={company} />
        <CompanyTabs companyId={companyId} company={company} />
      </main>
      <Footer />
    </>
  )
}
