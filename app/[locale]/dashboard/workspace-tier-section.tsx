"use client";

import { useWorkspaceContext } from "@/app/[locale]/dashboard/workspace-context-provider";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getWorkspaceTierPlan } from "@/lib/workspace-tier-config";
import type { SubscriptionTier } from "@/server/subscriptions/types";
import { T } from "gt-next";

export function WorkspaceTierSection({
	onOpenDialog,
}: {
	onOpenDialog: (currentTier: SubscriptionTier) => void;
}) {
	const { currentTier, isLoading } = useWorkspaceContext();
	const { setOpenMobile } = useSidebar();

	// Wait until loading finishes to avoid flicker
	if (isLoading) return null;

	const plan = getWorkspaceTierPlan(currentTier);
	const isHighestTier = currentTier === "pro";

	const handleOpenDialog = () => {
		onOpenDialog(currentTier);
		setOpenMobile(false);
	};

	return (
		<button
			onClick={handleOpenDialog}
			className={cn(
				"flex w-full items-center justify-between gap-3 rounded-lg p-2 text-left text-sm transition-colors hover:bg-sidebar-accent group",
			)}
		>
			<div className="flex flex-col gap-0.5 leading-none">
				<span className="text-[10px] font-medium tracking-wider text-sidebar-foreground/50 uppercase transition-colors group-hover:text-primary/70">
					<T>Workspace Plan</T>
				</span>
				<div className="flex items-center gap-1.5 mt-0.5">
					<span className="font-semibold text-primary transition-colors">
						{plan.name}
					</span>
				</div>
			</div>

			<span className="text-xs font-semibold opacity-60 hover:opacity-100 transition-colors pr-1">
				{!isHighestTier ? <T>Manage</T> : <T>Upgrade</T>}
			</span>
		</button>
	);
}
