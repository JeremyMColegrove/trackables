"use client"

import { SignIn } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"

import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in"

export function SignInPageClient() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url") ?? "/dashboard"

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <RedirectIfSignedIn href={redirectUrl} />
      <SignIn
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </div>
  )
}
