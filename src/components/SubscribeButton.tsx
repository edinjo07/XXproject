'use client'

import { useState } from 'react'
import axios from 'axios'
import { FaBell, FaRegBell } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SubscribeButtonProps {
  username: string
  initialSubscriberCount: number
  initialIsSubscribed: boolean
}

export function SubscribeButton({
  username,
  initialSubscriberCount,
  initialIsSubscribed,
}: SubscribeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [subscriberCount, setSubscriberCount] = useState(initialSubscriberCount)
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      if (isSubscribed) {
        // Unsubscribe
        const response = await axios.delete(`/api/users/${username}/subscribe`)
        setSubscriberCount(response.data.subscriberCount)
        setIsSubscribed(false)
      } else {
        // Subscribe
        const response = await axios.post(`/api/users/${username}/subscribe`)
        setSubscriberCount(response.data.subscriberCount)
        setIsSubscribed(true)
      }
    } catch (error: any) {
      console.error('Error toggling subscription:', error)
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${
          isSubscribed
            ? 'bg-surface hover:bg-surfaceHover text-white'
            : 'bg-primary hover:bg-primaryHover text-white'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubscribed ? (
          <>
            <FaBell />
            Subscribed
          </>
        ) : (
          <>
            <FaRegBell />
            Subscribe
          </>
        )}
      </button>
      <span className="text-textSecondary">
        {subscriberCount.toLocaleString()} subscriber{subscriberCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
