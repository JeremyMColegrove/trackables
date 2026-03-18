import { relations } from "drizzle-orm"
import {
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import {
  expiresAt,
  nullableTimestamp,
  occurredAt,
  ownerId,
  timestamps,
  usageCount,
  uuidPrimaryKey,
} from "@/db/schema/_shared"
import { apiKeyStatusEnum } from "@/db/schema/enums"
import type { UsageEventMetadata, UsageEventPayload } from "@/db/schema/types"
import { trackableItems } from "@/db/schema/trackables"
import { users } from "@/db/schema/users"

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuidPrimaryKey(),
    ownerId: ownerId().references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => trackableItems.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    secretHash: text("secret_hash").notNull(),
    lastFour: text("last_four").notNull(),
    status: apiKeyStatusEnum("status").default("active").notNull(),
    expiresAt: expiresAt(),
    lastUsedAt: nullableTimestamp("last_used_at"),
    usageCount: usageCount(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("api_keys_key_prefix_idx").on(table.keyPrefix),
    index("api_keys_owner_idx").on(table.ownerId),
    index("api_keys_project_idx").on(table.projectId),
    index("api_keys_status_idx").on(table.status),
  ]
)

export const trackableApiUsageEvents = pgTable(
  "trackable_api_usage_events",
  {
    id: uuidPrimaryKey(),
    trackableId: uuid("trackable_id")
      .notNull()
      .references(() => trackableItems.id, { onDelete: "cascade" }),
    apiKeyId: uuid("api_key_id")
      .notNull()
      .references(() => apiKeys.id, { onDelete: "cascade" }),
    requestId: text("request_id"),
    occurredAt: occurredAt(),
    payload: jsonb("payload").$type<UsageEventPayload>().notNull(),
    metadata: text("metadata").$type<UsageEventMetadata>(),
  },
  (table) => [
    uniqueIndex("trackable_api_usage_events_request_id_idx").on(
      table.requestId
    ),
    index("trackable_api_usage_events_trackable_occurred_idx").on(
      table.trackableId,
      table.occurredAt
    ),
    index("trackable_api_usage_events_api_key_occurred_idx").on(
      table.apiKeyId,
      table.occurredAt
    ),
  ]
)

export const apiKeysRelations = relations(apiKeys, ({ many, one }) => ({
  owner: one(users, {
    fields: [apiKeys.ownerId],
    references: [users.id],
  }),
  project: one(trackableItems, {
    fields: [apiKeys.projectId],
    references: [trackableItems.id],
  }),
  usageEvents: many(trackableApiUsageEvents),
}))

export const trackableApiUsageEventsRelations = relations(
  trackableApiUsageEvents,
  ({ one }) => ({
    trackable: one(trackableItems, {
      fields: [trackableApiUsageEvents.trackableId],
      references: [trackableItems.id],
    }),
    apiKey: one(apiKeys, {
      fields: [trackableApiUsageEvents.apiKeyId],
      references: [apiKeys.id],
    }),
  })
)
