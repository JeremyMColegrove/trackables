"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LandingAuthActionsProps = {
	section: "navbar" | "hero";
};

export function LandingAuthActions({ section }: LandingAuthActionsProps) {
	if (section === "navbar") {
		return (
			<div className="flex items-center gap-4">
				<SignInButton mode="modal">
					<button
						type="button"
						className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
					>
						Sign in
					</button>
				</SignInButton>
				<SignUpButton mode="modal">
					<button
						type="button"
						className={cn(buttonVariants({ variant: "default", size: "sm" }))}
					>
						Sign up
					</button>
				</SignUpButton>
			</div>
		);
	}

	return (
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
	);
}
