import Image from 'next/image'
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <Image
              src="/transpayra_main.png"
              alt="Transpayra"
              width={200}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          <ul className="mt-8 flex justify-start gap-6 sm:mt-0 sm:justify-end">
            <li>
              <a
                href="#"
                rel="noreferrer"
                target="_blank"
                className="text-brand-secondary transition hover:opacity-75"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="w-6 h-6" />
              </a>
            </li>

            <li>
              <a
                href="#"
                rel="noreferrer"
                target="_blank"
                className="text-brand-secondary transition hover:opacity-75"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="w-6 h-6" />
              </a>
            </li>

            <li>
              <a
                href="#"
                rel="noreferrer"
                target="_blank"
                className="text-brand-secondary transition hover:opacity-75"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-6 h-6" />
              </a>
            </li>

            <li>
              <a
                href="#"
                rel="noreferrer"
                target="_blank"
                className="text-brand-secondary transition hover:opacity-75"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="w-6 h-6" />
              </a>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-8 border-t border-gray-100 pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:pt-16">
          <div>
            <p className="font-medium text-gray-900">Services</p>

            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  See All Salaries
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  Community
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  Private Coaching
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  WhatsApp Group
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-gray-900">Company</p>

            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  About
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  Meet the Team
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  Affiliation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-gray-900">Helpful Links</p>

            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  Contact
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  FAQs
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  Live Chat
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-gray-900">Legal</p>

            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  Terms of Service
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Transpayra. All rights reserved.
        </p>
      </div>
    </footer>
  )
}