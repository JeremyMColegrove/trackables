import { db } from "@/db"

export async function getActiveShareLink(token: string) {
  return db.query.trackableShareLinks.findFirst({
    where: (table, { and, eq, isNull, or, gt }) =>
      and(
        eq(table.token, token),
        isNull(table.revokedAt),
        or(isNull(table.expiresAt), gt(table.expiresAt, new Date()))
      ),
    with: {
      trackable: {
        with: {
          owner: {
            columns: {
              displayName: true,
              primaryEmail: true,
            },
          },
          activeForm: {
            with: {
              fields: true,
            },
          },
        },
      },
    },
  })
}

export function requiresAuthenticatedSharedFormAccess(settings: {
  allowAnonymousSubmissions?: boolean
} | null) {
  return settings?.allowAnonymousSubmissions === false
}
