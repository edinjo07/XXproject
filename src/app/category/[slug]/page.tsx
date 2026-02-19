import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { VideoGrid } from '@/components/VideoGrid'
import { CategorySlider } from '@/components/CategorySlider'
import { LeaderboardAd, ResponsiveAd } from '@/components/AdBanner'

async function getCategory(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
  })
}

async function getCategoryVideos(categoryId: string) {
  return await prisma.video.findMany({
    where: {
      status: 'APPROVED',
      categoryId,
    },
    orderBy: {
      createdAt: 'desc',
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [category, videos, categories] = await Promise.all([
    getCategory(slug),
    getCategory(slug).then(cat => cat ? getCategoryVideos(cat.id) : []),
    getAllCategories(),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Category Slider */}
      <CategorySlider categories={categories} currentSlug={slug} />

      {/* Top Banner Ad */}
      <div className="hidden md:flex justify-center my-6 sm:my-8">
        <LeaderboardAd slot="category_top_1" />
      </div>
      <div className="md:hidden my-4 sm:my-8">
        <ResponsiveAd slot="category_top_mobile_1" />
      </div>

      {/* Category Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          {category.icon && <span className="text-3xl sm:text-4xl">{category.icon}</span>}
          <h1 className="text-2xl sm:text-3xl font-bold">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-textSecondary text-base sm:text-lg">{category.description}</p>
        )}
        <p className="text-xs sm:text-sm text-textSecondary mt-2">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </p>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-textSecondary text-lg">No videos in this category yet.</p>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  )
}
