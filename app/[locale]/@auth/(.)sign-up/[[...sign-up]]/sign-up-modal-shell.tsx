"use client"

import { AuthModal } from "@/components/auth/auth-modal"
import { SignUpPageEntry } from "../../../sign-up/[[...sign-up]]/sign-up-page-entry"

export function SignUpModalShell() {
  return (
    <AuthModal>
      <SignUpPageEntry redirectUrl="/dashboard" />
    </AuthModal>
  )
}
