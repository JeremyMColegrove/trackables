import { ProjectPageClient } from "./project-page-client"

export const dynamic = "force-static"

export function generateStaticParams() {
  return []
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params

  return <ProjectPageClient projectId={resolvedParams.id} />
}
