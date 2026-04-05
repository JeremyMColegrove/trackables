"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

type CodeBlockProps = {
  code: string
  label: string
}

const LABEL_DOT_COLORS: Record<string, string> = {
  json: "bg-amber-400",
  env: "bg-emerald-400",
  yml: "bg-sky-400",
  yaml: "bg-sky-400",
  bash: "bg-violet-400",
  sh: "bg-violet-400",
}

function getLabelDotColor(label: string): string {
  const lower = label.toLowerCase()
  if (lower.includes(".json")) return LABEL_DOT_COLORS.json
  if (lower.startsWith(".env") || lower.includes(".env"))
    return LABEL_DOT_COLORS.env
  if (lower.endsWith(".yml") || lower.endsWith(".yaml"))
    return LABEL_DOT_COLORS.yml
  if (lower === "bash" || lower === "sh") return LABEL_DOT_COLORS.bash
  return "bg-muted-foreground/40"
}

export function CodeBlock({ code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="relative my-6 overflow-hidden rounded-xl border bg-muted shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/80 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${getLabelDotColor(label)}`}
          />
          <span className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void handleCopy()}
          className="h-7 shrink-0 text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <div className="overflow-x-auto p-4 text-sm text-foreground">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
