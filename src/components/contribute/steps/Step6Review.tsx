'use client'

import { FormData } from '../types'

interface Step6Props {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function Step6Review({ formData, updateFormData, errors }: Step6Props) {
  const calculateAverageAnnualStock = () => {
    if (!formData.equityGrantValue || !formData.vestingDuration) return 0

    if (formData.vestingFrontLoaded && formData.vestingFrontLoadedPercent) {
      const year1 = (formData.equityGrantValue * formData.vestingFrontLoadedPercent) / 100
      const remaining = formData.equityGrantValue - year1
      const perYear = remaining / (formData.vestingDuration - 1)
      return (year1 + perYear * (formData.vestingDuration - 1)) / formData.vestingDuration
    }

    return formData.equityGrantValue / formData.vestingDuration
  }

  const calculateBonus = () => {
    if (formData.actualBonusAmount) return formData.actualBonusAmount
    if (formData.targetBonusPercent && formData.baseSalary) {
      return (formData.baseSalary * formData.targetBonusPercent) / 100
    }
    return 0
  }

  const totalCompensation =
    (formData.baseSalary || 0) +
    calculateAverageAnnualStock() +
    calculateBonus() +
    (formData.otherCashStipends || 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-gray-600">Please review your submission before submitting</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-brand-secondary rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Your Submission Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Job Title</p>
              <p className="font-semibold text-gray-900">{formData.jobTitle || '—'}</p>
            </div>
            <div>
              <p className="text-gray-600">Company</p>
              <p className="font-semibold text-gray-900">{formData.company || '—'}</p>
            </div>
            <div>
              <p className="text-gray-600">Location</p>
              <p className="font-semibold text-gray-900">{formData.location || '—'}</p>
            </div>
            <div>
              <p className="text-gray-600">Level</p>
              <p className="font-semibold text-gray-900">{formData.companyLevel || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-300 pt-4">
          <h4 className="font-bold text-gray-900 mb-3">Compensation Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Base Salary</span>
              <span className="font-semibold text-gray-900">
                {formData.currency} {(formData.baseSalary || 0).toLocaleString('en-US')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Avg Annual Stock</span>
              <span className="font-semibold text-gray-900">
                {formData.currency} {Math.round(calculateAverageAnnualStock()).toLocaleString('en-US')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Bonus</span>
              <span className="font-semibold text-gray-900">
                {formData.currency} {Math.round(calculateBonus()).toLocaleString('en-US')}
              </span>
            </div>
            {formData.otherCashStipends && formData.otherCashStipends > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700">Other Cash</span>
                <span className="font-semibold text-gray-900">
                  {formData.currency} {formData.otherCashStipends.toLocaleString('en-US')}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-amber-300 pt-2 mt-2">
              <span className="font-bold text-gray-900">Total Compensation</span>
              <span className="font-bold text-xl text-brand-secondary">
                {formData.currency} {Math.round(totalCompensation).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-300 pt-4">
          <h4 className="font-bold text-gray-900 mb-2">Experience</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Experience</p>
              <p className="font-semibold text-gray-900">
                {formData.yearsOfExperience ? `${formData.yearsOfExperience} yrs` : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">At Company</p>
              <p className="font-semibold text-gray-900">
                {formData.yearsAtCompany ? `${formData.yearsAtCompany} yrs` : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">At Level</p>
              <p className="font-semibold text-gray-900">
                {formData.yearsAtLevel ? `${formData.yearsAtLevel} yrs` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>How we calculate Total Compensation:</strong> Base + Average annual stock (grant
          value ÷ vesting years) + Bonus (actual or target × base) + Other recurring cash. We annualize
          all components for fair comparison.
        </p>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <label
          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            formData.accuracyConsent
              ? 'border-brand-secondary bg-amber-50'
              : errors.accuracyConsent
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="checkbox"
            checked={formData.accuracyConsent}
            onChange={(e) =>
              updateFormData({
                accuracyConsent: e.target.checked,
              })
            }
            className="w-5 h-5 mt-1 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
          />
          <div>
            <span className="font-semibold text-gray-900">
              This information is accurate to the best of my knowledge
            </span>
            {errors.accuracyConsent && (
              <p className="text-sm text-red-500 mt-1">{errors.accuracyConsent}</p>
            )}
          </div>
        </label>

        <label
          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            formData.privacyConsent
              ? 'border-brand-secondary bg-amber-50'
              : errors.privacyConsent
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="checkbox"
            checked={formData.privacyConsent}
            onChange={(e) =>
              updateFormData({
                privacyConsent: e.target.checked,
              })
            }
            className="w-5 h-5 mt-1 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
          />
          <div>
            <span className="font-semibold text-gray-900">
              Share anonymously according to our privacy policy
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Your submission will be completely anonymous. We don't store any personally identifiable
              information.
            </p>
            {errors.privacyConsent && (
              <p className="text-sm text-red-500 mt-1">{errors.privacyConsent}</p>
            )}
          </div>
        </label>
      </div>
    </div>
  )
}
