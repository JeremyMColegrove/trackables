import { TRPCError } from "@trpc/server"

import { recordApiUsage } from "@/server/usage-tracking/record-api-usage"

function parseUsageMetadata(formData: FormData) {
  const rawMetadata = formData.get("metadata") ?? formData.get("Metadata")

  if (rawMetadata === null) {
    return null
  }

  if (typeof rawMetadata !== "string") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: 'The "metadata" form-data field must be a text value.',
    })
  }

  return rawMetadata
}

function getErrorStatus(error: TRPCError) {
  return error.code === "BAD_REQUEST"
    ? 400
    : error.code === "UNAUTHORIZED"
      ? 401
      : error.code === "NOT_FOUND"
        ? 404
        : error.code === "CONFLICT"
          ? 409
          : error.code === "PRECONDITION_FAILED"
            ? 412
            : 500
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key")?.trim()

  if (!apiKey) {
    return Response.json(
      { error: 'Missing "X-Api-Key" header.' },
      { status: 401 }
    )
  }

  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return Response.json(
      { error: "Request body must be valid form data." },
      { status: 400 }
    )
  }

  const rawName = formData.get("Name")
  const name = typeof rawName === "string" ? rawName.trim() : ""

  if (!name) {
    return Response.json(
      { error: 'Missing "Name" form-data field.' },
      { status: 400 }
    )
  }

  try {
    const customMetadata = parseUsageMetadata(formData)

    const usageEvent = await recordApiUsage({
      apiKey,
      name,
      requestId: request.headers.get("x-request-id"),
      metadata: customMetadata,
    })

    return Response.json({
      ok: true,
      usageEvent,
    })
  } catch (error) {
    if (error instanceof TRPCError) {
      return Response.json(
        { error: error.message },
        { status: getErrorStatus(error) }
      )
    }

    console.error("Failed to record API usage", error)

    return Response.json(
      { error: "Failed to record API usage." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return Response.json(
    { error: 'Use POST with form-data and a "Name" field.' },
    { status: 405 }
  )
}
