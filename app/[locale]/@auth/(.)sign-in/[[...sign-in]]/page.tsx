import type { Metadata } from "next"

import { AuthModal } from "@/components/auth/auth-modal"
import { createNoIndexMetadata } from "@/lib/seo"

import { SignInPageClient } from "../../../sign-in/[[...sign-in]]/sign-in-page-client"

export const metadata: Metadata = createNoIndexMetadata({
  title: "Sign in",
  description: "Sign in to manage forms, responses, and API usage in Trackable.",
})

export default function InterceptedSignInPage() {
  return (
    <AuthModal>
      <SignInPageClient />
    </AuthModal>
  )
}
