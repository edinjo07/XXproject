import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { bunnyStream } from '@/lib/bunny-stream'
import { VideoPlayer } from '@/components/VideoPlayer'
import { VideoInfo } from '@/components/VideoInfo'
import { LikeButton } from '@/components/LikeButton'
import { Comments } from '@/components/Comments'
import { SkyscraperAd, LeaderboardAd, ResponsiveAd } from '@/components/AdBanner'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function getVideo(id: string) {
  const video = await prisma.video.findUnique({
    where: { id, status: 'APPROVED' },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  })

  if (!video) return null

  return video
}

async function checkUserLike(videoId: string, userId: string | null) {
  if (!userId) return false
  
  const like = await prisma.like.findUnique({
    where: {
      videoId_userId: {
        videoId,
        userId,
      },
    },
  })
  
  return !!like
}

async function getRelatedVideos(videoId: string, userId: string) {
  return await prisma.video.findMany({
    where: {
      status: 'APPROVED',
      userId,
      id: { not: videoId },
    },
    take: 8,
    orderBy: {
      views: 'desc',
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  })
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const video = await getVideo(id)

  if (!video) {
    notFound()
  }

  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as any).id : null
  const isLiked = await checkUserLike(video.id, userId)

  const relatedVideos = await getRelatedVideos(video.id, video.userId)
  const embedUrl = bunnyStream.getEmbedUrl(video.bunnyVideoId)

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <VideoPlayer videoId={video.id} embedUrl={embedUrl} />
          
          {/* Ad below video player */}
          <div className="my-4 sm:my-6 flex justify-center">
            <LeaderboardAd slot="video_below_player_1" className="hidden md:block" />
            <ResponsiveAd slot="video_below_player_mobile_1" className="md:hidden" />
          </div>

          {/* Like Button */}
          <div className="mb-6">
            <LikeButton
              videoId={video.id}
              initialLikeCount={video._count.likes}
              initialIsLiked={isLiked}
            />
          </div>
          
          <VideoInfo video={video} />

          {/* Comments Section */}
          <Comments videoId={video.id} />
        </div>

        <div>
          {/* Sticky sidebar ad */}
          <div className="hidden lg:block sticky top-20 mb-6">
            <SkyscraperAd slot="video_sidebar_1" />
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">More from {video.user.username}</h3>
          <div className="space-y-4">
            {relatedVideos.map((relatedVideo) => (
              <Link
                key={relatedVideo.id}
                href={`/video/${relatedVideo.id}`}
                className="block group"
              >
                <div className="flex gap-3">
                  <div className="relative aspect-video w-40 bg-surface rounded overflow-hidden flex-shrink-0">
                    <img
                      src={relatedVideo.thumbnail}
                      alt={relatedVideo.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold line-clamp-2 text-xs xs:text-sm sm:text-sm group-hover:text-primary transition">
                      {relatedVideo.title}
                    </h4>
                    <p className="text-xs text-textSecondary mt-1">
                      {relatedVideo.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
