import { Building2, MapPin, TrendingUp } from "lucide-react"
import Link from "next/link"
import { CompanyLogo } from "./CompanyLogo"

interface SalaryCardProps {
  id: number
  company: string
  companyLogoUrl?: string | null
  jobTitle: string
  location: string
  baseSalary: string
  bonus: string
  stockCompensation: string
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
  bonus,
  stockCompensation,
  yearsOfExperience,
  level,
}: SalaryCardProps) {
  const totalComp = (
    parseFloat(baseSalary) +
    parseFloat(bonus) +
    parseFloat(stockCompensation)
  ).toLocaleString('en-US', { maximumFractionDigits: 0 })

  return (
    <Link
      href={`/submission/${id}`}
      className="block w-full px-4 py-3 bg-white rounded-md shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-light text-black">
          <CompanyLogo companyName={company} logoUrl={companyLogoUrl} size="sm" />
          <span>{company}</span>
        </div>
        {level && (
          <span className="px-3 py-1 text-xs text-brand-secondary uppercase bg-brand-primary rounded-full font-medium">
            {level}
          </span>
        )}
      </div>

      <div>
        <h3 className="mt-2 text-lg font-semibold text-black">{jobTitle}</h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-black font-medium">Total Compensation:</span>
          <span className="text-brand-secondary font-bold text-lg">${totalComp}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Base Salary:</span>
          <span className="font-medium">${parseFloat(baseSalary).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Bonus:</span>
          <span className="font-medium">${parseFloat(bonus).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Stock:</span>
          <span className="font-medium">${parseFloat(stockCompensation).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-3 text-xs text-gray-600">
        <TrendingUp className="w-3 h-3" />
        <span>{yearsOfExperience} years of experience</span>
      </div>
    </Link>
  )
}