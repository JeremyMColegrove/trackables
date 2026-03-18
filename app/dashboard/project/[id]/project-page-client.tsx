"use client"

import { RequireAuth } from "@/components/auth/require-auth"

import { ProjectContent, ProjectContentSkeleton } from "./project-content"

export function ProjectPageClient({
  projectId,
}: {
  projectId: string
}) {
  return (
    <RequireAuth fallback={<ProjectContentSkeleton />}>
      <ProjectContent projectId={projectId} />
    </RequireAuth>
  )
}
