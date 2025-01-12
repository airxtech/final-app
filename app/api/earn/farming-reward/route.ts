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

    const updatedUser = await prisma.user.update({
      where: { telegramId: Number(telegramId) },
      data: {
        zoaBalance: user.zoaBalance + amount
      }
    })

    return NextResponse.json({
      success: true,
      zoaBalance: updatedUser.zoaBalance
    })
  } catch (error: any) {
    console.error('POST request error:', error)
    return NextResponse.json(
      { error: 'Database operation failed', details: error.message },
      { status: 500 }
    )
  }
}