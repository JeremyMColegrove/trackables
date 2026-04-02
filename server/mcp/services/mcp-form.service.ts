import "server-only"

import { randomUUID } from "node:crypto"

import {
  validateMcpFormPayload,
  type McpFormInput,
  type McpFormValidationResult,
} from "@/lib/mcp-form-schema"
import { formService } from "@/server/services/form.service"
import type { McpAuthContext } from "@/server/mcp/auth/mcp-auth-context"
import { McpToolError } from "@/server/mcp/errors/mcp-errors"
import type { McpValidationError } from "@/server/mcp/errors/mcp-errors"
import { mcpTrackableService } from "@/server/mcp/services/mcp-trackable.service"
import type { EditableTrackableForm } from "@/lib/project-form-builder"

// Re-export types for callers that import from this module
export type { McpFormInput, McpFormValidationResult }

/** Result returned to the create_form tool handler. */
export interface McpFormCreationResult {
  success: boolean
  formId?: string
  trackableId?: string
  formVersion?: number
  title?: string
  status?: string
  /** Structured errors for retry when success is false */
  errorCode?: string
  message?: string
  errors?: McpValidationError[]
}

/**
 * MCP Form Service
 *
 * Implements strict JSON-driven form creation for the create_form tool.
 *
 * Validation is deterministic and runs before any database write.
 * If validation fails, the caller receives structured path-level errors
 * suitable for agent self-correction and retry. If validation succeeds,
 * the form is created via the existing formService.saveForm().
 * Sharing state is managed separately via the update_form_sharing tool.
 *
 * The pure validation function lives in `lib/mcp-form-schema.ts` so it can
 * be tested without importing server-only modules.
 */
export class McpFormService {
  private toEditableFieldConfig(
    config: McpFormInput["fields"][number]["config"]
  ): EditableTrackableForm["fields"][number]["config"] {
    if (config.kind !== "checkboxes") {
      return config as EditableTrackableForm["fields"][number]["config"]
    }

    return {
      ...config,
      options: config.options.map((option) => ({
        ...option,
        id: randomUUID(),
      })),
    }
  }

  /**
   * Validates a raw (untrusted) payload against the MCP form schema.
   *
   * Delegates to `validateMcpFormPayload` from lib/mcp-form-schema.ts.
   * No database writes occur on validation failure.
   */
  validateFormPayload(payload: unknown): McpFormValidationResult {
    return validateMcpFormPayload(payload)
  }

  /**
   * Creates a form on an existing survey trackable from a validated MCP payload.
   *
   * Steps:
   * 1. Validate the payload — fail immediately with structured errors if invalid
   * 2. Verify the trackable exists, is a survey, and is accessible
   * 3. Transform the payload into EditableTrackableForm (assigning IDs/positions)
   * 4. Persist via formService.saveForm()
   * 5. Return success with form identifiers and deep links
   */
  async createFormFromPayload(
    trackableId: string,
    rawPayload: unknown,
    authContext: McpAuthContext
  ): Promise<McpFormCreationResult> {
    // Step 1: Validate before touching the database
    const validation = this.validateFormPayload(rawPayload)
    if (!validation.valid) {
      return {
        success: false,
        errorCode: "VALIDATION_ERROR",
        message:
          "Form payload validation failed. Fix the listed errors and retry.",
        errors: validation.errors,
      }
    }

    const formInput = validation.data

    // Step 2: Verify trackable access and kind
    const trackable = await mcpTrackableService.assertAccess(
      trackableId,
      authContext
    )

    if (trackable.kind !== "survey") {
      throw new McpToolError(
        "FORBIDDEN",
        `Trackable "${trackable.name}" is of kind "${trackable.kind}". Only survey trackables can have forms.`
      )
    }

    // Step 3: Transform to EditableTrackableForm (assign UUIDs and positions)
    const editableForm: EditableTrackableForm = {
      title: formInput.title,
      description: formInput.description ?? null,
      status: formInput.status,
      submitLabel: formInput.submit_label ?? null,
      successMessage: formInput.success_message ?? null,
      fields: formInput.fields.map((field, index) => ({
        id: randomUUID(),
        key: field.key,
        kind: field.kind,
        label: field.label,
        description: field.description ?? null,
        required: field.required,
        position: index,
        config: this.toEditableFieldConfig(field.config),
      })),
    }

    // Step 4: Persist via the existing form service
    const savedForm = await formService.saveForm(
      trackableId,
      authContext.ownerUserId,
      editableForm
    )

    return {
      success: true,
      formId: savedForm.id,
      trackableId,
      formVersion: savedForm.version,
      title: savedForm.title,
      status: savedForm.status,
    }
  }
}

export const mcpFormService = new McpFormService()
