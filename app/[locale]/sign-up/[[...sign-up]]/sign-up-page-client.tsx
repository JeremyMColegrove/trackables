"use client"

import { SignUp } from "@clerk/nextjs"

import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in"

export function SignUpPageClient({ redirectUrl }: { redirectUrl: string }) {
  return (
    <>
      <RedirectIfSignedIn href={redirectUrl} />
      <SignUp
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </>
  )
}
