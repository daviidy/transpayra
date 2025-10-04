'use client'

import { FormData } from '../types'

interface Step2Props {
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

export function Step2Compensation({ formData, updateFormData, errors }: Step2Props) {
  const formatNumber = (value: number | undefined) => {
    if (!value) return ''
    return value.toLocaleString('en-US')
  }

  const parseNumber = (value: string) => {
    return parseFloat(value.replace(/,/g, '')) || undefined
  }

  const calculateAverageAnnualStock = () => {
    if (!formData.equityGrantValue || !formData.vestingDuration) return 0
    return formData.equityGrantValue / formData.vestingDuration
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compensation</h2>
        <p className="text-gray-600">Your total compensation package</p>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.currency}
          onChange={(e) => updateFormData({ currency: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent ${
            errors.currency ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} ({currency.symbol}) - {currency.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cash Compensation */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-gray-900 mb-3">💵 Cash Compensation</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Salary (Annual) <span className="text-red-500">*</span>
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
              placeholder="120,000"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent ${
                errors.baseSalary ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.baseSalary && <p className="text-sm text-red-500 mt-1">{errors.baseSalary}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Signing Bonus</label>
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
                placeholder="25,000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bonus (Annual)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                {CURRENCIES.find((c) => c.code === formData.currency)?.symbol || '$'}
              </span>
              <input
                type="text"
                value={formatNumber(formData.actualBonusAmount)}
                onChange={(e) =>
                  updateFormData({
                    actualBonusAmount: parseNumber(e.target.value),
                  })
                }
                placeholder="18,000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Equity Compensation */}
      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-gray-900 mb-3">📈 Equity / Stock</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Equity Type</label>
          <select
            value={formData.equityType}
            onChange={(e) =>
              updateFormData({
                equityType: e.target.value as 'RSU' | 'Options' | 'None',
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="RSU">RSU</option>
            <option value="Options">Options</option>
            <option value="None">None</option>
          </select>
        </div>

        {formData.equityType && formData.equityType !== 'None' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Grant Value
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    value={formatNumber(formData.equityGrantValue)}
                    onChange={(e) =>
                      updateFormData({
                        equityGrantValue: parseNumber(e.target.value),
                      })
                    }
                    placeholder="400,000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vesting (years)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={formData.vestingDuration || ''}
                  onChange={(e) =>
                    updateFormData({
                      vestingDuration: parseFloat(e.target.value),
                    })
                  }
                  placeholder="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                />
              </div>
            </div>

            {formData.vestingDuration && formData.equityGrantValue && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700">Avg Annual Stock:</p>
                <p className="text-xl font-bold text-green-700">
                  ${Math.round(calculateAverageAnnualStock()).toLocaleString('en-US')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
