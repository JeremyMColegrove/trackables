ALTER TABLE "mcp_access_tokens" DROP CONSTRAINT "mcp_access_tokens_workspace_id_workspaces_id_fk";
--> statement-breakpoint
DROP INDEX "mcp_access_tokens_workspace_idx";--> statement-breakpoint
ALTER TABLE "mcp_access_tokens" DROP COLUMN "workspace_id";