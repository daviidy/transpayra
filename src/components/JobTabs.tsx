'use client'

import { useState, useEffect } from 'react'
import { Code, Briefcase, Database, Palette, Server } from 'lucide-react'
import { SalaryCard } from './SalaryCard'
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
  currency: string
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
        <div className="flex flex-wrap justify-center items-center gap-2 mb-10">
          {jobCategories.map((category) => {
            const Icon = category.icon
            const isActive = activeTab === category.id

            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-2 px-6 py-2 h-10 rounded-full font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-primary text-brand-secondary'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No salary data available for this role yet.
            </div>
          ) : (
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
                  currency={submission.currency}
                  yearsOfExperience={submission.yearsOfExperience}
                  level={submission.level}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}