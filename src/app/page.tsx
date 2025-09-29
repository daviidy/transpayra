import { UserMenu } from "@/components/auth/UserMenu";
import { Briefcase, Users } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - MerakiUI Style with Brand Colors */}
      <nav className="relative bg-brand-primary shadow-sm">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <a href="#" className="flex items-center gap-2">
                  <Image
                    src="/transpayra_main.png"
                    alt="Transpayra"
                    width={400}
                    height={80}
                    className="w-auto h-8 sm:h-10"
                    priority
                  />
                </a>

                {/* Search input on desktop screen */}
                <div className="hidden mx-10 md:block">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="w-5 h-5 text-brand-secondary" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="w-full py-2 pl-10 pr-4 text-brand-secondary bg-white border border-gray-300 rounded-lg focus:border-brand-secondary focus:outline-none placeholder-brand-secondary"
                      placeholder="search by company, title or city"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex lg:hidden">
                <button
                  type="button"
                  className="text-brand-secondary hover:text-brand-accent focus:outline-none"
                  aria-label="toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="flex flex-col md:flex-row md:mx-1">
              <div className="flex items-center gap-2 my-2 text-sm leading-5 text-brand-secondary font-medium transition-colors duration-300 px-3 py-2 rounded-lg md:mx-2 md:my-0 cursor-pointer">
                <Briefcase className="w-4 h-4" />
                <span>Salaries</span>
              </div>

              <div className="flex items-center gap-2 my-2 text-sm leading-5 text-brand-secondary font-medium transition-colors duration-300 px-3 py-2 rounded-lg md:mx-2 md:my-0 cursor-pointer">
                <Users className="w-4 h-4" />
                <span>Contribute</span>
              </div>

              <div className="md:ml-4">
                <UserMenu />
              </div>
            </div>

            {/* Search input on mobile screen */}
            <div className="my-4 md:hidden">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-brand-secondary" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  className="w-full py-2 pl-10 pr-4 text-brand-secondary bg-white border border-gray-300 rounded-lg focus:border-brand-secondary focus:outline-none placeholder-brand-secondary"
                  placeholder="search by company, title or city"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
