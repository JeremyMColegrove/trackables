/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatUserTimestamp } from "@/lib/date-time";
import {
	MCP_TOOL_DEFINITIONS,
	MCP_TOOL_NAMES,
	type McpToolName,
} from "@/lib/mcp-tools";
import { buildAbsoluteUrl } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { T, useGT } from "gt-next";
import {
	Check,
	Copy,
	KeyRound,
	LoaderCircle,
	Plus,
	Trash2,
	TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const expirationPresetOptions = [
	{ value: "never", label: "Never" },
	{ value: "30_days", label: "30 days" },
	{ value: "60_days", label: "60 days" },
	{ value: "90_days", label: "90 days" },
] as const;

const createTokenSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Token name is required.")
			.max(100, "Token name must be at most 100 characters."),
		expirationPreset: z.enum(["never", "30_days", "60_days", "90_days"]),
		allowAllTools: z.boolean(),
		selectedTools: z.array(z.enum(MCP_TOOL_NAMES)),
	})
	.superRefine((values, ctx) => {
		if (!values.allowAllTools && values.selectedTools.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select at least one tool.",
				path: ["selectedTools"],
			});
		}
	});

type CreateTokenValues = z.infer<typeof createTokenSchema>;

type McpTokenRow = {
	id: string;
	name: string;
	lastFour: string;
	capabilities: {
		tools: "all" | McpToolName[];
	};
	status: string;
	expiresAt: string | Date | null;
	lastUsedAt: string | Date | null;
	usageCount: number;
	createdAt: string | Date;
};

type CreatedTokenResult = {
	id: string;
	name: string;
	token: string;
	lastFour: string;
};

