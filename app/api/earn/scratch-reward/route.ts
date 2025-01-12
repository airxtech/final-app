import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const { amount, telegramId } = await request.json()
    console.log('POST Request:', { amount, telegramId }); // Debug log

    if (!telegramId || amount === undefined) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: Number(telegramId) },
      include: { scratchHistory: true }
    })

    console.log('Found User:', user); // Debug log

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

    // Begin transaction to update both user and scratch history
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { telegramId: Number(telegramId) },
        data: {
          zoaBalance: { increment: amount },
          scratchChances: { decrement: 1 }
        }
      })

      console.log('Updated User:', updatedUser); // Debug log

      // Update or create scratch history
      if (user.scratchHistory) {
        await tx.scratchHistory.update({
          where: { userId: user.id },
          data: {
            lastScratchDate: new Date(),
            totalScratches: { increment: 1 }
          }
        })
      } else {
        await tx.scratchHistory.create({
          data: {
            id: randomUUID(),
            userId: user.id,
            lastScratchDate: new Date(),
            lastResetDate: new Date(),
            totalScratches: 1
          }
        })
      }

      return updatedUser
    })

    console.log('Final Response:', { zoaBalance: updatedUser.zoaBalance, scratchChances: updatedUser.scratchChances }); // Debug log

    return NextResponse.json({
      success: true,
      zoaBalance: updatedUser.zoaBalance,
      scratchChances: updatedUser.scratchChances
    })
  } catch (error) {
    console.error('POST request error:', error)
    return NextResponse.json(
      { error: 'Database operation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}