import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { TitleDirectory } from '@/components/directory/TitleDirectory'

export default function TitlesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <TitleDirectory />
      </main>
      <Footer />
    </>
  )
}
