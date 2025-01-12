import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegramId')
    
    if (!telegramId) {
      return NextResponse.json(
        { error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { 
        telegramId: Number(telegramId) 
      },
      select: {
        zoaBalance: true,
        scratchChances: true,
        lastScratchDate: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Reset scratch chances if it's a new day
    const today = new Date().toISOString().split('T')[0]
    const lastScratch = user.lastScratchDate?.toISOString().split('T')[0]
    
    if (today !== lastScratch) {
      await prisma.user.update({
        where: { telegramId: Number(telegramId) },
        data: { scratchChances: 3 }
      })
      user.scratchChances = 3
    }

    return NextResponse.json({
      success: true,
      zoaBalance: user.zoaBalance,
      scratchChances: user.scratchChances
    })
  } catch (error: any) {
    console.error('GET request error:', error)
    return NextResponse.json(
      { error: 'Database query failed', details: error.message },
      { status: 500 }
    )
  }
}