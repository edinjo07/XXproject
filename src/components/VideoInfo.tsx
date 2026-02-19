'use client'

import Link from 'next/link'
import { FaEye, FaUser, FaCalendar, FaFlag } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import axios from 'axios'
import { SubscribeButton } from './SubscribeButton'

interface VideoInfoProps {
  video: {
    id: string
    title: string
    description: string | null
    views: number
    createdAt: Date
    user: {
      id: string
      username: string
      avatar: string | null
    }
  }
}

export function VideoInfo({ video }: VideoInfoProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReport = async () => {
    if (!reportReason) return

    setIsSubmitting(true)
    try {
      await axios.post(`/api/videos/${video.id}/report`, {
        reason: reportReason,
        details: reportDetails,
      })
      alert('Report submitted successfully')
      setShowReportModal(false)
      setReportReason('')
      setReportDetails('')
    } catch (error) {
      alert('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold mb-4">{video.title}</h1>

      <div className="flex flex-wrap items-center gap-6 text-textSecondary mb-6">
        <span className="flex items-center gap-2">
          <FaEye />
          {video.views.toLocaleString()} views
        </span>
        <span className="flex items-center gap-2">
          <FaCalendar />
          {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
        </span>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 hover:text-primary transition ml-auto"
        >
          <FaFlag />
          Report
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
        <Link
          href={`/profile/${video.user.username}`}
          className="flex items-center gap-3 flex-1 hover:bg-surfaceHover p-2 rounded transition"
        >
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <FaUser className="text-2xl" />
          </div>
          <div>
            <div className="font-semibold">{video.user.username}</div>
            <div className="text-sm text-textSecondary">View Profile</div>
          </div>
        </Link>
        <SubscribeButton
          username={video.user.username}
          initialSubscriberCount={0}
          initialIsSubscribed={false}
        />
      </div>

      {video.description && (
        <div className="mt-6 p-4 bg-surface rounded-lg">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-textSecondary whitespace-pre-wrap">
            {video.description}
          </p>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-surface p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Report Video</h2>
            <div className="mb-4">
              <label className="block text-sm mb-2">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-background border border-gray-700 rounded px-3 py-2"
              >
                <option value="">Select a reason</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="copyright">Copyright Violation</option>
                <option value="spam">Spam or Misleading</option>
                <option value="illegal">Illegal Content</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-2">Additional Details (Optional)</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="w-full bg-background border border-gray-700 rounded px-3 py-2"
                rows={4}
                placeholder="Provide more information..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReport}
                disabled={!reportReason || isSubmitting}
                className="flex-1 bg-primary hover:bg-primaryHover disabled:bg-gray-600 text-white py-2 rounded font-semibold"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-surface hover:bg-surfaceHover border border-gray-700 py-2 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
