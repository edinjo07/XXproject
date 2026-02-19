import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriberId = (session.user as any).id
    const { username } = await params

    // Find the creator to subscribe to
    const creator = await prisma.user.findUnique({
      where: { username },
    })

    if (!creator) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Can't subscribe to yourself
    if (creator.id === subscriberId) {
      return NextResponse.json(
        { error: 'Cannot subscribe to yourself' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_subscribedToId: {
          subscriberId,
          subscribedToId: creator.id,
        },
      },
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      )
    }

    // Create subscription
    await prisma.subscription.create({
      data: {
        subscriberId,
        subscribedToId: creator.id,
      },
    })

    // Get updated subscriber count
    const subscriberCount = await prisma.subscription.count({
      where: { subscribedToId: creator.id },
    })

    return NextResponse.json({
      success: true,
      subscriberCount,
    })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriberId = (session.user as any).id
    const { username } = await params

    // Find the creator
    const creator = await prisma.user.findUnique({
      where: { username },
    })

    if (!creator) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete subscription
    await prisma.subscription.deleteMany({
      where: {
        subscriberId,
        subscribedToId: creator.id,
      },
    })

    // Get updated subscriber count
    const subscriberCount = await prisma.subscription.count({
      where: { subscribedToId: creator.id },
    })

    return NextResponse.json({
      success: true,
      subscriberCount,
    })
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : null

    // Find the creator
    const creator = await prisma.user.findUnique({
      where: { username },
    })

    if (!creator) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscriber count
    const subscriberCount = await prisma.subscription.count({
      where: { subscribedToId: creator.id },
    })

    // Check if current user is subscribed (if logged in)
    let isSubscribed = false
    if (userId) {
      const subscription = await prisma.subscription.findUnique({
        where: {
          subscriberId_subscribedToId: {
            subscriberId: userId,
            subscribedToId: creator.id,
          },
        },
      })
      isSubscribed = !!subscription
    }

    return NextResponse.json({
      subscriberCount,
      isSubscribed,
    })
  } catch (error) {
    console.error('Error getting subscription info:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
