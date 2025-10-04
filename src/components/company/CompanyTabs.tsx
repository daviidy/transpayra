'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { OverviewTab } from './OverviewTab'
import { SalariesTab } from './SalariesTab'
import type { CompanyDetails } from '@/app/actions/companies'

interface CompanyTabsProps {
  companyId: number
  company: CompanyDetails
}

export function CompanyTabs({ companyId, company }: CompanyTabsProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'overview' | 'salaries'>(
    tabParam === 'salaries' ? 'salaries' : 'overview'
  )

  useEffect(() => {
    if (tabParam === 'salaries') {
      setActiveTab('salaries')
    }
  }, [tabParam])

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="container mx-auto px-6">
          <div className="flex justify-center gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-brand-secondary text-brand-secondary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('salaries')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'salaries'
                  ? 'border-brand-secondary text-brand-secondary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Salaries
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'overview' ? (
          <OverviewTab
            companyId={companyId}
            company={company}
            onViewAllSalaries={() => setActiveTab('salaries')}
          />
        ) : (
          <SalariesTab companyId={companyId} companyName={company.name} />
        )}
      </div>
    </div>
  )
}
