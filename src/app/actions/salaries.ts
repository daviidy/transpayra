'use server'

import { db } from '@/lib/db'
import { salarySubmission, company, jobTitle, location, level } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getSalariesByJobTitle(jobTitleName: string, limit: number = 8) {
  const submissions = await db
    .select({
      submissionId: salarySubmission.submissionId,
      companyName: company.name,
      jobTitleName: jobTitle.title,
      locationCity: location.city,
      locationCountry: location.country,
      levelName: level.levelName,
      baseSalary: salarySubmission.baseSalary,
      bonus: salarySubmission.bonus,
      stockCompensation: salarySubmission.stockCompensation,
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
    jobTitle: sub.jobTitleName,
    location: `${sub.locationCity}, ${sub.locationCountry}`,
    baseSalary: sub.baseSalary,
    bonus: sub.bonus || '0',
    stockCompensation: sub.stockCompensation || '0',
    yearsOfExperience: sub.yearsOfExperience,
    level: sub.levelName || undefined,
  }))
}