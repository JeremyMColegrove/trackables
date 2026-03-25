import type { Metadata } from "next"

import { AuthModal } from "@/components/auth/auth-modal"
import { createNoIndexMetadata } from "@/lib/seo"

import { SignUpPageClient } from "../../../sign-up/[[...sign-up]]/sign-up-page-client"

export const metadata: Metadata = createNoIndexMetadata({
  title: "Create account",
  description:
    "Create a Trackable account to manage forms, responses, and API usage.",
})

export default function InterceptedSignUpPage() {
  return (
    <AuthModal>
      <SignUpPageClient />
    </AuthModal>
  )
}
