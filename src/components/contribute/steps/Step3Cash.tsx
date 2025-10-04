'use client'

import { FormData } from '../types'

interface Step3Props {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
]

export function Step3Cash({ formData, updateFormData, errors }: Step3Props) {
  const formatNumber = (value: number | undefined) => {
    if (!value) return ''
    return value.toLocaleString('en-US')
  }

  const parseNumber = (value: string) => {
    return parseFloat(value.replace(/,/g, '')) || undefined
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cash Compensation</h2>
        <p className="text-gray-600">Your direct cash earnings</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.currency}
          onChange={(e) => updateFormData({ currency: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.currency ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} ({currency.symbol}) - {currency.name}
            </option>
          ))}
        </select>
        {errors.currency && <p className="text-sm text-red-500 mt-1">{errors.currency}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Base Salary (Annualized) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {CURRENCIES.find((c) => c.code === formData.currency)?.symbol || '$'}
          </span>
          <input
            type="text"
            value={formatNumber(formData.baseSalary)}
            onChange={(e) =>
              updateFormData({
                baseSalary: parseNumber(e.target.value),
              })
            }
            placeholder="e.g., 120,000"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.baseSalary ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          We annualize for you — just enter your yearly base pay
        </p>
        {errors.baseSalary && <p className="text-sm text-red-500 mt-1">{errors.baseSalary}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Signing Bonus (One-time)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {CURRENCIES.find((c) => c.code === formData.currency)?.symbol || '$'}
          </span>
          <input
            type="text"
            value={formatNumber(formData.signingBonus)}
            onChange={(e) =>
              updateFormData({
                signingBonus: parseNumber(e.target.value),
              })
            }
            placeholder="e.g., 25,000"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Any one-time payment upon joining</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other Recurring Cash Stipends (Annual)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {CURRENCIES.find((c) => c.code === formData.currency)?.symbol || '$'}
          </span>
          <input
            type="text"
            value={formatNumber(formData.otherCashStipends)}
            onChange={(e) =>
              updateFormData({
                otherCashStipends: parseNumber(e.target.value),
              })
            }
            placeholder="e.g., 5,000"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Housing, transportation, or other yearly cash benefits
        </p>
      </div>
    </div>
  )
}
