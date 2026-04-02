import { Suspense } from "react"

import { TrackableFormSection } from "../trackable-form-section"

export default async function TrackableFormPage() {
  return (
    <Suspense fallback={null}>
      <TrackableFormSection />
    </Suspense>
  )
}
