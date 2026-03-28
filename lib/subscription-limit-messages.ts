export function getTrackableLimitMessage(limit: number) {
  return `You have reached the maximum of ${limit} trackable items for your plan. Please upgrade to create more.`
}

export function getSurveyResponseLimitMessage(limit: number) {
  return `This survey has received the maximum of ${limit} responses allowed on the current plan. The workspace owner needs to upgrade to collect more.`
}

export function isSurveyResponseLimitMessage(message: string) {
  return message.startsWith("This survey has received the maximum of ")
}

export function getWorkspaceMemberLimitMessage(limit: number) {
  return `This workspace has reached the maximum of ${limit} members for its plan. Please upgrade to invite more.`
}

export function isWorkspaceMemberLimitMessage(message: string) {
  return message.startsWith("This workspace has reached the maximum of ")
}

export function getCreatedWorkspaceLimitMessage(limit: number) {
  return `You have reached the maximum of ${limit} workspaces you can create on the free tier.`
}

export function isCreatedWorkspaceLimitMessage(message: string) {
  return (
    message.startsWith("You have reached the maximum of ") &&
    message.includes("workspaces you can create on the free tier")
  )
}

function formatByteLimit(limit: number) {
  if (limit >= 1024) {
    return `${Math.round(limit / 1024)} KB`
  }

  return `${limit} bytes`
}

export function getApiPayloadSizeLimitMessage(limit: number) {
  return `This request exceeds the maximum API log payload size of ${formatByteLimit(limit)} for the current plan.`
}

export function isApiPayloadSizeLimitMessage(message: string) {
  return message.startsWith(
    "This request exceeds the maximum API log payload size of "
  )
}

export function getApiLogRateLimitMessage(limit: number) {
  return `You have exceeded the maximum of ${limit} API log attempts per minute for your plan. Please upgrade for a higher logging rate.`
}

export function isApiLogRateLimitMessage(message: string) {
  return (
    message.startsWith("You have exceeded the maximum of ") &&
    message.includes("API log attempts per minute")
  )
}
