'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { FaVideo } from 'react-icons/fa'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'USER' | 'CREATOR'>('USER')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      await axios.post('/api/auth/register', {
        email,
        username,
        password,
        role,
      })

      router.push('/login?registered=true')
    } catch (error: any) {
      setError(
        error.response?.data?.error || 'Registration failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FaVideo className="text-5xl text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-textSecondary mt-2">Join our platform today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg">
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

          <div className="mb-4">
            <label className="block text-sm mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-primary"
              minLength={3}
              maxLength={20}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-primary"
              minLength={8}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2">Account Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="USER"
                  checked={role === 'USER'}
                  onChange={(e) => setRole('USER')}
                  className="text-primary"
                />
                <span>Viewer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="CREATOR"
                  checked={role === 'CREATOR'}
                  onChange={(e) => setRole('CREATOR')}
                  className="text-primary"
                />
                <span>Creator</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primaryHover disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold mb-4"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-center text-textSecondary">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
