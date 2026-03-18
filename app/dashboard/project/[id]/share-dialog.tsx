"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Link2, ShareIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTRPC } from "@/trpc/client";

import { formatDateTime } from "./display-utils";
import type { ProjectDetails, ShareLinkRow } from "./table-types";

function buildSurveyLink(token: string) {
	if (typeof window === "undefined") {
		return `/share/${token}`;
	}

	return `${window.location.origin}/share/${token}`;
}

function getSurveyLink(links: ShareLinkRow[]) {
	return links.find((link) => !link.revokedAt) ?? links[0] ?? null;
}

export function ShareDialog({ project }: { project: ProjectDetails }) {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const projectQueryKey = trpc.projects.getById.queryKey({ id: project.id });

	const surveyLink = useMemo(
		() => getSurveyLink(project.shareSettings.shareLinks),
		[project.shareSettings.shareLinks],
	);
	const linkIsOn = Boolean(surveyLink && !surveyLink.revokedAt);
	const hasForm = Boolean(project.activeForm);

	async function refreshProject() {
		await queryClient.invalidateQueries({
			queryKey: projectQueryKey,
		});
	}

	const createShareLink = useMutation(
		trpc.projects.createShareLink.mutationOptions({
			onSuccess: refreshProject,
		}),
	);

	const updateShareLink = useMutation(
		trpc.projects.updateShareLink.mutationOptions({
			onSuccess: refreshProject,
		}),
	);

	const isBusy = createShareLink.isPending || updateShareLink.isPending;

	function turnLinkOn() {
		if (surveyLink) {
			updateShareLink.mutate({
				projectId: project.id,
				linkId: surveyLink.id,
				role: "submit",
				isActive: true,
			});
			return;
		}

		createShareLink.mutate({
			projectId: project.id,
			role: "submit",
		});
	}

	function turnLinkOff() {
		if (!surveyLink) {
			return;
		}

		updateShareLink.mutate({
			projectId: project.id,
			linkId: surveyLink.id,
			role: "submit",
			isActive: false,
		});
	}

	async function copyLink() {
		if (!surveyLink || !linkIsOn) {
			return;
		}

		await navigator.clipboard.writeText(buildSurveyLink(surveyLink.token));
		setCopied(true);
		window.setTimeout(() => setCopied(false), 2000);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="h-9 gap-2 rounded-full px-5">
					<ShareIcon className="size-4" />
					Share Form
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Form link</DialogTitle>
					<DialogDescription>
						This link opens the survey form only. It does not give access to the
						project dashboard.
					</DialogDescription>
				</DialogHeader>

				{!hasForm ? (
					<div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
						Create a form first, then you can turn on a share link for it.
					</div>
				) : (
					<div className="space-y-4">
						<div className="rounded-xl border border-border/60 bg-muted/20 p-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<div className="flex items-center gap-2">
										<span className="font-medium">Survey link</span>
										<Badge variant="outline">{linkIsOn ? "On" : "Off"}</Badge>
									</div>
									<p className="mt-1 text-sm text-muted-foreground">
										Turn this on when you want people to fill out the survey.
									</p>
								</div>

								<Button
									type="button"
									variant={linkIsOn ? "outline" : "default"}
									onClick={linkIsOn ? turnLinkOff : turnLinkOn}
									disabled={isBusy}
								>
									{linkIsOn
										? "Turn off"
										: createShareLink.isPending
											? "Turning on..."
											: "Turn on"}
								</Button>
							</div>
						</div>

						<div className="rounded-xl border border-border/60 bg-background p-4">
							<div className="flex items-center gap-2 text-sm font-medium">
								<Link2 className="size-4 text-muted-foreground" />
								Public form link
							</div>

							<div className="mt-3 break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
								{surveyLink
									? buildSurveyLink(surveyLink.token)
									: "Link not created yet"}
							</div>

							<div className="mt-3 flex items-center justify-between gap-3">
								<div className="text-sm text-muted-foreground">
									{surveyLink
										? `Created ${formatDateTime(surveyLink.createdAt)}`
										: "Turn the link on to create it."}
								</div>

								<Button
									type="button"
									variant="outline"
									onClick={copyLink}
									disabled={!surveyLink || !linkIsOn || isBusy}
								>
									{copied ? (
										<Check className="size-4" />
									) : (
										<Copy className="size-4" />
									)}
									{copied ? "Copied" : "Copy link"}
								</Button>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
