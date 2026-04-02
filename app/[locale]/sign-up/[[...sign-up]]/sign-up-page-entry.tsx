"use client"

import dynamic from "next/dynamic"

const SignUpPageClient = dynamic(
  () => import("./sign-up-page-client").then((mod) => mod.SignUpPageClient),
  {
    ssr: false,
  }
)

export function SignUpPageEntry({ redirectUrl }: { redirectUrl: string }) {
  return <SignUpPageClient redirectUrl={redirectUrl} />
}
