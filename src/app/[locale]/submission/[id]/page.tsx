import { getSubmissionDetails, getSimilarSubmissions } from '@/app/actions/submissions'
import { Navbar } from '@/components/navbar/Navbar'
import { ContributeCTA } from '@/components/ContributeCTA'
import { Footer } from '@/components/Footer'
import { SubmissionDetailsClient } from '@/components/submission/SubmissionDetailsClient'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SubmissionPage({ params }: PageProps) {
  const { id } = await params
  const submissionId = parseInt(id)

  if (isNaN(submissionId)) {
    notFound()
  }

  const submission = await getSubmissionDetails(submissionId)

  if (!submission) {
    notFound()
  }

  // Fetch similar submissions if jobTitleId is available
  const similarSubmissions = submission.jobTitleId
    ? await getSimilarSubmissions(submission.jobTitleId, submissionId, 10)
    : []

  return (
    <>
      <Navbar />
      <SubmissionDetailsClient submission={submission} similarSubmissions={similarSubmissions} />
      <Footer />
    </>
  )
}
