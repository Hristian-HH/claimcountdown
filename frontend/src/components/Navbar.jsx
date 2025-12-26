import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Get user initials for avatar
  const getInitials = (email) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-subtle shadow-sm">
      <div className="container-app">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo with Icon */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            {/* Clock/Timer Icon */}
            <div className="w-7 h-7 flex items-center justify-center text-accent">
              <svg className="w-7 h-7 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-text-primary tracking-tight">ClaimCountdown</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-accent hover:bg-accent/8 rounded-lg transition-all duration-150"
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-accent hover:bg-accent/8 rounded-lg transition-all duration-150"
                >
                  Settings
                </Link>
              </>
            )}

            {/* User Menu */}
            {user && (
              <div className="relative ml-4" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-text-secondary">{user.email}</span>
                  {/* Avatar with Gradient Background */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
                  >
                    {getInitials(user.email)}
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-modal border border-border-subtle py-2 animate-scale-in">
                    <div className="px-4 py-3 border-b border-border-subtle">
                      <p className="text-sm font-semibold text-text-primary truncate">{user.email}</p>
                      {user.organizationName && (
                        <p className="text-xs text-text-muted mt-1">{user.organizationName}</p>
                      )}
                      {user.role && (
                        <span
                          className="inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full text-white"
                          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
                        >
                          {user.role}
                        </span>
                      )}
                    </div>

                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-danger hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && user && (
        <div className="md:hidden border-t border-border-subtle bg-white/95 backdrop-blur-md animate-slide-up">
          <div className="container-app py-4 space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/settings"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-lg transition-colors"
            >
              Settings
            </Link>
            <div className="border-t border-border-subtle my-2"></div>
            <div className="px-4 py-2">
              <p className="text-sm font-semibold text-text-primary">{user.email}</p>
              {user.organizationName && (
                <p className="text-xs text-text-muted mt-0.5">{user.organizationName}</p>
              )}
            </div>
            <button
              onClick={() => {
                setShowMobileMenu(false)
                handleLogout()
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-danger hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
