'use client'

import { SalaryResult } from '@/app/actions/search-salaries'
import { useState } from 'react'

interface SalaryResultsTableProps {
  results: SalaryResult[]
}

export function SalaryResultsTable({ results }: SalaryResultsTableProps) {
  const [sortField, setSortField] = useState<keyof SalaryResult>('totalCompensation')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof SalaryResult) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    return 0
  })

  const formatCurrency = (value: string | number | null) => {
    if (value === null) return '$0'
    const num = typeof value === 'string' ? parseFloat(value) : value
    return `$${Math.round(num).toLocaleString()}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }

  const SortIcon = ({ field }: { field: keyof SalaryResult }) => {
    if (sortField !== field) {
      return (
        <span className="text-gray-400 ml-1">
          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 8l5-5 5 5H5zm0 4l5 5 5-5H5z" />
          </svg>
        </span>
      )
    }

    return (
      <span className="text-brand-secondary ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-brand-primary border-b border-gray-300">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('company')}
              >
                Company <SortIcon field="company" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('jobTitle')}
              >
                Job Title <SortIcon field="jobTitle" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('location')}
              >
                Location <SortIcon field="location" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('level')}
              >
                Level <SortIcon field="level" />
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('baseSalary')}
              >
                Base <SortIcon field="baseSalary" />
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('bonus')}
              >
                Bonus <SortIcon field="bonus" />
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('stockCompensation')}
              >
                Stock <SortIcon field="stockCompensation" />
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('totalCompensation')}
              >
                Total <SortIcon field="totalCompensation" />
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('yearsOfExperience')}
              >
                YOE <SortIcon field="yearsOfExperience" />
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-semibold text-brand-secondary uppercase tracking-wider cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => handleSort('submissionDate')}
              >
                Date <SortIcon field="submissionDate" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedResults.map((result) => (
              <tr key={result.submissionId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {result.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {result.jobTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {result.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {result.level || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(result.baseSalary)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(result.bonus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(result.stockCompensation)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-secondary text-right">
                  {formatCurrency(result.totalCompensation)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                  {result.yearsOfExperience}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                  {formatDate(result.submissionDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
