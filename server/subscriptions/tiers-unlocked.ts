import "server-only";

export function areTiersUnlocked(): boolean {
	return Boolean(process.env.NEXT_PUBLIC_TIERS_UNLOCKED) ?? false;
}
