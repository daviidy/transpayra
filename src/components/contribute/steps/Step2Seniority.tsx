'use client'

import { FormData } from '../types'
import { TypeaheadInput } from './TypeaheadInput'
import { searchCompanyLevels } from '@/app/actions/typeahead'

interface Step2Props {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function Step2Seniority({ formData, updateFormData, errors }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seniority & Experience</h2>
        <p className="text-gray-600">Help us understand your career progression</p>
      </div>

      <TypeaheadInput
        label="Company-Specific Level"
        placeholder="e.g., L5, Senior, Principal..."
        value={formData.companyLevel || ''}
        onChange={(value, id) => updateFormData({ companyLevel: value, companyLevelId: id })}
        onSearch={(query) =>
          searchCompanyLevels(query, formData.companyId || 0, formData.jobTitleId || 0)
        }
        error={errors.companyLevel}
        helperText='Select your level at this company, or choose "Not sure"'
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience (Total)
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={formData.yearsOfExperience || ''}
            onChange={(e) =>
              updateFormData({
                yearsOfExperience: parseFloat(e.target.value),
              })
            }
            placeholder="e.g., 5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Total professional experience in your field</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Years at Company</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={formData.yearsAtCompany || ''}
            onChange={(e) =>
              updateFormData({
                yearsAtCompany: parseFloat(e.target.value),
              })
            }
            placeholder="e.g., 2"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Time at your current company</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years at Level (Optional)
        </label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={formData.yearsAtLevel || ''}
          onChange={(e) =>
            updateFormData({
              yearsAtLevel: parseFloat(e.target.value),
            })
          }
          placeholder="e.g., 1"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">Time at your current level/title</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Focus Tag / Team (Optional)
        </label>
        <input
          type="text"
          value={formData.focusTag || ''}
          onChange={(e) => updateFormData({ focusTag: e.target.value })}
          placeholder="e.g., Backend, ML, Security, Frontend..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">Your specialization or team focus area</p>
      </div>
    </div>
  )
}
