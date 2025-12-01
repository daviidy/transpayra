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
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'

const STEPS = [
  { number: 1, name: 'Role & Experience' },
  { number: 2, name: 'Compensation' },
  { number: 3, name: 'Review' },
]

export function SalarySubmissionWizard() {
  const router = useRouter()
  const { token, isLoading: tokenLoading } = useAnonymousToken()
  const { user } = useAuth()
  const t = useTranslations()
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
      const result = await submitSalary(formData, token, user?.id)

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
    <div className="min-h-screen flex flex-col">
      {/* Progress Bar at Top */}
      <div className="w-full px-4 pt-6">
        <div className="max-w-2xl mx-auto">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-secondary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          {/* Step Content Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  {t('contribute.back')}
                </button>
              )}
              <button
                onClick={handleSaveAndExit}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
              >
                {t('contribute.saveAndExit')}
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={isSubmitting || (currentStep === 3 && !token)}
              className="px-10 py-4 bg-brand-secondary text-white rounded-2xl font-bold text-base hover:bg-brand-accent transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              {isSubmitting ? t('contribute.submitting') : currentStep === 3 ? t('contribute.submit') : t('contribute.continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
