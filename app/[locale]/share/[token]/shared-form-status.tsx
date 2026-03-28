/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { T } from "gt-next"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function SharedFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 md:px-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-28 rounded-3xl" />
      <Skeleton className="h-80 rounded-3xl" />
    </div>
  )
}

export function SharedFormUnavailable({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10 md:px-6">
      <Card className="w-full rounded-3xl border-border/60">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
            <T>Shared form</T>
          </Badge>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
          {children ? <div className="pt-2">{children}</div> : null}
        </CardHeader>
      </Card>
    </div>
  )
}

export function SharedFormStatusCard({
  badge,
  title,
  description,
  variant = "success",
}: {
  badge: string
  title: string
  description: string
  variant?: "success" | "error"
}) {
  const Icon = variant === "error" ? AlertCircle : CheckCircle2

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10 md:px-6">
      <Card className="w-full rounded-3xl border-border/60 bg-card/95 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <div
            className={cn(
              "rounded-full p-3",
              variant === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-600"
            )}
          >
            <Icon className="size-8" />
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            {badge}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function SharedFormResponseLimitCard() {
  return (
    <SharedFormStatusCard
      badge="Response limit reached"
      title="This survey is no longer accepting responses."
      description="This survey has already received the maximum number of responses allowed on the current plan. The workspace owner needs to upgrade to accept more responses."
      variant="error"
    />
  )
}
