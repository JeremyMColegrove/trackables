"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowLeft, Key, LayoutTemplate } from "lucide-react";
import Link from "next/link";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";
import { ApiKeysTable } from "./api-keys-table";
import { FormBuilder } from "./form-builder";
import { FormSubmissionsTable } from "./form-submissions-table";
import { SettingsDialog } from "./settings-dialog";
import { ShareDialog } from "./share-dialog";
import { UsageEventsTable } from "./usage-events-table";

function ProjectContentSkeleton() {
	return (
		<div className="flex-1 space-y-6 px-4 md:px-6">
			<div className="space-y-3 pt-4">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-10 w-72" />
				<Skeleton className="h-5 w-lg max-w-full" />
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-32 rounded-xl" />
				))}
			</div>
			<Skeleton className="h-[420px] rounded-xl" />
		</div>
	);
}

export function ProjectContent({ projectId }: { projectId: string }) {
	const trpc = useTRPC();
	const projectQuery = useQuery(
		trpc.projects.getById.queryOptions(
			{ id: projectId },
			{
				retry: false,
			},
		),
	);

	if (projectQuery.error?.data?.code === "NOT_FOUND") {
		return (
			<div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 md:px-6">
				<Card className="border-border/50 bg-card/40 shadow-sm backdrop-blur-sm">
					<CardHeader>
						<CardTitle>Project not found</CardTitle>
						<CardDescription>
							This project does not exist or you no longer have access to it.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (projectQuery.isError) {
		return (
			<div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 md:px-6">
				<Card className="border-border/50 bg-card/40 shadow-sm backdrop-blur-sm">
					<CardHeader>
						<CardTitle>Unable to load project</CardTitle>
						<CardDescription>
							There was a problem loading the latest project data.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (projectQuery.isLoading || !projectQuery.data) {
		return <ProjectContentSkeleton />;
	}

	const project = projectQuery.data;
	return (
		<div className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 animate-in space-y-6 px-4 duration-500 fade-in md:px-6">
			<div className="flex min-w-0 flex-1 flex-col gap-4">
				<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
					<Link
						href="/dashboard"
						className="flex items-center gap-1 transition-colors hover:text-foreground"
					>
						<ArrowLeft className="size-4" />
						Dashboard
					</Link>
					<span>/</span>
					<span className="font-medium text-foreground">{project.name}</span>
				</div>

				<div className="mt-2 mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
							{project.name}
						</h1>
						<p className="mt-1.5 max-w-2xl text-lg text-muted-foreground">
							{project.description ?? "No description added yet."}
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-3">
						<SettingsDialog project={project} />
						<ShareDialog project={project} />
					</div>
				</div>

				<div className="mt-2">
					<Tabs defaultValue="overview" className="w-full min-w-0">
						<TabsList>
							<TabsTrigger value="overview">
								<Activity className="mr-2 size-4" />
								Overview
							</TabsTrigger>
							<TabsTrigger value="form">
								<LayoutTemplate className="mr-2 size-4" />
								Form Builder
							</TabsTrigger>
							<TabsTrigger value="api">
								<Key className="mr-2 size-4" />
								API Keys
							</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="mt-6 min-w-0 space-y-6">
							<Card className="min-w-0">
								<CardContent className="min-w-0">
									<div className="grid min-w-0 gap-6 xl:grid-cols-2 xl:items-start">
										<FormSubmissionsTable data={project.recentSubmissions} />
										<UsageEventsTable data={project.recentUsageEvents} />
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="form" className="mt-6 min-w-0">
							<FormBuilder
								key={project.activeForm?.id ?? "empty-form"}
								projectId={project.id}
								projectName={project.name}
								activeForm={project.activeForm}
							/>
						</TabsContent>

						<TabsContent value="api" className="mt-6 min-w-0">
							<Card className="min-w-0">
								<CardContent className="min-w-0">
									<ApiKeysTable data={project.apiKeys} projectId={project.id} />
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
