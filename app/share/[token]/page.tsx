import { SharedFormPage } from "./shared-form-page"

export const dynamic = "force-static"

export function generateStaticParams() {
  return []
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const resolvedParams = await params

  return <SharedFormPage token={resolvedParams.token} />
}
