/**
 * MCP HTTP Transport Route
 *
 * Handles all MCP JSON-RPC requests via the Streamable HTTP transport.
 * Each POST request is stateless and independent.
 *
 * Auth flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Validate via McpTokenService — 401 on any auth failure
 * 3. Build a scoped McpServer with the resolved auth context
 * 4. Delegate to WebStandardStreamableHTTPServerTransport
 *
 * The business layer never receives raw tokens — only McpAuthContext.
 */

import { NextRequest, NextResponse } from "next/server"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"

import { logger } from "@/lib/logger"
import { mcpTokenService } from "@/server/mcp/auth/mcp-token.service"
import { McpAuthError } from "@/server/mcp/errors/mcp-errors"
import { buildMcpServer } from "@/server/mcp/mcp-server"

/** Extracts the Bearer token from the Authorization header. */
function extractBearerToken(req: NextRequest): string | null {
  const authHeader =
    req.headers.get("Authorization") ?? req.headers.get("authorization")
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() ?? null
}

export async function POST(req: NextRequest): Promise<Response> {
  const rawToken = extractBearerToken(req)

  if (!rawToken) {
    logger.warn("MCP request received with no Authorization header.")
    return NextResponse.json(
      {
        error: true,
        code: "UNAUTHORIZED",
        message: "Authorization header with Bearer token is required.",
      },
      { status: 401 }
    )
  }

  let authContext
  try {
    authContext = await mcpTokenService.validateToken(rawToken)
  } catch (error) {
    if (error instanceof McpAuthError) {
      logger.warn({ code: error.code }, `MCP auth failed: ${error.message}`)
      return NextResponse.json(
        { error: true, code: error.code, message: error.message },
        { status: 401 }
      )
    }

    logger.error(
      { err: error },
      "Unexpected error during MCP token validation."
    )
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_ERROR",
        message: "Authentication failed.",
      },
      { status: 500 }
    )
  }

  // Build a scoped server for this request — stateless, no shared state
  const server = buildMcpServer(authContext)

  const transport = new WebStandardStreamableHTTPServerTransport({
    // Stateless mode: no session ID, no in-memory state between requests
    sessionIdGenerator: undefined,
    // Return JSON responses instead of SSE streams for simple request/response tools
    enableJsonResponse: true,
  })

  await server.connect(transport)

  return transport.handleRequest(req)
}

/**
 * GET handler for SSE stream connections (optional long-lived sessions).
 * Currently responds with a guidance message — stateless JSON mode is preferred.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const rawToken = extractBearerToken(req)

  if (!rawToken) {
    return NextResponse.json(
      {
        error: true,
        code: "UNAUTHORIZED",
        message: "Authorization header with Bearer token is required.",
      },
      { status: 401 }
    )
  }

  let authContext
  try {
    authContext = await mcpTokenService.validateToken(rawToken)
  } catch (error) {
    if (error instanceof McpAuthError) {
      return NextResponse.json(
        { error: true, code: error.code, message: error.message },
        { status: 401 }
      )
    }
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_ERROR",
        message: "Authentication failed.",
      },
      { status: 500 }
    )
  }

  const server = buildMcpServer(authContext)

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  await server.connect(transport)

  return transport.handleRequest(req)
}
