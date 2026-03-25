import type { Metadata, MetadataRoute } from "next"

import {
  buildLocalizedPath,
  buildLocalizedUrl,
  defaultLocale,
  supportedLocales,
} from "@/lib/discovery-files"
import { siteConfig } from "@/lib/site-config"

type PageMetadataOptions = {
  description: string
  locale?: string
  pathname: string
  robots?: Metadata["robots"]
  title: string
  useAbsoluteTitle?: boolean
}

export function buildLanguageAlternates(pathname: string) {
  const languages = Object.fromEntries(
    supportedLocales.map((locale) => [
      locale,
      buildLocalizedUrl(pathname, locale).toString(),
    ])
  )

  return {
    languages: {
      ...languages,
      "x-default": buildLocalizedUrl(pathname, defaultLocale).toString(),
    },
  }
}

export function createPageMetadata({
  description,
  locale = defaultLocale,
  pathname,
  robots,
  title,
  useAbsoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = buildLocalizedUrl(pathname, locale).toString()

  return {
    title: useAbsoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalUrl,
      ...buildLanguageAlternates(pathname),
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      url: canonicalUrl,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots,
  }
}

export function createNoIndexMetadata({
  description,
  title,
}: Pick<PageMetadataOptions, "description" | "title">): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
  }
}
