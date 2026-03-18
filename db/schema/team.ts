import { relations, sql } from "drizzle-orm"
import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core"

import {
  createdByUserId,
  revokedAt,
  timestamps,
  uuidPrimaryKey,
} from "@/db/schema/_shared"
import { users } from "@/db/schema/users"

export const workspaceTeamMembers = pgTable(
  "workspace_team_members",
  {
    id: uuidPrimaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    memberUserId: text("member_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdByUserId: createdByUserId().references(() => users.id, {
      onDelete: "cascade",
    }),
    revokedAt: revokedAt(),
    ...timestamps,
  },
  (table) => [
    index("workspace_team_members_owner_idx").on(table.ownerId),
    index("workspace_team_members_member_idx").on(table.memberUserId),
    uniqueIndex("workspace_team_members_owner_member_idx")
      .on(table.ownerId, table.memberUserId)
      .where(sql`${table.revokedAt} is null`),
  ]
)

export const workspaceTeamMembersRelations = relations(
  workspaceTeamMembers,
  ({ one }) => ({
    owner: one(users, {
      fields: [workspaceTeamMembers.ownerId],
      references: [users.id],
    }),
    member: one(users, {
      fields: [workspaceTeamMembers.memberUserId],
      references: [users.id],
    }),
    createdByUser: one(users, {
      fields: [workspaceTeamMembers.createdByUserId],
      references: [users.id],
    }),
  })
)
