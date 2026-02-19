import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reportActionSchema = z.object({
  action: z.enum(['resolved']),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = reportActionSchema.parse(body)
    const reportId = params.id
    const adminId = (session.user as any).id

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Report updated', report })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
