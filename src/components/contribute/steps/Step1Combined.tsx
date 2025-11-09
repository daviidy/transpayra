'use client'

import { FormData } from '../types'
import { TypeaheadInput } from './TypeaheadInput'
import {
  searchIndustries,
  searchJobTitles,
  searchCompanies,
  searchLocations,
  getIndustryByJobTitle,
  saveLocation,
} from '@/app/actions/typeahead'

interface Step1Props {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function Step1Combined({ formData, updateFormData, errors }: Step1Props) {
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

  // Auto-populate industry when job title is selected
  const handleJobTitleChange = async (value: string, id?: number) => {
    // Fetch and populate industry
    if (id) {
      const industryData = await getIndustryByJobTitle(id)
      if (industryData) {
        updateFormData({
          jobTitle: value,
          jobTitleId: id,
          industry: industryData.value,
          industryId: industryData.id,
        })
      }
    } else {
      updateFormData({ jobTitle: value, jobTitleId: id })
    }
  }

  // Save location to database when selected
  const handleLocationChange = async (value: string, id?: number) => {
    // Save to database and get real location ID
    try {
      const locationId = await saveLocation(value)
      updateFormData({
        location: value,
        locationId: locationId,
      })
    } catch (error) {
      console.error('Error saving location:', error)
      // Fallback to just saving the value
      updateFormData({ location: value })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Role, Company & Experience</h2>
        <p className="text-gray-600">Tell us about your position and career progression</p>
      </div>

      <TypeaheadInput
        label="Job Title"
        placeholder="e.g., Software Engineer, Product Manager..."
        value={formData.jobTitle || ''}
        onChange={handleJobTitleChange}
        onSearch={(query) => searchJobTitles(query)}
        error={errors.jobTitle}
        required
      />

      <TypeaheadInput
        label="Industry"
        placeholder="Auto-populated based on job title"
        value={formData.industry || ''}
        onChange={(value, id) => updateFormData({ industry: value, industryId: id })}
        onSearch={searchIndustries}
        error={errors.industry}
        required
        disabled
        helperText="This field is automatically filled based on your job title"
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
        placeholder="e.g., San Francisco, London, Tokyo..."
        value={formData.location || ''}
        onChange={handleLocationChange}
        onSearch={searchLocations}
        error={errors.location}
        required
        helperText="Enter city name - we'll show you matching cities worldwide"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-3">
            Work Model <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.workModel}
            onChange={(e) =>
              updateFormData({
                workModel: e.target.value as 'Remote' | 'Hybrid' | 'On-site',
              })
            }
            className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all ${
              errors.workModel ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="">Select...</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
          {errors.workModel && <p className="text-sm text-red-500 mt-2">{errors.workModel}</p>}
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-800 mb-3">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.employmentType}
            onChange={(e) =>
              updateFormData({
                employmentType: e.target.value as 'Full-time' | 'Contract' | 'Intern',
              })
            }
            className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all ${
              errors.employmentType ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="">Select...</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </select>
          {errors.employmentType && <p className="text-sm text-red-500 mt-2">{errors.employmentType}</p>}
        </div>
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          As-of Date <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={formData.asOfDate.month}
            onChange={(e) =>
              updateFormData({
                asOfDate: { ...formData.asOfDate, month: e.target.value },
              })
            }
            className="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all"
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
            className="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all"
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {errors.asOfDate && <p className="text-sm text-red-500 mt-2">{errors.asOfDate}</p>}
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience & Seniority</h3>

        <div>
          <label className="block text-base font-semibold text-gray-800 mb-3">
            Company-Specific Level
          </label>
          <input
            type="text"
            value={formData.companyLevel || ''}
            onChange={(e) => updateFormData({ companyLevel: e.target.value })}
            placeholder="e.g., L5, Senior, Principal..."
            className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all ${
              errors.companyLevel ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          <p className="text-sm text-gray-500 mt-2">
            Optional - Add your Level (like Senior, Junior, VP etc)
          </p>
          {errors.companyLevel && <p className="text-sm text-red-500 mt-2">{errors.companyLevel}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Years of Experience
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
              placeholder="5"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Years at Company</label>
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
              placeholder="2"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Years at Level</label>
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
              placeholder="1"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
