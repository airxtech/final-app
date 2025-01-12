import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ErrorResponse } from '@/app/types'

interface FarmingRewardRequest {
  amount: number;
  telegramId: number;
}

export async function POST(request: Request) {
  try {
    const { amount, telegramId } = await request.json() as FarmingRewardRequest;

    if (!telegramId || amount === undefined) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: Number(telegramId) }
    });

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId: Number(telegramId) },
      data: {
        zoaBalance: user.zoaBalance + amount
      }
    });

    return NextResponse.json({
      success: true,
      zoaBalance: updatedUser.zoaBalance
    });
  } catch (error) {
    console.error('POST request error:', error);
    return NextResponse.json<ErrorResponse>(
      { 
        error: 'Database operation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}