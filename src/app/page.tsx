import { prisma } from '@/lib/prisma'
import { VideoGrid } from '@/components/VideoGrid'
import { CategorySlider } from '@/components/CategorySlider'
import { BillboardAd, LeaderboardAd, ResponsiveAd } from '@/components/AdBanner'

export const dynamic = 'force-dynamic'

async function getFeaturedVideos() {
  return await prisma.video.findMany({
    where: {
      status: 'APPROVED',
    },
    orderBy: {
      views: 'desc',
    },
    take: 12,
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  })
}

async function getLatestVideos() {
  return await prisma.video.findMany({
    where: {
      status: 'APPROVED',
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 12,
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  })
}

async function getAllCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          videos: {
            where: { status: 'APPROVED' }
          }
        }
      }
    }
  })

  return categories.map((category: any) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    color: category.color,
    videoCount: category._count.videos
  }))
}

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedVideos(),
    getLatestVideos(),
    getAllCategories(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Top Banner Ad - Desktop */}
      <div className="hidden md:flex justify-center mb-6 sm:mb-8">
        <BillboardAd slot="homepage_top_1" />
      </div>
      
      {/* Top Banner Ad - Mobile */}
      <div className="md:hidden mb-4 sm:mb-8">
        <ResponsiveAd slot="homepage_top_mobile_1" />
      </div>

      {/* Category Slider */}
      <CategorySlider categories={categories} />

      <section className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Featured Videos</h1>
        <VideoGrid videos={featured} />
      </section>

      {/* Mid-content Ad */}
      <div className="flex justify-center my-8 sm:my-12">
        <LeaderboardAd slot="homepage_mid_1" className="hidden md:block" />
        <ResponsiveAd slot="homepage_mid_mobile_1" className="md:hidden" />
      </div>

      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Latest Uploads</h2>
        <VideoGrid videos={latest} />
      </section>
    </div>
  )
}
