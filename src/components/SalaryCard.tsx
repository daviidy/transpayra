'use client'

import { MapPin } from "lucide-react"
import Link from "next/link"
import { CompanyLogo } from "./CompanyLogo"
import { useCurrency } from "@/contexts/CurrencyContext"
import { Currency } from "@/lib/currency"

interface SalaryCardProps {
  id: number
  company: string
  companyLogoUrl?: string | null
  jobTitle: string
  location: string
  baseSalary: string
  bonus: string
  stockCompensation: string
  currency: string
  yearsOfExperience: number
  level?: string
}

export function SalaryCard({
  id,
  company,
  companyLogoUrl,
  jobTitle,
  location,
  baseSalary,
  currency,
}: SalaryCardProps) {
  const { formatAmount } = useCurrency()
  const formattedBase = formatAmount(parseFloat(baseSalary), currency as Currency)

  return (
    <Link
      href={`/submission/${id}`}
      className="block w-60 flex flex-col bg-white border border-gray-200 rounded-xl pb-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Decorative Header with Logo */}
      <div className="h-14 relative rounded-t-xl bg-gradient-to-r from-brand-primary to-brand-secondary/20">
        <div className="absolute -bottom-7 left-3 z-10">
          <CompanyLogo companyName={company} logoUrl={companyLogoUrl} size="lg" />
        </div>
      </div>

      {/* Card Content */}
      <div className="mt-10 px-4 flex flex-col">
        <h4 className="text-sm font-semibold text-gray-900">
          {jobTitle}
        </h4>
        <p className="text-xs font-medium text-gray-700 mt-0.5">
          {company}
        </p>
        <p className="text-xs mt-1 text-gray-600 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {location}
        </p>

        <hr className="border-[1.5px] w-12 mt-6 mb-2 border-gray-200 rounded" />

        <p className="text-lg font-bold text-brand-secondary">{formattedBase}</p>
      </div>
    </Link>
  )
}