"use client"

import { SignIn } from "@clerk/nextjs"

import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in"

export function SignInPageClient({ redirectUrl }: { redirectUrl: string }) {
  return (
    <>
      <RedirectIfSignedIn href={redirectUrl} />
      <SignIn
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </>
  )
}
