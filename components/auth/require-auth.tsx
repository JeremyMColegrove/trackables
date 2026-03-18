"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

export function RequireAuth({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isLoaded, userId } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded || userId) {
      return
    }

    router.replace(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`)
  }, [isLoaded, pathname, router, userId])

  if (!isLoaded || !userId) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
