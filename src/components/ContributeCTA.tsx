import Link from 'next/link'

export function ContributeCTA() {
  return (
    <section className="overflow-hidden bg-brand-primary sm:grid sm:grid-cols-2 sm:items-center">
      <div className="p-8 md:p-12 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-xl text-center sm:text-left">
          <h2 className="text-2xl font-bold text-brand-secondary md:text-3xl">
            Your salary data helps thousands negotiate better offers
          </h2>

          <p className="hidden text-black md:mt-4 md:block">
            Every submission you share empowers engineers across Europe and Africa to know their worth
            and negotiate fairly. Join a community committed to transparency—your contribution takes
            just 2 minutes and stays completely anonymous.
          </p>

          <div className="mt-4 md:mt-8">
            <Link
              href="/contribute"
              className="inline-block rounded-lg bg-brand-secondary px-12 py-3 text-sm font-medium text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
            >
              Share Your Salary
            </Link>
          </div>
        </div>
      </div>

      <div
        className="h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://cdn.midjourney.com/5ded5ea2-eb67-4577-b694-f3047b5a3164/0_3.png)'
        }}
      />
    </section>
  )
}