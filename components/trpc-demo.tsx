"use client"

import { useQuery } from "@tanstack/react-query"

import { useTRPC } from "@/trpc/client"

export function TRPCDemo() {
  const trpc = useTRPC()
  const helloQuery = useQuery(
    trpc.hello.queryOptions({
      text: "trackable",
    })
  )

  return (
    <div className="rounded-lg border p-4">
      <p className="font-medium">tRPC quickstart check</p>
      <p className="text-muted-foreground">
        {helloQuery.data?.greeting ?? "Loading greeting..."}
      </p>
    </div>
  )
}
