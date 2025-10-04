'use client'

import { useState, useEffect } from 'react'
import { Info, ChevronDown, X } from 'lucide-react'
import {
  getTopCompaniesByJobTitle,
  getAllCompaniesByJobTitle,
  getLevelsByCompanyAndJobTitle,
  getLevelSalaryDetails,
} from '@/app/actions/salaries'
import { LevelDetailsModal } from './LevelDetailsModal'

interface Company {
  id: number
  name: string
  submissionCount?: number
}

interface Level {
  id: number
  levelName: string
  description?: string
}

interface LevelDetails {
  companyName: string
  jobTitleName: string
  levelName: string
  totalCompensation: number
  baseSalary: number
  bonus: number
  stockCompensation: number
  dataPointCount: number
}

const companyColors: Record<string, string> = {
  Google: 'bg-green-100 border-green-300 text-green-800',
  Meta: 'bg-purple-100 border-purple-300 text-purple-800',
  Facebook: 'bg-purple-100 border-purple-300 text-purple-800',
  Microsoft: 'bg-blue-100 border-blue-300 text-blue-800',
  Amazon: 'bg-orange-100 border-orange-300 text-orange-800',
  Apple: 'bg-gray-100 border-gray-400 text-gray-800',
}

export function LevelsComparison({ jobTitle }: { jobTitle: string }) {
  const [topCompanies, setTopCompanies] = useState<Company[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [companyLevels, setCompanyLevels] = useState<Record<string, Level[]>>({})
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modalData, setModalData] = useState<LevelDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true)
      const [top, all] = await Promise.all([
        getTopCompaniesByJobTitle(jobTitle, 5),
        getAllCompaniesByJobTitle(jobTitle),
      ])
      setTopCompanies(top)
      setAllCompanies(all)
      setLoading(false)
    }
    fetchCompanies()
  }, [jobTitle])

  const handleCompanyClick = async (companyName: string) => {
    if (selectedCompanies.includes(companyName)) {
      // Deselect company
      setSelectedCompanies(selectedCompanies.filter((c) => c !== companyName))
      const newLevels = { ...companyLevels }
      delete newLevels[companyName]
      setCompanyLevels(newLevels)
    } else {
      // Select company
      let newSelected = [...selectedCompanies, companyName]

      // FIFO: if already 3, remove the oldest
      if (newSelected.length > 3) {
        const removed = newSelected.shift()!
        const newLevels = { ...companyLevels }
        delete newLevels[removed]
        setCompanyLevels(newLevels)
      }

      setSelectedCompanies(newSelected)

      // Fetch levels for this company
      const levels = await getLevelsByCompanyAndJobTitle(companyName, jobTitle)
      setCompanyLevels((prev) => ({ ...prev, [companyName]: levels }))
    }
    setShowMoreDropdown(false)
  }

  const handleLevelClick = async (companyName: string, levelName: string) => {
    const details = await getLevelSalaryDetails(companyName, jobTitle, levelName)
    if (details) {
      setModalData(details)
      setIsModalOpen(true)
    }
  }

  const moreCompanies = allCompanies.filter(
    (c) => !topCompanies.some((tc) => tc.id === c.id)
  )

  const getCompanyColor = (companyName: string) => {
    return companyColors[companyName] || 'bg-gray-100 border-gray-300 text-gray-800'
  }

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="mt-12 py-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-black">{jobTitle} Levels</h2>
          <button className="text-gray-400 hover:text-gray-600" title="Compare career ladders across companies">
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Company Badges Row */}
        <div className="flex flex-wrap gap-3 mb-8">
          {topCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleCompanyClick(company.name)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border-2 ${
                selectedCompanies.includes(company.name)
                  ? 'bg-brand-secondary text-white border-brand-secondary'
                  : 'bg-white text-black border-gray-300 hover:border-brand-secondary'
              }`}
            >
              {company.name}
              {company.submissionCount && (
                <span className="ml-2 text-xs opacity-75">({company.submissionCount})</span>
              )}
            </button>
          ))}

          {moreCompanies.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-white text-black border-2 border-gray-300 hover:border-brand-secondary flex items-center gap-1"
              >
                More
                <ChevronDown className="w-4 h-4" />
              </button>

              {showMoreDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
                  {moreCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanyClick(company.name)}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison Grid */}
        {selectedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCompanies.map((companyName) => (
              <div key={companyName} className="bg-white rounded-lg border-2 border-gray-200 p-4">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <h3 className="font-bold text-lg text-black">{companyName}</h3>
                  <button
                    onClick={() => handleCompanyClick(companyName)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Level Cards */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {companyLevels[companyName]?.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleLevelClick(companyName, level.levelName)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${getCompanyColor(
                        companyName
                      )}`}
                    >
                      <div className="font-bold">{level.levelName}</div>
                      {level.description && (
                        <div className="text-xs mt-1 opacity-80">{level.description}</div>
                      )}
                    </button>
                  ))}
                  {(!companyLevels[companyName] || companyLevels[companyName].length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No level data available
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Select companies above to compare their career levels</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalData && (
        <LevelDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          companyName={modalData.companyName}
          levelName={modalData.levelName}
          jobTitle={modalData.jobTitleName}
          totalCompensation={modalData.totalCompensation}
          baseSalary={modalData.baseSalary}
          bonus={modalData.bonus}
          stockCompensation={modalData.stockCompensation}
          dataPointCount={modalData.dataPointCount}
        />
      )}
    </div>
  )
}