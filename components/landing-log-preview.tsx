"use client"

import logDarkImage from "@/images/log-dark_hd.webp"
import logLightImage from "@/images/log-light_hd.webp"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

export function LandingLogPreview() {
  const [theme, setTheme] = useState<"dark" | string>("light")
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (resolvedTheme) {
      setTheme(resolvedTheme)
    }
  }, [resolvedTheme])

  if (theme === "dark") {
    return (
      <Image
        key="dark-log"
        src={logDarkImage}
        alt="Trackables log search preview"
        width={logDarkImage.width}
        height={logDarkImage.height}
        className="h-auto w-full"
      />
    )
  }

  return (
    <Image
      key="light-log"
      src={logLightImage}
      alt="Trackables log search preview"
      width={logLightImage.width}
      height={logLightImage.height}
      className="h-auto w-full"
    />
  )
}
