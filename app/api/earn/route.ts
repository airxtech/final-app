import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ErrorResponse } from '@/app/types'
import { randomUUID } from 'crypto'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegramId')
    
    console.log('GET Request - Telegram ID:', telegramId); // Debug log
    
    if (!telegramId) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { 
        telegramId: Number(telegramId) 
      },
      include: {
        scratchHistory: true
      }
    })
    
    console.log('Found User:', user); // Debug log
    
    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const lastResetDate = user.scratchHistory?.lastResetDate.toISOString().split('T')[0]
    
    console.log('Date Check:', { today, lastResetDate }); // Debug log
    
    if (!lastResetDate || today !== lastResetDate) {
      await prisma.$transaction(async (tx) => {
        // If no scratch history exists, create one
        if (!user.scratchHistory) {
          await tx.scratchHistory.create({
            data: {
              id: randomUUID(),
              userId: user.id,
              lastResetDate: new Date(),
              lastScratchDate: new Date(),
              totalScratches: 0
            }
          })
        } else {
          // Update existing scratch history
          await tx.scratchHistory.update({
            where: { userId: user.id },
            data: { 
              lastResetDate: new Date()
            }
          })
        }

        await tx.user.update({
          where: { telegramId: Number(telegramId) },
          data: { scratchChances: 3 }
        })
      })

      user.scratchChances = 3
    }

    console.log('Response:', { zoaBalance: user.zoaBalance, scratchChances: user.scratchChances }); // Debug log

    return NextResponse.json({
      success: true,
      zoaBalance: user.zoaBalance,
      scratchChances: user.scratchChances
    })
  } catch (error) {
    console.error('GET request error:', error)
    return NextResponse.json<ErrorResponse>(
      { error: 'Database query failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}