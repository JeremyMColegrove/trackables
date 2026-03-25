export type LegalDocumentSection = {
  heading: React.ReactNode
  paragraphs: React.ReactNode[]
}

type LegalDocumentPageProps = {
  effectiveDate: React.ReactNode
  sections: LegalDocumentSection[]
  title: React.ReactNode
}

export function LegalDocumentPage({
  effectiveDate,
  sections,
  title,
}: LegalDocumentPageProps) {
  return (
    <main className="min-h-svh bg-background py-16">
      <article className="mx-auto w-full max-w-3xl px-6 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{effectiveDate}</p>
        <div className="mt-8 space-y-8 rounded-xl border bg-card p-6 sm:p-8">
          {sections.map((section, index) => (
            <section key={index} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {section.heading}
              </h2>
              <div className="space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
