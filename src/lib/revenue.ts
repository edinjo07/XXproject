import { prisma } from './prisma'
import { config } from './config'

export class RevenueService {
  /**
   * Calculate earnings for a video based on views
   */
  calculateEarnings(views: number): number {
    const thousands = Math.floor(views / 1000)
    return thousands * config.platform.payoutRatePer1000
  }

  /**
   * Calculate and store earnings for a creator's video
   */
  async calculateVideoEarnings(videoId: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        earnings: true,
      },
    })

    if (!video || video.status !== 'APPROVED') {
      return null
    }

    // Get total views already counted in earnings
    const totalCountedViews = video.earnings.reduce(
      (sum, earning) => sum + earning.views,
      0
    )

    // Calculate new views
    const newViews = video.views - totalCountedViews

    if (newViews < 1000) {
      // Only calculate earnings per 1000 views
      return null
    }

    // Calculate earnings for complete thousands
    const viewsToCount = Math.floor(newViews / 1000) * 1000
    const amount = this.calculateEarnings(viewsToCount)

    // Create earning record
    const earning = await prisma.earning.create({
      data: {
        userId: video.userId,
        videoId: video.id,
        amount,
        views: viewsToCount,
      },
    })

    return earning
  }

  /**
   * Get total earnings for a user
   */
  async getUserTotalEarnings(userId: string) {
    const result = await prisma.earning.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    })

    return result._sum.amount || 0
  }

  /**
   * Get earnings breakdown per video for a user
   */
  async getUserEarningsBreakdown(userId: string) {
    const earnings = await prisma.earning.groupBy({
      by: ['videoId'],
      where: { userId },
      _sum: {
        amount: true,
        views: true,
      },
    })

    const videos = await prisma.video.findMany({
      where: {
        id: {
          in: earnings.map((e) => e.videoId),
        },
      },
      select: {
        id: true,
        title: true,
        views: true,
      },
    })

    return earnings.map((earning) => {
      const video = videos.find((v) => v.id === earning.videoId)
      return {
        videoId: earning.videoId,
        videoTitle: video?.title,
        totalViews: video?.views || 0,
        countedViews: earning._sum.views || 0,
        totalEarnings: earning._sum.amount || 0,
      }
    })
  }

  /**
   * Calculate pending earnings (views not yet counted)
   */
  async getUserPendingEarnings(userId: string) {
    const videos = await prisma.video.findMany({
      where: {
        userId,
        status: 'APPROVED',
      },
      include: {
        earnings: true,
      },
    })

    let pendingViews = 0

    for (const video of videos) {
      const countedViews = video.earnings.reduce(
        (sum, earning) => sum + earning.views,
        0
      )
      const remainingViews = video.views - countedViews
      pendingViews += remainingViews
    }

    return {
      pendingViews,
      estimatedEarnings: this.calculateEarnings(pendingViews),
    }
  }
}

export const revenueService = new RevenueService()
