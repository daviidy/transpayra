'use client'

import { FormData } from '../types'
import { TypeaheadInput } from './TypeaheadInput'
import {
  searchIndustries,
  searchJobTitles,
  searchCompanies,
  searchLocations,
} from '@/app/actions/typeahead'

interface Step1Props {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function Step1RoleCompany({ formData, updateFormData, errors }: Step1Props) {
  const currentYear = new Date().getFullYear()
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Role & Company</h2>
        <p className="text-gray-600">Tell us about your position and where you work</p>
      </div>

      <TypeaheadInput
        label="Industry"
        placeholder="e.g., Technology, Finance, Healthcare..."
        value={formData.industry || ''}
        onChange={(value, id) => updateFormData({ industry: value, industryId: id })}
        onSearch={searchIndustries}
        error={errors.industry}
        required
        helperText="Choose the industry that best matches your company"
      />

      <TypeaheadInput
        label="Job Title"
        placeholder="e.g., Software Engineer, Product Manager..."
        value={formData.jobTitle || ''}
        onChange={(value, id) => updateFormData({ jobTitle: value, jobTitleId: id })}
        onSearch={(query) => searchJobTitles(query, formData.industryId)}
        error={errors.jobTitle}
        required
        helperText="Your official job title or role"
      />

      <TypeaheadInput
        label="Company"
        placeholder="e.g., Google, Microsoft, Amazon..."
        value={formData.company || ''}
        onChange={(value, id) => updateFormData({ company: value, companyId: id })}
        onSearch={searchCompanies}
        error={errors.company}
        required
      />

      <TypeaheadInput
        label="Location"
        placeholder="e.g., San Francisco, CA, USA..."
        value={formData.location || ''}
        onChange={(value, id) => updateFormData({ location: value, locationId: id })}
        onSearch={searchLocations}
        error={errors.location}
        required
        helperText="City or metro area where you work"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Model <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          {['Remote', 'Hybrid', 'On-site'].map((model) => (
            <button
              key={model}
              type="button"
              onClick={() =>
                updateFormData({
                  workModel: model as 'Remote' | 'Hybrid' | 'On-site',
                })
              }
              className={`px-4 py-3 border rounded-lg font-medium transition-colors ${
                formData.workModel === model
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
              }`}
            >
              {model}
            </button>
          ))}
        </div>
        {errors.workModel && <p className="text-sm text-red-500 mt-1">{errors.workModel}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Employment Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          {['Full-time', 'Contract', 'Intern'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                updateFormData({
                  employmentType: type as 'Full-time' | 'Contract' | 'Intern',
                })
              }
              className={`px-4 py-3 border rounded-lg font-medium transition-colors ${
                formData.employmentType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.employmentType && <p className="text-sm text-red-500 mt-1">{errors.employmentType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          As-of Date <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">When was/is this compensation effective?</p>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={formData.asOfDate.month}
            onChange={(e) =>
              updateFormData({
                asOfDate: { ...formData.asOfDate, month: e.target.value },
              })
            }
            className="px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select month</option>
            {months.map((month, index) => (
              <option key={month} value={String(index + 1)}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={formData.asOfDate.year}
            onChange={(e) =>
              updateFormData({
                asOfDate: { ...formData.asOfDate, year: e.target.value },
              })
            }
            className="px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {errors.asOfDate && <p className="text-sm text-red-500 mt-1">{errors.asOfDate}</p>}
      </div>
    </div>
  )
}
