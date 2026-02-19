import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { VideoGrid } from '@/components/VideoGrid'
import { ResponsiveAd } from '@/components/AdBanner'
import { FaUser, FaVideo, FaEye } from 'react-icons/fa'

async function getProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      createdAt: true,
      videos: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  })

  if (!user) return null

  const totalViews = user.videos.reduce((sum, video) => sum + video.views, 0)

  return {
    ...user,
    totalViews,
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="bg-surface p-4 sm:p-6 lg:p-8 rounded-lg mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary rounded-full flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl flex-shrink-0 mx-auto sm:mx-0">
            <FaUser />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{profile.username}</h1>
            {profile.bio && (
              <p className="text-textSecondary mb-3 sm:mb-4 text-sm sm:text-base">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-3 sm:gap-6 text-textSecondary text-sm sm:text-base justify-center sm:justify-start">
              <span className="flex items-center gap-2">
                <FaVideo />
                {profile.videos.length} videos
              </span>
              <span className="flex items-center gap-2">
                <FaEye />
                {profile.totalViews.toLocaleString()} total views
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ad between profile and videos */}
      <div className="my-6 sm:my-8">
        <ResponsiveAd slot="profile_below_header_1" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Videos</h2>
      <VideoGrid videos={profile.videos} />
    </div>
  )
}
