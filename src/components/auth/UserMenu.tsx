'use client'

import { useAuth } from '@/contexts/AuthContext'
import { User } from 'lucide-react'
import { useState } from 'react'

export function UserMenu() {
  const { user, loading, signInWithGitHub, signInWithGoogle, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return <span className="text-brand-secondary">Loading...</span>
  }

  if (user) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-10 flex items-center p-2 text-sm text-brand-secondary bg-transparent rounded-md focus:outline-none"
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <svg className="w-5 h-5 mx-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z" fill="currentColor"></path>
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute right-0 z-20 w-56 py-2 mt-2 overflow-hidden origin-top-right bg-white rounded-md shadow-xl"
            onBlur={() => setIsOpen(false)}
          >
            <div className="flex items-center p-3 -mt-2 text-sm text-brand-secondary">
              {user.user_metadata?.avatar_url && (
                <img
                  className="flex-shrink-0 object-cover mx-1 rounded-full w-9 h-9"
                  src={user.user_metadata.avatar_url}
                  alt="user avatar"
                />
              )}
              <div className="mx-1">
                <h1 className="text-sm font-semibold text-brand-secondary">
                  {user.user_metadata?.full_name || 'User'}
                </h1>
                <p className="text-sm text-brand-secondary text-opacity-60">{user.email}</p>
              </div>
            </div>

            <hr className="border-gray-200" />

            <button
              onClick={signOut}
              className="block w-full px-4 py-3 text-sm text-brand-secondary text-left capitalize transition-colors duration-300 transform hover:bg-brand-secondary hover:text-white"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 flex items-center p-2 text-sm text-brand-secondary bg-transparent rounded-md focus:outline-none"
      >
        <User className="w-5 h-5 mx-1" />
        <svg className="w-5 h-5 mx-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z" fill="currentColor"></path>
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-20 w-56 py-2 mt-2 overflow-hidden origin-top-right bg-white rounded-md shadow-xl"
          onBlur={() => setIsOpen(false)}
        >
          <button
            onClick={signInWithGitHub}
            className="flex items-center w-full px-4 py-3 text-sm text-brand-secondary capitalize transition-colors duration-300 transform hover:bg-brand-secondary hover:text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            Sign in with GitHub
          </button>

          <button
            onClick={signInWithGoogle}
            className="flex items-center w-full px-4 py-3 text-sm text-brand-secondary capitalize transition-colors duration-300 transform hover:bg-brand-secondary hover:text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  )
}