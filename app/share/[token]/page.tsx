import { auth } from "@clerk/nextjs/server"
import { cookies } from "next/headers"

import {
  getActiveShareLink,
  requiresAuthenticatedSharedFormAccess,
} from "@/lib/trackable-share-links"
import { getSharedFormCompletionCookieName } from "@/lib/shared-form-completion-cookie"

import { SharedFormPage } from "./shared-form-page"

export default async function SharePage({
  params,
}: {
  params: { token: string } | Promise<{ token: string }>
}) {
  const resolvedParams = await Promise.resolve(params)
  const { userId, redirectToSignIn } = await auth()
  const cookieStore = await cookies()
  const shareLink = await getActiveShareLink(resolvedParams.token)

  if (
    shareLink &&
    requiresAuthenticatedSharedFormAccess(shareLink.trackable.settings) &&
    !userId
  ) {
    return redirectToSignIn({ returnBackUrl: `/share/${resolvedParams.token}` })
  }

  const isAnonymousVisitor = !userId
  const hasCompletedForm =
    isAnonymousVisitor &&
    cookieStore.get(
      getSharedFormCompletionCookieName(resolvedParams.token)
    )?.value === "true"

  return (
    <SharedFormPage
      token={resolvedParams.token}
      initialHasSubmitted={hasCompletedForm}
      isAnonymousVisitor={isAnonymousVisitor}
    />
  )
}
