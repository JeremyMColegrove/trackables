import { boolean, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core"

import { lastSeenAt, timestamps } from "@/db/schema/_shared"

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    primaryEmail: text("primary_email").notNull(),
    displayName: text("display_name"),
    imageUrl: text("image_url"),
    isProfilePrivate: boolean("is_profile_private").default(false).notNull(),
    lastSeenAt: lastSeenAt(),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_primary_email_idx").on(table.primaryEmail)]
)
