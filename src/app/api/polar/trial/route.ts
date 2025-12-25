import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { startTrial, TRIAL_DAYS } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription or trial
    if (user.subscriptionTier !== 'FREE' || user.subscriptionStatus === 'TRIALING') {
      return NextResponse.json({
        error: 'Trial not available',
        message: 'You already have an active subscription or trial.',
      }, { status: 400 });
    }

    // Start the trial
    await startTrial(user.id, TRIAL_DAYS);

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    return NextResponse.json({
      success: true,
      message: `Trial started! You have ${TRIAL_DAYS} days of Pro access.`,
      data: {
        subscriptionTier: updatedUser?.subscriptionTier,
        subscriptionStatus: updatedUser?.subscriptionStatus,
        trialEndDate: updatedUser?.trialEndDate,
      },
    });
  } catch (error) {
    console.error('Trial start error:', error);
    return NextResponse.json(
      { error: 'Failed to start trial', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const isInTrial = user.subscriptionStatus === 'TRIALING' && user.trialEndDate && user.trialEndDate > now;
    const trialDaysRemaining = isInTrial && user.trialEndDate
      ? Math.ceil((user.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        isEligibleForTrial: user.subscriptionTier === 'FREE' && user.subscriptionStatus !== 'TRIALING',
        isInTrial,
        trialDaysRemaining,
        trialEndDate: user.trialEndDate,
      },
    });
  } catch (error) {
    console.error('Trial status error:', error);
    return NextResponse.json(
      { error: 'Failed to get trial status', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
