"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export type DashboardProjectRow = {
	id: string;
	name: string;
	submissionCount: number;
	apiUsageCount: number;
	owner: {
		displayName: string | null;
		imageUrl: string | null;
	};
};

export const dashboardProjectColumns: ColumnDef<DashboardProjectRow>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Project" />
		),
		cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
		enableHiding: false,
	},
	{
		id: "owner",
		accessorFn: (row) => row.owner.displayName ?? "User",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Owner" />
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Avatar className="h-6 w-6">
					<AvatarImage src={row.original.owner.imageUrl ?? undefined} />
					<AvatarFallback>
						{row.original.owner.displayName?.substring(0, 2).toUpperCase() ??
							"U"}
					</AvatarFallback>
				</Avatar>
				<span className="text-sm text-muted-foreground">
					{row.original.owner.displayName ?? "User"}
				</span>
			</div>
		),
	},
	{
		accessorKey: "submissionCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Submissions" />
		),
		cell: ({ row }) => (
			<div className="font-medium tabular-nums">
				{row.original.submissionCount.toLocaleString()}
			</div>
		),
	},
	{
		accessorKey: "apiUsageCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Usage Hits" />
		),
		cell: ({ row }) => (
			<div className="font-medium tabular-nums">
				{row.original.apiUsageCount.toLocaleString()}
			</div>
		),
	},
];
