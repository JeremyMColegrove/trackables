import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { readLegalDocument } from "@/lib/legal-documents"
import { buildAbsoluteUrl, siteConfig } from "@/lib/site-config"

const pathname = "/privacy"

export const metadata: Metadata = {
  title: "Privacy Statement",
  description: `Privacy Statement for ${siteConfig.name}.`,
  alternates: {
    canonical: buildAbsoluteUrl(pathname).toString(),
  },
}

export default async function PrivacyPage() {
  const content = await readLegalDocument("privacy")

  return <LegalDocumentPage title="Privacy Statement" content={content} />
}
