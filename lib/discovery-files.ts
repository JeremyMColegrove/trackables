import gtConfig from "../gt.config.json"
import { buildAbsoluteUrl, getSiteUrl, siteConfig } from "./site-config"

type PublicRouteDefinition = {
  changeFrequency: "weekly" | "yearly"
  pathname: string
  priority: number
}

const publicRoutes: PublicRouteDefinition[] = [
  {
    pathname: "/",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    pathname: "/privacy",
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    pathname: "/terms",
    changeFrequency: "yearly",
    priority: 0.2,
  },
]

export const defaultLocale = gtConfig.defaultLocale
export const supportedLocales = gtConfig.locales

export function buildLocalizedPath(pathname: string, locale = defaultLocale) {
  if (locale === defaultLocale) {
    return pathname
  }

  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`
}

export function buildLocalizedUrl(pathname: string, locale = defaultLocale) {
  return buildAbsoluteUrl(buildLocalizedPath(pathname, locale))
}

export function getRobotsDisallowList() {
  return [
    "/api",
    "/api/",
    "/dashboard",
    "/dashboard/",
    "/sign-in",
    "/sign-up",
    "/*/dashboard",
    "/*/dashboard/",
    "/*/sign-in",
    "/*/sign-up",
  ]
}

export function buildRobotsTxt() {
  const lines = ["User-agent: *", "Allow: /"]

  for (const pattern of getRobotsDisallowList()) {
    lines.push(`Disallow: ${pattern}`)
  }

  lines.push(`Sitemap: ${buildAbsoluteUrl("/sitemap.xml").toString()}`)
  lines.push(`Host: ${getSiteUrl().origin}`)

  return `${lines.join("\n")}\n`
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

export function buildSitemapXml() {
  const urls = supportedLocales.flatMap((locale) =>
    publicRoutes.map((route) => ({
      loc: buildLocalizedUrl(route.pathname, locale).toString(),
      changeFrequency: route.changeFrequency,
      priority: route.priority.toFixed(1),
    }))
  )

  const entries = urls
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}

export function buildLlmsTxt() {
  const siteUrl = getSiteUrl().toString()
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.name} is a web app for creating shareable forms, collecting structured responses, and tracking API usage events.`,
    "",
    "## What the site does",
    "- Create trackable items for forms, surveys, and usage tracking.",
    "- Share forms with a public link, named users, or specific email addresses.",
    "- Collect structured responses from shared forms.",
    "- Record API usage events with API keys and attached metadata.",
    "- Review submissions and usage history in an authenticated dashboard.",
    "",
    "## Public pages",
    `- Home: ${siteUrl}`,
    `- Terms of Service: ${buildAbsoluteUrl("/terms").toString()}`,
    `- Privacy Statement: ${buildAbsoluteUrl("/privacy").toString()}`,
    "",
    "## Discovery",
    `- Sitemap: ${buildAbsoluteUrl("/sitemap.xml").toString()}`,
    `- Robots: ${buildAbsoluteUrl("/robots.txt").toString()}`,
    `- Security: ${buildAbsoluteUrl("/security.txt").toString()}`,
    "",
    "## Source",
    `- GitHub: ${siteConfig.githubUrl}`,
    "",
    "## Crawling guidance",
    "- The public marketing and legal pages are indexable.",
    "- Sign-in, sign-up, dashboard, API, and tokenized shared form routes are not part of the public index.",
  ]

  return `${lines.join("\n")}\n`
}

export function buildSecurityTxt() {
  const contact = siteConfig.securityContactEmail
    ? `mailto:${siteConfig.securityContactEmail}`
    : siteConfig.securityContactUrl
  const expires = new Date()

  expires.setMonth(expires.getMonth() + 12)

  const lines = [
    `Contact: ${contact}`,
    `Canonical: ${buildAbsoluteUrl("/.well-known/security.txt").toString()}`,
    `Expires: ${expires.toISOString()}`,
  ]

  if (siteConfig.securityPolicyUrl) {
    lines.push(`Policy: ${siteConfig.securityPolicyUrl}`)
  }

  return `${lines.join("\n")}\n`
}
