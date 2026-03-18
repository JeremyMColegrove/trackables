import { createHash, randomBytes } from "node:crypto"

export function buildApiKeySecret() {
  return `trk_live_${randomBytes(24).toString("base64url")}`
}

export function hashApiKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex")
}

function addDaysToNow(days: number) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)
  return expiresAt
}

export function resolveApiKeyExpiration(
  preset: "never" | "30_days" | "60_days" | "90_days"
) {
  switch (preset) {
    case "never":
      return null
    case "30_days":
      return addDaysToNow(30)
    case "60_days":
      return addDaysToNow(60)
    case "90_days":
      return addDaysToNow(90)
  }
}
