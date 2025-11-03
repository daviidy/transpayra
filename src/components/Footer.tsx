import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Image
            src="/transpayra_main.png"
            alt="Transpayra"
            width={200}
            height={40}
            className="h-8 w-auto"
          />
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Transpayra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}