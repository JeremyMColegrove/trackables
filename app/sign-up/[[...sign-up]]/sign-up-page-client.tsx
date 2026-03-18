"use client"

import { SignUp } from "@clerk/nextjs"

export function SignUpPageClient() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <SignUp />
    </div>
  )
}
