import { sql } from "drizzle-orm"
import { integer, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core"

export function uuidPrimaryKey(name = "id") {
  return uuid(name).defaultRandom().primaryKey()
}

export function createdAt(name = "created_at") {
  return timestamp(name, { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull()
}

export function updatedAt(name = "updated_at") {
  return timestamp(name, { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull()
}

export function archivedAt(name = "archived_at") {
  return timestamp(name, { mode: "date", withTimezone: true })
}

export function revokedAt(name = "revoked_at") {
  return timestamp(name, { mode: "date", withTimezone: true })
}

export function expiresAt(name = "expires_at") {
  return timestamp(name, { mode: "date", withTimezone: true })
}

export function occurredAt(name = "occurred_at") {
  return timestamp(name, { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull()
}

export function nullableTimestamp(name: string) {
  return timestamp(name, { mode: "date", withTimezone: true })
}

export function lastSeenAt(name = "last_seen_at") {
  return nullableTimestamp(name)
}

export function sortOrder(name = "position") {
  return integer(name).default(0).notNull()
}

export function usageCount(name = "usage_count") {
  return integer(name).default(0).notNull()
}

export function submissionCount(name = "submission_count") {
  return integer(name).default(0).notNull()
}

export function ownerId(name = "owner_id") {
  return text(name).notNull()
}

export function createdByUserId(name = "created_by_user_id") {
  return text(name).notNull()
}

export function metadataJson<T>(name = "metadata") {
  return jsonb(name)
    .$type<T>()
    .default(sql`'{}'::jsonb`)
    .notNull()
}

export function settingsJson<T>(name = "settings") {
  return jsonb(name)
    .$type<T>()
    .default(sql`'{}'::jsonb`)
    .notNull()
}

export const timestamps = {
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}
