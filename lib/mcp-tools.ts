export const MCP_TOOL_NAMES = [
  "list_workspaces",
  "find_trackables",
  "list_trackables",
  "create_trackable",
  "search_logs",
  "get_log",
  "create_form",
  "update_form_sharing",
  "list_responses",
  "get_response",
] as const

export type McpToolName = (typeof MCP_TOOL_NAMES)[number]

export const MCP_TOOL_DEFINITIONS = [
  {
    name: "find_trackables",
    label: "Find trackables",
    description:
      "Search trackables in the active workspace by default and prefer this before existing-trackable actions.",
  },
  {
    name: "list_workspaces",
    label: "List workspaces",
    description:
      "Discover which workspaces this token can access and which one is currently active.",
  },
  {
    name: "list_trackables",
    label: "List trackables",
    description:
      "Browse the trackables within one workspace, defaulting to the active workspace when omitted.",
  },
  {
    name: "create_trackable",
    label: "Create trackable",
    description:
      "Create new trackable items from an MCP client, defaulting to the active workspace when omitted.",
  },
  {
    name: "search_logs",
    label: "Search logs",
    description: "Search logged usage events for API ingestion trackables.",
  },
  {
    name: "get_log",
    label: "Get log details",
    description: "Inspect a single log event in detail.",
  },
  {
    name: "create_form",
    label: "Create form",
    description: "Create form definitions for survey-style trackables.",
  },
  {
    name: "update_form_sharing",
    label: "Update form sharing",
    description:
      "Manage public survey links and anonymous-response settings for survey trackables.",
  },
  {
    name: "list_responses",
    label: "List responses",
    description: "Review collected responses for survey trackables.",
  },
  {
    name: "get_response",
    label: "Get response details",
    description: "Inspect an individual response in detail.",
  },
] as const satisfies readonly {
  name: McpToolName
  label: string
  description: string
}[]
