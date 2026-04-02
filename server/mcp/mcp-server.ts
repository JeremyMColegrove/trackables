import "server-only"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import type { McpAuthContext } from "@/server/mcp/auth/mcp-auth-context"
import { mcpAuditService } from "@/server/mcp/audit/mcp-audit.service"
import { mcpTrackableService } from "@/server/mcp/services/mcp-trackable.service"
import { WorkspaceDiscoveryTool } from "@/server/mcp/tools/workspace-discovery.tool"
import { FindTrackablesTool } from "@/server/mcp/tools/trackable-find.tool"
import { TrackableDiscoveryTool } from "@/server/mcp/tools/trackable-discovery.tool"
import { TrackableCreationTool } from "@/server/mcp/tools/trackable-creation.tool"
import { LogSearchTool } from "@/server/mcp/tools/log-search.tool"
import { LogDetailTool } from "@/server/mcp/tools/log-detail.tool"
import { FormCreationTool } from "@/server/mcp/tools/form-creation.tool"
import { FormSharingTool } from "@/server/mcp/tools/form-sharing.tool"
import { ResponseListTool } from "@/server/mcp/tools/response-list.tool"
import { ResponseDetailTool } from "@/server/mcp/tools/response-detail.tool"

/** All available MCP tool instances, constructed once at module load. */
const allTools = [
  new WorkspaceDiscoveryTool(),
  new FindTrackablesTool(mcpTrackableService, mcpAuditService),
  new TrackableDiscoveryTool(),
  new TrackableCreationTool(),
  new LogSearchTool(),
  new LogDetailTool(),
  new FormCreationTool(),
  new FormSharingTool(),
  new ResponseListTool(),
  new ResponseDetailTool(),
]

/**
 * Builds a fully configured McpServer for a single authenticated request.
 *
 * The auth context is captured via closure by each tool handler.
 * Only tools that the token's capability grants allow are registered,
 * so the agent's tool list is scoped to what the token permits.
 *
 * Called once per incoming MCP request — stateless, no shared state.
 */
export function buildMcpServer(authContext: McpAuthContext): McpServer {
  const server = new McpServer({
    name: "trackable",
    version: "1.0.0",
  })

  for (const tool of allTools) {
    // Only register tools the token is permitted to use
    if (authContext.canUseTool(tool.name)) {
      tool.register(server, authContext)
    }
  }

  return server
}
