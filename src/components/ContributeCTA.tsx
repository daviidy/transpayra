import Link from 'next/link'

export function ContributeCTA() {
  return (
    <section className="bg-brand-primary py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-2xl font-bold text-brand-secondary md:text-3xl">
          Your salary data helps thousands negotiate better offers
        </h2>

        <p className="mt-4 text-black">
          Every submission you share empowers engineers across Europe and Africa to know their worth
          and negotiate fairly. Join a community committed to transparency—your contribution takes
          just 2 minutes and stays completely anonymous.
        </p>

        <div className="mt-8">
          <Link
            href="/contribute"
            className="inline-block rounded-lg bg-brand-secondary px-12 py-3 text-sm font-medium text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
          >
            Share Your Salary
          </Link>
        </div>
      </div>
    </section>
  )
}