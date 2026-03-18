import { z } from "zod"

import type {
  CheckboxesFieldConfig,
  FormAnswerValue,
  NotesFieldConfig,
  RatingFieldConfig,
  TrackableFormFieldSnapshot,
  TrackableFormSnapshot,
  TrackableSubmissionSnapshot,
} from "@/db/schema/types"

const otherCheckboxValue = "__other__"

export const publicFormSubmissionSchema = z.object({
  token: z.string().trim().min(1),
  responderEmail: z.string().trim().email().optional(),
  metadata: z
    .object({
      locale: z.string().trim().max(40).optional(),
      userAgent: z.string().trim().max(512).optional(),
      referrer: z.string().trim().max(1024).optional(),
    })
    .optional(),
  answers: z.array(
    z.object({
      fieldId: z.string().uuid(),
      value: z.unknown(),
    })
  ),
})

export type PublicFormSubmissionInput = z.infer<
  typeof publicFormSubmissionSchema
>

type SubmissionAnswer = TrackableSubmissionSnapshot["answers"][number]

export function isRatingField(
  field: TrackableFormFieldSnapshot
): field is TrackableFormFieldSnapshot & {
  kind: "rating"
  config: RatingFieldConfig
} {
  return field.kind === "rating" && field.config.kind === "rating"
}

export function isCheckboxesField(
  field: TrackableFormFieldSnapshot
): field is TrackableFormFieldSnapshot & {
  kind: "checkboxes"
  config: CheckboxesFieldConfig
} {
  return field.kind === "checkboxes" && field.config.kind === "checkboxes"
}

export function isNotesField(
  field: TrackableFormFieldSnapshot
): field is TrackableFormFieldSnapshot & {
  kind: "notes"
  config: NotesFieldConfig
} {
  return field.kind === "notes" && field.config.kind === "notes"
}

export function buildSubmissionSnapshot(
  form: TrackableFormSnapshot,
  answers: PublicFormSubmissionInput["answers"]
) {
  const fields = [...form.fields].sort((left, right) => left.position - right.position)
  const answersByFieldId = new Map<string, unknown>()

  for (const answer of answers) {
    if (answersByFieldId.has(answer.fieldId)) {
      throw new Error("Duplicate answers are not allowed.")
    }

    answersByFieldId.set(answer.fieldId, answer.value)
  }

  const normalizedAnswers = fields.map((field) =>
    buildFieldAnswer(field, answersByFieldId.get(field.id))
  )

  return {
    snapshot: {
      form: {
        ...form,
        fields,
      },
      answers: normalizedAnswers,
    } satisfies TrackableSubmissionSnapshot,
    answers: normalizedAnswers.map((answer) => ({
      fieldId: answer.fieldId,
      value: answer.value,
    })),
  }
}

export function requiresResponderEmail(settings: {
  allowAnonymousSubmissions?: boolean
  collectResponderEmail?: boolean
} | null) {
  return settings?.collectResponderEmail === true
}

function buildFieldAnswer(
  field: TrackableFormFieldSnapshot,
  rawValue: unknown
): SubmissionAnswer {
  if (isRatingField(field)) {
    return {
      fieldId: field.id,
      fieldKey: field.key,
      fieldKind: field.kind,
      fieldLabel: field.label,
      value: {
        kind: "rating",
        value: parseRatingValue(field, rawValue),
      },
    }
  }

  if (isCheckboxesField(field)) {
    return {
      fieldId: field.id,
      fieldKey: field.key,
      fieldKind: field.kind,
      fieldLabel: field.label,
      value: {
        kind: "checkboxes",
        value: parseCheckboxValues(field, rawValue),
      },
    }
  }

  if (isNotesField(field)) {
    return {
      fieldId: field.id,
      fieldKey: field.key,
      fieldKind: field.kind,
      fieldLabel: field.label,
      value: {
        kind: "notes",
        value: parseNotesValue(field, rawValue),
      },
    }
  }

  throw new Error(`Unsupported field type for ${field.label}.`)
}

function parseRatingValue(
  field: TrackableFormFieldSnapshot & {
    kind: "rating"
    config: RatingFieldConfig
  },
  rawValue: unknown
) {
  if (typeof rawValue !== "number" || !Number.isInteger(rawValue)) {
    throw new Error(`${field.label} requires a valid rating.`)
  }

  if (rawValue < 1 || rawValue > field.config.scale) {
    throw new Error(`${field.label} must be between 1 and ${field.config.scale}.`)
  }

  return rawValue
}

function parseCheckboxValues(
  field: TrackableFormFieldSnapshot & {
    kind: "checkboxes"
    config: CheckboxesFieldConfig
  },
  rawValue: unknown
) {
  if (!Array.isArray(rawValue)) {
    throw new Error(`${field.label} requires one or more selections.`)
  }

  const normalizedValues = Array.from(
    new Set(
      rawValue
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  )

  const allowedValues = new Set(field.config.options.map((option) => option.value))

  if (field.config.allowOther) {
    allowedValues.add(otherCheckboxValue)
  }

  for (const value of normalizedValues) {
    if (!allowedValues.has(value)) {
      throw new Error(`${field.label} contains an invalid selection.`)
    }
  }

  if (field.required && normalizedValues.length === 0) {
    throw new Error(`${field.label} requires at least one selection.`)
  }

  if (
    typeof field.config.minSelections === "number" &&
    normalizedValues.length < field.config.minSelections
  ) {
    throw new Error(
      `${field.label} requires at least ${field.config.minSelections} selections.`
    )
  }

  if (
    typeof field.config.maxSelections === "number" &&
    normalizedValues.length > field.config.maxSelections
  ) {
    throw new Error(
      `${field.label} allows at most ${field.config.maxSelections} selections.`
    )
  }

  return normalizedValues
}

function parseNotesValue(
  field: TrackableFormFieldSnapshot & {
    kind: "notes"
    config: NotesFieldConfig
  },
  rawValue: unknown
) {
  if (typeof rawValue !== "string") {
    throw new Error(`${field.label} requires text.`)
  }

  const normalizedValue = rawValue.trim()

  if (field.required && normalizedValue.length === 0) {
    throw new Error(`${field.label} cannot be empty.`)
  }

  if (
    typeof field.config.maxLength === "number" &&
    normalizedValue.length > field.config.maxLength
  ) {
    throw new Error(
      `${field.label} must be ${field.config.maxLength} characters or fewer.`
    )
  }

  return normalizedValue
}

export function getEmptyAnswerValue(field: TrackableFormFieldSnapshot): FormAnswerValue {
  switch (field.kind) {
    case "rating":
      return { kind: "rating", value: 0 }
    case "checkboxes":
      return { kind: "checkboxes", value: [] }
    case "notes":
      return { kind: "notes", value: "" }
  }
}

export function getOtherCheckboxValue() {
  return otherCheckboxValue
}
