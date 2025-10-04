'use client'

import { FormData } from '../types'

interface Step5Props {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function Step5Bonus({ formData, updateFormData, errors }: Step5Props) {
  const formatNumber = (value: number | undefined) => {
    if (!value) return ''
    return value.toLocaleString('en-US')
  }

  const parseNumber = (value: string) => {
    return parseFloat(value.replace(/,/g, '')) || undefined
  }

  const estimatedBonus = formData.targetBonusPercent && formData.baseSalary
    ? (formData.baseSalary * formData.targetBonusPercent) / 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bonus</h2>
        <p className="text-gray-600">Your performance-based compensation</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Bonus (% of base)
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="200"
            step="5"
            value={formData.targetBonusPercent || ''}
            onChange={(e) =>
              updateFormData({
                targetBonusPercent: parseFloat(e.target.value),
              })
            }
            placeholder="e.g., 15"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Your target bonus as a percentage of base salary
        </p>
        {estimatedBonus > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            Estimated: ${Math.round(estimatedBonus).toLocaleString('en-US')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Actual Annual Bonus Last Year
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="text"
            value={formatNumber(formData.actualBonusAmount)}
            onChange={(e) =>
              updateFormData({
                actualBonusAmount: parseNumber(e.target.value),
              })
            }
            placeholder="e.g., 18,000"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          The actual bonus you received last year (if applicable)
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">💡 About Bonuses</h3>
        <p className="text-sm text-gray-700">
          We use your actual bonus if provided. If not, we'll estimate using your target bonus
          percentage. This helps us calculate your total compensation accurately.
        </p>
      </div>
    </div>
  )
}
