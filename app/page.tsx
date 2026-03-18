import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-static"

export default function Page() {

	return (
		<main className="flex min-h-svh flex-col bg-background">
      <RedirectIfSignedIn href="/dashboard" />
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8">
					<div className="flex items-center gap-2">
						<span className="text-lg font-bold tracking-tighter">
							Trackable.
						</span>
					</div>
					<div className="flex items-center gap-4">
						<SignInButton mode="modal">
							<Button variant="ghost" size="sm">
								Log in
							</Button>
						</SignInButton>
						<SignUpButton mode="modal">
							<Button size="sm">Sign up</Button>
						</SignUpButton>
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

					<h1 className="text-4xl font-semibold tracking-tighter text-foreground sm:text-6xl md:text-7xl">
						Surveys for your team.
					</h1>

					<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
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
								Simple interface
							</h3>
							<p className="mt-2 text-base leading-relaxed text-muted-foreground">
								A clean dashboard that keeps projects, responses, and usage easy
								to manage without extra complexity.
							</p>
						</div>
						<div className="flex flex-col border-l-2 border-border pl-6">
							<span className="text-3xl font-bold tracking-tighter text-muted-foreground">
								02
							</span>
							<h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
								Fast surveys and tracking
							</h3>
							<p className="mt-2 text-base leading-relaxed text-muted-foreground">
								Collect feedback quickly and record API usage in the same flow,
								so every response and event is captured in one place.
							</p>
						</div>
						<div className="flex flex-col border-l-2 border-border pl-6">
							<span className="text-3xl font-bold tracking-tighter text-muted-foreground">
								03
							</span>
							<h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
								Share with your team
							</h3>
							<p className="mt-2 text-base leading-relaxed text-muted-foreground">
								Invite teammates, share access where needed, and keep everyone
								aligned around the same trackable items.
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
	);
}
