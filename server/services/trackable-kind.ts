import { TRPCError } from "@trpc/server"

import type { TrackableKind } from "@/db/schema/types"

export function assertTrackableKind(
  kind: TrackableKind,
  expected: TrackableKind,
  message: string
) {
  if (kind !== expected) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message,
    })
  }
}
