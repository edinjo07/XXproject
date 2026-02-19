'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaVideo, FaUser, FaSignOutAlt, FaUpload, FaBars, FaTimes, FaHome, FaShieldAlt, FaSearch, FaBell } from 'react-icons/fa'

export function Navbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const userRole = (session?.user as any)?.role

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-surface border-b border-gray-800 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold">
            <FaVideo className="text-primary text-xl sm:text-2xl" />
            <span className="hidden xs:inline sm:inline">Video Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="w-64">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full bg-background border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
              </div>
            </form>

            {status === 'loading' ? (
              <div className="text-textSecondary">Loading...</div>
            ) : session ? (
              <>
                <Link
                  href="/subscriptions"
                  className="flex items-center gap-2 hover:text-primary transition"
                  title="Subscriptions"
                >
                  <FaBell />
                </Link>
                <Link
                  href="/creator/dashboard"
                  className="flex items-center gap-2 hover:text-primary transition"
                >
                  <FaUpload />
                  <span>Creator Dashboard</span>
                </Link>
                {userRole === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 hover:text-primary transition"
                  >
                    <FaShieldAlt />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  href={`/profile/${(session.user as any)?.username}`}
                  className="flex items-center gap-2 hover:text-primary transition"
                >
                  <FaUser />
                  <span>{(session.user as any)?.username}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 hover:text-primary transition"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-primary transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primaryHover px-4 py-2 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-background rounded-lg transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4 px-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full bg-background border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
              </div>
            </form>

            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="flex items-center gap-3 px-2 py-2 hover:bg-background rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaHome className="text-primary" />
                <span>Home</span>
              </Link>
              
              {status === 'loading' ? (
                <div className="text-textSecondary px-2">Loading...</div>
              ) : session ? (
                <>
                  <Link
                    href="/subscriptions"
                    className="flex items-center gap-3 px-2 py-2 hover:bg-background rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaBell className="text-primary" />
                    <span>Subscriptions</span>
                  </Link>
                  <Link
                    href="/creator/dashboard"
                    className="flex items-center gap-3 px-2 py-2 hover:bg-background rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUpload className="text-primary" />
                    <span>Creator Dashboard</span>
                  </Link>
                  
                  {userRole === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-2 py-2 hover:bg-background rounded-lg transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FaShieldAlt className="text-primary" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  <Link
                    href={`/profile/${(session.user as any)?.username}`}
                    className="flex items-center gap-3 px-2 py-2 hover:bg-background rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUser className="text-primary" />
                    <span>{(session.user as any)?.username}</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 px-2 py-2 hover:bg-background rounded-lg transition text-left"
                  >
                    <FaSignOutAlt className="text-primary" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-2 py-2 hover:bg-background rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUser className="text-primary" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary hover:bg-primaryHover px-4 py-3 rounded-lg transition text-center font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
