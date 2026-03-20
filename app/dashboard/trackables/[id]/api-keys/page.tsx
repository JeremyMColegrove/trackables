import { TrackableApiKeysSection } from "../trackable-sections"

export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return []
}

export default function TrackableApiKeysPage() {
  return <TrackableApiKeysSection />
}
