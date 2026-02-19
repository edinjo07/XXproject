'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface VideoPlayerProps {
  videoId: string
  embedUrl: string
}

export function VideoPlayer({ videoId, embedUrl }: VideoPlayerProps) {
  const [viewRecorded, setViewRecorded] = useState(false)

  useEffect(() => {
    // Record view after 5 seconds of watching
    const timer = setTimeout(async () => {
      if (!viewRecorded) {
        try {
          await axios.post(`/api/videos/${videoId}/view`)
          setViewRecorded(true)
        } catch (error) {
          console.error('Error recording view:', error)
        }
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [videoId, viewRecorded])

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        loading="lazy"
        style={{
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
        }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    </div>
  )
}
