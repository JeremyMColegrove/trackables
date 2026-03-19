type LegalDocumentPageProps = {
  content: string
  title: string
}

export function LegalDocumentPage({
  content,
  title,
}: LegalDocumentPageProps) {
  return (
    <main className="min-h-svh bg-background py-16">
      <div className="mx-auto w-full max-w-3xl px-6 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <pre className="mt-8 whitespace-pre-wrap break-words rounded-xl border bg-card p-6 font-sans text-sm leading-7 text-muted-foreground sm:p-8">
          {content}
        </pre>
      </div>
    </main>
  )
}
