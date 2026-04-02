"use client"

import dynamic from "next/dynamic"

const SignInPageClient = dynamic(
  () => import("./sign-in-page-client").then((mod) => mod.SignInPageClient),
  {
    ssr: false,
  }
)

export function SignInPageEntry({ redirectUrl }: { redirectUrl: string }) {
  return <SignInPageClient redirectUrl={redirectUrl} />
}
