import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { createPageMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/site-config"
import { getTermsDocumentContent } from "./terms-document-content"

const pathname = "/terms"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return createPageMetadata({
    title: "Terms of Service",
    description: `Read the Terms of Service for ${siteConfig.name}.`,
    pathname,
    locale,
  })
}

export default async function TermsPage() {
  const document = getTermsDocumentContent()

  return (
    <LegalDocumentPage
      title={document.title}
      effectiveDate={document.effectiveDate}
      sections={document.sections}
    />
  )
}