export function McpUserProfilePage() {
	const gt = useGT();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const listTokensQueryKey = trpc.mcp.listTokens.queryKey();
	const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [copiedEndpoint, setCopiedEndpoint] = useState(false);
	const endpoint = buildAbsoluteUrl("/api/mcp").toString();

	const tokensQuery = useQuery(trpc.mcp.listTokens.queryOptions());

	const revokeToken = useMutation(
		trpc.mcp.revokeToken.mutationOptions({
			onSuccess: async () => {
				setTokenToRevoke(null);
				await queryClient.invalidateQueries({ queryKey: listTokensQueryKey });
			},
		}),
	);

	async function handleCopyEndpoint() {
		await navigator.clipboard.writeText(endpoint);
		setCopiedEndpoint(true);
		window.setTimeout(() => setCopiedEndpoint(false), 1500);
	}

	const tokens = (tokensQuery.data ?? []) as McpTokenRow[];

	return (
		<div className="space-y-6">
			{/* Connection info */}
			<div className="rounded-xl border bg-muted/30 p-4">
				<p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					<T>Server endpoint</T>
				</p>
				<div className="flex items-center gap-2">
					<code className="min-w-0 flex-1 truncate rounded-md bg-background px-3 py-2 font-mono text-xs text-foreground ring-1 ring-border">
						{endpoint}
					</code>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="shrink-0 gap-1.5"
						onClick={() => void handleCopyEndpoint()}
					>
						{copiedEndpoint ? (
							<Check className="size-3.5 text-emerald-500" />
						) : (
							<Copy className="size-3.5" />
						)}
						{copiedEndpoint ? <T>Copied</T> : <T>Copy</T>}
					</Button>
				</div>
				<p className="mt-2 text-xs text-muted-foreground">
					<T>Authenticate with</T>{" "}
					<code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
						Authorization: Bearer &lt;token&gt;
					</code>
				</p>
			</div>

			{/* Tokens section */}
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-2">
					<div>
						<h2 className="text-sm font-semibold text-foreground">
							<T>MCP Tokens</T>
						</h2>
						<p className="text-xs text-muted-foreground">
							<T>Create and manage access tokens for MCP clients.</T>
						</p>
					</div>
					<Button
						type="button"
						variant={isCreateOpen ? "outline" : "default"}
						size="sm"
						className="shrink-0 gap-1.5"
						onClick={() => {
							setIsCreateOpen((v) => !v);
							setTokenToRevoke(null);
						}}
					>
						<Plus className="size-3.5" />
						{isCreateOpen ? <T>Cancel</T> : <T>New token</T>}
					</Button>
				</div>

				{/* Create form */}
				{isCreateOpen ? (
					<CreateMcpTokenPanel
						listTokensQueryKey={listTokensQueryKey}
						onDone={() => setIsCreateOpen(false)}
					/>
				) : null}

				{/* Token list */}
				{tokensQuery.isLoading ? (
					<div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
						<LoaderCircle className="size-4 animate-spin" />
						<T>Loading tokens...</T>
					</div>
				) : tokensQuery.error ? (
					<p className="text-sm text-destructive">
						<T>Failed to load your MCP tokens. Please try again.</T>
					</p>
				) : tokens.length === 0 && !isCreateOpen ? (
					<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
						<div className="flex size-10 items-center justify-center rounded-full bg-muted">
							<KeyRound className="size-5 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								<T>No tokens yet</T>
							</p>
							<p className="text-xs text-muted-foreground">
								<T>Create a token to connect an MCP client.</T>
							</p>
						</div>
					</div>
				) : (
					<div className="space-y-2">
						{tokens.map((token) => (
							<TokenCard
								key={token.id}
								token={token}
								isRevoking={
									revokeToken.isPending && tokenToRevoke === token.id
								}
								isConfirmingRevoke={tokenToRevoke === token.id}
								onRevoke={() => setTokenToRevoke(token.id)}
								onCancelRevoke={() => setTokenToRevoke(null)}
								onConfirmRevoke={() =>
									revokeToken.mutate({ tokenId: token.id })
								}
								gt={gt}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function TokenCard({
	token,
	isRevoking,
	isConfirmingRevoke,
	onRevoke,
	onCancelRevoke,
	onConfirmRevoke,
	gt,
}: {
	token: McpTokenRow;
	isRevoking: boolean;
	isConfirmingRevoke: boolean;
	onRevoke: () => void;
	onCancelRevoke: () => void;
	onConfirmRevoke: () => void;
	gt: ReturnType<typeof useGT>;
}) {
	const isActive = token.status === "active";
	const toolsSummary = getToolsSummary(token.capabilities.tools, gt);

	return (
		<div
			className={cn(
				"rounded-xl border bg-background transition-colors",
				isConfirmingRevoke && "border-destructive/40 bg-destructive/5",
			)}
		>
			<div className="flex items-start gap-3 p-4">
				{/* Status dot */}
				<div className="mt-1 shrink-0">
					<div
						className={cn(
							"size-2 rounded-full",
							isActive ? "bg-emerald-500" : "bg-muted-foreground/40",
						)}
					/>
				</div>

				{/* Main info */}
				<div className="min-w-0 flex-1 space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-medium text-sm text-foreground leading-none">
							{token.name}
						</span>
						<Badge
							variant={isActive ? "secondary" : "outline"}
							className="text-xs"
						>
							{isActive ? <T>Active</T> : <T>Revoked</T>}
						</Badge>
						<span className="font-mono text-xs text-muted-foreground">
							{`••••${token.lastFour}`}
						</span>
					</div>

					<p className="truncate text-xs text-muted-foreground">{toolsSummary}</p>

					<div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
						{token.usageCount > 0 ? (
							<span>
								{token.usageCount.toLocaleString()}{" "}
								{token.usageCount === 1 ? gt("use") : gt("uses")}
							</span>
						) : (
							<span>
								<T>Never used</T>
							</span>
						)}
						{token.lastUsedAt ? (
							<span>
								<T>Last used</T> {formatUserTimestamp(token.lastUsedAt)}
							</span>
						) : null}
						{token.expiresAt ? (
							<span>
								<T>Expires</T> {formatUserTimestamp(token.expiresAt)}
							</span>
						) : null}
					</div>
				</div>

				{/* Revoke button */}
				{isActive && !isConfirmingRevoke ? (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						title={gt("Revoke token")}
						className="size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
						onClick={onRevoke}
					>
						<Trash2 className="size-4" />
					</Button>
				) : null}
			</div>

			{/* Inline revoke confirmation */}
			{isConfirmingRevoke ? (
				<div className="flex items-center justify-between gap-3 border-t border-destructive/20 px-4 py-3">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<TriangleAlert className="size-3.5 shrink-0 text-destructive" />
						<span>
							<T>Revoke this token? It will stop working immediately.</T>
						</span>
					</div>
					<div className="flex shrink-0 gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onCancelRevoke}
							disabled={isRevoking}
						>
							<T>Cancel</T>
						</Button>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={onConfirmRevoke}
							disabled={isRevoking}
						>
							{isRevoking ? (
								<LoaderCircle className="size-3.5 animate-spin" />
							) : null}
							<T>Revoke</T>
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}

function CreateMcpTokenPanel({
	listTokensQueryKey,
	onDone,
}: {
	listTokensQueryKey: readonly unknown[];
	onDone: () => void;
}) {
	const gt = useGT();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [copied, setCopied] = useState(false);
	const [createdToken, setCreatedToken] = useState<CreatedTokenResult | null>(
		null,
	);

	const form = useForm<CreateTokenValues>({
		resolver: zodResolver(createTokenSchema),
		defaultValues: {
			name: "",
			expirationPreset: "never",
			allowAllTools: true,
			selectedTools: [],
		},
	});
	const allowAllTools = useWatch({ control: form.control, name: "allowAllTools" });

	const createToken = useMutation(
		trpc.mcp.createToken.mutationOptions({
			onSuccess: async (result) => {
				setCreatedToken({
					id: result.id,
					name: result.name,
					token: result.token,
					lastFour: result.lastFour,
				});
				setCopied(false);
				await queryClient.invalidateQueries({ queryKey: listTokensQueryKey });
			},
		}),
	);

	async function handleCopyToken() {
		if (!createdToken?.token) return;
		await navigator.clipboard.writeText(createdToken.token);
		setCopied(true);
	}

	function onSubmit(values: CreateTokenValues) {
		createToken.mutate({
			name: values.name,
			expiration: values.expirationPreset,
			capabilities: {
				tools: values.allowAllTools ? "all" : values.selectedTools,
			},
		});
	}

	const isSubmitting = form.formState.isSubmitting || createToken.isPending;

	/* Token reveal view */
	if (createdToken) {
		return (
			<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
				<div className="mb-3 flex items-center gap-2">
					<div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15">
						<Check className="size-3.5 text-emerald-600" />
					</div>
					<h3 className="text-sm font-semibold text-foreground">
						<T>Token created — copy it now</T>
					</h3>
				</div>

				<div className="rounded-lg border bg-background p-3">
					<code className="block break-all font-mono text-xs text-foreground">
						{createdToken.token}
					</code>
				</div>
				<p className="mt-2 text-xs text-muted-foreground">
					<T>
						You won&apos;t be able to see this token again. Store it somewhere
						secure.
					</T>
				</p>

				<div className="mt-4 flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => void handleCopyToken()}
					>
						{copied ? (
							<Check className="size-3.5 text-emerald-500" />
						) : (
							<Copy className="size-3.5" />
						)}
						{copied ? <T>Copied</T> : <T>Copy token</T>}
					</Button>
					<Button type="button" size="sm" onClick={onDone}>
						<T>Done</T>
					</Button>
				</div>
			</div>
		);
	}

	/* Create form view */
	return (
		<div className="rounded-xl border bg-muted/20 p-4">
			<h3 className="mb-4 text-sm font-semibold text-foreground">
				<T>Create MCP token</T>
			</h3>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T>Name</T>
									</FormLabel>
									<FormControl>
										<Input
											placeholder={gt("e.g. Cursor integration")}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="expirationPreset"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<T>Expiration</T>
									</FormLabel>
									<FormControl>
										<select
											{...field}
											className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
										>
											{expirationPresetOptions.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="allowAllTools"
						render={({ field }) => (
							<FormItem className="rounded-lg border bg-background p-3">
								<div className="flex items-start gap-3">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={(checked) => {
												const nextValue = checked === true;
												field.onChange(nextValue);

												if (
													!nextValue &&
													form.getValues("selectedTools").length === 0
												) {
													form.setValue("selectedTools", [...MCP_TOOL_NAMES], {
														shouldValidate: true,
													});
												}

												if (nextValue) {
													form.clearErrors("selectedTools");
												}
											}}
										/>
									</FormControl>
									<div className="space-y-0.5">
										<FormLabel className="text-sm font-medium">
											<T>Allow all tools</T>
										</FormLabel>
										<FormDescription className="text-xs">
											<T>Grant access to every MCP operation.</T>
										</FormDescription>
									</div>
								</div>
							</FormItem>
						)}
					/>

					{!allowAllTools ? (
						<FormField
							control={form.control}
							name="selectedTools"
							render={({ field }) => (
								<FormItem>
									<div className="mb-2 space-y-0.5">
										<FormLabel>
											<T>Allowed tools</T>
										</FormLabel>
										<FormDescription className="text-xs">
											<T>Choose which operations this token can run.</T>
										</FormDescription>
									</div>

									<div className="grid gap-2 sm:grid-cols-2">
										{MCP_TOOL_DEFINITIONS.map((tool) => {
											const isChecked = field.value.includes(tool.name);

											return (
												<label
													key={tool.name}
													className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/30"
												>
													<Checkbox
														checked={isChecked}
														onCheckedChange={(checked) => {
															const nextValue =
																checked === true
																	? [...field.value, tool.name]
																	: field.value.filter(
																			(v) => v !== tool.name,
																		);
															field.onChange(nextValue);
														}}
													/>
													<div className="space-y-0.5">
														<p className="text-sm font-medium leading-none text-foreground">
															{tool.label}
														</p>
														<p className="text-xs text-muted-foreground">
															{tool.description}
														</p>
													</div>
												</label>
											);
										})}
									</div>

									<FormMessage />
								</FormItem>
							)}
						/>
					) : null}

					{createToken.error ? (
						<p className="text-sm text-destructive">
							{createToken.error.message ||
								gt("Failed to create the MCP token. Please try again.")}
						</p>
					) : null}

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onDone}
							disabled={isSubmitting}
						>
							<T>Cancel</T>
						</Button>
						<Button type="submit" size="sm" disabled={isSubmitting}>
							{createToken.isPending ? (
								<LoaderCircle className="size-3.5 animate-spin" />
							) : null}
							<T>Create token</T>
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

function getToolsSummary(
	tools: "all" | readonly McpToolName[],
	gt: ReturnType<typeof useGT>,
) {
	if (tools === "all") {
		return gt("All tools");
	}

	return tools
		.map((toolName) => {
			const definition = MCP_TOOL_DEFINITIONS.find(
				(tool) => tool.name === toolName,
			);
			return definition?.label ?? toolName;
		})
		.join(", ");
}
