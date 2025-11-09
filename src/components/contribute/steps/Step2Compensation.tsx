'use client'

import { FormData } from '../types'
import { useTranslations } from 'next-intl'

interface Step2Props {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

const CURRENCIES = [
  { code: 'XOF', symbol: 'F CFA', name: 'West African CFA Franc' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
]

export function Step2Compensation({ formData, updateFormData, errors }: Step2Props) {
  const t = useTranslations()
  const formatNumber = (value: number | undefined) => {
    if (!value) return ''
    return value.toLocaleString('en-US')
  }

  const parseNumber = (value: string) => {
    const num = parseFloat(value.replace(/,/g, ''))
    return isNaN(num) ? undefined : num
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('form.step2Title')}</h2>
        <p className="text-gray-600">{t('form.step2Subtitle')}</p>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          {t('form.currency')} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.currency}
          onChange={(e) => updateFormData({ currency: e.target.value })}
          className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 text-base bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all ${
            errors.currency ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} ({currency.symbol}) - {currency.name}
            </option>
          ))}
        </select>
        {errors.currency && <p className="text-sm text-red-500 mt-2">{errors.currency}</p>}
      </div>

      {/* Base Salary */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          {t('form.baseSalary')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formatNumber(formData.baseSalary)}
          onChange={(e) =>
            updateFormData({
              baseSalary: parseNumber(e.target.value),
            })
          }
          placeholder="120,000"
          className={`w-full px-4 py-4 border-2 rounded-xl text-gray-900 text-lg bg-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-all ${
            errors.baseSalary ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.baseSalary && <p className="text-sm text-red-500 mt-2">{errors.baseSalary}</p>}
      </div>
    </div>
  )
}
