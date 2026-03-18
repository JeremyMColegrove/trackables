import { db } from "@/db"

export async function hasAuthenticatedSharedFormSubmission(input: {
  shareLinkId: string
  userId: string
}) {
  const existingSubmission = await db.query.trackableFormSubmissions.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.shareLinkId, input.shareLinkId),
        eq(table.submittedByUserId, input.userId)
      ),
    columns: {
      id: true,
    },
  })

  return Boolean(existingSubmission)
}
