import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { SalarySubmissionWizard } from '@/components/contribute/SalarySubmissionWizard'

export default function ContributePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <SalarySubmissionWizard />
      </main>
      <Footer />
    </>
  )
}
