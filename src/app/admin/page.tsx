'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { FaCheck, FaTimes, FaVideo, FaFlag, FaEye } from 'react-icons/fa'

interface Video {
  id: string
  title: string
  description: string | null
  bunnyVideoId: string
  status: string
  views: number
  createdAt: string
  user: {
    username: string
  }
}

interface Report {
  id: string
  reason: string
  details: string | null
  status: string
  createdAt: string
  video: {
    id: string
    title: string
  }
  reporter: {
    username: string
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingVideos, setPendingVideos] = useState<Video[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [activeTab, setActiveTab] = useState<'videos' | 'reports'>('videos')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      const userRole = (session.user as any)?.role
      if (userRole !== 'ADMIN') {
        router.push('/')
        return
      }
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      const [videosRes, reportsRes] = await Promise.all([
        axios.get('/api/admin/videos/pending'),
        axios.get('/api/admin/reports'),
      ])
      setPendingVideos(videosRes.data.videos)
      setReports(reportsRes.data.reports)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoAction = async (
    videoId: string,
    action: 'approve' | 'reject',
    reason?: string
  ) => {
    try {
      await axios.post(`/api/admin/videos/${videoId}/${action}`, { reason })
      setPendingVideos(pendingVideos.filter((v) => v.id !== videoId))
    } catch (error) {
      alert('Action failed. Please try again.')
    }
  }

  const handleReportAction = async (reportId: string, action: string) => {
    try {
      await axios.post(`/api/admin/reports/${reportId}`, { action })
      setReports(reports.filter((r) => r.id !== reportId))
    } catch (error) {
      alert('Action failed. Please try again.')
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-surfaceHover'
          }`}
        >
          <FaVideo />
          Pending Videos ({pendingVideos.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-surfaceHover'
          }`}
        >
          <FaFlag />
          Reports ({reports.length})
        </button>
      </div>

      {activeTab === 'videos' && (
        <div className="space-y-4">
          {pendingVideos.length === 0 ? (
            <div className="bg-surface p-12 rounded-lg text-center text-textSecondary">
              No pending videos to review
            </div>
          ) : (
            pendingVideos.map((video) => (
              <div key={video.id} className="bg-surface p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{video.title}</h3>
                    <p className="text-textSecondary">
                      by {video.user.username} •{' '}
                      {new Date(video.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${video.bunnyVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FaEye />
                    Preview
                  </a>
                </div>
                {video.description && (
                  <p className="text-textSecondary mb-4">{video.description}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVideoAction(video.id, 'approve')}
                    className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded flex items-center gap-2"
                  >
                    <FaCheck />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:')
                      if (reason) {
                        handleVideoAction(video.id, 'reject', reason)
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded flex items-center gap-2"
                  >
                    <FaTimes />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-surface p-12 rounded-lg text-center text-textSecondary">
              No pending reports
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-surface p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{report.video.title}</h3>
                    <p className="text-textSecondary">
                      Reported by {report.reporter.username} •{' '}
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-textSecondary">Reason:</p>
                  <p className="font-semibold">{report.reason}</p>
                  {report.details && <p className="mt-2">{report.details}</p>}
                </div>
                <div className="flex gap-3">
                  <a
                    href={`/video/${report.video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded flex items-center gap-2"
                  >
                    <FaEye />
                    View Video
                  </a>
                  <button
                    onClick={() => handleReportAction(report.id, 'resolved')}
                    className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
