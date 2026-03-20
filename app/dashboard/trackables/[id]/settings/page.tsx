import { TrackableSettingsSection } from "../trackable-sections"

export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return []
}

export default function TrackableSettingsPage() {
  return <TrackableSettingsSection />
}
