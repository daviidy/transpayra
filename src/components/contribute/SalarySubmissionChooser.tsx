'use client'

import { useRouter } from 'next/navigation'

export function SalarySubmissionChooser() {
  const router = useRouter()

  const handleUploadPDF = () => {
    // Coming soon - show tooltip or modal
    alert('PDF upload coming soon!')
  }

  const handleEnterManually = () => {
    router.push('/contribute/manual')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Add Your Salary</h1>
        <p className="text-lg text-gray-600">Over 300,000 salaries submitted!</p>
      </div>

      {/* Submission Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Upload PDF */}
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-not-allowed opacity-75"
          onClick={handleUploadPDF}
        >
          {/* Top Button Bar */}
          <div className="bg-brand-secondary text-white text-center py-4">
            <button className="text-lg font-semibold">Upload PDF</button>
            <span className="text-sm block mt-1 opacity-80">(Coming Soon)</span>
          </div>

          {/* Card Content */}
          <div className="p-8">
            {/* Text Rows */}
            <div className="space-y-4 mb-8">
              <div className="text-gray-700 text-lg">Anonymous</div>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-lg">Verified</span>
              </div>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-lg">Encrypted & Secure</span>
              </div>
            </div>

            {/* File Types Section */}
            <div>
              <p className="text-gray-600 mb-4 font-medium">Can be any of:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  Offer Letter
                </span>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  Yearly Comp Statement
                </span>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">W2</span>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  Promotion Summary
                </span>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Etc</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Enter Manually */}
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
          onClick={handleEnterManually}
        >
          {/* Top Button Bar */}
          <div className="bg-brand-secondary text-white text-center py-4 group-hover:bg-brand-accent transition-colors">
            <button className="text-lg font-semibold">Enter Manually</button>
          </div>

          {/* Card Content */}
          <div className="p-8">
            {/* Text Rows */}
            <div className="space-y-6">
              <div className="text-gray-700 text-lg">Anonymous</div>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-lg">Takes about 50 seconds</span>
              </div>

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 text-lg">Encrypted & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
