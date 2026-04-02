CREATE TABLE "mcp_access_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by_user_id" text NOT NULL,
	"name" text NOT NULL,
	"key_prefix" text NOT NULL,
	"secret_hash" text NOT NULL,
	"last_four" text NOT NULL,
	"capabilities" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mcp_access_tokens" ADD CONSTRAINT "mcp_access_tokens_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mcp_access_tokens_key_prefix_idx" ON "mcp_access_tokens" USING btree ("key_prefix");--> statement-breakpoint
CREATE INDEX "mcp_access_tokens_workspace_idx" ON "mcp_access_tokens" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "mcp_access_tokens_status_idx" ON "mcp_access_tokens" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mcp_access_tokens_created_by_idx" ON "mcp_access_tokens" USING btree ("created_by_user_id");