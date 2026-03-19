/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TrackableFormSnapshot } from "@/db/schema/types";
import {
	createCheckboxOption,
	createDefaultEditableField,
	createDefaultEditableForm,
	createFieldKey,
	createOptionValue,
	type EditableTrackableForm,
	type EditableTrackableFormField,
	editableTrackableFormSchema,
	formSnapshotToEditableForm,
	normalizeEditableForm,
} from "@/lib/project-form-builder";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	CheckSquare,
	Edit3,
	FileText,
	FormInput,
	Plus,
	Star,
	Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { formatFieldKind } from "./display-utils";

type RatingConfig = Extract<
	EditableTrackableFormField["config"],
	{ kind: "rating" }
>;
type CheckboxesConfig = Extract<
	EditableTrackableFormField["config"],
	{ kind: "checkboxes" }
>;
type NotesConfig = Extract<
	EditableTrackableFormField["config"],
	{ kind: "notes" }
>;
type ShortTextConfig = Extract<
	EditableTrackableFormField["config"],
	{ kind: "short_text" }
>;

function isRatingField(
	field: EditableTrackableFormField,
): field is EditableTrackableFormField & { config: RatingConfig } {
	return field.config.kind === "rating";
}

function isCheckboxesField(
	field: EditableTrackableFormField,
): field is EditableTrackableFormField & { config: CheckboxesConfig } {
	return field.config.kind === "checkboxes";
}

function isNotesField(
	field: EditableTrackableFormField,
): field is EditableTrackableFormField & { config: NotesConfig } {
	return field.config.kind === "notes";
}

function isShortTextField(
	field: EditableTrackableFormField,
): field is EditableTrackableFormField & { config: ShortTextConfig } {
	return field.config.kind === "short_text";
}

function getFieldIcon(kind: EditableTrackableFormField["kind"]) {
	switch (kind) {
		case "rating":
			return <Star className="size-4" />;
		case "checkboxes":
			return <CheckSquare className="size-4" />;
		case "notes":
			return <FileText className="size-4" />;
		case "short_text":
			return <FormInput className="size-4" />;
	}
}

const FIELD_TYPE_OPTIONS = [
	{ kind: "rating", label: "Quick Rating" },
	{ kind: "short_text", label: "Short Text" },
	{ kind: "notes", label: "Notes / Input" },
	{ kind: "checkboxes", label: "Checkbox" },
] as const;

