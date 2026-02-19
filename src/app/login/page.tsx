'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaVideo } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    console.log('Attempting login with:', email)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('Login result:', result)

      if (result?.error) {
        console.error('Login error:', result.error)
        setError('Invalid email or password')
      } else {
        console.log('Login successful, redirecting...')
        router.push('/creator/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Login exception:', error)
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <FaVideo className="text-4xl sm:text-5xl text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back</h1>
          <p className="text-textSecondary mt-2 text-sm sm:text-base">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface p-6 sm:p-8 rounded-lg">
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primaryHover disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold mb-4"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center mt-6 text-textSecondary text-sm sm:text-base">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
