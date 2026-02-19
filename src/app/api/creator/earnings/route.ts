import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revenueService } from '@/lib/revenue'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const [totalEarnings, breakdown, pending] = await Promise.all([
      revenueService.getUserTotalEarnings(userId),
      revenueService.getUserEarningsBreakdown(userId),
      revenueService.getUserPendingEarnings(userId),
    ])

    return NextResponse.json({
      totalEarnings,
      pendingEarnings: pending.estimatedEarnings,
      pendingViews: pending.pendingViews,
      breakdown,
    })
  } catch (error) {
    console.error('Earnings fetch error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
