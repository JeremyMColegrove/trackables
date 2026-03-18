export interface RatingFieldConfig {
  kind: "rating"
  scale: number
  icon?: "star" | "thumb" | "heart"
  labels?: {
    low?: string
    high?: string
  }
}

export interface CheckboxOption {
  id: string
  label: string
  value: string
}

export interface CheckboxesFieldConfig {
  kind: "checkboxes"
  options: CheckboxOption[]
  allowOther?: boolean
  minSelections?: number
  maxSelections?: number
}

export interface NotesFieldConfig {
  kind: "notes"
  placeholder?: string
  maxLength?: number
}

export type FormFieldConfig =
  | RatingFieldConfig
  | CheckboxesFieldConfig
  | NotesFieldConfig

export type FormAnswerValue =
  | { kind: "rating"; value: number }
  | { kind: "checkboxes"; value: string[] }
  | { kind: "notes"; value: string }

export interface TrackableFormFieldSnapshot {
  id: string
  key: string
  kind: FormFieldConfig["kind"]
  label: string
  description: string | null
  required: boolean
  position: number
  config: FormFieldConfig
}

export interface TrackableFormSnapshot {
  id: string
  version: number
  title: string
  status: "draft" | "published" | "archived"
  submitLabel: string | null
  successMessage: string | null
  fields: TrackableFormFieldSnapshot[]
}

export interface TrackableFormAnswerSnapshot {
  fieldId: string
  fieldKey: string
  fieldKind: FormAnswerValue["kind"]
  fieldLabel: string
  value: FormAnswerValue
}

export interface TrackableSubmissionSnapshot {
  form: TrackableFormSnapshot
  answers: TrackableFormAnswerSnapshot[]
}

export interface TrackableSettings {
  allowAnonymousSubmissions?: boolean
  allowMultipleSubmissions?: boolean
  collectResponderEmail?: boolean
  successRedirectUrl?: string | null
  isFormEnabled?: boolean
  isApiEnabled?: boolean
}

export interface SubmissionMetadata {
  ipHash?: string
  userAgent?: string
  referrer?: string
  locale?: string
  deviceId?: string
}

export interface UsageEventMetadata {
  ipHash?: string
  userAgent?: string
  referrer?: string
  requestSource?: string
  headers?: Record<string, string>
}

export type UsageEventPayload = Record<string, unknown>
