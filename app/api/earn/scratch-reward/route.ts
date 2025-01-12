import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { amount, telegramId } = await request.json()

    if (!telegramId || amount === undefined) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: Number(telegramId) }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.scratchChances <= 0) {
      return NextResponse.json(
        { error: 'No scratch chances remaining' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId: Number(telegramId) },
      data: {
        zoaBalance: user.zoaBalance + amount,
        scratchChances: user.scratchChances - 1,
        lastScratchDate: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      zoaBalance: updatedUser.zoaBalance,
      scratchChances: updatedUser.scratchChances
    })
  } catch (error: any) {
    console.error('POST request error:', error)
    return NextResponse.json(
      { error: 'Database operation failed', details: error.message },
      { status: 500 }
    )
  }
}