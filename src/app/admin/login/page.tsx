'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaLock, FaUserShield } from 'react-icons/fa'

export default function AdminLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
        setIsLoading(false)
        return
      }

      // Verify the user has admin role
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        setError('Access denied. Admin privileges required.')
        setIsLoading(false)
      }
    } catch (error) {
      setError('An error occurred during login')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary bg-opacity-20 p-4 rounded-full">
              <FaUserShield className="text-4xl text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">Admin Access</h2>
          <p className="mt-2 text-sm text-textSecondary">
            Administrative login required
          </p>
        </div>

        <div className="bg-surface rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-base"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-base"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primaryHover text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <FaLock />
                  Sign In as Admin
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-primary hover:text-primaryHover transition"
          >
            ← Back to Regular Login
          </Link>
        </div>
      </div>
    </div>
  )
}
