const SHARED_FORM_COMPLETION_COOKIE_PREFIX = "shared-form-completed"

function toCookieSafeSegment(value: string) {
  return encodeURIComponent(value)
}

export function getSharedFormCompletionCookieName(token: string) {
  return `${SHARED_FORM_COMPLETION_COOKIE_PREFIX}-${toCookieSafeSegment(token)}`
}
