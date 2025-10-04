'use client'

import { FormData } from '../types'

interface Step4Props {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function Step4Equity({ formData, updateFormData, errors }: Step4Props) {
  const formatNumber = (value: number | undefined) => {
    if (!value) return ''
    return value.toLocaleString('en-US')
  }

  const parseNumber = (value: string) => {
    return parseFloat(value.replace(/,/g, '')) || undefined
  }

  const calculateAverageAnnualStock = () => {
    if (!formData.equityGrantValue || !formData.vestingDuration) return 0

    if (formData.vestingFrontLoaded && formData.vestingFrontLoadedPercent) {
      // Simplified front-loaded calculation
      // Year 1: frontLoadedPercent%, remaining years: split evenly
      const year1 = (formData.equityGrantValue * formData.vestingFrontLoadedPercent) / 100
      const remaining = formData.equityGrantValue - year1
      const perYear = remaining / (formData.vestingDuration - 1)
      return (year1 + perYear * (formData.vestingDuration - 1)) / formData.vestingDuration
    }

    return formData.equityGrantValue / formData.vestingDuration
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Equity / Stock</h2>
        <p className="text-gray-600">Your equity compensation details</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Equity Type</label>
        <div className="grid grid-cols-3 gap-4">
          {['RSU', 'Options', 'None'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                updateFormData({
                  equityType: type as 'RSU' | 'Options' | 'None',
                })
              }
              className={`px-4 py-3 border rounded-lg font-medium transition-colors ${
                formData.equityType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {formData.equityType && formData.equityType !== 'None' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grant Value</label>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => updateFormData({ equityGrantToggle: 'value' })}
                className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
                  formData.equityGrantToggle === 'value'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Total $ Value
              </button>
              <button
                type="button"
                onClick={() => updateFormData({ equityGrantToggle: 'shares' })}
                className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
                  formData.equityGrantToggle === 'shares'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Number of Shares
              </button>
            </div>

            {formData.equityGrantToggle === 'value' ? (
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
                  placeholder="e.g., 400,000"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.equityGrant ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
            ) : (
              <input
                type="text"
                value={formatNumber(formData.equityGrantShares)}
                onChange={(e) =>
                  updateFormData({
                    equityGrantShares: parseNumber(e.target.value),
                  })
                }
                placeholder="e.g., 10,000"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.equityGrant ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
            {errors.equityGrant && <p className="text-sm text-red-500 mt-1">{errors.equityGrant}</p>}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Vesting Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (years)
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
                  placeholder="e.g., 4"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vestingDuration ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vestingDuration && (
                  <p className="text-sm text-red-500 mt-1">{errors.vestingDuration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliff (months)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.vestingCliff || ''}
                  onChange={(e) =>
                    updateFormData({
                      vestingCliff: parseInt(e.target.value),
                    })
                  }
                  placeholder="e.g., 12"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vestingCliff ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vestingCliff && (
                  <p className="text-sm text-red-500 mt-1">{errors.vestingCliff}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.vestingFrontLoaded}
                  onChange={(e) =>
                    updateFormData({
                      vestingFrontLoaded: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Front-loaded vesting?</span>
              </label>
              {formData.vestingFrontLoaded && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First year percent
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.vestingFrontLoadedPercent || ''}
                    onChange={(e) =>
                      updateFormData({
                        vestingFrontLoadedPercent: parseFloat(e.target.value),
                      })
                    }
                    placeholder="e.g., 40"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {formData.vestingDuration && formData.equityGrantValue && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Computed Average Annual Stock:</p>
              <p className="text-2xl font-bold text-green-700">
                ${Math.round(calculateAverageAnnualStock()).toLocaleString('en-US')}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refreshers/Top-ups This Year (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                value={formatNumber(formData.equityRefresher)}
                onChange={(e) =>
                  updateFormData({
                    equityRefresher: parseNumber(e.target.value),
                  })
                }
                placeholder="e.g., 50,000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Additional equity grants received this year</p>
          </div>
        </>
      )}
    </div>
  )
}
