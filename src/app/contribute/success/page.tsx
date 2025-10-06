import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function SubmissionSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You for Your Contribution!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Your salary data has been submitted successfully
            </p>
            <p className="text-gray-500">
              You're helping thousands of engineers negotiate fairly and understand their worth
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-brand-secondary mb-2">300,000+</p>
                <p className="text-gray-600">Total Submissions</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-brand-secondary mb-2">5,000+</p>
                <p className="text-gray-600">Companies</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-brand-secondary mb-2">150+</p>
                <p className="text-gray-600">Countries</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/contribute"
              className="inline-block px-8 py-4 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-[#5d4527] transition-colors"
            >
              + Add Another Salary
            </Link>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-white text-brand-secondary font-semibold rounded-lg border-2 border-brand-secondary hover:bg-brand-primary transition-colors"
            >
              Explore Salaries
            </Link>
          </div>

          {/* Share Section */}
          <div className="bg-brand-primary border border-[#d4c4a8] rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Help Others Too!</h3>
            <p className="text-gray-700 mb-4">
              Share Transpayra with your colleagues and friends to help build the most comprehensive
              salary database for tech professionals
            </p>
            <div className="flex gap-3 justify-center">
              <button className="px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-[#5d4527] transition-colors">
                Share on Twitter
              </button>
              <button className="px-6 py-2 bg-white text-brand-secondary border border-brand-secondary rounded-lg hover:bg-brand-primary transition-colors">
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
