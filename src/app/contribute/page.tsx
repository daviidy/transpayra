import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { SalarySubmissionChooser } from '@/components/contribute/SalarySubmissionChooser'

export default function ContributePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <SalarySubmissionChooser />
      </main>
      <Footer />
    </>
  )
}
