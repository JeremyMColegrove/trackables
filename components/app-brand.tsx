"use client"

import Image from "next/image"
import Link from "next/link"

import iosSmallIcon from "@/images/ios/AppIcon-20@3x.png"

type AppBrandProps = {
  href?: string
  className?: string
}

export function AppBrand({
  href = "/",
  className = "text-lg font-bold tracking-tighter",
}: AppBrandProps) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <Image
        src={iosSmallIcon}
        alt="Trackable logo"
        width={24}
        height={24}
        className="h-6 w-6 rounded-sm"
        priority
      />
      <span>Trackable.</span>
    </Link>
  )
}
