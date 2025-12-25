import { prisma } from '@/lib/db/prisma';

export const TRIAL_DAYS = 14;
export const FREE_TIER_LIMITS = {
  analysesPerMonth: 5,
  apiCallsPerMonth: 0,
};

export const PRO_TIER_LIMITS = {
  analysesPerMonth: 500,
  apiCallsPerMonth: 0,
  teamMembers: 1,
};

export const BUSINESS_TIER_LIMITS = {
  analysesPerMonth: 2000,
  apiCallsPerMonth: 1000,
  teamMembers: 5,
};

export const API_STARTER_LIMITS = {
  analysesPerMonth: 0,
  apiCallsPerMonth: 10000,
};

export const API_GROWTH_LIMITS = {
  analysesPerMonth: 0,
  apiCallsPerMonth: 50000,
};

export const API_ENTERPRISE_LIMITS = {
  analysesPerMonth: 0,
  apiCallsPerMonth: -1, // unlimited
};

export type SubscriptionTier = 'FREE' | 'PRO' | 'BUSINESS' | 'API_STARTER' | 'API_GROWTH' | 'API_ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';

export interface TierLimits {
  analysesPerMonth: number;
  apiCallsPerMonth: number;
  teamMembers?: number;
}

export function isInTrial(user: {
  subscriptionStatus: SubscriptionStatus;
  trialEndDate: Date | null;
}): boolean {
  if (user.subscriptionStatus !== 'TRIALING') return false;
  if (!user.trialEndDate) return false;
  return new Date() < user.trialEndDate;
}

export function getEffectiveTier(user: {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndDate: Date | null;
}): SubscriptionTier {
  // If in trial with TRIALING status, user gets Pro benefits
  if (isInTrial(user)) {
    return 'PRO';
  }
  return user.subscriptionTier;
}

export function getEffectiveStatus(user: {
  subscriptionStatus: SubscriptionStatus;
  trialEndDate: Date | null;
}): SubscriptionStatus {
  if (isInTrial(user)) {
    return 'TRIALING';
  }
  return user.subscriptionStatus;
}

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  switch (tier) {
    case 'FREE':
      return FREE_TIER_LIMITS;
    case 'PRO':
      return PRO_TIER_LIMITS;
    case 'BUSINESS':
      return BUSINESS_TIER_LIMITS;
    case 'API_STARTER':
      return API_STARTER_LIMITS;
    case 'API_GROWTH':
      return API_GROWTH_LIMITS;
    case 'API_ENTERPRISE':
      return API_ENTERPRISE_LIMITS;
    default:
      return FREE_TIER_LIMITS;
  }
}

export function canAccessFeature(
  user: {
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus;
    trialEndDate: Date | null;
  },
  feature: 'seo_analysis' | 'keyword_suggestions' | 'pdf_export' | 'api_access' | 'webhooks' | 'team' | 'custom_branding'
): boolean {
  const tier = getEffectiveTier(user);
  const status = getEffectiveStatus(user);

  // Only active or trialing users can access features
  if (status !== 'ACTIVE' && status !== 'TRIALING') {
    return false;
  }

  switch (feature) {
    case 'seo_analysis':
      return true; // Available on all tiers
    case 'keyword_suggestions':
      return tier !== 'FREE';
    case 'pdf_export':
      return tier !== 'FREE';
    case 'api_access':
      return tier.startsWith('API_') || tier === 'BUSINESS';
    case 'webhooks':
      return tier === 'BUSINESS';
    case 'team':
      return tier === 'BUSINESS';
    case 'custom_branding':
      return tier === 'BUSINESS';
    default:
      return false;
  }
}

export function getRemainingAnalyses(user: {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndDate: Date | null;
  monthlyAnalysesUsed: number;
}): number {
  const tier = getEffectiveTier(user);
  const limits = getTierLimits(tier);
  return Math.max(0, limits.analysesPerMonth - user.monthlyAnalysesUsed);
}

export function canPerformAnalysis(user: {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndDate: Date | null;
  monthlyAnalysesUsed: number;
}): boolean {
  const tier = getEffectiveTier(user);
  const status = getEffectiveStatus(user);

  if (status !== 'ACTIVE' && status !== 'TRIALING') {
    return false;
  }

  const limits = getTierLimits(tier);
  return user.monthlyAnalysesUsed < limits.analysesPerMonth;
}

export async function startTrial(userId: string, days: number = TRIAL_DAYS): Promise<void> {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + days);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'PRO',
      subscriptionStatus: 'TRIALING',
      trialStartDate: now,
      trialEndDate: endDate,
    },
  });

  console.log(`Started ${days}-day trial for user ${userId}`);
}

export async function endTrial(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'INACTIVE',
      trialStartDate: null,
      trialEndDate: null,
    },
  });

  console.log(`Trial ended for user ${userId}`);
}

export async function checkAndExpireTrials(): Promise<void> {
  const expiredTrials = await prisma.user.findMany({
    where: {
      subscriptionStatus: 'TRIALING',
      trialEndDate: {
        lt: new Date(),
      },
    },
  });

  for (const user of expiredTrials) {
    await endTrial(user.id);
    console.log(`Auto-expired trial for user ${user.id}`);
  }
}

export function formatTier(tier: SubscriptionTier): string {
  switch (tier) {
    case 'FREE':
      return 'Free';
    case 'PRO':
      return 'Pro';
    case 'BUSINESS':
      return 'Business';
    case 'API_STARTER':
      return 'API Starter';
    case 'API_GROWTH':
      return 'API Growth';
    case 'API_ENTERPRISE':
      return 'API Enterprise';
    default:
      return tier;
  }
}

export function formatStatus(status: SubscriptionStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    case 'CANCELLED':
      return 'Cancelled';
    case 'PAST_DUE':
      return 'Past Due';
    case 'TRIALING':
      return 'Trial';
    default:
      return status;
  }
}
