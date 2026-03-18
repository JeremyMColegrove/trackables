import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { ProjectContent } from "./project-content"

export default async function ProjectPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const resolvedParams = await Promise.resolve(params)

  return <ProjectContent projectId={resolvedParams.id} />
}
