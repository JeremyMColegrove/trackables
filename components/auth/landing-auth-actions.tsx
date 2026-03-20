"use client"

import Link from "next/link"
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  useAuth,
} from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { T } from "gt-next";

type LandingAuthActionsProps = {
  section: "navbar" | "hero"
}

const dashboardRedirectUrl = "/dashboard"

export function LandingAuthActions({ section }: LandingAuthActionsProps) {
  const { isLoaded, userId } = useAuth()
  const isSignedIn = isLoaded && Boolean(userId)

  if (!isLoaded) {
    return null
  }

  if (section === "navbar") {
    return (
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <>
            <Button asChild size="sm" variant="ghost">
              <Link href="/dashboard"><T>Dashboard</T></Link>
            </Button>
            <SignOutButton redirectUrl="/">
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" })
                )}
              >
                
                                            <T>Sign out</T>
                                          </button>
            </SignOutButton>
          </>
        ) : (
          <>
            <SignInButton
              mode="modal"
              forceRedirectUrl={dashboardRedirectUrl}
              fallbackRedirectUrl={dashboardRedirectUrl}
            >
              <button
                type="button"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                
                                                <T>Sign in</T>
                                              </button>
            </SignInButton>
            <SignUpButton
              mode="modal"
              forceRedirectUrl={dashboardRedirectUrl}
              fallbackRedirectUrl={dashboardRedirectUrl}
            >
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" })
                )}
              >
                
                                                <T>Sign up</T>
                                              </button>
            </SignUpButton>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
      {isSignedIn ? (
        <>
          <Button asChild size="lg">
            <Link href="/dashboard">
              
                                        <T>Open dashboard</T>
                                        <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <SignOutButton redirectUrl="/">
            <Button size="lg" variant="outline">
              
                                        <T>Sign out</T>
                                      </Button>
          </SignOutButton>
        </>
      ) : (
        <>
          <SignUpButton
            mode="modal"
            forceRedirectUrl={dashboardRedirectUrl}
            fallbackRedirectUrl={dashboardRedirectUrl}
          >
            <Button size="lg">
              
                                            <T>Start tracking now</T>
                                            <ArrowRight className="ml-2 size-4" />
            </Button>
          </SignUpButton>
          <SignInButton
            mode="modal"
            forceRedirectUrl={dashboardRedirectUrl}
            fallbackRedirectUrl={dashboardRedirectUrl}
          >
            <Button size="lg" variant="outline">
              
                                            <T>Log in to account</T>
                                          </Button>
          </SignInButton>
        </>
      )}
    </div>
  )
}
