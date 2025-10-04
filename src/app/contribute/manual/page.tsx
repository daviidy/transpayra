import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { SalarySubmissionWizard } from '@/components/contribute/SalarySubmissionWizard'

export default function ManualContributePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <SalarySubmissionWizard />
      </main>
      <Footer />
    </>
  )
}
