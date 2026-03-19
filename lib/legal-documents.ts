import { readFile } from "node:fs/promises"
import path from "node:path"

const legalDocumentPaths = {
  privacy: path.join(process.cwd(), "privacy"),
  terms: path.join(process.cwd(), "terms"),
} as const

export type LegalDocumentSlug = keyof typeof legalDocumentPaths

export async function readLegalDocument(slug: LegalDocumentSlug) {
  return readFile(legalDocumentPaths[slug], "utf8")
}
