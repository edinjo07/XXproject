'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FaVideo, FaEye, FaDollarSign, FaUpload } from 'react-icons/fa'
import { LeaderboardAd, ResponsiveAd } from '@/components/AdBanner'

interface Video {
  id: string
  title: string
  views: number
  status: string
  createdAt: string
}

interface Earnings {
  totalEarnings: number
  pendingEarnings: number
  pendingViews: number
}

export default function CreatorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [earnings, setEarnings] = useState<Earnings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [videosRes, earningsRes] = await Promise.all([
        axios.get('/api/creator/videos'),
        axios.get('/api/creator/earnings'),
      ])
      setVideos(videosRes.data.videos)
      setEarnings(earningsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Creator Dashboard</h1>
        <Link
          href="/creator/upload"
          className="w-full sm:w-auto bg-primary hover:bg-primaryHover px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FaUpload />
          Upload Video
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-surface p-4 sm:p-6 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FaVideo className="text-xl sm:text-2xl text-primary" />
            <div className="text-textSecondary text-sm sm:text-base">Total Videos</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">{videos.length}</div>
        </div>

        <div className="bg-surface p-4 sm:p-6 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FaDollarSign className="text-xl sm:text-2xl text-green-500" />
            <div className="text-textSecondary text-sm sm:text-base">Total Earnings</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">
            ${earnings?.totalEarnings.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-surface p-4 sm:p-6 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FaEye className="text-xl sm:text-2xl text-blue-500" />
            <div className="text-textSecondary">Pending Earnings</div>
          </div>
          <div className="text-3xl font-bold">
            ${earnings?.pendingEarnings.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-textSecondary mt-1">
            {earnings?.pendingViews || 0} pending views
          </div>
        </div>
      </div>

      {/* Ad below stats */}
      <div className="flex justify-center my-8">
        <LeaderboardAd slot="dashboard_below_stats_1" className="hidden md:block" />
        <ResponsiveAd slot="dashboard_below_stats_mobile_1" className="md:hidden" />
      </div>

      {/* Videos Table */}
      <div className="bg-surface rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">Your Videos</h2>
        </div>

        {videos.length === 0 ? (
          <div className="p-12 text-center text-textSecondary">
            <FaVideo className="text-5xl mx-auto mb-4 opacity-50" />
            <p className="mb-4">You haven't uploaded any videos yet.</p>
            <Link
              href="/creator/upload"
              className="inline-block bg-primary hover:bg-primaryHover px-6 py-3 rounded-lg font-semibold"
            >
              Upload Your First Video
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Views</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-t border-gray-800">
                    <td className="p-4">{video.title}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          video.status === 'APPROVED'
                            ? 'bg-green-500 bg-opacity-20 text-green-500'
                            : video.status === 'PENDING'
                            ? 'bg-yellow-500 bg-opacity-20 text-yellow-500'
                            : 'bg-red-500 bg-opacity-20 text-red-500'
                        }`}
                      >
                        {video.status}
                      </span>
                    </td>
                    <td className="p-4">{video.views.toLocaleString()}</td>
                    <td className="p-4">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {video.status === 'APPROVED' && (
                        <Link
                          href={`/video/${video.id}`}
                          className="text-primary hover:underline"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
