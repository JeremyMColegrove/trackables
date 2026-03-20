import { TrackableFormSection } from "../trackable-sections"

export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return []
}

export default function TrackableFormPage() {
  return <TrackableFormSection />
}
