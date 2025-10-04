import { Navbar } from "@/components/navbar/Navbar";
import { JobTabs } from "@/components/JobTabs";
import { ContributeCTA } from "@/components/ContributeCTA";
import { Footer } from "@/components/Footer";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section - Based on MerakiUI */}
      <section className="bg-brand-hero-bg">
        <div className="container flex flex-col px-6 py-16 mx-auto space-y-8 lg:py-20">
          <div className="w-full text-center">
            <h1 className="text-4xl font-bold tracking-wide text-brand-secondary lg:text-5xl">
              Find out what engineers really earn.
            </h1>

            <p className="mt-6 text-lg text-brand-secondary text-opacity-80 max-w-2xl mx-auto">
              Get transparent salary data from real engineers at companies everywhere across Europe and Africa.
            </p>

            {/* Central Search Bar */}
            <div className="w-full mt-12 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <SearchAutocomplete
                    placeholder="Search by Job Title, Company, or Location…"
                    className="h-14 text-base"
                  />
                </div>
                <button
                  type="button"
                  className="h-14 px-8 text-white font-medium transition-colors duration-300 transform bg-brand-secondary rounded-lg hover:bg-brand-accent focus:outline-none focus:bg-brand-accent"
                >
                  Search
                </button>
              </div>
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
