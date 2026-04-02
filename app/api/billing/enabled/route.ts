import { NextResponse } from "next/server"

import { isSubscriptionEnforcementEnabled } from "@/lib/subscription-enforcement"

export async function GET() {
  return NextResponse.json(
    { enabled: isSubscriptionEnforcementEnabled() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  )
}
