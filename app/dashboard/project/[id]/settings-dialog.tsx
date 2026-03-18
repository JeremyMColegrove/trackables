"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Settings, Shield, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Control, FieldPath } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { ProjectDetails } from "./table-types";

const settingsSchema = z.object({
	name: z.string().min(1, "Project name is required"),
	description: z.string().optional(),
	isFormEnabled: z.boolean(),
	isApiEnabled: z.boolean(),
	allowAnonymousSubmissions: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
type SaveState = "idle" | "saving" | "saved" | "error";

type ToggleFieldName =
	| "isFormEnabled"
	| "allowAnonymousSubmissions"
	| "isApiEnabled";

function SettingsToggleField({
	control,
	name,
	label,
	description,
}: {
	control: Control<SettingsFormValues>;
	name: FieldPath<SettingsFormValues> & ToggleFieldName;
	label: string;
	description: string;
}) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="flex flex-row items-start justify-between gap-4 rounded-xl border border-border/60 bg-background p-4 shadow-xs">
					<div className="space-y-1 pr-2">
						<FormLabel className="text-sm font-medium text-foreground">
							{label}
						</FormLabel>
						<FormDescription className="text-xs leading-5">
							{description}
						</FormDescription>
					</div>
					<FormControl>
						<Switch checked={field.value} onCheckedChange={field.onChange} />
					</FormControl>
				</FormItem>
			)}
		/>
	);
}

