import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import { LocationDirectory } from '@/components/directory/LocationDirectory'

export default function LocationsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <LocationDirectory />
      </main>
      <Footer />
    </>
  )
}
