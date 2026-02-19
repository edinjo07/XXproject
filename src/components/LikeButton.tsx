'use client'

import { useState } from 'react'
import axios from 'axios'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  videoId: string
  initialLikeCount: number
  initialIsLiked: boolean
}

export function LikeButton({
  videoId,
  initialLikeCount,
  initialIsLiked,
}: LikeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      if (isLiked) {
        // Unlike
        const response = await axios.delete(`/api/videos/${videoId}/like`)
        setLikeCount(response.data.likeCount)
        setIsLiked(false)
      } else {
        // Like
        const response = await axios.post(`/api/videos/${videoId}/like`)
        setLikeCount(response.data.likeCount)
        setIsLiked(true)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        isLiked
          ? 'bg-primary text-white'
          : 'bg-surface hover:bg-surfaceHover text-textSecondary'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLiked ? <FaHeart className="text-xl" /> : <FaRegHeart className="text-xl" />}
      <span className="font-semibold">{likeCount.toLocaleString()}</span>
    </button>
  )
}
