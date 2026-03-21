import "server-only"

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "@/db/schema"
import { logger } from "@/lib/logger"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on("connect", () => {
  logger.info("Connected to PostgreSQL database successfully")
})

pool.on("error", (err) => {
  logger.error({ error: err }, "PostgreSQL database error")
})

export const db = drizzle(pool, { casing: "snake_case", schema })
