"use client";

import { CreateTrackableDialog } from "@/app/[locale]/dashboard/CreateProjectDialog";
import { DashboardMetrics } from "@/app/[locale]/dashboard/DashboardMetrics";
import { DashboardTrackablesTable } from "@/app/[locale]/dashboard/DashboardProjectsTable";
import { PageShell } from "@/components/page-shell";
import { useGT } from "gt-next";

export function DashboardPageClient() {
	const gt = useGT();
	return (
		<PageShell title={gt("Overview")} headerActions={<CreateTrackableDialog />}>
			<DashboardMetrics />

			<DashboardTrackablesTable
				title={gt("Trackables")}
				titleVariant="default"
				description={gt("Manage your logs, surveys, and links")}
				showSearch={false}
				showViewOptions={false}
			/>
		</PageShell>
	);
}
