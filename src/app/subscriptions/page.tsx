import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { VideoGrid } from '@/components/VideoGrid'
import { prisma } from '@/lib/prisma'

async function getSubscriptionFeed(userId: string) {
  const videos = await prisma.video.findMany({
    where: {
      status: 'APPROVED',
      user: {
        subscribers: {
          some: {
            subscriberId: userId,
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 24,
  })

  return videos
}

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = (session.user as any).id
  const videos = await getSubscriptionFeed(userId)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Subscriptions Feed</h1>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-textSecondary mb-4">
            No videos from your subscriptions yet.
          </p>
          <p className="text-sm text-textSecondary">
            Subscribe to creators to see their latest videos here!
          </p>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  )
}
