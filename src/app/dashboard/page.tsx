'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken'
import { useEffect, useState } from 'react'
import { getUserSubmissions, type UserSubmission } from '@/app/actions/get-user-submissions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, Briefcase, MapPin, TrendingUp, Calendar, User, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const { token } = useAnonymousToken()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<UserSubmission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)
  const [activeTab, setActiveTab] = useState('submissions')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      getUserSubmissions(user.id, token).then((data) => {
        setSubmissions(data)
        setLoadingSubmissions(false)
      })
    }
  }, [user, token])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `$${Math.round(num).toLocaleString('en-US')}`
  }

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return email.slice(0, 2).toUpperCase()
  }

  const totalSubmissions = submissions.length
  const avgCompensation = submissions.length > 0
    ? submissions.reduce((sum, sub) => sum + parseFloat(sub.totalCompensation), 0) / submissions.length
    : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-base font-bold text-gray-900">
              Transpayra
            </Link>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm font-medium text-brand-secondary bg-white border border-gray-300 rounded-lg hover:bg-brand-primary transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-1/4 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-8">
            {/* Profile Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {getInitials(user.email || '')}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('submissions')}
                className={`w-full text-left block py-3 px-3 text-sm rounded-lg transition-colors ${
                  activeTab === 'submissions'
                    ? 'text-brand-secondary font-medium bg-brand-primary'
                    : 'text-gray-800 hover:text-brand-secondary hover:bg-gray-50'
                }`}
              >
                My Submissions
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`w-full text-left block py-3 px-3 text-sm rounded-lg transition-colors ${
                  activeTab === 'stats'
                    ? 'text-brand-secondary font-medium bg-brand-primary'
                    : 'text-gray-800 hover:text-brand-secondary hover:bg-gray-50'
                }`}
              >
                Statistics
              </button>
              <Link
                href="/"
                className="block py-3 px-3 text-sm text-gray-800 hover:text-brand-secondary hover:bg-gray-50 rounded-lg transition-colors"
              >
                Browse Salaries
              </Link>
              <Link
                href="/contribute"
                className="block py-3 px-3 text-sm text-gray-800 hover:text-brand-secondary hover:bg-gray-50 rounded-lg transition-colors"
              >
                Add New Submission
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white">
          <div className="p-16">
            {activeTab === 'submissions' && (
              <>
                {/* Section Header */}
                <div className="mb-12">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
                  <p className="text-base text-gray-500">
                    View and manage your salary submissions
                  </p>
                </div>

                {loadingSubmissions ? (
                  <div className="text-center py-12 text-gray-500">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                    <p className="text-gray-500 mb-6">Start contributing to unlock salary data</p>
                    <Link
                      href="/contribute"
                      className="inline-block px-6 py-3 bg-brand-secondary text-white rounded-lg hover:bg-brand-accent transition-colors"
                    >
                      Add Your First Salary
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div
                        key={submission.submissionId}
                        className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-bold text-gray-900">
                                {submission.jobTitle}
                              </h3>
                              {submission.level && (
                                <span className="px-2 py-1 bg-brand-primary text-brand-secondary text-xs font-medium rounded">
                                  {submission.level}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Briefcase className="w-4 h-4" />
                                {submission.company}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {submission.location}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <TrendingUp className="w-4 h-4" />
                                {submission.yearsOfExperience} yrs experience
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {new Date(submission.submissionDate).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Total Compensation</div>
                                <div className="text-2xl font-bold text-brand-secondary">
                                  {formatCurrency(submission.totalCompensation)}
                                </div>
                              </div>
                              <div className="h-8 w-px bg-gray-200" />
                              <div className="flex gap-4 text-sm">
                                <div>
                                  <div className="text-gray-500">Base</div>
                                  <div className="font-medium">{formatCurrency(submission.baseSalary)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Stock</div>
                                  <div className="font-medium">{formatCurrency(submission.stockCompensation)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Bonus</div>
                                  <div className="font-medium">{formatCurrency(submission.bonus)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'stats' && (
              <>
                {/* Section Header */}
                <div className="mb-12">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics</h1>
                  <p className="text-base text-gray-500">
                    Overview of your salary submission data
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Total Submissions Card */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-2">Total Submissions</h3>
                        <p className="text-4xl font-bold text-brand-secondary">{totalSubmissions}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Average Compensation Card */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-2">Avg Compensation</h3>
                        <p className="text-4xl font-bold text-brand-secondary">
                          {avgCompensation > 0 ? formatCurrency(avgCompensation) : '$0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Account Type Card */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-2">Account Type</h3>
                        <p className="text-sm text-gray-500">
                          {user.app_metadata?.provider ? `Signed in with ${user.app_metadata.provider}` : 'Email'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Member Since Card */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-2">Member Since</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(user.created_at || '').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
