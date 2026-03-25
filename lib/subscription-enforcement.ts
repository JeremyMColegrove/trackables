export function isSubscriptionEnforcementEnabledValue(
	value: string | undefined,
): boolean {
	return value?.trim() === "true";
}

export function isSubscriptionEnforcementEnabled(): boolean {
	return isSubscriptionEnforcementEnabledValue(
		process.env.ENABLE_SUBSCRIPTIONS,
	);
}
