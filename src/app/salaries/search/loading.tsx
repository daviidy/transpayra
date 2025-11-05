import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Page Header Skeleton */}
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>

          {/* Stats Card Skeleton */}
          <section className="bg-gray-50 rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
          </section>

          {/* Table Skeleton */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-800 text-white">
              <div className="flex py-4 px-6">
                <div className="flex-1 h-5 bg-gray-700 rounded w-24 animate-pulse"></div>
                <div className="flex-1 h-5 bg-gray-700 rounded w-24 mx-4 animate-pulse"></div>
                <div className="flex-1 h-5 bg-gray-700 rounded w-24 mx-4 animate-pulse"></div>
                <div className="flex-1 h-5 bg-gray-700 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-4 px-6">
                  <div className="grid grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
