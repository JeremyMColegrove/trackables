"use client"

import { useAuth } from "@clerk/nextjs"
import { QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { createTRPCClient } from "@trpc/client"
import { useEffect, useRef, useState } from "react"

import type { AppRouter } from "@/server/api/root"
import { getSiteUrl } from "@/lib/site-config"
import { getQueryClient, resetAuthRedirectState } from "@/trpc/query-client"
import { TRPCProvider } from "@/trpc/client"

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return ""
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return getSiteUrl().toString().replace(/\/$/, "")
}

export function TRPCReactProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isLoaded, userId } = useAuth()
  const queryClient = getQueryClient()
  const previousViewerIdRef = useRef<string | null | undefined>(undefined)
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  )

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    resetAuthRedirectState()

    const nextViewerId = userId ?? null

    if (previousViewerIdRef.current === undefined) {
      previousViewerIdRef.current = nextViewerId
      return
    }

    if (previousViewerIdRef.current === nextViewerId) {
      return
    }

    previousViewerIdRef.current = nextViewerId

    void queryClient.cancelQueries()

    if (nextViewerId) {
      void queryClient.refetchQueries({
        type: "active",
      })
      return
    }

    queryClient.clear()
  }, [isLoaded, queryClient, userId])

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
