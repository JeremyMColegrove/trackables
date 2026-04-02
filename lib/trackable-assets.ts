import type {
  TrackableAssetRecord,
  TrackableAssetReference,
} from "@/db/schema/types"

export function buildTrackableAssetUrl(
  publicToken: string,
  options?: {
    shareToken?: string | null
  }
) {
  const url = new URL(
    `/api/trackable-assets/${encodeURIComponent(publicToken)}`,
    "https://trackable.local"
  )

  if (options?.shareToken) {
    url.searchParams.set("shareToken", options.shareToken)
  }

  return `${url.pathname}${url.search}`
}

export function toTrackableAssetReference(
  asset: Pick<
    TrackableAssetRecord,
    | "id"
    | "publicToken"
    | "kind"
    | "originalFileName"
    | "mimeType"
    | "imageWidth"
    | "imageHeight"
  >
): TrackableAssetReference {
  return {
    id: asset.id,
    publicToken: asset.publicToken,
    kind: asset.kind,
    originalFileName: asset.originalFileName,
    mimeType: asset.mimeType,
    imageWidth: asset.imageWidth,
    imageHeight: asset.imageHeight,
  }
}
