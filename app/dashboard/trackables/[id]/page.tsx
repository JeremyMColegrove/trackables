import { TrackableOverviewSection } from "./trackable-sections"

export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return []
}

export default function TrackablePage() {
  return <TrackableOverviewSection />
}
