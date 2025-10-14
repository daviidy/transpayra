'use server'

import { db } from '@/lib/db'
import { salarySubmission, company, jobTitle, location, level } from '@/lib/db/schema'
import { eq, desc, and, sql, count } from 'drizzle-orm'

export async function getSalariesByJobTitle(jobTitleName: string, limit: number = 8) {
  const submissions = await db
    .select({
      submissionId: salarySubmission.submissionId,
      companyName: company.name,
      companyLogoUrl: company.logoUrl,
      jobTitleName: jobTitle.title,
      locationCity: location.city,
      locationCountry: location.country,
      levelName: level.levelName,
      baseSalary: salarySubmission.baseSalary,
      bonus: salarySubmission.bonus,
      stockCompensation: salarySubmission.stockCompensation,
      currency: salarySubmission.currency,
      yearsOfExperience: salarySubmission.yearsOfExperience,
    })
    .from(salarySubmission)
    .innerJoin(company, eq(salarySubmission.companyId, company.companyId))
    .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
    .innerJoin(location, eq(salarySubmission.locationId, location.locationId))
    .leftJoin(level, eq(salarySubmission.levelId, level.levelId))
    .where(eq(jobTitle.title, jobTitleName))
    .orderBy(desc(salarySubmission.submissionDate))
    .limit(limit)

  return submissions.map((sub) => ({
    id: sub.submissionId,
    company: sub.companyName,
    companyLogoUrl: sub.companyLogoUrl,
    jobTitle: sub.jobTitleName,
    location: `${sub.locationCity}, ${sub.locationCountry}`,
    baseSalary: sub.baseSalary,
    bonus: sub.bonus || '0',
    stockCompensation: sub.stockCompensation || '0',
    currency: sub.currency || 'XOF',
    yearsOfExperience: sub.yearsOfExperience,
    level: sub.levelName || undefined,
  }))
}

export async function getTopCompaniesByJobTitle(jobTitleName: string, limit: number = 5) {
  const companies = await db
    .select({
      companyId: company.companyId,
      companyName: company.name,
      submissionCount: count(salarySubmission.submissionId),
    })
    .from(salarySubmission)
    .innerJoin(company, eq(salarySubmission.companyId, company.companyId))
    .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
    .where(eq(jobTitle.title, jobTitleName))
    .groupBy(company.companyId, company.name)
    .orderBy(desc(count(salarySubmission.submissionId)))
    .limit(limit)

  return companies.map((c) => ({
    id: c.companyId,
    name: c.companyName,
    submissionCount: Number(c.submissionCount),
  }))
}

export async function getAllCompaniesByJobTitle(jobTitleName: string) {
  const companies = await db
    .selectDistinct({
      companyId: company.companyId,
      companyName: company.name,
    })
    .from(salarySubmission)
    .innerJoin(company, eq(salarySubmission.companyId, company.companyId))
    .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
    .where(eq(jobTitle.title, jobTitleName))
    .orderBy(company.name)

  return companies.map((c) => ({
    id: c.companyId,
    name: c.companyName,
  }))
}

export async function getLevelsByCompanyAndJobTitle(companyName: string, jobTitleName: string) {
  const levels = await db
    .select({
      levelId: level.levelId,
      levelName: level.levelName,
      description: level.description,
    })
    .from(level)
    .innerJoin(company, eq(level.companyId, company.companyId))
    .innerJoin(jobTitle, eq(level.jobTitleId, jobTitle.jobTitleId))
    .where(and(eq(company.name, companyName), eq(jobTitle.title, jobTitleName)))
    .orderBy(level.levelName)

  return levels.map((l) => ({
    id: l.levelId,
    levelName: l.levelName,
    description: l.description || undefined,
  }))
}

export async function getLevelSalaryDetails(companyName: string, jobTitleName: string, levelName: string) {
  const submissions = await db
    .select({
      baseSalary: salarySubmission.baseSalary,
      bonus: salarySubmission.bonus,
      stockCompensation: salarySubmission.stockCompensation,
    })
    .from(salarySubmission)
    .innerJoin(company, eq(salarySubmission.companyId, company.companyId))
    .innerJoin(jobTitle, eq(salarySubmission.jobTitleId, jobTitle.jobTitleId))
    .innerJoin(level, eq(salarySubmission.levelId, level.levelId))
    .where(
      and(
        eq(company.name, companyName),
        eq(jobTitle.title, jobTitleName),
        eq(level.levelName, levelName)
      )
    )

  if (submissions.length === 0) {
    return null
  }

  // Calculate averages
  const totalSubmissions = submissions.length
  const avgBase =
    submissions.reduce((sum, s) => sum + parseFloat(s.baseSalary), 0) / totalSubmissions
  const avgBonus =
    submissions.reduce((sum, s) => sum + parseFloat(s.bonus || '0'), 0) / totalSubmissions
  const avgStock =
    submissions.reduce((sum, s) => sum + parseFloat(s.stockCompensation || '0'), 0) /
    totalSubmissions

  const totalComp = avgBase + avgBonus + avgStock

  return {
    companyName,
    jobTitleName,
    levelName,
    totalCompensation: Math.round(totalComp),
    baseSalary: Math.round(avgBase),
    bonus: Math.round(avgBonus),
    stockCompensation: Math.round(avgStock),
    dataPointCount: totalSubmissions,
  }
}