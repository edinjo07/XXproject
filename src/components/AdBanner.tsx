'use client'

import { useEffect, useRef } from 'react'

interface AdBannerProps {
  slot: string
  format?: 'leaderboard' | 'billboard' | 'rectangle' | 'skyscraper' | 'mobile' | 'auto'
  className?: string
  responsive?: boolean
}

export function AdBanner({ 
  slot, 
  format = 'auto',
  className = '',
  responsive = true 
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize ad script here (Google AdSense, etc.)
    // This is a placeholder for now
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('Ad loading error:', error)
    }
  }, [])

  const getAdDimensions = () => {
    switch (format) {
      case 'leaderboard':
        return 'w-[728px] h-[90px]'
      case 'billboard':
        return 'w-[970px] h-[250px]'
      case 'rectangle':
        return 'w-[300px] h-[250px]'
      case 'skyscraper':
        return 'w-[300px] h-[600px]'
      case 'mobile':
        return 'w-[320px] h-[50px]'
      default:
        return 'w-full h-auto'
    }
  }

  const getDataAdFormat = () => {
    if (responsive) return 'auto'
    switch (format) {
      case 'leaderboard':
        return 'horizontal'
      case 'rectangle':
      case 'skyscraper':
        return 'vertical'
      default:
        return 'auto'
    }
  }

  return (
    <div 
      ref={adRef}
      className={`ad-container flex items-center justify-center bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden ${className}`}
    >
      {/* Google AdSense placeholder */}
      <ins
        className={`adsbygoogle block ${responsive ? 'w-full' : getAdDimensions()}`}
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense publisher ID
        data-ad-slot={slot}
        data-ad-format={getDataAdFormat()}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      >
        {/* Placeholder content - remove when ads are live */}
        <div className={`flex items-center justify-center bg-surface ${responsive ? 'min-h-[90px]' : getAdDimensions()}`}>
          <div className="text-center p-4">
            <div className="text-textSecondary text-sm font-medium mb-1">
              Advertisement Space
            </div>
            <div className="text-xs text-gray-600">
              {format === 'auto' ? 'Responsive Ad' : format.charAt(0).toUpperCase() + format.slice(1)} - Slot: {slot}
            </div>
          </div>
        </div>
      </ins>
    </div>
  )
}

// Pre-sized banner components for convenience
export function LeaderboardAd({ slot, className = '' }: { slot: string; className?: string }) {
  return <AdBanner slot={slot} format="leaderboard" responsive={false} className={className} />
}

export function BillboardAd({ slot, className = '' }: { slot: string; className?: string }) {
  return <AdBanner slot={slot} format="billboard" responsive={false} className={className} />
}

export function RectangleAd({ slot, className = '' }: { slot: string; className?: string }) {
  return <AdBanner slot={slot} format="rectangle" responsive={false} className={className} />
}

export function SkyscraperAd({ slot, className = '' }: { slot: string; className?: string }) {
  return <AdBanner slot={slot} format="skyscraper" responsive={false} className={className} />
}

export function MobileAd({ slot, className = '' }: { slot: string; className?: string }) {
  return <AdBanner slot={slot} format="mobile" responsive={false} className={`md:hidden ${className}`} />
}

export function ResponsiveAd({ slot, className = '' }: { slot: string; className?: string }) {
  return <AdBanner slot={slot} format="auto" responsive={true} className={className} />
}
