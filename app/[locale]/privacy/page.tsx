import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { createPageMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/site-config"
import { getPrivacyDocumentContent } from "./privacy-document-content"

const pathname = "/privacy"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  return createPageMetadata({
    title: "Privacy Statement",
    description: `Read the Privacy Statement for ${siteConfig.name}.`,
    pathname,
    locale,
  })
}

export default async function PrivacyPage() {
  const document = getPrivacyDocumentContent()

  return (
    <LegalDocumentPage
      title={document.title}
      effectiveDate={document.effectiveDate}
      sections={document.sections}
    />
  )
}
