import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { ArrowRight, LayoutDashboard } from "lucide-react"
import Link from "next/link"

import { UserAccountButton } from "@/components/user-account-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function Page() {
  const { userId } = await auth()

  return (
    <main className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tighter">
              Trackable.
            </span>
          </div>
          <div className="flex items-center gap-4">
            {userId ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <div className="h-4 w-px bg-border max-sm:hidden" />
                <UserAccountButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Sign up</Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="relative flex flex-col items-center justify-center border-b py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[32px_32px] opacity-20" />
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center lg:px-8">
          <Badge
            variant="outline"
            className="mb-8 rounded-full border-primary/20 p-1 px-3 text-xs font-medium tracking-tight text-primary"
          >
            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-primary" />
            Trackable v2.0 is now live
          </Badge>

          <h1 className="text-5xl font-semibold tracking-tighter text-foreground sm:text-7xl md:text-8xl">
            Tracking for your <br className="hidden sm:block" /> team and
            projects.
          </h1>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            {userId ? (
              <>
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Go to workspace
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 size-4" />
                    Overview
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <Button size="lg">
                    Start tracking now
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button size="lg" variant="outline">
                    Log in to account
                  </Button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </div>

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            <div className="flex flex-col border-l-2 border-primary/30 pl-6">
              <span className="text-3xl font-bold tracking-tighter text-foreground">
                01
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                Overview first
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                See what matters immediately without scanning through poorly
                stacked panels and tabs.
              </p>
            </div>
            <div className="flex flex-col border-l-2 border-border pl-6">
              <span className="text-3xl font-bold tracking-tighter text-muted-foreground">
                02
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                Minimal surface
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                No gradients, no decorative blocks, and no oversized marketing
                sections. Just clarity.
              </p>
            </div>
            <div className="flex flex-col border-l-2 border-border pl-6">
              <span className="text-3xl font-bold tracking-tighter text-muted-foreground">
                03
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                Fast navigation
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                Jump from home to workspace instantly. Built for speed and
                returning users.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Trackable Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Twitter
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
