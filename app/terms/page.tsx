import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { readLegalDocument } from "@/lib/legal-documents"
import { buildAbsoluteUrl, siteConfig } from "@/lib/site-config"

const pathname = "/terms"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${siteConfig.name}.`,
  alternates: {
    canonical: buildAbsoluteUrl(pathname).toString(),
  },
}

export default async function TermsPage() {
  const content = await readLegalDocument("terms")

  return <LegalDocumentPage title="Terms of Service" content={content} />
}
