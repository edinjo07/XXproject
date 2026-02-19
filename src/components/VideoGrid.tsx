'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaEye, FaUser } from 'react-icons/fa'

interface Video {
  id: string
  title: string
  thumbnail: string
  views: number
  duration: number
  user: {
    username: string
  }
  createdAt: Date
}

interface VideoGridProps {
  videos: Video[]
}

export function VideoGrid({ videos }: VideoGridProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  if (videos.length === 0) {
    return (
      <div className="text-center text-textSecondary py-12">
        No videos available yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/video/${video.id}`}
          className="group cursor-pointer"
        >
          <div className="relative aspect-video bg-surface rounded-lg overflow-hidden mb-2 sm:mb-3">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 bg-black bg-opacity-80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
              {formatDuration(video.duration)}
            </div>
          </div>
          <h3 className="font-semibold line-clamp-2 mb-1 text-sm sm:text-base group-hover:text-primary transition">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-textSecondary">
            <span className="flex items-center gap-1">
              <FaUser className="text-xs" />
              {video.user.username}
            </span>
            <span className="flex items-center gap-1">
              <FaEye className="text-xs" />
              {formatViews(video.views)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
