'use client'

import { useState, useEffect } from 'react'
import { Code, Briefcase, Database, Palette, Server } from 'lucide-react'
import { SalaryCard } from './SalaryCard'
import { LevelsComparison } from './levels/LevelsComparison'
import { getSalariesByJobTitle } from '@/app/actions/salaries'

interface Submission {
  id: number
  company: string
  companyLogoUrl?: string | null
  jobTitle: string
  location: string
  baseSalary: string
  bonus: string
  stockCompensation: string
  yearsOfExperience: number
  level?: string
}

const jobCategories = [
  { id: 'software-engineer', label: 'Software Engineer', icon: Code },
  { id: 'product-manager', label: 'Product Manager', icon: Briefcase },
  { id: 'data-scientist', label: 'Data Scientist', icon: Database },
  { id: 'designer', label: 'UI/UX Designer', icon: Palette },
  { id: 'devops-engineer', label: 'DevOps Engineer', icon: Server },
]

export function JobTabs() {
  const [activeTab, setActiveTab] = useState('software-engineer')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const jobTitleMap: Record<string, string> = {
        'software-engineer': 'Software Engineer',
        'product-manager': 'Product Manager',
        'data-scientist': 'Data Scientist',
        'designer': 'UI/UX Designer',
        'devops-engineer': 'DevOps Engineer',
      }

      const data = await getSalariesByJobTitle(jobTitleMap[activeTab])
      setSubmissions(data)
      setLoading(false)
    }

    fetchData()
  }, [activeTab])

  const activeCategory = jobCategories.find(cat => cat.id === activeTab)

  return (
    <section className="bg-white py-12">
      <div className="container px-6 mx-auto">
        {/* Tabs with More link */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-10 relative">
          <div className="flex flex-wrap justify-center gap-3">
            {jobCategories.map((category) => {
              const Icon = category.icon
              const isActive = activeTab === category.id

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-secondary text-white shadow-md'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              )
            })}
          </div>

          {/* More link */}
          <a
            href="/salaries/by-industry"
            className="text-sm font-medium text-brand-secondary hover:text-brand-accent transition-colors flex items-center gap-1"
          >
            More →
          </a>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">
              {activeCategory?.label} Salaries
            </h2>
            <a
              href={`/salaries/${activeTab}`}
              className="text-sm font-medium text-brand-secondary hover:text-brand-accent underline"
            >
              View All →
            </a>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No salary data available for this role yet.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {submissions.map((submission) => (
                  <SalaryCard
                    key={submission.id}
                    id={submission.id}
                    company={submission.company}
                    companyLogoUrl={submission.companyLogoUrl}
                    jobTitle={submission.jobTitle}
                    location={submission.location}
                    baseSalary={submission.baseSalary}
                    bonus={submission.bonus}
                    stockCompensation={submission.stockCompensation}
                    yearsOfExperience={submission.yearsOfExperience}
                    level={submission.level}
                  />
                ))}
              </div>

              {/* Levels Comparison Section */}
              <LevelsComparison jobTitle={activeCategory?.label || ''} />
            </>
          )}
        </div>
      </div>
    </section>
  )
}