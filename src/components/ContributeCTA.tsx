'use client'

import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export function ContributeCTA() {
  const t = useTranslations()

  return (
    <section className="bg-brand-primary py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-2xl font-bold text-brand-secondary md:text-3xl">
          {t('cta.title')}
        </h2>

        <p className="mt-4 text-black">
          {t('cta.description')}
        </p>

        <div className="mt-8">
          <Link
            href="/contribute"
            className="inline-block rounded-lg bg-brand-secondary px-12 py-3 text-sm font-medium text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
          >
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </section>
  )
}