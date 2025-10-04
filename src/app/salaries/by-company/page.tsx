import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { CompanyDirectory } from '@/components/directory/CompanyDirectory'

export default function CompaniesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <CompanyDirectory />
      </main>
      <Footer />
    </>
  )
}
