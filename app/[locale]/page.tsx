import { auth } from "@clerk/nextjs/server"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { createPageMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/site-config"
import { LandingPage } from "./landing-page"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return createPageMetadata({
    title: siteConfig.homeTitle,
    description: siteConfig.description,
    pathname: "/",
    locale,
    useAbsoluteTitle: true,
  })
}

export default async function Page() {
  const { userId } = await auth()

  if (userId) {
    redirect("/dashboard")
  }

  return <LandingPage />
}