function FieldPreview({
	field,
	index,
	total,
	onChange,
	onMove,
	onRemove,
}: {
	field: EditableTrackableFormField;
	index: number;
	total: number;
	onChange: (nextField: EditableTrackableFormField) => void;
	onMove: (index: number, direction: -1 | 1) => void;
	onRemove: (index: number) => void;
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<label className="block text-lg font-medium">
							{field.label || "Untitled field"}
						</label>
						<Badge variant="outline" className="rounded-full">
							{field.required ? "Required" : formatFieldKind(field.kind)}
						</Badge>
					</div>
					{field.description ? (
						<p className="text-sm text-muted-foreground">{field.description}</p>
					) : null}
				</div>
				<div className="flex items-center gap-2">
					<Dialog>
						<DialogTrigger asChild>
							<Button type="button" size="sm" variant="outline">
								<Edit3 className="size-3.5" />
								Edit
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
							<DialogHeader>
								<DialogTitle>Field</DialogTitle>
							</DialogHeader>

							<div className="grid gap-3">
								<div className="space-y-2">
									<Label>Label</Label>
									<Input
										value={field.label}
										placeholder="Field label"
										onChange={(event) =>
											onChange({ ...field, label: event.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Description</Label>
									<Textarea
										value={field.description ?? ""}
										placeholder="Description"
										onChange={(event) =>
											onChange({
												...field,
												description: event.target.value || null,
											})
										}
										className="min-h-20 resize-none"
									/>
								</div>
								<div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
									<Label>Required</Label>
									<Switch
										checked={field.required}
										onCheckedChange={(checked) =>
											onChange({ ...field, required: checked })
										}
									/>
								</div>

								{isRatingField(field) ? (
									<div className="space-y-2">
										<Label>Scale</Label>
										<Input
											type="number"
											min={3}
											max={10}
											value={field.config.scale}
											placeholder="Scale"
											onChange={(event) =>
												onChange({
													...field,
													config: {
														...field.config,
														scale: Number(event.target.value) || 3,
													},
												})
											}
										/>
									</div>
								) : null}

								{isNotesField(field) || isShortTextField(field) ? (
									<div className="space-y-2">
										<Label>Placeholder</Label>
										<Input
											value={field.config.placeholder ?? ""}
											placeholder="Placeholder"
											onChange={(event) =>
												onChange({
													...field,
													config: {
														...field.config,
														placeholder: event.target.value,
													},
												})
											}
										/>
									</div>
								) : null}

								{isCheckboxesField(field) ? (
									<div className="space-y-2">
										<Label>Options</Label>
										{field.config.options.map((option, optionIndex) => (
											<div
												key={option.id}
												className="grid gap-2 md:grid-cols-[1fr_auto]"
											>
												<Input
													value={option.label}
													placeholder={`Option ${optionIndex + 1}`}
													onChange={(event) => {
														const nextOptions = [...field.config.options];
														const nextLabel = event.target.value;

														nextOptions[optionIndex] = {
															...nextOptions[optionIndex],
															label: nextLabel,
															value: createOptionValue(nextLabel),
														};

														onChange({
															...field,
															config: {
																...field.config,
																options: nextOptions,
															},
														});
													}}
												/>
												<Button
													type="button"
													variant="destructive"
													size="icon-sm"
													onClick={() => {
														const nextOptions = field.config.options.filter(
															(_, indexToKeep) => indexToKeep !== optionIndex,
														);

														onChange({
															...field,
															config: {
																...field.config,
																options:
																	nextOptions.length > 0
																		? nextOptions
																		: [createCheckboxOption("Option 1")],
															},
														});
													}}
												>
													<Trash2 className="size-4" />
												</Button>
											</div>
										))}
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												onChange({
													...field,
													config: {
														...field.config,
														options: [
															...field.config.options,
															createCheckboxOption(
																`Option ${field.config.options.length + 1}`,
															),
														],
													},
												})
											}
										>
											<Plus className="size-4" />
											Add option
										</Button>
									</div>
								) : null}
							</div>
						</DialogContent>
					</Dialog>
					<Button
						type="button"
						size="icon-sm"
						variant="outline"
						onClick={() => onMove(index, -1)}
						disabled={index === 0}
					>
						<ArrowUp className="size-4" />
					</Button>
					<Button
						type="button"
						size="icon-sm"
						variant="outline"
						onClick={() => onMove(index, 1)}
						disabled={index === total - 1}
					>
						<ArrowDown className="size-4" />
					</Button>
					<Button
						type="button"
						size="icon-sm"
						variant="destructive"
						onClick={() => onRemove(index)}
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			</div>

			{isRatingField(field) ? (
				<div className="flex flex-wrap gap-2">
					{Array.from({ length: field.config.scale }).map((_, indexValue) => (
						<button
							key={indexValue}
							type="button"
							disabled
							className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
						>
							<Star className="size-4" />
						</button>
					))}
				</div>
			) : null}

			{isCheckboxesField(field) ? (
				<div className="space-y-2">
					{field.config.options.map((option) => (
						<label key={option.id} className="flex items-center gap-3 text-sm">
							<Checkbox disabled />
							<span>{option.label}</span>
						</label>
					))}
					{field.config.allowOther ? (
						<label className="flex items-center gap-3 text-sm">
							<Checkbox disabled />
							<span>Other</span>
						</label>
					) : null}
				</div>
			) : null}

			{isNotesField(field) ? (
				<Textarea
					disabled
					className="min-h-24 resize-none"
					placeholder={field.config.placeholder ?? "Write your response..."}
				/>
			) : null}

			{isShortTextField(field) ? (
				<Input
					disabled
					placeholder={field.config.placeholder ?? "Type your answer..."}
				/>
			) : null}
		</div>
	);
}

export function FormBuilder({
	trackableId,
	trackableName,
	trackableDescription,
	activeForm,
}: {
	trackableId: string;
	trackableName: string;
	trackableDescription: string | null;
	activeForm: TrackableFormSnapshot | null;
}) {
	const addFieldTriggerRef = useRef<HTMLButtonElement | null>(null);
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [draft, setDraft] = useState<EditableTrackableForm>(() =>
		activeForm
			? formSnapshotToEditableForm(activeForm)
			: createDefaultEditableForm(trackableName),
	);

	const saveForm = useMutation(
		trpc.trackables.saveForm.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.trackables.getById.queryKey({ id: trackableId }),
				});
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const normalizedDraft = useMemo(() => normalizeEditableForm(draft), [draft]);
	const initialDraft = useMemo(
		() =>
			activeForm
				? normalizeEditableForm(formSnapshotToEditableForm(activeForm))
				: normalizeEditableForm(createDefaultEditableForm(trackableName)),
		[activeForm, trackableName],
	);
	const validationResult = useMemo(
		() => editableTrackableFormSchema.safeParse(normalizedDraft),
		[normalizedDraft],
	);
	const isDirty =
		JSON.stringify(normalizedDraft) !== JSON.stringify(initialDraft);

	function addField(kind: EditableTrackableFormField["kind"]) {
		setDraft((currentDraft) => ({
			...currentDraft,
			fields: [
				...currentDraft.fields,
				createDefaultEditableField(kind, currentDraft.fields.length),
			].map((field, index) => ({
				...field,
				key:
					field.key === createFieldKey(field.kind, field.position)
						? createFieldKey(field.kind, index)
						: field.key,
				position: index,
			})),
		}));
	}

	function updateField(index: number, nextField: EditableTrackableFormField) {
		setDraft((currentDraft) => ({
			...currentDraft,
			fields: currentDraft.fields.map((field, fieldIndex) =>
				fieldIndex === index ? { ...nextField, position: index } : field,
			),
		}));
	}

	function moveField(index: number, direction: -1 | 1) {
		setDraft((currentDraft) => {
			const nextIndex = index + direction;

			if (nextIndex < 0 || nextIndex >= currentDraft.fields.length) {
				return currentDraft;
			}

			const nextFields = [...currentDraft.fields];
			const [field] = nextFields.splice(index, 1);
			nextFields.splice(nextIndex, 0, field);

			return {
				...currentDraft,
				fields: nextFields.map((entry, entryIndex) => ({
					...entry,
					position: entryIndex,
				})),
			};
		});
	}

	function removeField(index: number) {
		setDraft((currentDraft) => ({
			...currentDraft,
			fields: currentDraft.fields
				.filter((_, fieldIndex) => fieldIndex !== index)
				.map((field, fieldIndex) => ({
					...field,
					position: fieldIndex,
				})),
		}));
	}

	function resetDraft() {
		setDraft(
			activeForm
				? formSnapshotToEditableForm(activeForm)
				: createDefaultEditableForm(trackableName),
		);
	}

	function handleSave() {
		const result = editableTrackableFormSchema.safeParse(normalizedDraft);

		if (!result.success) {
			toast.error(
				result.error.issues[0]?.message ?? "Unable to save the form.",
			);
			return;
		}

		saveForm.mutate({
			trackableId,
			form: result.data,
		});
	}

	const validationMessage = validationResult.success
		? isDirty
			? "Unsaved changes ready for the next version."
			: "No unpublished changes."
		: "Resolve validation issues before saving.";

	return (
		<div className="flex flex-col gap-6">
			<div className="mx-auto flex w-full max-w-4xl items-center justify-end gap-2">
				<div className="mr-auto">
					<div
						className={cn(
							"hidden text-sm sm:block",
							!validationResult.success
								? "font-medium text-destructive"
								: "text-muted-foreground",
						)}
					>
						{validationMessage}
					</div>
				</div>
				<Button
					type="button"
					variant="outline"
					onClick={resetDraft}
					disabled={!isDirty || saveForm.isPending}
				>
					Reset
				</Button>
				<Button
					type="button"
					onClick={handleSave}
					disabled={!isDirty || saveForm.isPending}
				>
					{saveForm.isPending ? "Saving..." : "Save changes"}
				</Button>
			</div>

			<div className="mx-auto w-full max-w-4xl">
				<div className="flex flex-col gap-8">
					<div className="flex flex-col gap-2">
						<Label
							htmlFor="form-title"
							className="text-xs uppercase tracking-wide text-muted-foreground"
						>
							Form title
						</Label>
						<Input
							id="form-title"
							value={draft.title}
							placeholder="Form title"
							onChange={(event) =>
								setDraft((currentDraft) => ({
									...currentDraft,
									title: event.target.value,
								}))
							}
						/>
						<Textarea
							value={draft.description ?? ""}
							placeholder="Your form description..."
							onChange={(event) =>
								setDraft((currentDraft) => ({
									...currentDraft,
									description: event.target.value,
								}))
							}
							rows={2}
						/>
					</div>

					{draft.fields.length > 0
						? draft.fields.map((field, index) => (
								<div key={field.id} className="flex flex-col gap-8">
									<FieldPreview
										field={field}
										index={index}
										total={draft.fields.length}
										onChange={(nextField) => updateField(index, nextField)}
										onMove={moveField}
										onRemove={removeField}
									/>
									{index < draft.fields.length - 1 ? (
										<div className="border-b border-border/50" />
									) : null}
								</div>
							))
						: null}

					<Separator />

					<ContextMenu>
						<ContextMenuTrigger asChild>
							<button
								ref={addFieldTriggerRef}
								type="button"
								className="flex items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/50 px-4 py-5 text-sm text-muted-foreground transition-colors hover:bg-muted"
								onClick={(event) => {
									event.preventDefault();
									addFieldTriggerRef.current?.dispatchEvent(
										new MouseEvent("contextmenu", {
											bubbles: true,
											cancelable: true,
											clientX: event.clientX,
											clientY: event.clientY,
											view: window,
										}),
									);
								}}
							>
								<Plus className="size-4" />
								<span>Click to add new form field</span>
							</button>
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuGroup>
								{FIELD_TYPE_OPTIONS.map((entry) => (
									<ContextMenuItem
										key={entry.kind}
										onClick={() => addField(entry.kind)}
									>
										{getFieldIcon(entry.kind)}
										<span>{entry.label}</span>
									</ContextMenuItem>
								))}
							</ContextMenuGroup>
						</ContextMenuContent>
					</ContextMenu>

					<Button disabled type="button" className="self-start">
						{draft.submitLabel ?? "Submit response"}
					</Button>
					{draft.successMessage ? (
						<p className="text-sm text-muted-foreground">
							{draft.successMessage}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
