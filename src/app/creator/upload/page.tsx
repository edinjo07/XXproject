'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { FaUpload, FaCheck } from 'react-icons/fa'

interface Category {
  id: string
  name: string
  icon?: string
}

export default function UploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchCategories()
    }
  }, [status, router])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (max 2GB)
      if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
        setError('File size must be less than 2GB')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Step 1: Initialize upload
      const initResponse = await axios.post('/api/videos/upload', {
        title,
        description,
        categoryId: categoryId || null,
      })

      const { video, uploadUrl } = initResponse.data

      // Step 2: Upload file to Bunny Stream
      if (file) {
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': 'application/octet-stream',
            AccessKey: process.env.NEXT_PUBLIC_BUNNY_STREAM_API_KEY || '',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0
            setUploadProgress(progress)
          },
        })

        // Step 3: Complete upload
        await axios.post(`/api/videos/${video.id}/complete`)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/creator/dashboard')
      }, 2000)
    } catch (error: any) {
      setError(
        error.response?.data?.error || 'Upload failed. Please try again.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Upload Video</h1>

      {success ? (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 p-6 rounded-lg text-center">
          <FaCheck className="text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Upload Successful!</h2>
          <p>Your video is being processed and will be reviewed shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface p-4 sm:p-6 lg:p-8 rounded-lg">
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm mb-2">Video Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-primary text-base"
              maxLength={200}
              required
              disabled={isUploading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-primary text-base"
              rows={5}
              maxLength={5000}
              disabled={isUploading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-background border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-primary text-base"
              disabled={isUploading}
            >
              <option value="">Select a category (optional)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2">Video File *</label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <FaUpload className="text-4xl mx-auto mb-4 text-textSecondary" />
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-primary hover:underline"
              >
                {file ? file.name : 'Click to select video file'}
              </label>
              <p className="text-sm text-textSecondary mt-2">
                Max file size: 2GB
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full bg-primary hover:bg-primaryHover disabled:bg-gray-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-base"
          >
            {isUploading ? 'Uploading...' : 'Upload Video'}
          </button>

          <p className="text-sm text-textSecondary mt-4">
            * Your video will be reviewed before being published to the platform.
          </p>
        </form>
      )}
    </div>
  )
}
