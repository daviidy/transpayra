'use client'

export function WhatsAppBanner() {
  return (
    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
      {/* Visual Cue: WhatsApp Icon */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl">
          💬
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Join Our WhatsApp Community
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Connect with professionals, share insights, and stay updated on salary trends.
      </p>

      <a
        href="https://chat.whatsapp.com/HxKCD7iOdxc0JYRbQgSA7W"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2 w-fit"
      >
        <span>Join Now</span>
        <span>→</span>
      </a>
    </div>
  )
}
