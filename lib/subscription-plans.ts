import type {
	SubscriptionTier,
	TierLimits,
} from "@/server/subscriptions/types";

export interface FreeTierUserLimits {
	maxCreatedWorkspaces: number | null;
}

export interface SubscriptionPlanDefinition {
	tier: SubscriptionTier;
	rank: number;
	lemonSqueezyVariantId: string | null;
	limits: TierLimits;
}

const FREE_LIMITS: TierLimits = {
	maxTrackableItems: 10,
	maxResponsesPerSurvey: 100,
	maxWorkspaceMembers: 10,
	maxApiLogsPerMinute: 10,
	maxApiPayloadBytes: 1024,
	logRetentionDays: 3,
};

const PLUS_LIMITS: TierLimits = {
	maxTrackableItems: 100,
	maxResponsesPerSurvey: null,
	maxWorkspaceMembers: 100,
	maxApiLogsPerMinute: 60,
	maxApiPayloadBytes: 32 * 1024,
	logRetentionDays: 90,
};

const PRO_LIMITS: TierLimits = {
	maxTrackableItems: 1000,
	maxResponsesPerSurvey: null,
	maxWorkspaceMembers: null,
	maxApiLogsPerMinute: 600,
	maxApiPayloadBytes: 32 * 1024 * 10,
	logRetentionDays: 365,
};

const FREE_TIER_USER_LIMITS: FreeTierUserLimits = {
	maxCreatedWorkspaces: 3,
};

const SUBSCRIPTION_PLAN_LIST: SubscriptionPlanDefinition[] = [
	{
		tier: "free",
		rank: 0,
		lemonSqueezyVariantId: null,
		limits: FREE_LIMITS,
	},
	{
		tier: "plus",
		rank: 1,
		lemonSqueezyVariantId: "1482028",
		limits: PLUS_LIMITS,
	},
	{
		tier: "pro",
		rank: 2,
		lemonSqueezyVariantId: "1482029",
		limits: PRO_LIMITS,
	},
];

const SUBSCRIPTION_PLANS = SUBSCRIPTION_PLAN_LIST.reduce(
	(plans, plan) => {
		plans[plan.tier] = plan;
		return plans;
	},
	{} as Record<SubscriptionTier, SubscriptionPlanDefinition>,
);

const TIER_RANKS = SUBSCRIPTION_PLAN_LIST.reduce(
	(ranks, plan) => {
		ranks[plan.tier] = plan.rank;
		return ranks;
	},
	{} as Record<SubscriptionTier, number>,
);

export function getSubscriptionPlans(): readonly SubscriptionPlanDefinition[] {
	return [...SUBSCRIPTION_PLAN_LIST].sort(
		(left, right) => left.rank - right.rank,
	);
}

export function getSubscriptionPlan(
	tier: SubscriptionTier,
): SubscriptionPlanDefinition {
	return SUBSCRIPTION_PLANS[tier];
}

export function getLimitsForTier(tier: SubscriptionTier): TierLimits {
	return getSubscriptionPlan(tier).limits;
}

export function getFreeTierUserLimits(): FreeTierUserLimits {
	return FREE_TIER_USER_LIMITS;
}

export function getFreeTierCreatedWorkspaceLimit(): number | null {
	return getFreeTierUserLimits().maxCreatedWorkspaces;
}

export function resolveTierFromVariantId(
	variantId: string,
): SubscriptionTier | null {
	const matchingPlan = SUBSCRIPTION_PLAN_LIST.find(
		(plan) => plan.lemonSqueezyVariantId === variantId,
	);

	return matchingPlan?.tier ?? null;
}

export function isTierAtLeast(
	current: SubscriptionTier,
	required: SubscriptionTier,
): boolean {
	return TIER_RANKS[current] >= TIER_RANKS[required];
}
