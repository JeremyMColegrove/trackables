import "server-only"

import Redis from "ioredis"
import { logger } from "@/lib/logger"

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

  const client = new Redis(redisUrl, {
    lazyConnect: true, // Don't crash immediately if Redis is unreachable on start
    maxRetriesPerRequest: 3,
  })

  client.on("connect", () => {
    logger.info({ redisUrl }, "Connected to Redis successfully");
  });

  client.on("error", (error) => {
    logger.error({ error }, "Redis connection error");
  });

  client.on("reconnecting", () => {
    logger.info("Reconnecting to Redis...");
  });

  return client
}

// Export a singleton instance
export const redis = createRedisClient()
