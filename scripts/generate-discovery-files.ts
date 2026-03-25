import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import {
  buildLlmsTxt,
  buildRobotsTxt,
  buildSecurityTxt,
  buildSitemapXml,
} from "../lib/discovery-files"

const projectRoot = process.cwd()

const discoveryFiles = [
  {
    relativePath: "public/llms.txt",
    content: buildLlmsTxt(),
  },
  {
    relativePath: "public/robots.txt",
    content: buildRobotsTxt(),
  },
  {
    relativePath: "public/security.txt",
    content: buildSecurityTxt(),
  },
  {
    relativePath: "public/.well-known/security.txt",
    content: buildSecurityTxt(),
  },
  {
    relativePath: "public/sitemap.xml",
    content: buildSitemapXml(),
  },
]

async function main() {
  for (const file of discoveryFiles) {
    const outputPath = path.join(projectRoot, file.relativePath)

    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, file.content, "utf8")
  }
}

await main()
