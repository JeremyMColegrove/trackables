import type { Metadata } from "next"

import { siteConfig } from "@/lib/site-config"
import { getShareMetadataContent } from "@/lib/share-metadata"

import { SharedFormPage } from "./shared-form-page"

export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>
}): Promise<Metadata> {
  const { locale, token } = await params
  const shareMetadata = await getShareMetadataContent(token, locale)

  if (!shareMetadata) {
    return {
      title: "Survey unavailable",
      description:
        "This shared survey link is invalid, expired, or no longer accepting responses.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${shareMetadata.formTitle} | ${shareMetadata.projectName}`

  return {
    title,
    description: shareMetadata.description,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: shareMetadata.shareUrl,
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      url: shareMetadata.shareUrl,
      title,
      description: shareMetadata.description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: shareMetadata.description,
    },
  }
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const resolvedParams = await params

  return <SharedFormPage token={resolvedParams.token} />
}