export function SettingsDialog({ project }: { project: ProjectDetails }) {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const [saveState, setSaveState] = useState<SaveState>("idle");

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const projectQueryKey = trpc.projects.getById.queryKey({ id: project.id });
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const saveStateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	const inFlightRef = useRef<string | null>(null);
	const lastSavedRef = useRef("");

	function getDefaultValues(): SettingsFormValues {
		return {
			name: project.name,
			description: project.description ?? "",
			isFormEnabled: project.settings?.isFormEnabled ?? true,
			isApiEnabled: project.settings?.isApiEnabled ?? true,
			allowAnonymousSubmissions:
				project.settings?.allowAnonymousSubmissions ?? true,
		};
	}

	function serializeSettings(values: SettingsFormValues) {
		return JSON.stringify(values);
	}

	function clearSaveTimers() {
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = null;
		}

		if (saveStateTimeoutRef.current) {
			clearTimeout(saveStateTimeoutRef.current);
			saveStateTimeoutRef.current = null;
		}
	}

	const form = useForm<SettingsFormValues>({
		resolver: zodResolver(settingsSchema),
		defaultValues: getDefaultValues(),
	});
	const watchedSettings = useWatch({ control: form.control });

	// Reset form when dialog opens
	function handleOpenChange(newOpen: boolean) {
		if (newOpen) {
			const defaultValues = getDefaultValues();
			form.reset(defaultValues);
			lastSavedRef.current = serializeSettings(defaultValues);
			inFlightRef.current = null;
			clearSaveTimers();
			setSaveState("idle");
		} else {
			clearSaveTimers();
			inFlightRef.current = null;
			setSaveState("idle");
		}

		setOpen(newOpen);
	}

	const updateSettings = useMutation(
		trpc.projects.updateSettings.mutationOptions(),
	);

	const queueSave = useCallback(
		(delay = 500) => {
			function runSave() {
				const parsedValues = settingsSchema.safeParse(form.getValues());

				if (!parsedValues.success) {
					setSaveState("idle");
					return;
				}

				const snapshot = serializeSettings(parsedValues.data);

				if (
					snapshot === lastSavedRef.current ||
					snapshot === inFlightRef.current
				) {
					return;
				}

				if (updateSettings.isPending) {
					setSaveState("saving");
					saveTimeoutRef.current = setTimeout(() => {
						runSave();
					}, 250);
					return;
				}

				inFlightRef.current = snapshot;
				setSaveState("saving");
				updateSettings.mutate(
					{
						projectId: project.id,
						...parsedValues.data,
					},
					{
						onSuccess: async (_data, variables) => {
							await queryClient.invalidateQueries({
								queryKey: projectQueryKey,
							});

							const savedValues: SettingsFormValues = {
								name: variables.name,
								description: variables.description ?? "",
								isFormEnabled: variables.isFormEnabled,
								isApiEnabled: variables.isApiEnabled,
								allowAnonymousSubmissions: variables.allowAnonymousSubmissions,
							};
							const savedSnapshot = serializeSettings(savedValues);
							const currentSnapshot = serializeSettings(form.getValues());

							lastSavedRef.current = savedSnapshot;
							inFlightRef.current = null;

							if (currentSnapshot === savedSnapshot) {
								form.reset(savedValues);
								setSaveState("saved");
								saveStateTimeoutRef.current = setTimeout(() => {
									setSaveState("idle");
								}, 1500);
								return;
							}

							setSaveState("idle");
							saveTimeoutRef.current = setTimeout(() => {
								runSave();
							}, 150);
						},
						onError: () => {
							inFlightRef.current = null;
							setSaveState("error");
						},
					},
				);
			}

			clearSaveTimers();
			saveTimeoutRef.current = setTimeout(() => {
				runSave();
			}, delay);
		},
		[form, project.id, projectQueryKey, queryClient, updateSettings],
	);

	useEffect(() => {
		if (!open) {
			return;
		}
		queueSave();

		return () => {
			clearSaveTimers();
		};
	}, [open, project.id, queueSave, updateSettings, watchedSettings]);

	async function copyProjectId() {
		await navigator.clipboard.writeText(project.id);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-9 gap-2 rounded-full border-border/60 px-4 transition-all hover:bg-muted/50"
				>
					<Settings className="size-4" />
					Settings
				</Button>
			</DialogTrigger>
			<DialogContent className="flex max-h-[min(90vh,44rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader className="shrink-0 px-6 pt-6 pb-4">
					<DialogTitle>Project Settings</DialogTitle>
					<DialogDescription>
						Manage your project configuration, access, and API behavior.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form className="flex min-h-0 flex-1 flex-col">
						<Tabs
							defaultValue="general"
							className="flex min-h-0 flex-1 flex-col overflow-hidden"
						>
							<div className="shrink-0 px-6 pb-1">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="general">
										<Settings className="size-4" />
										General
									</TabsTrigger>
									<TabsTrigger value="sharing">
										<Shield className="size-4" />
										Sharing
									</TabsTrigger>
									<TabsTrigger value="api">
										<Zap className="size-4" />
										API
									</TabsTrigger>
								</TabsList>
							</div>

							<div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
								<TabsContent value="general" className="mt-0 space-y-5">
									<div className="space-y-1">
										<h3 className="text-sm font-medium text-foreground">
											Project details
										</h3>
										<p className="text-sm text-muted-foreground">
											Name the project clearly and add context for
											collaborators.
										</p>
									</div>

									<div className="grid gap-4">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Project Name</FormLabel>
													<FormControl>
														<Input
															placeholder="My Trackable Project"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description (Optional)</FormLabel>
													<FormControl>
														<Textarea
															placeholder="What is this project tracking?"
															className="min-h-28 resize-none"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</TabsContent>

								<TabsContent value="sharing" className="mt-0 space-y-5">
									<div className="space-y-1">
										<h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
											<Globe className="size-4 text-muted-foreground" />
											Response access
										</h3>
										<p className="text-sm text-muted-foreground">
											Control whether the shared form accepts submissions and
											who can submit.
										</p>
									</div>

									<div className="space-y-3">
										<SettingsToggleField
											control={form.control}
											name="isFormEnabled"
											label="Enable form"
											description="Allow new responses submitted through the public form."
										/>
										<SettingsToggleField
											control={form.control}
											name="allowAnonymousSubmissions"
											label="Allow anonymous responses"
											description="When off, people must sign in before they can open and submit the shared survey."
										/>
									</div>
								</TabsContent>

								<TabsContent value="api" className="mt-0 space-y-5">
									<div className="space-y-1">
										<h3 className="text-sm font-medium text-foreground">
											API access
										</h3>
										<p className="text-sm text-muted-foreground">
											Manage usage tracking behavior and copy the project
											identifier used by integrations.
										</p>
									</div>

									<div className="space-y-3">
										<SettingsToggleField
											control={form.control}
											name="isApiEnabled"
											label="Enable API"
											description="Allow usage events from configured API keys."
										/>
									</div>
								</TabsContent>
							</div>
						</Tabs>

						<div className="shrink-0 border-t bg-muted/50 px-6 py-3 text-sm text-muted-foreground">
							{saveState === "saving" && "Saving changes..."}
							{saveState === "saved" && "All changes saved."}
							{saveState === "error" && "Unable to save changes."}
							{saveState === "idle" && "Changes save automatically."}
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
