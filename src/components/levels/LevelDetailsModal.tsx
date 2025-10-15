'use client'

import { X } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

interface LevelDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  companyName: string
  levelName: string
  jobTitle: string
  totalCompensation: number
  baseSalary: number
  bonus: number
  stockCompensation: number
  dataPointCount: number
}

export function LevelDetailsModal({
  isOpen,
  onClose,
  companyName,
  levelName,
  jobTitle,
  totalCompensation,
  baseSalary,
  bonus,
  stockCompensation,
  dataPointCount,
}: LevelDetailsModalProps) {
  const { formatAmount } = useCurrency()

  if (!isOpen) return null

  const basePercent = (baseSalary / totalCompensation) * 100
  const bonusPercent = (bonus / totalCompensation) * 100
  const stockPercent = (stockCompensation / totalCompensation) * 100

  // Assume aggregated stats are in XOF (base currency)
  const formatCurrency = (amount: number) => {
    return formatAmount(amount, 'XOF')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-black">
              {companyName} - {levelName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Total Compensation */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Average Total Compensation</p>
            <p className="text-5xl font-bold text-brand-secondary">
              {formatCurrency(totalCompensation)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Based on {dataPointCount} data point{dataPointCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Breakdown Table */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-black mb-3">Compensation Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Base Salary</span>
                <span className="font-semibold text-black">{formatCurrency(baseSalary)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Bonus</span>
                <span className="font-semibold text-black">{formatCurrency(bonus)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Stock Compensation</span>
                <span className="font-semibold text-black">
                  {formatCurrency(stockCompensation)}
                </span>
              </div>
            </div>
          </div>

          {/* Donut Chart (Simple bar representation) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-black">Distribution</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Base Salary</span>
                  <span>{basePercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${basePercent}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Bonus</span>
                  <span>{bonusPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${bonusPercent}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Stock</span>
                  <span>{stockPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${stockPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 bg-brand-secondary text-white font-medium rounded-lg hover:bg-brand-accent transition-colors">
              Add Your Salary
            </button>
            <button className="flex-1 px-4 py-3 border border-brand-secondary text-brand-secondary font-medium rounded-lg hover:bg-brand-primary transition-colors">
              View Data Points
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}