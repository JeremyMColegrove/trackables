import { Download } from "lucide-react"
import { T } from "gt-next"

import type { TrackableAssetReference } from "@/db/schema/types"
import { buildTrackableAssetUrl } from "@/lib/trackable-assets"
import { cn } from "@/lib/utils"

export function TrackableAssetAnswer({
  asset,
  className,
  shareToken,
}: {
  asset: TrackableAssetReference
  className?: string
  shareToken?: string | null
}) {
  const assetUrl = buildTrackableAssetUrl(asset.publicToken, { shareToken })

  if (asset.kind === "image") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border/60 bg-muted/20",
          className
        )}
      >
        <img
          src={assetUrl}
          alt={asset.originalFileName}
          className="max-h-[28rem] w-full object-contain"
        />
      </div>
    )
  }

  return (
    <a
      href={assetUrl}
      download={asset.originalFileName}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline",
        className
      )}
    >
      <Download className="size-4" />
      <span>
        <T>Download file</T>: {asset.originalFileName}
      </span>
    </a>
  )
}
