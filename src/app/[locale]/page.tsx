import { Navbar } from "@/components/navbar/Navbar";
import { JobTabs } from "@/components/JobTabs";
import { ContributeCTA } from "@/components/ContributeCTA";
import { Footer } from "@/components/Footer";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations();
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section - Based on MerakiUI */}
      <section className="bg-brand-hero-bg">
        <div className="container flex flex-col px-6 py-16 mx-auto space-y-8 lg:py-20">
          <div className="w-full text-center">
            <h1 className="text-4xl font-bold tracking-wide text-brand-secondary lg:text-5xl">
              {t('home.title')}
            </h1>

            <p className="mt-6 text-lg text-brand-secondary text-opacity-80 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>

            {/* Central Search Bar */}
            <div className="w-full mt-12 max-w-4xl mx-auto">
              <SearchAutocomplete
                placeholder={t('home.searchPlaceholder')}
                className="h-14 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Job Category Tabs */}
      <JobTabs />

      {/* Contribution CTA */}
      <ContributeCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
