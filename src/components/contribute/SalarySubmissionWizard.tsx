'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormData, initialFormData, TypeaheadOption } from './types'
import {
  searchIndustries,
  searchJobTitles,
  searchCompanies,
  searchLocations,
  searchCompanyLevels,
} from '@/app/actions/typeahead'
import { Step1Combined } from './steps/Step1Combined'
import { Step2Compensation } from './steps/Step2Compensation'
import { Step6Review } from './steps/Step6Review'
import { useAnonymousToken } from '@/lib/hooks/useAnonymousToken'

const STEPS = [
  { number: 1, name: 'Role & Experience' },
  { number: 2, name: 'Compensation' },
  { number: 3, name: 'Review' },
]

export function SalarySubmissionWizard() {
  const router = useRouter()
  const { token, isLoading: tokenLoading } = useAnonymousToken()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('salary_submission_draft')
    if (draft) {
      try {
        setFormData(JSON.parse(draft))
      } catch (e) {
        console.error('Failed to load draft', e)
      }
    }
  }, [])

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('salary_submission_draft', JSON.stringify(formData))
  }, [formData])

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.industryId) newErrors.industry = 'Industry is required'
      if (!formData.jobTitleId) newErrors.jobTitle = 'Job Title is required'
      if (!formData.companyId) newErrors.company = 'Company is required'
      if (!formData.locationId) newErrors.location = 'Location is required'
      if (!formData.workModel) newErrors.workModel = 'Work model is required'
      if (!formData.employmentType) newErrors.employmentType = 'Employment type is required'
      if (!formData.asOfDate.month || !formData.asOfDate.year)
        newErrors.asOfDate = 'As-of date is required'
    }

    if (step === 2) {
      if (!formData.currency) newErrors.currency = 'Currency is required'
      if (!formData.baseSalary || formData.baseSalary <= 0)
        newErrors.baseSalary = 'Base salary must be greater than 0'
    }

    if (step === 3) {
      if (!formData.accuracyConsent) newErrors.accuracyConsent = 'You must confirm accuracy'
      if (!formData.privacyConsent) newErrors.privacyConsent = 'You must accept privacy policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        // Submit
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting || !token) return

    setIsSubmitting(true)
    try {
      const { submitSalary } = await import('@/app/actions/submit-salary')
      const result = await submitSalary(formData, token)

      if (result.success) {
        // Clear draft
        localStorage.removeItem('salary_submission_draft')

        // Redirect to success page
        router.push('/contribute/success')
      } else {
        alert(result.error || 'Failed to submit salary. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('An error occurred while submitting. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleRestart = () => {
    if (
      currentStep > 1 &&
      !confirm('Are you sure you want to restart? Your progress will be lost.')
    ) {
      return
    }

    setFormData(initialFormData)
    setCurrentStep(1)
    localStorage.removeItem('salary_submission_draft')
    router.push('/contribute')
  }

  const handleSaveAndExit = () => {
    // Draft is already saved in localStorage
    router.push('/')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Your Salary</h1>
          <p className="text-gray-600 mt-2">All information is anonymous and encrypted</p>
        </div>
        <button
          onClick={handleRestart}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Restart
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        {/* Step Indicators with Lines */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 w-full">
            {STEPS.map((step, index) => (
              <div key={step.number} className={`relative ${index < STEPS.length - 1 ? 'flex-1' : ''} flex items-center`}>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 font-semibold relative z-10 ${
                    currentStep >= step.number
                      ? 'bg-brand-secondary text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute w-full h-1 left-0 top-1/2 -translate-y-1/2 -z-0 transition-colors duration-300 ${
                      currentStep > step.number ? 'bg-brand-secondary' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-secondary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step Labels */}
        <div className="flex items-center justify-between mt-4">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`text-xs text-center font-medium ${
                currentStep >= step.number ? 'text-brand-secondary' : 'text-gray-500'
              }`}
              style={{ width: '33.33%' }}
            >
              {step.name}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        {currentStep === 1 && (
          <Step1Combined formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
        {currentStep === 2 && (
          <Step2Compensation formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
        {currentStep === 3 && (
          <Step6Review formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleSaveAndExit}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Save & Exit
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={isSubmitting || (currentStep === 3 && !token)}
          className="px-8 py-3 bg-brand-secondary text-white rounded-lg font-semibold hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : currentStep === 3 ? 'Submit' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
