export interface FormData {
  // Step 1: Role & Company
  industry?: string
  industryId?: number
  jobTitle?: string
  jobTitleId?: number
  company?: string
  companyId?: number
  location?: string
  locationId?: number
  workModel: 'Remote' | 'Hybrid' | 'On-site' | ''
  employmentType: 'Full-time' | 'Contract' | 'Intern' | ''
  asOfDate: {
    month: string
    year: string
  }

  // Step 2: Seniority & Experience
  companyLevel?: string
  companyLevelId?: number
  yearsOfExperience?: number
  yearsAtCompany?: number
  yearsAtLevel?: number
  focusTag?: string

  // Step 3: Cash Compensation
  currency: string
  baseSalary?: number
  signingBonus?: number
  otherCashStipends?: number

  // Step 4: Equity / Stock
  equityType: 'RSU' | 'Options' | 'None' | ''
  equityGrantValue?: number
  equityGrantShares?: number
  equityGrantToggle: 'value' | 'shares'
  vestingDuration?: number
  vestingCliff?: number
  vestingFrontLoaded: boolean
  vestingFrontLoadedPercent?: number
  equityRefresher?: number

  // Step 5: Bonus
  targetBonusPercent?: number
  actualBonusAmount?: number

  // Step 6: Review & Privacy
  accuracyConsent: boolean
  privacyConsent: boolean
}

export const initialFormData: FormData = {
  workModel: '',
  employmentType: '',
  asOfDate: { month: '', year: '' },
  currency: 'USD',
  equityType: '',
  equityGrantToggle: 'value',
  vestingFrontLoaded: false,
  accuracyConsent: false,
  privacyConsent: false,
}

export interface TypeaheadOption {
  id: number
  label: string
  value: string
}
