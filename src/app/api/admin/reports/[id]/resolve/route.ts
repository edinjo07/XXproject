import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, resolutionNotes } = await req.json()
    const reportId = params.id
    const adminId = (session.user as any)?.id

    // Get report details
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        video: {
          select: { id: true, title: true, userId: true }
        }
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Update report
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        action: action || 'NO_ACTION',
        resolutionNotes: resolutionNotes || ''
      }
    })

    // Log the action
    await prisma.adminActionLog.create({
      data: {
        adminId,
        action: 'REPORT_RESOLVED',
        targetType: 'REPORT',
        targetId: reportId,
        reason: resolutionNotes,
        metadata: JSON.stringify({
          videoId: report.videoId,
          videoTitle: report.video.title,
          reportReason: report.reason,
          resolutionAction: action
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resolving report:', error)
    return NextResponse.json({ error: 'Failed to resolve report' }, { status: 500 })
  }
}
